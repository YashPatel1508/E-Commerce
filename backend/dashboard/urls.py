from django.urls import path
from .views import (
    DashboardStatsView, SalesAnalyticsView, ExportSalesCSVView,
    OrderStatusStatsView, TopProductsView, MonthlyRevenueView, RefundNetRevenueView
)

urlpatterns = [
    path('stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('analytics/', SalesAnalyticsView.as_view(), name='dashboard-analytics'),
    path('export/sales/', ExportSalesCSVView.as_view(), name='export-sales-csv'),
    path('order-status-stats/', OrderStatusStatsView.as_view(), name='order-status-stats'),
    path('top-products/', TopProductsView.as_view(), name='top-products'),
    path('monthly-revenue/', MonthlyRevenueView.as_view(), name='monthly-revenue'),
    path('refund-net-revenue/', RefundNetRevenueView.as_view(), name='refund-net-revenue'),
]
