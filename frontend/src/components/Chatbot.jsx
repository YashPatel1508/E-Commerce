import { useState, useRef, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, User, Loader2 } from 'lucide-react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

export default function Chatbot() {
    const { user } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "Welcome to our luxury collection. I am ERA, your personal shopping assistant. How may I elevate your experience today?" }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsTyping(true);

        try {
            const { data } = await api.post('/chatbot/chat/', { message: userMsg });
            setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', text: "I apologize, but I'm momentarily unavailable. Please browse our collection in the meantime." }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-50 font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.8 }}
                        className="bg-white/95 backdrop-blur-xl w-[380px] h-[550px] shadow-2xl overflow-hidden border border-luxury-black/5 ring-1 ring-luxury-black/5 flex flex-col mb-6"
                        style={{ borderRadius: '24px' }}
                    >
                        {/* Header */}
                        <div className="bg-luxury-black text-white p-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-luxury-gold rounded-full flex items-center justify-center shadow-inner">
                                    <Sparkles className="w-5 h-5 text-luxury-black" strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-display font-medium tracking-[0.1em] uppercase">ERA</h3>
                                    <p className="text-[10px] text-white/60 font-medium tracking-widest uppercase">Luxury Concierge</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-[#fcfaf5]/50">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={idx}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] p-4 text-xs leading-relaxed ${
                                        msg.role === 'user' 
                                            ? 'bg-luxury-black text-white rounded-[20px_20px_4px_20px]' 
                                            : 'bg-white border border-luxury-gray/10 text-luxury-charcoal rounded-[20px_20px_20px_4px] shadow-sm'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}
                            {isTyping && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                    <div className="bg-white border border-luxury-gray/10 p-4 rounded-[20px_20px_20px_4px] shadow-sm">
                                        <Loader2 className="w-4 h-4 text-luxury-gold animate-spin" />
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-4 border-t border-luxury-gray/10 bg-white">
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Inquire about our collection..."
                                    className="w-full bg-luxury-cream/50 border-none rounded-full py-4 pl-6 pr-14 text-xs font-light focus:ring-1 focus:ring-luxury-gold/30 outline-none placeholder:italic"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 w-10 h-10 bg-luxury-black rounded-full flex items-center justify-center text-white hover:bg-luxury-gold transition-colors duration-300 shadow-md"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-[10px] text-center text-luxury-gray mt-3 font-medium uppercase tracking-[0.1em] opacity-40">ERA Personalized Service</p>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-colors duration-500 ${
                    isOpen ? 'bg-white text-luxury-black' : 'bg-luxury-black text-white ring-4 ring-luxury-gold/30'
                }`}
            >
                {isOpen ? <X className="w-8 h-8" /> : <MessageCircle className="w-8 h-8" />}
                {!isOpen && (
                    <div className="absolute top-0 right-0 w-4 h-4 bg-luxury-gold rounded-full border-2 border-luxury-black animate-pulse" />
                )}
            </motion.button>
        </div>
    );
}
