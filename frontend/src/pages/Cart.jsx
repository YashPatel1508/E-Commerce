import { useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { Trash2, ChevronRight, Plus, Minus } from 'lucide-react';
import { formatPrice, getImageUrl } from '../utils/format';

export default function Cart() {
    const { user } = useContext(AuthContext);
    const { cartItems, removeFromCart, clearCart, updateQuantity } = useContext(CartContext);
    
    if (!user) return <Navigate to="/login" />;
    
    const total = cartItems.reduce((acc, item) => acc + (parseFloat(item.product.price) * item.quantity), 0);

    if (cartItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-40 text-luxury-black bg-luxury-cream min-h-screen">
                <h2 className="text-3xl font-display font-medium text-luxury-black mb-6">Your bag is empty</h2>
                <div className="w-12 h-px bg-luxury-gold mb-10"></div>
                <Link to="/shop" className="text-luxury-charcoal border-b border-luxury-charcoal hover:text-luxury-gold hover:border-luxury-gold transition font-sans font-medium uppercase text-[10px] tracking-[0.2em] pb-1">Discover the Collection</Link>
            </div>
        );
    }

    return (
        <div className="bg-luxury-cream min-h-screen text-luxury-black pt-32 pb-24 font-sans">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-display font-medium text-center mb-16">Shopping Bag</h1>
                
                <div className="flex flex-col lg:flex-row gap-16">
                    <div className="lg:w-2/3">
                        <ul className="divide-y divide-luxury-gray/20 border-t border-luxury-gray/20">
                            <AnimatePresence>
                                {cartItems.map(item => (
                                    <motion.li
                                        key={item.product.id}
                                        layout
                                        exit={{ opacity: 0, height: 0, marginTop: 0, paddingTop: 0, paddingBottom: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="py-8 flex flex-col sm:flex-row items-center sm:items-start group"
                                    >
                                        <Link to={`/products/${item.product.id}`} className="flex-shrink-0 w-32 h-40 bg-[#f5f5f5] mb-6 sm:mb-0 sm:mr-8 overflow-hidden block">
                                            {item.product.images?.[0] ? (
                                                <img src={getImageUrl(item.product.images[0].image)} alt={item.product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-1000" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-luxury-gray/30 font-display text-sm tracking-widest">FeelLuxury</div>
                                            )}
                                        </Link>
                                        
                                        <div className="flex-1 text-center sm:text-left flex flex-col h-full justify-between">
                                            <div>
                                                <Link to={`/products/${item.product.id}`}>
                                                    <h3 className="text-lg font-display text-luxury-black hover:text-luxury-gold transition mb-2">{item.product.name}</h3>
                                                </Link>
                                                <p className="text-luxury-gray font-light text-xs mb-5 uppercase tracking-widest">
                                                    {formatPrice(item.product.price)} each
                                                </p>

                                                {/* Quantity Controls */}
                                                <div className="inline-flex items-center border border-luxury-gray/30 mb-5">
                                                    <button
                                                        onClick={() => {
                                                            if (item.quantity === 1) removeFromCart(item.product.id);
                                                            else updateQuantity(item.product.id, item.quantity - 1);
                                                        }}
                                                        className="w-9 h-9 flex items-center justify-center text-luxury-charcoal hover:bg-luxury-gold hover:text-white transition duration-300"
                                                        aria-label="Decrease quantity"
                                                    >
                                                        <Minus className="w-3 h-3" strokeWidth={2} />
                                                    </button>
                                                    <span className="w-10 h-9 flex items-center justify-center text-sm font-medium text-luxury-black border-x border-luxury-gray/30">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                        className="w-9 h-9 flex items-center justify-center text-luxury-charcoal hover:bg-luxury-gold hover:text-white transition duration-300"
                                                        aria-label="Increase quantity"
                                                    >
                                                        <Plus className="w-3 h-3" strokeWidth={2} />
                                                    </button>
                                                </div>
                                            </div>
                                            <button onClick={() => removeFromCart(item.product.id)} className="text-luxury-gray hover:text-red-900/60 transition inline-flex items-center justify-center sm:justify-start text-[10px] font-medium uppercase tracking-[0.1em] gap-1.5">
                                                <Trash2 className="w-3 h-3" strokeWidth={1.5} />
                                                Remove Item
                                            </button>
                                        </div>
                                        
                                        <div className="text-center sm:text-right mt-6 sm:mt-0">
                                            <p className="text-lg font-sans font-light text-luxury-charcoal">${formatPrice(item.quantity * item.product.price)}</p>
                                            <p className="text-[10px] text-luxury-gray/60 mt-1">Qty: {item.quantity}</p>
                                        </div>
                                    </motion.li>
                                ))}
                            </AnimatePresence>
                        </ul>
                    </div>
                    
                    <div className="lg:w-1/3">
                        <div className="bg-[#fcfaf5] border border-luxury-gray/10 p-10 sticky top-32">
                            <h2 className="text-xl font-display font-medium border-b border-luxury-gray/20 pb-4 mb-8">Summary</h2>
                            
                            <div className="space-y-3 mb-8">
                                {cartItems.map(item => (
                                    <div key={item.product.id} className="flex justify-between text-luxury-charcoal font-light text-xs">
                                        <span className="truncate max-w-[65%]">{item.product.name} <span className="text-luxury-gray">×{item.quantity}</span></span>
                                        <span>${formatPrice(item.quantity * item.product.price)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between text-luxury-charcoal mb-4 font-light text-sm border-t border-luxury-gray/20 pt-4">
                                <span>Subtotal</span>
                                <span>${formatPrice(total)}</span>
                            </div>
                            <div className="flex justify-between text-luxury-charcoal mb-8 font-light text-sm">
                                <span>Shipping</span>
                                <span>Complimentary</span>
                            </div>
                            
                            <div className="flex justify-between items-center text-xl font-display font-medium pt-8 border-t border-luxury-gray/20 mb-10">
                                <span>Total</span>
                                <span>${formatPrice(total)}</span>
                            </div>
                            
                            <Link to="/checkout" className="w-full bg-luxury-black hover:bg-luxury-gold text-white py-4 flex items-center justify-center font-sans font-medium uppercase tracking-[0.2em] text-[10px] transition duration-500">
                                Secure Checkout <ChevronRight className="w-3 h-3 ml-2" />
                            </Link>
                            <button onClick={clearCart} className="w-full mt-4 bg-transparent border border-luxury-gray/20 text-luxury-charcoal hover:bg-luxury-gray/5 hover:border-luxury-gray/40 py-4 flex items-center justify-center font-sans font-medium uppercase tracking-[0.2em] text-[10px] transition duration-500">
                                Empty Bag
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
