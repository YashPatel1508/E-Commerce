from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from datetime import timedelta
from .models import Order
from .serializers import OrderSerializer


class OrderListCreateView(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Order.objects.all().order_by('-created_at')
        return Order.objects.filter(user=self.request.user).order_by('-created_at')


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(user=self.request.user)


class OrderUpdateStatusView(APIView):
    """Admin-only: update order status with business rules enforced."""
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({'detail': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Lock terminal statuses — no changes allowed once cancelled or refunded
        if order.status in Order.TERMINAL_STATUSES:
            return Response(
                {'detail': f'This order is {order.status} and cannot be modified further.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        new_status = request.data.get('status')
        allowed = [s[0] for s in Order.STATUS_CHOICES]
        if new_status not in allowed:
            return Response({'detail': f'Invalid status. Allowed: {allowed}'}, status=status.HTTP_400_BAD_REQUEST)

        # Enforce valid sequence
        valid_transitions = {
            'Pending': ['Pending', 'Processing', 'Cancelled'],
            'Processing': ['Processing', 'Shipped'],
            'Shipped': ['Shipped', 'Delivered'],
            'Delivered': ['Delivered'],
            'Return Requested': ['Return Requested', 'Return Pickup'],
            'Return Pickup': ['Return Pickup', 'Refunded'],
        }

        if order.status in valid_transitions and new_status not in valid_transitions[order.status]:
            return Response(
                {'detail': f'Invalid transition from {order.status} to {new_status}.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        tracking_messages = {
            'Pending': 'Your order has been received and is being processed.',
            'Processing': 'Your order is being prepared and quality-checked.',
            'Shipped': 'Your order has been dispatched and is on its way.',
            'Delivered': 'Your order has been successfully delivered. Enjoy!',
            'Return Requested': 'Your return request has been received. We will arrange a pickup soon.',
            'Return Pickup': 'Our team will collect the item from you within 2-3 business days.',
            'Refunded': 'Your refund has been processed. The amount will be credited within 5-7 business days.',
            'Cancelled': 'Your order has been cancelled.',
        }

        # Restore stock when order is Refunded
        if new_status == 'Refunded' and order.status != 'Refunded':
            for item in order.items.all():
                if item.product:
                    item.product.stock += item.quantity
                    item.product.save()

        order.status = new_status
        order.tracking_info = tracking_messages.get(new_status, '')
        order.save()

        serializer = OrderSerializer(order)
        return Response(serializer.data)


class OrderCancelReturnView(APIView):
    """Customer: request return of a Delivered order within 7 days. Once set to Return Requested, status is locked for customer."""
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, user=request.user)
        except Order.DoesNotExist:
            return Response({'detail': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Already in return/cancel flow — cannot change again
        if order.status in Order.TERMINAL_STATUSES or order.status in ('Return Requested', 'Return Pickup', 'Refunded'):
            return Response(
                {'detail': 'A return has already been initiated for this order.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if order.status != 'Delivered':
            return Response(
                {'detail': 'Only delivered orders can be returned.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 7-day return window from purchase date
        deadline = order.created_at + timedelta(days=7)
        if timezone.now() > deadline:
            return Response(
                {'detail': 'Return window has expired. Returns are only accepted within 7 days of purchase.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = 'Return Requested'
        order.tracking_info = 'Your return request has been received. We will arrange a pickup soon.'
        order.save()

        serializer = OrderSerializer(order)
        return Response(serializer.data)


class OrderCustomerCancelPendingView(APIView):
    """Customer: cancel a Pending order."""
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, user=request.user)
        except Order.DoesNotExist:
            return Response({'detail': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        if order.status != 'Pending':
            return Response(
                {'detail': 'Only pending orders can be cancelled by the customer.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = 'Cancelled'
        order.tracking_info = 'Your order has been cancelled.'
        order.save()

        serializer = OrderSerializer(order)
        return Response(serializer.data)
