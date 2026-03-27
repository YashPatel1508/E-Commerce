import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const user = await login(email, password);
            if (!user.is_staff && !user.is_superuser) {
                logout();
                setError('Unauthorized: Admin privileges required to access this portal.');
            } else {
                navigate('/admin');
            }
        } catch (err) {
            setError('Invalid master credentials');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-luxury-black">
            <div className="absolute top-0 right-0 w-96 h-96 bg-luxury-gold/5 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-luxury-cream/5 rounded-full blur-[100px] pointer-events-none"></div>
            
            <div className="bg-[#121212] p-8 md:p-14 rounded-sm shadow-2xl w-full max-w-md border border-white/10 relative z-10">
                <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/20 flex items-center justify-center">
                        <Shield className="w-8 h-8" strokeWidth={1.5} />
                    </div>
                </div>
                <h2 className="text-2xl font-display font-medium text-white text-center mb-2 tracking-wide uppercase">Admin Portal</h2>
                <p className="text-[10px] text-white/50 text-center font-sans tracking-[0.2em] uppercase mb-10">Restricted Access</p>
                
                {error && <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-4 mb-8 text-xs font-light tracking-wide text-center">{error}</div>}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-medium text-white/70 uppercase tracking-widest mb-3">Master Email</label>
                        <input 
                            type="email" required
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white focus:bg-white/10 focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold outline-none transition font-light text-sm"
                            value={email} onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-medium text-white/70 uppercase tracking-widest mb-3">Master Password</label>
                        <input 
                            type="password" required
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white focus:bg-white/10 focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold outline-none transition font-light text-sm"
                            value={password} onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="w-full bg-luxury-gold text-luxury-black hover:bg-white font-medium py-4 text-xs tracking-[0.2em] uppercase transition duration-500 mt-6 shadow-[0_0_20px_rgba(197,160,89,0.3)] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                        Authenticate
                    </button>
                </form>
            </div>
        </div>
    );
}
