from django.urls import path
from .views import ChatbotView, ChatbotActionView

urlpatterns = [
    path('chat/', ChatbotView.as_view(), name='chatbot'),
    path('action/', ChatbotActionView.as_view(), name='chatbot_action'),
]
