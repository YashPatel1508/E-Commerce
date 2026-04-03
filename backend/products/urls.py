from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, CategoryViewSet, SubCategoryViewSet

router = DefaultRouter()
router.register('products', ProductViewSet, basename='product')
router.register('categories', CategoryViewSet, basename='category')
router.register('subcategories', SubCategoryViewSet, basename='subcategory')

urlpatterns = [
    # Standard router URLs
    path('', include(router.urls)),
    
    # High-level Command POST routes for detail objects
    path('products/<int:pk>/action/', ProductViewSet.as_view({'post': 'handle_command'}), name='product-action'),
    path('categories/<int:pk>/action/', CategoryViewSet.as_view({'post': 'handle_command'}), name='category-action'),
    path('subcategories/<int:pk>/action/', SubCategoryViewSet.as_view({'post': 'handle_command'}), name='subcategory-action'),
]
