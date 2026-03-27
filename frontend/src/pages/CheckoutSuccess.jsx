import { useEffect, useContext, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { CheckCircle, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CheckoutSuccess() {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const { clearCart } = useContext(CartContext);
    const [cleared, setCleared] = useState(false);

    useEffect(() => {
        if (!cleared) {
            clearCart();
            setCleared(true);
        }
    }, [clearCart, cleared]);

    return (
        <div className="min-h-screen bg-luxury-cream flex items-center justify-center pt-24 pb-12 px-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white border border-luxury-gray/10 p-12 text-center shadow-xl"
            >
                <div className="flex justify-center mb-8">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 border border-green-100">
                        <CheckCircle className="w-10 h-10" strokeWidth={1.5} />
                    </div>
                </div>
                
                <h1 className="text-3xl font-display font-medium text-luxury-black mb-4">Payment Successful</h1>
                <p className="text-luxury-gray text-sm font-light mb-8 leading-relaxed">
                    Thank you for your purchase. Your order is being processed and will be prepared with the utmost care.
                </p>

                <div className="bg-slate-50 border border-luxury-gray/5 p-4 mb-10 rounded-lg">
                    <p className="text-[10px] uppercase tracking-widest text-luxury-gray mb-1">Session ID</p>
                    <p className="text-[11px] font-mono text-luxury-charcoal truncate">{sessionId || 'N/A'}</p>
                </div>

                <div className="space-y-4">
                    <Link to="/orders" className="w-full py-4 bg-luxury-black text-white text-[11px] uppercase tracking-[0.2em] font-medium transition hover:bg-luxury-gold flex items-center justify-center gap-2">
                        View My Orders <ArrowRight className="w-3 h-3" />
                    </Link>
                    <Link to="/shop" className="w-full py-4 border border-luxury-gray/20 text-luxury-charcoal text-[11px] uppercase tracking-[0.2em] font-medium transition hover:border-luxury-black flex items-center justify-center gap-2">
                        <ShoppingBag className="w-3 h-3" /> Continue Shopping
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
