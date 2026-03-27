from django.urls import path
from .views import ProductListView, ProductDetailView, CategoryListView, SubCategoryListView, ProductImageCreateView

urlpatterns = [
    path('', ProductListView.as_view()),
    path('products/', ProductListView.as_view()),
    path('products/<int:pk>/', ProductDetailView.as_view()),
    path('categories/', CategoryListView.as_view()),
    path('subcategories/', SubCategoryListView.as_view()),
    path('images/', ProductImageCreateView.as_view()),
]
