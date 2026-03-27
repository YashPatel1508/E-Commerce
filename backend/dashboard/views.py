from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Sum, Count, F
from django.utils import timezone
from datetime import timedelta
from products.models import Product
from orders.models import Order, OrderItem
import csv
from django.http import HttpResponse


class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_staff)


class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get(self, request):
        # Net sales = Total price of all orders except Cancelled and Refunded
        total_sales = Order.objects.exclude(status__in=['Cancelled', 'Refunded']).aggregate(Sum('total_price'))['total_price__sum'] or 0
        total_orders = Order.objects.count() # Count all orders
        total_products = Product.objects.count()
        low_stock_alerts = Product.objects.filter(stock__lte=5).count()

        return Response({
            'total_sales': float(total_sales),
            'total_orders': total_orders,
            'total_products': total_products,
            'low_stock_alerts': low_stock_alerts
        })


class SalesAnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get(self, request):
        # Return last 7 days sales (Net revenue)
        today = timezone.now().date()
        data = []
        for i in range(6, -1, -1):
            date = today - timedelta(days=i)
            daily_orders = Order.objects.filter(created_at__date=date)
            # Revenue debits refunded/cancelled orders
            daily_sales = daily_orders.exclude(status__in=['Cancelled', 'Refunded']).aggregate(Sum('total_price'))['total_price__sum'] or 0
            data.append({
                'date': date.strftime('%Y-%m-%d'),
                'sales': float(daily_sales),
                'order_count': daily_orders.count()
            })
        return Response(data)


class OrderStatusStatsView(APIView):
    """Returns count of orders grouped by status for pie/donut chart."""
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get(self, request):
        status_counts = (
            Order.objects
            .values('status')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        return Response(list(status_counts))


class TopProductsView(APIView):
    """Returns top 10 products by total revenue / units sold."""
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get(self, request):
        top = (
            OrderItem.objects
            .values(name=F('product__name'))
            .annotate(
                revenue=Sum(F('price') * F('quantity')),
                units_sold=Sum('quantity'),
            )
            .order_by('-revenue')[:10]
        )
        return Response(list(top))


class MonthlyRevenueView(APIView):
    """Returns monthly revenue + order count for last 12 months (area chart)."""
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get(self, request):
        today = timezone.now().date()
        data = []
        for i in range(11, -1, -1):
            # First day of each month going back
            year = (today.replace(day=1) - timedelta(days=i * 30)).year
            month = (today.replace(day=1) - timedelta(days=i * 30)).month
            
            all_month_orders = Order.objects.filter(
                created_at__year=year,
                created_at__month=month
            )
            # Net revenue excludes returns/cancellations
            revenue = all_month_orders.exclude(status__in=['Cancelled', 'Refunded']).aggregate(Sum('total_price'))['total_price__sum'] or 0
            
            data.append({
                'month': f"{year}-{month:02d}",
                'revenue': float(revenue),
                'orders': all_month_orders.count(), # Count all orders
            })
        return Response(data)


class RefundNetRevenueView(APIView):
    """Returns weekly breakdown of gross revenue vs refunds for stacked bar chart."""
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get(self, request):
        today = timezone.now().date()
        data = []
        for i in range(7, -1, -1):
            week_start = today - timedelta(days=(i * 7 + 6))
            week_end = today - timedelta(days=i * 7)
            label = week_start.strftime('%b %d')

            active_orders = Order.objects.filter(
                created_at__date__gte=week_start,
                created_at__date__lte=week_end,
            )
            gross = active_orders.exclude(status__in=['Cancelled', 'Refunded']).aggregate(Sum('total_price'))['total_price__sum'] or 0
            refunded = active_orders.filter(status='Refunded').aggregate(Sum('total_price'))['total_price__sum'] or 0
            data.append({
                'week': label,
                'net_revenue': float(gross),
                'refunds': float(refunded),
            })
        return Response(data)


class ExportSalesCSVView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="sales_report.csv"'

        writer = csv.writer(response)
        writer.writerow(['Order ID', 'Customer Email', 'Status', 'Total Price', 'Date'])

        orders = Order.objects.all().order_by('-created_at')
        for order in orders:
            writer.writerow([order.id, order.user.email, order.status, order.total_price, order.created_at.strftime('%Y-%m-%d %H:%M:%S')])

        return response
