import { useState, useContext } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { ArrowLeft, Loader2, Check, ShieldCheck, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatPrice } from '../utils/format';

export default function Checkout() {
    const { cartItems, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [step, setStep] = useState(1); // 1=form, 2=processing
    const [address, setAddress] = useState({ name: '', street: '', city: '', postal: '' });
    const total = cartItems.reduce((acc, item) => acc + (parseFloat(item.product.price) * item.quantity), 0);

    if (!user) return <Navigate to="/register?redirect=/checkout" replace />;
    if (cartItems.length === 0 && step === 1) return <Navigate to="/cart" replace />;

    const handlePayment = async (e) => {
        e.preventDefault();
        setStep(2);

        const items = cartItems.map(item => ({
            product_id: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
        }));

        try {
            // Use Mock Payment Gateway instead of Stripe
            const { data } = await api.post('/payments/mock-checkout/', { items });
            
            if (data.redirect_url) {
                clearCart();
                navigate(data.redirect_url);
            } else {
                throw new Error("No redirect received");
            }
        } catch (err) {
            console.error(err);
            alert('Payment failed. Please try again.');
            setStep(1);
        }
    };

    return (
        <div className="bg-luxury-cream min-h-screen text-luxury-black pt-32 pb-24 font-sans">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <Link to="/cart" className={`inline-flex items-center text-luxury-gray font-medium uppercase tracking-[0.15em] text-[10px] hover:text-luxury-black transition mb-12 ${step > 1 ? 'hidden' : ''}`}>
                    <ArrowLeft className="w-3 h-3 mr-2" strokeWidth={1.5} /> Return to Bag
                </Link>

                <div className="bg-[#fcfaf5] border border-luxury-gray/10 shadow-sm">
                    {step === 1 && (
                        <div className="p-8 md:p-16">
                            <h1 className="text-3xl font-display font-medium mb-12 text-center">Checkout</h1>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                                <form onSubmit={handlePayment} className="space-y-12">
                                    
                                    <div>
                                        <h2 className="text-sm font-sans font-medium uppercase tracking-[0.15em] border-b border-luxury-gray/20 pb-4 mb-6">Shipping Address</h2>
                                        <div className="space-y-6">
                                            <input
                                                type="text" required placeholder="Full Name"
                                                value={address.name}
                                                onChange={e => setAddress(a => ({...a, name: e.target.value}))}
                                                defaultValue={user?.first_name ? `${user.first_name} ${user.last_name}` : ''}
                                                className="w-full bg-transparent border-b border-luxury-gray/40 px-0 py-2 text-sm text-luxury-black placeholder-luxury-gray/60 focus:border-luxury-gold focus:outline-none transition font-light"
                                            />
                                            <input
                                                type="text" required placeholder="Street Address"
                                                className="w-full bg-transparent border-b border-luxury-gray/40 px-0 py-2 text-sm text-luxury-black placeholder-luxury-gray/60 focus:border-luxury-gold focus:outline-none transition font-light"
                                            />
                                            <div className="grid grid-cols-2 gap-6">
                                                <input type="text" required placeholder="City" className="w-full bg-transparent border-b border-luxury-gray/40 px-0 py-2 text-sm text-luxury-black placeholder-luxury-gray/60 focus:border-luxury-gold focus:outline-none transition font-light" />
                                                <input type="text" required placeholder="Postal Code" className="w-full bg-transparent border-b border-luxury-gray/40 px-0 py-2 text-sm text-luxury-black placeholder-luxury-gray/60 focus:border-luxury-gold focus:outline-none transition font-light" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mock Payment Badge */}
                                    <div className="border border-luxury-gray/20 p-5 flex items-center gap-4 bg-white shadow-sm ring-1 ring-luxury-gray/5">
                                        <ShieldCheck className="w-8 h-8 text-luxury-gold flex-shrink-0" strokeWidth={1} />
                                        <div>
                                            <p className="text-xs font-medium text-luxury-black mb-0.5">Secure Mock Payment</p>
                                            <p className="text-[10px] text-luxury-gray font-light">Using development gateway for testing. No actual funds will be transferred.</p>
                                        </div>
                                    </div>

                                    <button type="submit" className="w-full bg-luxury-black hover:bg-luxury-gold text-white py-5 font-sans font-medium tracking-[0.2em] uppercase text-[11px] transition duration-500 mt-8 flex items-center justify-center gap-3">
                                        <CreditCard className="w-4 h-4" /> Pay ₹{formatPrice(total)} via Mock Gateway
                                    </button>
                                    <p className="text-center text-[10px] text-luxury-gray mt-2 tracking-widest uppercase">Safe Simulation · Development Mode</p>
                                </form>

                                <div className="bg-[#f5f5f5] p-8">
                                    <h3 className="font-display font-medium text-lg mb-8">Order Summary</h3>
                                    <ul className="space-y-6 mb-8 border-b border-luxury-gray/20 pb-8">
                                        {cartItems.map(item => (
                                            <li key={item.product.id} className="flex justify-between items-start text-sm font-light text-luxury-charcoal">
                                                <div className="max-w-[70%]">
                                                    <span className="block mb-1 font-medium">{item.product.name}</span>
                                                    <span className="text-luxury-gray">Qty: {item.quantity}</span>
                                                </div>
                                                <span className="font-medium">₹{formatPrice(item.quantity * item.product.price)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="flex justify-between items-center text-xl font-display font-medium">
                                        <span>Total</span>
                                        <span>₹{formatPrice(total)}</span>
                                    </div>
                                    <p className="text-[9px] text-luxury-gray/60 mt-3 font-light">Taxes and shipping included in summary.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="p-24 flex flex-col items-center justify-center text-center">
                            <Loader2 className="w-8 h-8 text-luxury-gold animate-spin mb-8" strokeWidth={1} />
                            <h2 className="text-2xl font-display font-medium text-luxury-black mb-4">Redirecting to Secure Payment</h2>
                            <p className="text-luxury-gray font-light text-sm">You are being safely redirected to Stripe to complete your purchase.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
