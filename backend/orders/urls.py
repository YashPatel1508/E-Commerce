from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet

router = DefaultRouter()
router.register('orders', OrderViewSet, basename='order')

urlpatterns = [
    # Standard router URLs
    path('', include(router.urls)),
    
    # High-level Command POST route for detail objects
    path('orders/<int:pk>/action/', OrderViewSet.as_view({'post': 'handle_command'}), name='order-action'),
]
