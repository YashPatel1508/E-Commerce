import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { user, login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        if (user) navigate('/');
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 bg-slate-50">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-luxury-gold/10 text-luxury-gold rounded-full flex items-center justify-center text-2xl font-display font-medium">FL</div>
                </div>
                <h2 className="text-3xl font-display font-medium text-luxury-black text-center mb-8">Client Sign In</h2>
                {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium flex justify-center text-center">{error}</div>}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-semibold text-luxury-charcoal uppercase tracking-wider mb-2">Email Address</label>
                        <input 
                            type="email" required
                            className="w-full px-4 py-3 border border-luxury-gray/20 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold outline-none transition font-light text-sm"
                            value={email} onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-luxury-charcoal uppercase tracking-wider mb-2">Password</label>
                        <input 
                            type="password" required
                            className="w-full px-4 py-3 border border-luxury-gray/20 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold outline-none transition font-light text-sm"
                            value={password} onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="w-full bg-luxury-black text-white font-medium py-4 text-xs tracking-widest uppercase hover:bg-luxury-gold transition duration-500 mt-4">
                        Sign In
                    </button>
                    <div className="text-center mt-6">
                        <p className="text-sm text-luxury-gray font-light">
                            Don't have an account? <Link to="/register" className="text-luxury-black font-medium hover:text-luxury-gold transition border-b border-transparent hover:border-luxury-gold pb-0.5">Register</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
