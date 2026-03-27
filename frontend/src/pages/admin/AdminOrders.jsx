import React, { useState, useEffect, Fragment } from 'react';
import api from '../../api/axios';
import { CheckCircle, Clock, Package, Truck, XCircle } from 'lucide-react';
import { formatPrice, formatDate, getImageUrl } from '../../utils/format';

// Maps each status to the only valid next statuses an admin can set
const NEXT_STATUS = {
    'Pending':          ['Processing', 'Cancelled'],
    'Processing':       ['Shipped'],
    'Shipped':          ['Delivered'],
    'Delivered':        [], // customer-only: Return
    'Return Requested': ['Return Pickup'],
    'Return Pickup':    ['Refunded'],
    'Refunded':         [], // terminal
    'Cancelled':        [], // terminal
};

const TERMINAL_STATUSES = ['Cancelled', 'Refunded'];
const RETURN_STATUSES = ['Return Requested', 'Return Pickup', 'Refunded', 'Cancelled'];


const statusStyle = {
    Completed:          { icon: CheckCircle, cls: 'text-green-700 bg-green-50 border-green-200' },
    Processing:         { icon: Clock,       cls: 'text-amber-700 bg-amber-50 border-amber-200' },
    Shipped:            { icon: Truck,       cls: 'text-blue-700 bg-blue-50 border-blue-200' },
    Delivered:          { icon: CheckCircle, cls: 'text-green-700 bg-green-50 border-green-200' },
    Pending:            { icon: Package,     cls: 'text-luxury-charcoal bg-luxury-gray/10 border-luxury-gray/30' },
    Cancelled:          { icon: XCircle,     cls: 'text-red-700 bg-red-50 border-red-200' },
    'Return Requested': { icon: XCircle,     cls: 'text-orange-700 bg-orange-50 border-orange-200' },
    'Return Pickup':    { icon: Truck,       cls: 'text-purple-700 bg-purple-50 border-purple-200' },
    Refunded:           { icon: CheckCircle, cls: 'text-teal-700 bg-teal-50 border-teal-200' },
};

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    const toggleOrderDetails = (orderId) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    const fetchOrders = () => {
        api.get('/checkout/orders/')
           .then(res => {
               setOrders(res.data.results || res.data);
               setLoading(false);
           })
           .catch(err => {
               console.error(err);
               setLoading(false);
           });
    };

    useEffect(() => { fetchOrders(); }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        setUpdatingId(orderId);
        try {
            const res = await api.patch(`/checkout/orders/${orderId}/status/`, { status: newStatus });
            setOrders(prev => prev.map(o => o.id === orderId ? res.data : o));
        } catch (err) {
            console.error('Status update failed:', err);
            alert('Failed to update order status.');
        } finally {
            setUpdatingId(null);
        }
    };

    const getUserDisplay = (order) => {
        if (order.user?.first_name) return `${order.user.first_name} ${order.user.last_name}`;
        if (order.user?.email) return order.user.email;
        if (order.user?.username) return order.user.username;
        return `User #${order.user?.id || '?'}`;
    };

    return (
        <div className="font-sans">
            <div className="mb-10">
                <h1 className="text-3xl font-display font-medium text-luxury-black mb-2">Order Management</h1>
                <p className="text-luxury-gray text-xs font-light tracking-[0.05em]">Review, dispatch, and manage client transactions.</p>
            </div>

            <div className="bg-white rounded-sm border border-luxury-gray/20 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-luxury-gray/10 flex justify-between items-center bg-[#fcfaf5]">
                    <h2 className="text-sm font-medium uppercase tracking-[0.1em] text-luxury-charcoal">Recent Transactions</h2>
                    <span className="text-[10px] font-medium bg-luxury-gold/10 text-luxury-gold px-3 py-1 uppercase tracking-widest">{orders.length} Total</span>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-luxury-gray/10">
                        <thead className="bg-[#fcfaf5]">
                            <tr>
                                <th className="px-8 py-5 text-left font-medium text-luxury-gray uppercase tracking-[0.1em] text-[10px]">Order ID</th>
                                <th className="px-8 py-5 text-left font-medium text-luxury-gray uppercase tracking-[0.1em] text-[10px]">Client / Date</th>
                                <th className="px-8 py-5 text-left font-medium text-luxury-gray uppercase tracking-[0.1em] text-[10px]">Total Amount</th>
                                <th className="px-8 py-5 text-left font-medium text-luxury-gray uppercase tracking-[0.1em] text-[10px]">Status</th>
                                <th className="px-8 py-5 text-left font-medium text-luxury-gray uppercase tracking-[0.1em] text-[10px]">Update Status</th>
                                <th className="px-8 py-5 text-right font-medium text-luxury-gray uppercase tracking-[0.1em] text-[10px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-luxury-gray/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-10 text-center text-luxury-gray text-xs uppercase tracking-widest animate-pulse">Retrieving Data...</td>
                                </tr>
                            ) : orders.map(order => {
                                const s = statusStyle[order.status] || statusStyle['Pending'];
                                const Icon = s.icon;
                                return (
                                    <Fragment key={order.id}>
                                        <tr className="hover:bg-luxury-cream/30 transition duration-300">
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="text-xs font-medium text-luxury-charcoal tracking-wide">#{String(order.id).padStart(6, '0')}</div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="text-sm font-medium text-luxury-black">{getUserDisplay(order)}</div>
                                                <div className="text-[10px] text-luxury-gray font-light mt-1">{formatDate(order.created_at)}</div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="text-sm font-medium text-luxury-gold">${formatPrice(order.total_price)}</div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <span className={`flex items-center w-fit text-[10px] border px-3 py-1 uppercase tracking-[0.1em] font-medium ${s.cls}`}>
                                                    <Icon className="w-3 h-3 mr-1" strokeWidth={2}/> {order.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                {(() => {
                                                    const nextOptions = NEXT_STATUS[order.status] || [];
                                                    if (nextOptions.length === 0) {
                                                        return <span className="text-[9px] uppercase tracking-widest text-luxury-gray italic font-light">Locked</span>;
                                                    }
                                                    return (
                                                        <>
                                                            <select
                                                                key={order.status}
                                                                defaultValue=""
                                                                disabled={updatingId === order.id}
                                                                onChange={(e) => { if (e.target.value) handleStatusChange(order.id, e.target.value); }}
                                                                className="text-[10px] border border-luxury-gray/30 bg-[#fcfaf5] text-luxury-charcoal px-3 py-2 uppercase tracking-widest font-medium focus:outline-none focus:border-luxury-gold transition cursor-pointer disabled:opacity-50"
                                                            >
                                                                <option value="" disabled>Move to…</option>
                                                                {nextOptions.map(opt => (
                                                                    <option key={opt} value={opt}>{opt}</option>
                                                                ))}
                                                            </select>
                                                            {updatingId === order.id && (
                                                                <span className="ml-2 text-[9px] text-luxury-gold animate-pulse uppercase tracking-widest">Saving...</span>
                                                            )}
                                                        </>
                                                    );
                                                })()}
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap text-right text-sm">
                                                <button 
                                                    onClick={() => toggleOrderDetails(order.id)}
                                                    className="text-[10px] font-medium uppercase tracking-[0.1em] border-b border-luxury-black text-luxury-black hover:text-luxury-gold hover:border-luxury-gold transition pb-0.5">
                                                    {expandedOrderId === order.id ? 'Hide' : 'View Items'}
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedOrderId === order.id && (
                                            <tr>
                                                <td colSpan="6" className="px-8 py-6 bg-[#fcfaf5] border-t border-luxury-gray/10">
                                                    <div className="text-xs uppercase tracking-widest text-luxury-gray font-medium mb-4">Order Items ({order.items?.length || 0})</div>
                                                    {order.tracking_info && (
                                                        <div className="mb-4 text-[10px] text-luxury-gold bg-luxury-gold/5 border border-luxury-gold/20 px-4 py-2 font-medium uppercase tracking-widest">
                                                            📦 {order.tracking_info}
                                                        </div>
                                                    )}
                                                    <div className="space-y-4">
                                                        {order.items?.map(item => (
                                                            <div key={item.id} className="flex items-center bg-white p-3 border border-luxury-gray/10 rounded-sm">
                                                                <div className="w-12 h-12 bg-luxury-gray/5 border border-luxury-gray/10 flex-shrink-0 mr-4 flex items-center justify-center overflow-hidden">
                                                                    {item.product?.images?.[0] ? 
                                                                        <img src={getImageUrl(item.product.images[0].image)} alt={item.product.name} className="w-full h-full object-cover" /> :
                                                                        <span className="text-[8px] text-luxury-gray uppercase">No Img</span>
                                                                    }
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="text-sm font-medium text-luxury-black">{item.product?.name || 'Unknown Product'}</div>
                                                                    <div className="text-[10px] text-luxury-gray mt-1">Qty: {item.quantity}</div>
                                                                </div>
                                                                <div className="text-sm font-medium text-luxury-gold">${formatPrice(item.price)}</div>
                                                            </div>
                                                        ))}
                                                        {(!order.items || order.items.length === 0) && (
                                                            <div className="text-xs text-luxury-gray text-center py-4">No items recorded for this order.</div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
