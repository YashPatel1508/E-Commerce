from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.db import transaction
from orders.models import Order, OrderItem
from products.models import Product

class MockPaymentView(APIView):
    """Mock Payment Gateway for free development."""
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        items_data = request.data.get('items', [])
        if not items_data:
            return Response({'detail': 'No items provided.'}, status=status.HTTP_400_BAD_REQUEST)

        total_price = 0
        order_items_to_create = []

        for item in items_data:
            try:
                product = Product.objects.get(id=item['product_id'])
                qty = int(item['quantity'])
                
                if product.stock < qty:
                    return Response({'detail': f'Insufficient stock for {product.name}.'}, status=status.HTTP_400_BAD_REQUEST)
                
                total_price += product.price * qty
                order_items_to_create.append((product, qty))
            except Product.DoesNotExist:
                return Response({'detail': f'Product {item["product_id"]} not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            # Create the order
            order = Order.objects.create(
                user=request.user,
                status='Processing',
                total_price=total_price,
                tracking_info='Paid via Mock Gateway. Your order is being prepared.'
            )

            # Create order items and update stock
            for product, qty in order_items_to_create:
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=qty,
                    price=product.price
                )
                product.stock -= qty
                product.save()

            return Response({
                'message': 'Payment successful via Mock Gateway.',
                'order_id': order.id,
                'redirect_url': '/checkout/success'
            })
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
