from django.contrib import admin
from .models import Category, SubCategory, Product, ProductImage

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

class ProductAdmin(admin.ModelAdmin):
    inlines = [ProductImageInline]
    list_display = ('name', 'price', 'stock', 'created_at')
    search_fields = ('name', 'description')
    list_filter = ('categories', 'subcategories')

admin.site.register(Category)
admin.site.register(SubCategory)
admin.site.register(Product, ProductAdmin)
