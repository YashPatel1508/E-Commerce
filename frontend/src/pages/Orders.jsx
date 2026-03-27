import { useEffect, useState, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatPrice, formatDate, getImageUrl } from '../utils/format';
import { Package, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';

const STAGES = [
    { key: 'Pending',    label: 'Order Received',  Icon: Package },
    { key: 'Processing', label: 'Preparing',        Icon: Clock },
    { key: 'Shipped',    label: 'In Transit',       Icon: Truck },
    { key: 'Delivered',  label: 'Delivered',        Icon: CheckCircle },
];

const RETURN_STAGES = [
    { key: 'Return Requested', label: 'Return Requested', Icon: XCircle },
    { key: 'Return Pickup',    label: 'Pickup Scheduled', Icon: Truck },
    { key: 'Refunded',         label: 'Refunded',          Icon: CheckCircle },
];

const stageIndex = (status) => STAGES.findIndex(s => s.key === status);
const returnStageIndex = (status) => RETURN_STAGES.findIndex(s => s.key === status);

function TrackingTimeline({ order }) {
    const isReturn = ['Return Requested', 'Return Pickup', 'Refunded'].includes(order.status);
    const isCancelled = order.status === 'Cancelled';
    const currentIdx = (!isReturn && !isCancelled) ? stageIndex(order.status) : -1;
    const returnIdx = isReturn ? returnStageIndex(order.status) : -1;

    if (isCancelled) {
        return (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-sm text-xs font-medium uppercase tracking-widest mt-4">
                <XCircle className="w-4 h-4" strokeWidth={2}/> Order Cancelled
            </div>
        );
    }

    if (isReturn) {
        return (
            <div className="mt-6 mb-2">
                {order.tracking_info && (
                    <p className="text-xs text-orange-600 bg-orange-50 px-4 py-2 rounded-sm mb-4 font-medium border border-orange-100">
                        🔄 {order.tracking_info}
                    </p>
                )}
                <div className="relative flex items-center justify-between">
                    <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0">
                        <div className="h-full bg-orange-400 transition-all duration-700"
                            style={{ width: returnIdx >= 0 ? `${(returnIdx / (RETURN_STAGES.length - 1)) * 100}%` : '0%' }} />
                    </div>
                    {RETURN_STAGES.map((stage, idx) => {
                        const done = idx <= returnIdx;
                        const current = idx === returnIdx;
                        return (
                            <div key={stage.key} className="relative z-10 flex flex-col items-center text-center w-1/3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${done ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white border-gray-300 text-gray-400'} ${current ? 'ring-4 ring-orange-100 shadow-lg' : ''}`}>
                                    <stage.Icon className="w-4 h-4" strokeWidth={2} />
                                </div>
                                <p className={`text-[10px] mt-2 font-semibold uppercase tracking-wide ${done ? 'text-orange-500' : 'text-gray-400'}`}>
                                    {stage.label}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="mt-6 mb-2">
            {order.tracking_info && (
                <p className="text-xs text-indigo-600 bg-indigo-50 px-4 py-2 rounded-sm mb-4 font-medium border border-indigo-100">
                    📦 {order.tracking_info}
                </p>
            )}
            <div className="relative flex items-center justify-between">
                {/* Progress bar behind icons */}
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0">
                    <div
                        className="h-full bg-indigo-500 transition-all duration-700"
                        style={{ width: currentIdx >= 0 ? `${(currentIdx / (STAGES.length - 1)) * 100}%` : '0%' }}
                    />
                </div>
                {STAGES.map((stage, idx) => {
                    const done = idx <= currentIdx;
                    const current = idx === currentIdx;
                    return (
                        <div key={stage.key} className="relative z-10 flex flex-col items-center text-center w-1/4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${done ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-300 text-gray-400'} ${current ? 'ring-4 ring-indigo-100 shadow-lg' : ''}`}>
                                <stage.Icon className="w-4 h-4" strokeWidth={2} />
                            </div>
                            <p className={`text-[10px] mt-2 font-semibold uppercase tracking-wide ${done ? 'text-indigo-600' : 'text-gray-400'}`}>
                                {stage.label}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function Orders() {
    const { user, loading } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [returningId, setReturningId] = useState(null);

    useEffect(() => {
        if (user) {
            api.get('/checkout/orders/').then(res => setOrders(res.data.results || res.data));
        }
    }, [user]);

    const canReturn = (order) => {
        if (order.status !== 'Delivered') return false;
        const purchaseDate = new Date(order.created_at);
        const deadline = new Date(purchaseDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        return new Date() <= deadline;
    };

    const daysLeft = (order) => {
        const deadline = new Date(new Date(order.created_at).getTime() + 7 * 24 * 60 * 60 * 1000);
        return Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
    };

    const handleReturn = async (orderId) => {
        if (!window.confirm('Are you sure you want to return this order? This action cannot be undone.')) return;
        setReturningId(orderId);
        try {
            const res = await api.patch(`/checkout/orders/${orderId}/return/`, {});
            setOrders(prev => prev.map(o => o.id === orderId ? res.data : o));
        } catch (err) {
            const msg = err.response?.data?.detail || 'Return request failed.';
            alert(msg);
        } finally {
            setReturningId(null);
        }
    };

    const handleCustomerCancel = async (orderId) => {
        if (!window.confirm('Cancel this order? This cannot be undone.')) return;
        setReturningId(orderId);
        try {
            const res = await api.patch(`/checkout/orders/${orderId}/cancel/`, {});
            setOrders(prev => prev.map(o => o.id === orderId ? res.data : o));
        } catch (err) {
            const msg = err.response?.data?.detail || 'Cancellation failed.';
            alert(msg);
        } finally {
            setReturningId(null);
        }
    };

    if (loading) return <div className="flex justify-center py-40"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
    if (!user) return <Navigate to="/login" />;

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-10">Order History</h1>
            {orders.length === 0 ? (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center text-gray-500 flex flex-col items-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                    </div>
                    <p className="text-xl font-medium mb-4 text-gray-700">You haven't placed any orders yet.</p>
                    <Link to="/shop" className="text-white bg-indigo-600 px-8 py-3 rounded-full font-bold hover:bg-indigo-700 transition shadow-md">Start Shopping</Link>
                </div>
            ) : (
                <div className="space-y-8">
                    {orders.map((order, idx) => (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} key={order.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-slate-50 px-8 py-5 border-b border-gray-100 flex justify-between items-center flex-wrap gap-6">
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Order Placed</p>
                                    <p className="text-gray-900 font-semibold">{formatDate(order.created_at)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total</p>
                                    <p className="text-indigo-600 font-bold text-lg">${formatPrice(order.total_price)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Status</p>
                                    <span className={`inline-flex px-3 py-1 text-xs font-extrabold rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Order #</p>
                                    <p className="text-gray-900 font-mono font-semibold">{String(order.id).padStart(6, '0')}</p>
                                </div>

                                {/* Cancel button — only for Pending orders */}
                                {order.status === 'Pending' && (
                                    <div className="text-right">
                                        <button
                                            onClick={() => handleCustomerCancel(order.id)}
                                            disabled={returningId === order.id}
                                            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-red-600 border border-red-300 bg-red-50 hover:bg-red-100 px-4 py-2 transition disabled:opacity-50"
                                        >
                                            {returningId === order.id ? 'Cancelling...' : 'Cancel Order'}
                                        </button>
                                        <p className="text-[9px] text-gray-400 mt-1.5">Only available before processing</p>
                                    </div>
                                )}

                                {/* Return Button — only for Delivered within 7 days */}
                                {canReturn(order) && (
                                    <div className="text-right">
                                        <button
                                            onClick={() => handleReturn(order.id)}
                                            disabled={returningId === order.id}
                                            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-red-600 border border-red-300 bg-red-50 hover:bg-red-100 px-4 py-2 transition disabled:opacity-50"
                                        >
                                            {returningId === order.id ? 'Processing...' : `Return (${daysLeft(order)}d left)`}
                                        </button>
                                        <p className="text-[9px] text-gray-400 mt-1.5">7-day return window</p>
                                    </div>
                                )}
                            </div>
                            
                            {/* Live Delivery Tracking */}
                            <div className="px-8 pt-6 pb-2">
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Delivery Tracking</p>
                                <TrackingTimeline order={order} />
                            </div>

                            <div className="px-8 pb-8 pt-4">
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-4 border-t border-gray-100 pt-4">Items</p>
                                <ul className="divide-y divide-gray-100">
                                    {order.items.map(item => (
                                        <li key={item.id} className="py-5 flex items-center">
                                            <div className="w-20 h-20 bg-gray-100 rounded-xl mr-6 overflow-hidden border border-gray-100 shadow-sm">
                                                {item.product?.images?.[0] ? 
                                                    <img src={getImageUrl(item.product.images[0].image)} className="w-full h-full object-cover" /> : 
                                                    <div className="text-[10px] flex h-full items-center justify-center text-gray-400">No Image</div>
                                                }
                                            </div>
                                            <div className="flex-1">
                                                <Link to={`/products/${item.product?.id}`}>
                                                    <h4 className="text-lg font-bold text-gray-900 hover:text-indigo-600 transition">{item.product ? item.product.name : 'Unknown Product'}</h4>
                                                </Link>
                                                <p className="text-sm font-medium text-gray-500 mt-1">Qty: {item.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-gray-900">${formatPrice(item.price)}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
