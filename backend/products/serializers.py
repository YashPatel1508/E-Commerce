from rest_framework import serializers
from .models import Category, SubCategory, Product, ProductImage

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class SubCategorySerializer(serializers.ModelSerializer):
    category_id = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), source='category', write_only=True)
    category = CategorySerializer(read_only=True)
    
    class Meta:
        model = SubCategory
        fields = '__all__'

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ('id', 'product', 'image')

class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    subcategories = SubCategorySerializer(many=True, read_only=True)
    
    category_ids = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), many=True, write_only=True, source='categories', required=False)
    subcategory_ids = serializers.PrimaryKeyRelatedField(queryset=SubCategory.objects.all(), many=True, write_only=True, source='subcategories', required=False)

    class Meta:
        model = Product
        fields = ('id', 'name', 'description', 'price', 'stock', 'created_at', 'categories', 'subcategories', 'images', 'category_ids', 'subcategory_ids')
