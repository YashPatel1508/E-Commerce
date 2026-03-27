import os
import re
import google.generativeai as genai
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.conf import settings
from products.models import Product
from orders.models import Order
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta

# Configure Gemini
genai.configure(api_key=os.environ.get('GEMINI_API_KEY', ''))

class ChatbotView(APIView):
    """
    ERA AI Chatbot with Advanced RAG (Products + Orders + History).
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        user_message = request.data.get('message', '')
        if not user_message:
            return Response({'detail': 'No message provided.'}, status=status.HTTP_400_BAD_REQUEST)

        # --- 1. Product Context (Standard RAG) ---
        keywords = user_message.lower().split()
        product_query = Q()
        for word in keywords:
            if len(word) > 3:
                product_query |= Q(name__icontains=word) | Q(description__icontains=word)
        
        relevant_products = Product.objects.filter(product_query)[:5]
        product_context = ""
        if relevant_products.exists():
            product_context = "\nRelevant Products:\n"
            for p in relevant_products:
                stock_status = "In Stock" if p.stock > 0 else "Out of Stock"
                product_context += f"- {p.name}: ₹{p.price} ({stock_status})\n"

        # --- 2. User Order Context (Advanced RAG) ---
        order_context = ""
        user = request.user
        
        if user.is_authenticated:
            # A. Check for specific order ID lookup
            order_id_match = re.search(r'#?(\d{1,6})', user_message)
            if order_id_match:
                search_id = int(order_id_match.group(1))
                try:
                    specific_order = Order.objects.prefetch_related('items__product').get(id=search_id, user=user)
                    items_list = ", ".join([f"{item.product.name} (x{item.quantity})" for item in specific_order.items.all() if item.product])
                    order_context += f"\nSpecific Order Inquiry (ID: {search_id}):\n"
                    order_context += f"- Status: {specific_order.status}\n"
                    order_context += f"- Total: ₹{specific_order.total_price}\n"
                    order_context += f"- Items: {items_list}\n"
                    order_context += f"- Date: {specific_order.created_at.strftime('%Y-%m-%d')}\n"
                except Order.DoesNotExist:
                    order_context += f"\nUser mentioned Order ID {search_id}, but I couldn't find it in their records.\n"

            # B. Check for "today" query
            if 'today' in user_message.lower():
                today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
                today_orders = Order.objects.filter(user=user, created_at__gte=today_start)
                if today_orders.exists():
                    order_context += f"\nOrders placed today ({today_start.strftime('%Y-%m-%d')}):\n"
                    for o in today_orders:
                        order_context += f"- Order #{o.id}: {o.status} (Total: ₹{o.total_price})\n"
                else:
                    order_context += "\nUser has placed no orders today.\n"

            # C. General History
            if any(word in user_message.lower() for word in ['history', 'my orders', 'last order', 'all orders']):
                recent_orders = Order.objects.filter(user=user).order_by('-created_at')[:5]
                if recent_orders.exists():
                    order_context += "\nUser's Recent Order History:\n"
                    for o in recent_orders:
                        order_context += f"- Order #{o.id}: {o.status} (Total: ₹{o.total_price}) on {o.created_at.strftime('%Y-%m-%d')}\n"
                else:
                    order_context += "\nUser has no order history yet.\n"
        else:
            if any(word in user_message.lower() for word in ['order', 'history', 'my']):
                order_context = "\nNote: The user is NOT logged in. You MUST politely ask them to sign in to see their personal order details.\n"

        # --- 3. Gemini Prompt ---
        system_prompt = f"""
        You are ERA, the elite AI concierge for our luxury e-commerce house.
        Your tone is sophisticated, precise, and profoundly helpful.
        
        Store context (Luxury Products):
        {product_context if product_context else "Curate general luxury suggestions."}
        
        Personal context for {user.username if user.is_authenticated else "Guest"}:
        {order_context}
        
        Current Time: {timezone.now().strftime('%Y-%m-%d %H:%M')}
        
        Directives:
        - If the user asks about 'today', use the specific 'Orders placed today' context above.
        - If an Order ID is present, give detailed status.
        - Always remain elegant and supportive.
        - If the user asks for information not in the context, use your internal knowledge about our brand's luxury identity.
        
        User's Message: "{user_message}"
        """

        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(system_prompt)
            return Response({'reply': response.text, 'name': 'ERA'})
        except Exception as e:
            fallback = "I am currently refining my records. How else may I assist your luxury journey today?"
            if not os.environ.get('GEMINI_API_KEY'):
                fallback = "I'm currently in offline mode. Please ensure my Gemini API Key is configured for full concierge service."
            # Include error for debugging if needed (or log it)
            print(f"Chatbot Error: {str(e)}")
            return Response({'reply': f"{fallback} (Error: {str(e)[:50]}...)", 'name': 'ERA'})
