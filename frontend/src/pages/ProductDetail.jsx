import { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiService from '../api/apiService';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { ShoppingBag, Check, ArrowLeft, Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatPrice, getImageUrl } from '../utils/format';

export default function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const { addToCart } = useContext(CartContext);
    const [added, setAdded] = useState(false);
    const [qty, setQty] = useState(1);

    useEffect(() => {
        window.scrollTo(0, 0);
        setQty(1);
        apiService.products.get(id)
           .then(res => {
               setProduct(res.data);
               setLoading(false);
           })
           .catch(err => {
               console.error(err);
               setLoading(false);
           });
    }, [id]);

    const handleAddToCart = () => {
        addToCart(product, qty);
        setAdded(true);
        setTimeout(() => setAdded(false), 3000);
    };

    if (loading) return <div className="min-h-screen bg-luxury-cream flex justify-center items-center text-luxury-gray font-sans text-xs uppercase tracking-[0.2em] animate-pulse">Retrieving Details...</div>;
    if (!product) return <div className="min-h-screen bg-luxury-cream flex justify-center items-center text-luxury-black font-display text-2xl uppercase tracking-widest">Piece Not Found</div>;

    const inStock = product.stock > 0;
    const maxQty = Math.min(product.stock || 1, 10);

    return (
        <div className="bg-luxury-cream min-h-screen text-luxury-black pt-32 pb-24 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <Link to="/shop" className="inline-flex items-center text-luxury-gray font-medium uppercase tracking-[0.15em] text-[10px] hover:text-luxury-black transition mb-12">
                    <ArrowLeft className="w-3 h-3 mr-2" strokeWidth={1.5} /> Back to Collection
                </Link>

                <div className="flex flex-col md:flex-row gap-16 lg:gap-24">
                    
                    {/* Image Section */}
                    <div className="md:w-1/2">
                        <div className="aspect-[3/4] bg-[#f5f5f5] relative overflow-hidden">
                            {product.images?.[0] ? (
                                <motion.img 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    transition={{ duration: 1 }}
                                    src={getImageUrl(product.images[0].image)} 
                                    alt={product.name} 
                                    className="w-full h-full object-cover" 
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-luxury-gray/30 font-display text-4xl uppercase tracking-widest">FeelLuxury</div>
                            )}
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="md:w-1/2 flex flex-col justify-center py-10 md:py-0">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
                            <div className="flex gap-3 mb-6">
                                {product.categories?.map(c => (
                                    <span key={c.id} className="text-[9px] font-medium uppercase tracking-[0.2em] text-luxury-gray border-b border-luxury-gray/30 pb-1">
                                        {c.name}
                                    </span>
                                ))}
                            </div>
                            
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium text-luxury-black mb-6 leading-tight">
                                {product.name}
                            </h1>
                            
                            <div className="text-2xl font-sans font-light text-luxury-charcoal mb-10">
                                ₹{formatPrice(product.price)}
                            </div>

                            <div className="w-12 h-px bg-luxury-gold mb-10"></div>

                            <div className="prose prose-sm text-luxury-charcoal font-light leading-relaxed mb-12">
                                <p>{product.description || "An exemplar of refined craftsmanship, this piece brings together premium materials and timeless design to elevate your collection."}</p>
                            </div>

                            <div className="mb-8 font-sans text-xs tracking-[0.1em] text-luxury-gray uppercase">
                                {inStock ? (
                                    <span className="text-green-700">Available — {product.stock} in stock</span>
                                ) : (
                                    <span className="text-red-900/60">Currently Unavailable</span>
                                )}
                            </div>

                            {/* Quantity Selector */}
                            {inStock && (
                                <div className="mb-8">
                                    <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-luxury-gray mb-3">Quantity</p>
                                    <div className="inline-flex items-center border border-luxury-gray/30">
                                        <button
                                            onClick={() => setQty(q => Math.max(1, q - 1))}
                                            className="w-10 h-10 flex items-center justify-center text-luxury-charcoal hover:bg-luxury-gold hover:text-white transition duration-300"
                                            aria-label="Decrease"
                                        >
                                            <Minus className="w-3 h-3" strokeWidth={2} />
                                        </button>
                                        <span className="w-12 h-10 flex items-center justify-center text-sm font-medium text-luxury-black border-x border-luxury-gray/30">
                                            {qty}
                                        </span>
                                        <button
                                            onClick={() => setQty(q => Math.min(maxQty, q + 1))}
                                            className="w-10 h-10 flex items-center justify-center text-luxury-charcoal hover:bg-luxury-gold hover:text-white transition duration-300"
                                            aria-label="Increase"
                                        >
                                            <Plus className="w-3 h-3" strokeWidth={2} />
                                        </button>
                                    </div>
                                    {qty > 1 && (
                                        <p className="text-[10px] text-luxury-gray mt-2 font-light">
                                            Subtotal: ₹{formatPrice(qty * product.price)}
                                        </p>
                                    )}
                                </div>
                            )}

                            {user ? (
                                <button 
                                    onClick={handleAddToCart}
                                    disabled={!inStock}
                                    className={`w-full py-5 flex items-center justify-center font-sans font-medium uppercase tracking-[0.2em] text-[11px] transition duration-500 ${
                                        inStock 
                                        ? (added ? 'bg-luxury-gold text-white border border-luxury-gold' : 'bg-luxury-black text-white hover:bg-white hover:text-luxury-black border border-luxury-black') 
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-200'
                                    }`}
                                >
                                    {added ? (
                                        <><Check className="mr-3 w-4 h-4" strokeWidth={1.5} />Added {qty > 1 ? `${qty} items ` : ''}to Bag</>
                                    ) : (
                                        <><ShoppingBag className="mr-3 w-4 h-4" strokeWidth={1.5} /> {inStock ? 'Add to Bag' : 'Out of Stock'}</>
                                    )}
                                </button>
                            ) : (
                                <Link 
                                    to="/login"
                                    className="w-full py-5 flex items-center justify-center font-sans font-medium uppercase tracking-[0.2em] text-[11px] bg-luxury-gold text-white hover:bg-white hover:text-luxury-gold border border-luxury-gold transition duration-500"
                                >
                                    <ShoppingBag className="mr-3 w-4 h-4" strokeWidth={1.5} /> Sign in to Add to Bag
                                </Link>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
