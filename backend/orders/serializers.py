from rest_framework import serializers
from .models import Order, OrderItem
from products.serializers import ProductSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


class OrderUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'product_id', 'quantity', 'price')


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    user = OrderUserSerializer(read_only=True)

    class Meta:
        model = Order
        fields = ('id', 'user', 'status', 'total_price', 'tracking_info', 'created_at', 'items')
        read_only_fields = ('user', 'total_price', 'status', 'tracking_info', 'created_at')

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        user = self.context['request'].user

        # Validate stock availability first
        for item_data in items_data:
            from products.models import Product
            try:
                product = Product.objects.get(pk=item_data['product_id'])
            except Product.DoesNotExist:
                raise serializers.ValidationError(f"Product ID {item_data['product_id']} not found.")
            if product.stock < item_data['quantity']:
                raise serializers.ValidationError(
                    f"Insufficient stock for '{product.name}'. Only {product.stock} unit(s) available."
                )

        total_price = sum(item['price'] * item['quantity'] for item in items_data)
        order = Order.objects.create(user=user, total_price=total_price, **validated_data)

        for item_data in items_data:
            from products.models import Product
            product = Product.objects.get(pk=item_data['product_id'])
            OrderItem.objects.create(order=order, **item_data)
            # Deduct stock
            product.stock -= item_data['quantity']
            product.save()

        return order
