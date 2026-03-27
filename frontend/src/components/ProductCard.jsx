import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatPrice, getImageUrl } from '../utils/format';

export default function ProductCard({ product, index = 0, animationDelay = 0.1, duration = 0.8, showLimitedBadge = false, isFeatured = false }) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: isFeatured ? 30 : 20 }} 
            whileInView={isFeatured ? { opacity: 1, y: 0 } : undefined}
            animate={!isFeatured ? { opacity: 1, y: 0 } : undefined}
            viewport={isFeatured ? { once: true, margin: "-50px" } : undefined}
            transition={{ duration, delay: index * animationDelay }}
            className={isFeatured ? "group flex flex-col" : "group"}
        >
            <Link to={`/products/${product.id}`} className={isFeatured ? "block overflow-hidden relative mb-6" : "block"}>
                <div className={`aspect-[3/4] overflow-hidden relative ${isFeatured ? 'bg-luxury-gray/10' : 'bg-[#f5f5f5] mb-6'}`}>
                    {product.images?.[0] ? (
                        <img 
                            src={getImageUrl(product.images[0].image)} 
                            alt={product.name} 
                            className={`w-full h-full object-cover transition ${isFeatured ? 'hover:scale-105 duration-[1.5s] ease-out' : 'duration-[2s] group-hover:scale-105'}`} 
                        />
                    ) : (
                        <div className={`w-full h-full flex items-center justify-center ${isFeatured ? 'bg-[#111]' : ''}`}>
                            <span className={`${isFeatured ? 'text-white/20 text-2xl' : 'text-luxury-gray/30 text-xl'} font-display uppercase tracking-widest`}>
                                FeelLuxury
                            </span>
                        </div>
                    )}
                    {showLimitedBadge && product.stock <= 5 && product.stock > 0 && (
                        <div className="absolute top-4 right-4 bg-luxury-black text-white text-[9px] font-medium uppercase tracking-[0.2em] px-3 py-1">
                            Limited
                        </div>
                    )}
                </div>
                <div className="text-center">
                    <p className={`text-luxury-gray text-[9px] uppercase tracking-[0.2em] mb-2 ${isFeatured ? 'text-[10px]' : ''}`}>
                        {product.categories?.[0]?.name || 'Collection'}
                    </p>
                    {isFeatured ? (
                        <h3 className="text-lg font-display text-luxury-black mb-2 hover:text-luxury-gold transition duration-300">
                            {product.name}
                        </h3>
                    ) : (
                        <h3 className="text-base font-display text-luxury-black mb-1 group-hover:text-luxury-gold transition duration-300">
                            {product.name}
                        </h3>
                    )}
                    <p className={`text-luxury-charcoal font-sans font-light ${!isFeatured ? 'text-sm' : ''}`}>
                        ${formatPrice(product.price)}
                    </p>
                </div>
            </Link>
        </motion.div>
    );
}
