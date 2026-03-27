import { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, LogIn, LogOut, User as UserIcon, Shield } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import clsx from 'clsx';

export default function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const { cartItems } = useContext(CartContext);
    const cartCount = (cartItems && Array.isArray(cartItems)) ? cartItems.reduce((acc, item) => acc + (item.quantity || 0), 0) : 0;
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    
    const isHome = location.pathname === '/';

    useEffect(() => {
        const handleScroll = () => {
             setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navClass = clsx(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-700 border-b",
        (scrolled || !isHome) ? "bg-luxury-black/95 backdrop-blur-md border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] py-4" : "bg-transparent border-transparent py-8"
    );

    const textColorClass = (scrolled || !isHome) ? "text-white" : "text-white";

    return (
        <nav className={navClass}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <Link to="/" className="flex flex-col group">
                            <span className="text-2xl md:text-3xl font-display font-medium text-luxury-gold tracking-[0.2em] uppercase">FeelLuxury</span>
                            <span className="text-[8px] md:text-[10px] font-sans font-light uppercase tracking-[0.4em] text-white/70 group-hover:text-luxury-gold outline-none transition duration-500 mt-1">Elegance Defined</span>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-8 md:space-x-10">
                        <Link to="/" className={`text-xs font-medium uppercase tracking-[0.15em] ${textColorClass} hover:text-luxury-gold transition duration-500 hidden sm:block`}>Home</Link>
                        <Link to="/shop" className={`text-xs font-medium uppercase tracking-[0.15em] ${textColorClass} hover:text-luxury-gold transition duration-500`}>Collections</Link>
                        
                        {user && (
                            <Link to="/cart" className={`relative group ${textColorClass} hover:text-luxury-gold transition duration-500`}>
                                <ShoppingBag className="w-5 h-5 font-light" strokeWidth={1.5} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1.5 -right-2 bg-luxury-gold text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-[0_4px_10px_rgba(197,160,89,0.5)]">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        )}

                        {user ? (
                            <div className="flex items-center space-x-6 border-l border-white/20 pl-6">
                                {user.is_staff && (
                                    <Link to="/admin" className="text-luxury-gold flex items-center hover:text-white transition font-medium uppercase text-[10px] tracking-[0.15em]">
                                        <Shield className="w-4 h-4 mr-1" strokeWidth={1.5} /> <span className="hidden sm:inline">Admin</span>
                                    </Link>
                                )}
                                <Link to="/orders" className={`${textColorClass} hover:text-luxury-gold flex items-center transition`}>
                                    <UserIcon className="w-5 h-5 font-light" strokeWidth={1.5} />
                                </Link>
                                <button onClick={logout} className={`${textColorClass} hover:text-white/50 flex items-center transition`}>
                                    <LogOut className="w-5 h-5 font-light" strokeWidth={1.5} />
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className="flex items-center text-luxury-black bg-luxury-gold px-6 py-2.5 rounded-sm hover:bg-white transition duration-500 font-medium uppercase tracking-[0.15em] text-xs shadow-lg shadow-luxury-gold/20">
                                <LogIn className="w-4 h-4 mr-2" strokeWidth={1.5} /> Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
