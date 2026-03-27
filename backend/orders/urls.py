from django.urls import path
from .views import OrderListCreateView, OrderDetailView, OrderUpdateStatusView, OrderCancelReturnView, OrderCustomerCancelPendingView

urlpatterns = [
    path('orders/', OrderListCreateView.as_view(), name='order-list-create'),
    path('orders/<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('orders/<int:pk>/status/', OrderUpdateStatusView.as_view(), name='order-update-status'),
    path('orders/<int:pk>/return/', OrderCancelReturnView.as_view(), name='order-return'),
    path('orders/<int:pk>/cancel/', OrderCustomerCancelPendingView.as_view(), name='order-customer-cancel'),
]
