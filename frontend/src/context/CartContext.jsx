import { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

const CART_VERSION = "2.1"; // Updated for user-specific storage

export const CartProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [cartItems, setCartItems] = useState([]);

    // Get the storage key for the current user
    const getStorageKey = () => user ? `cart_user_${user.id}` : null;

    // Load cart when user changes
    useEffect(() => {
        const key = getStorageKey();
        if (!key) {
            setCartItems([]);
            return;
        }

        try {
            const version = localStorage.getItem(`${key}_version`);
            if (version !== CART_VERSION) {
                localStorage.removeItem(key);
                localStorage.setItem(`${key}_version`, CART_VERSION);
                setCartItems([]);
                return;
            }
            const localData = localStorage.getItem(key);
            if (!localData || localData === "null" || localData === "undefined") {
                setCartItems([]);
                return;
            }
            const parsed = JSON.parse(localData);
            setCartItems(Array.isArray(parsed) ? parsed : []);
        } catch (e) {
            console.error("Cart retrieval error:", e);
            setCartItems([]);
        }
    }, [user]);

    // Save cart when items change
    useEffect(() => {
        const key = getStorageKey();
        if (key && cartItems.length >= 0) {
            localStorage.setItem(key, JSON.stringify(cartItems));
        }
    }, [cartItems, user]);

    const addToCart = (product, quantity = 1) => {
        if (!user) return; // Prevent adding to cart if not logged in
        setCartItems(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { product, quantity, price: product.price }];
        });
    };

    const updateQuantity = (productId, newQty) => {
        if (newQty < 1) return;
        setCartItems(prev =>
            prev.map(item =>
                item.product.id === productId ? { ...item, quantity: newQty } : item
            )
        );
    };

    const removeFromCart = (productId) => {
        setCartItems(prev => prev.filter(item => item.product.id !== productId));
    };

    const clearCart = () => setCartItems([]);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, updateQuantity, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};
