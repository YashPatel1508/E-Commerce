from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'is_staff')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Allow 'email' as an input key if the frontend sends it instead of 'username'
        if 'email' not in self.fields:
            self.fields['email'] = serializers.CharField(required=False)

    def validate(self, attrs):
        # If 'email' is passed but 'username' (the USERNAME_FIELD) is not, 
        # map 'email' to 'username' for the base class
        username_field = self.username_field
        if 'email' in attrs and username_field not in attrs:
            attrs[username_field] = attrs['email']
            
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data
