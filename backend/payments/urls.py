from django.urls import path
from .views import MockPaymentView

urlpatterns = [
    path('mock-checkout/', MockPaymentView.as_view(), name='mock-checkout'),
]
