import { Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function AdminLayout() {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <div className="p-10 text-luxury-charcoal font-sans flex justify-center items-center min-h-screen">Authenticating Admin...</div>;
    if (!user) return <Navigate to="/admin/login" />;
    if (!user.is_staff && !user.is_superuser) return <Navigate to="/" />;

    return (
        <div className="flex bg-luxury-cream min-h-screen w-full pt-[88px] relative">
            <div className="w-64 flex-shrink-0 fixed bottom-0 left-0 top-[88px] overflow-y-auto bg-luxury-black z-40">
                <AdminSidebar />
            </div>
            <div className="flex-1 ml-64 p-10 min-h-[calc(100vh-88px)]">
                <Outlet />
            </div>
        </div>
    );
}
