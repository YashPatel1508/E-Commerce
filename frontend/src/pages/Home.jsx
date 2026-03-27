import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

export default function Home() {
    const [featured, setFeatured] = useState([]);

    useEffect(() => {
        window.scrollTo(0, 0);
        api.get('/shop/products/?ordering=-created_at').then(res => setFeatured(res.data.results?.slice(0, 4) || []));
    }, []);

    return (
        <div className="bg-luxury-cream min-h-screen text-luxury-black font-sans">
            {/* Cinematic Hero Section */}
            <div className="relative h-screen flex items-center justify-center overflow-hidden bg-luxury-black">
                <div className="absolute inset-0 z-0">
                    <img src="https://images.unsplash.com/photo-1549439602-43ebca2327af?q=80&w=2000&auto=format&fit=crop" className="w-full h-full object-cover opacity-60 scale-105" alt="Luxury Fashion" />
                    <div className="absolute inset-0 bg-gradient-to-b from-luxury-black/80 via-luxury-black/40 to-luxury-black"></div>
                </div>
                
                <div className="relative z-20 max-w-5xl mx-auto px-4 text-center mt-20">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ duration: 1.5, ease: "easeOut" }} 
                    >
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8, duration: 1.5 }}
                            className="text-luxury-gold font-sans font-light uppercase tracking-[0.4em] mb-6 text-sm"
                        >
                            The Spring / Summer Collection
                        </motion.p>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-medium text-white mb-8 tracking-wide leading-tight">
                            Exquisite <br/> <span className="italic text-luxury-lightgold font-light">Elegance</span>
                        </h1>
                        <p className="text-sm md:text-base font-light mb-12 text-white/70 max-w-lg mx-auto tracking-wide leading-relaxed">
                            Discover collections curated for the sophisticated palette. Redefining modern luxury through timeless design.
                        </p>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2, duration: 1.5 }}
                        >
                            <Link to="/shop" className="inline-block border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-luxury-black font-sans font-medium uppercase tracking-[0.2em] py-4 px-12 transition duration-700 text-xs">
                                Discover the Collection
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Featured Collection Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 bg-luxury-cream">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1 }}
                    className="text-center mb-20"
                >
                    <h2 className="text-4xl md:text-5xl font-display font-normal text-luxury-black tracking-wide mb-4">Curated Selections</h2>
                    <div className="w-12 h-px bg-luxury-gold mx-auto"></div>
                </motion.div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                    {featured.map((product, idx) => (
                        <ProductCard 
                            key={product.id} 
                            product={product} 
                            index={idx}
                            isFeatured={true}
                        />
                    ))}
                </div>
                <div className="mt-20 text-center">
                    <Link to="/shop" className="inline-block border-b border-luxury-black text-luxury-black hover:text-luxury-gold hover:border-luxury-gold pb-1 font-sans font-medium uppercase tracking-[0.1em] text-xs transition duration-500">
                        View All Collections
                    </Link>
                </div>
            </div>

            {/* Cinematic Parallax Section */}
            <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5 }}
                className="relative py-[250px] bg-fixed bg-center bg-cover overflow-hidden"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1549439602-43ebca2327af?q=80&w=2000&auto=format&fit=crop')" }} /* Replaced with luxury watches/fashion placeholder */
            >
                <div className="absolute inset-0 bg-luxury-black/70"></div>
                <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ duration: 1.5, delay: 0.2 }}
                    >
                        <h2 className="text-4xl md:text-6xl font-display font-light text-white mb-8 tracking-wide">Timeless <span className="italic text-luxury-lightgold">Design</span></h2>
                        <p className="text-white/80 font-light mb-10 max-w-lg mx-auto tracking-wide">Explore pieces designed with an uncompromising dedication to craftsmanship and aesthetics.</p>
                        <Link to="/shop" className="inline-block bg-luxury-gold text-luxury-black hover:bg-white hover:text-luxury-black font-sans font-medium uppercase tracking-[0.2em] px-10 py-4 transition duration-500 text-xs">
                            Shop The Look
                        </Link>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
