import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, LogOut, Tags } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import clsx from 'clsx';

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Categories', href: '/admin/categories', icon: Tags },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
];

export default function AdminSidebar() {
    const location = useLocation();
    const { logout } = useContext(AuthContext);

    return (
        <div className="flex flex-col w-64 bg-luxury-black border-r border-white/5 h-full">
            <div className="flex items-center justify-center h-24 border-b border-white/5">
                <div className="text-center">
                    <span className="text-xl font-display font-medium text-luxury-gold uppercase tracking-[0.2em] block">FeelLuxury</span>
                    <span className="text-[8px] font-sans font-light text-white/50 uppercase tracking-[0.4em] mt-1 block">Admin Portal</span>
                </div>
            </div>
            <div className="flex flex-col flex-1 overflow-y-auto">
                <nav className="flex-1 px-4 py-8 space-y-2">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href || (item.href !== '/admin' && location.pathname.startsWith(item.href));
                        return (
                            <NavLink
                                key={item.name}
                                to={item.href}
                                className={clsx(
                                    isActive ? 'bg-luxury-gold/10 text-luxury-gold' : 'text-gray-400 hover:bg-white/5 hover:text-white',
                                    'group flex items-center px-4 py-3 text-xs font-sans font-medium uppercase tracking-[0.1em] rounded-sm transition duration-500'
                                )}
                            >
                                <Icon className={clsx(isActive ? 'text-luxury-gold' : 'text-gray-400 group-hover:text-white', 'mr-4 h-4 w-4 transition duration-500')} strokeWidth={1.5} />
                                {item.name}
                            </NavLink>
                        );
                    })}
                </nav>
            </div>
            <div className="p-4 border-t border-white/5">
                <button
                    onClick={logout}
                    className="flex items-center w-full px-4 py-3 text-xs font-sans font-medium uppercase tracking-[0.1em] text-gray-400 rounded-sm hover:bg-white/5 hover:text-white transition duration-500"
                >
                    <LogOut className="mr-4 h-4 w-4" strokeWidth={1.5} />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
