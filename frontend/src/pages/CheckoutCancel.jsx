import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CheckoutCancel() {
    return (
        <div className="min-h-screen bg-luxury-cream flex items-center justify-center pt-24 pb-12 px-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white border border-luxury-gray/10 p-12 text-center shadow-xl"
            >
                <div className="flex justify-center mb-8">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 border border-red-100">
                        <XCircle className="w-10 h-10" strokeWidth={1.5} />
                    </div>
                </div>
                
                <h1 className="text-3xl font-display font-medium text-luxury-black mb-4">Payment Cancelled</h1>
                <p className="text-luxury-gray text-sm font-light mb-10 leading-relaxed">
                    Your transaction was cancelled. No charges were made. Your selected items are still in your bag if you'd like to try again.
                </p>

                <div className="space-y-4">
                    <Link to="/checkout" className="w-full py-4 bg-luxury-black text-white text-[11px] uppercase tracking-[0.2em] font-medium transition hover:bg-luxury-gold flex items-center justify-center gap-2">
                        Return to Checkout <ArrowLeft className="w-3 h-3" />
                    </Link>
                    <a href="mailto:support@feelluxury.com" className="w-full py-4 border border-luxury-gray/20 text-luxury-charcoal text-[11px] uppercase tracking-[0.2em] font-medium transition hover:border-luxury-black flex items-center justify-center gap-2">
                        <HelpCircle className="w-3 h-3" /> Contact Support
                    </a>
                </div>
            </motion.div>
        </div>
    );
}
