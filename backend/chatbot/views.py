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
from rest_framework.views import APIView

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
        
        Store context (Luxury Products):
        {product_context if product_context else "Curate general luxury suggestions."}
        
        Personal context for {user.username if user.is_authenticated else "Guest"}:
        {order_context}
        
        Current Time: {timezone.now().strftime('%Y-%m-%d %H:%M')}
        
        Directives:
        - Response Format: ALWAYS use high-end Markdown. Use **bold** for emphasis, bullet points for lists, and `tables` for data comparisons where appropriate.
        - Data Precision: If the user asks for a specific piece of information (e.g., "total payment", "status", "delivery date"), provide that value CLEARLY and PROMINENTLY (e.g., **Total Payment: ₹2160.00**). Avoid burying the direct answer in long paragraphs.
        - Tone: Elegant, sophisticated, and elitist yet helpful.
        - Proactiveness: If an order is "Pending" or "Processing", explicitly offer to cancel it. If "Delivered" within 7 days, mention the return option.
        - Context Awareness: If the user asks about 'today', use the specific 'Orders placed today' context.
        - Brand Alignment: If information is missing, speak from the perspective of a world-class luxury concierge.
        
        User's Message: "{user_message}"
        """

        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(system_prompt)
            
            # --- 4. Logic for Action Buttons ---
            actions = []
            if user.is_authenticated and order_id_match:
                search_id = int(order_id_match.group(1))
                try:
                    order = Order.objects.get(id=search_id, user=user)
                    if order.status in ('Pending', 'Processing'):
                        actions.append({'label': f'Cancel Order #{order.id}', 'type': 'cancel', 'order_id': order.id})
                    elif order.status == 'Delivered':
                        deadline = order.created_at + timedelta(days=7)
                        if timezone.now() <= deadline:
                            actions.append({'label': f'Return Order #{order.id}', 'type': 'return', 'order_id': order.id})
                except Order.DoesNotExist:
                    pass

            return Response({
                'reply': response.text, 
                'name': 'ERA',
                'actions': actions
            })
        except Exception as e:
            fallback = "I am currently refining my records. How else may I assist your luxury journey today?"
            if not os.environ.get('GEMINI_API_KEY'):
                fallback = "I'm currently in offline mode. Please ensure my Gemini API Key is configured for full concierge service."
            # Include error for debugging if needed (or log it)
            print(f"Chatbot Error: {str(e)}")
            return Response({'reply': f"{fallback} (Error: {str(e)[:50]}...)", 'name': 'ERA'})

class ChatbotActionView(APIView):
    """
    Handle specific order actions (cancel, return) triggered by the chatbot.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        action_type = request.data.get('type')
        order_id = request.data.get('order_id')
        
        if not action_type or not order_id:
            return Response({'detail': 'Type and order_id are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response({'detail': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        if action_type == 'cancel':
            if order.status not in ('Pending', 'Processing'):
                return Response({'detail': 'Only Pending or Processing orders can be cancelled.'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Stock restoration
            for item in order.items.all():
                if item.product:
                    item.product.stock += item.quantity
                    item.product.save()

            order.status = 'Cancelled'
            order.tracking_info = 'Cancelled via ERA Concierge service.'
            order.save()
            return Response({'reply': f'Order #{order_id} has been successfully cancelled at your request. Is there anything else I can assist you with?'})

        elif action_type == 'return':
            if order.status != 'Delivered':
                return Response({'detail': 'Only delivered orders can be returned.'}, status=status.HTTP_400_BAD_REQUEST)
            
            due_at = order.created_at + timedelta(days=7)
            if timezone.now() > due_at:
                return Response({'detail': 'Return period (7 days) has expired.'}, status=status.HTTP_400_BAD_REQUEST)

            order.status = 'Return Requested'
            order.tracking_info = 'Return initiated via ERA Concierge service. We will arrange pick-up.'
            order.save()
            return Response({'reply': f'Of course. I have initiated the return request for Order #{order_id}. A representative will contact you for pickup shortly.'})

        return Response({'detail': 'Invalid action type.'}, status=status.HTTP_400_BAD_REQUEST)
