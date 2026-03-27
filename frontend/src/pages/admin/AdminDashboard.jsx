import { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
    DollarSign, Package, ShoppingCart, TrendingUp,
    RefreshCw, AlertTriangle, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, AreaChart, Area,
    PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { formatPrice } from '../../utils/format';

const toDay = (d) => {
    if (!d) return "";
    try {
        return new Date(d).toISOString().slice(0, 10);
    } catch (e) {
        return "";
    }
};

const lastNDays = (n) => Array.from({ length: n }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (n - 1 - i));
    return d.toISOString().slice(0, 10);
});

const monthLabel = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "N/A" : d.toLocaleString('default', { month: 'short', year: '2-digit' });
};

// Elegant dark tooltip for all charts
const EliteTooltip = ({ active, payload, label, formatter }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: '#0a0a0a', border: 'none', borderRadius: 4, padding: '10px 14px', fontSize: 11 }}>
                <p style={{ color: '#8c8c8c', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
                {payload.map((p, i) => (
                    <p key={i} style={{ color: p.color || '#c5a059', fontWeight: 500, marginBottom: 2 }}>
                        {formatter ? formatter(p.value, p.name) : `${p.name}: ${p.value}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const PIE_COLORS = ['#c5a059', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'];
const STATUS_LABELS = {
    'Pending': 'Pending', 'Processing': 'Processing', 'Shipped': 'Shipped',
    'Delivered': 'Delivered', 'Cancelled': 'Cancelled', 'Refunded': 'Refunded',
    'Return Requested': 'Return Req.', 'Return Pickup': 'Return Pickup',
};

export default function AdminDashboard() {
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [statusStats, setStatusStats] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [monthlyRevenue, setMonthlyRevenue] = useState([]);
    const [refundData, setRefundData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(new Date());
    const [chartMode, setChartMode] = useState('7d');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [ordersRes, productsRes, statusRes, topProdRes, monthlyRes, refundRes] = await Promise.all([
                api.get('/checkout/orders/'),
                api.get('/shop/products/'),
                api.get('/dashboard/order-status-stats/'),
                api.get('/dashboard/top-products/'),
                api.get('/dashboard/monthly-revenue/'),
                api.get('/dashboard/refund-net-revenue/'),
            ]);
            setOrders(ordersRes.data.results || ordersRes.data);
            setProducts(productsRes.data.results || productsRes.data);
            setStatusStats(statusRes.data);
            setTopProducts(topProdRes.data);
            setMonthlyRevenue(monthlyRes.data);
            setRefundData(refundRes.data);
            setLastRefresh(new Date());
        } catch (err) {
            console.error("Dashboard data fetch error:", err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    // Computed stats
    const todayStr = toDay(new Date());
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // Defensive filtering
    const revenueOrders = Array.isArray(orders) ? orders.filter(o => o && !['Cancelled', 'Refunded'].includes(o.status)) : [];
    
    const todayOrders = revenueOrders.filter(o => o.created_at && toDay(o.created_at) === todayStr);
    const todayRevenue = todayOrders.reduce((a, o) => a + parseFloat(o.total_price || 0), 0);
    
    const monthOrders = revenueOrders.filter(o => o.created_at && typeof o.created_at === 'string' && o.created_at.slice(0, 7) === currentMonth);
    const monthRevenue = monthOrders.reduce((a, o) => a + parseFloat(o.total_price || 0), 0);
    
    const totalRevenue = revenueOrders.reduce((a, o) => a + parseFloat(o.total_price || 0), 0);
    const totalStock = Array.isArray(products) ? products.reduce((a, p) => a + (p.stock || 0), 0) : 0;
    const lowStockItems = Array.isArray(products) ? products.filter(p => p && p.stock <= 5 && p.stock > 0) : [];
    const outOfStockItems = Array.isArray(products) ? products.filter(p => p && p.stock === 0) : [];

    // Chart 1: Revenue + Orders over time (Line)
    const buildLineChartData = () => {
        if (!Array.isArray(revenueOrders)) return [];
        if (chartMode === 'monthly') {
            const map = {};
            revenueOrders.forEach(o => {
                if (!o || !o.created_at) return;
                const label = monthLabel(o.created_at);
                if (!map[label]) map[label] = { name: label, revenue: 0, orders: 0 };
                map[label].revenue += parseFloat(o.total_price || 0);
                map[label].orders += 1;
            });
            return Object.values(map).slice(-6);
        }
        const days = chartMode === '7d' ? 7 : 30;
        return lastNDays(days).map(day => {
            const dayOrders = revenueOrders.filter(o => o && o.created_at && toDay(o.created_at) === day);
            return {
                name: new Date(day).toLocaleDateString('en', chartMode === '7d' ? { weekday: 'short' } : { month: 'short', day: 'numeric' }),
                revenue: dayOrders.reduce((a, o) => a + parseFloat(o.total_price || 0), 0),
                orders: dayOrders.length,
            };
        });
    };

    const lineChartData = buildLineChartData();

    // Chart 2: Order Status Distribution
    const pieData = Array.isArray(statusStats) ? statusStats.map(s => ({
        name: STATUS_LABELS[s.status] || s.status,
        value: s.count,
    })) : [];

    // Chart 3: Top Products by Revenue
    const topProdChartData = Array.isArray(topProducts) ? topProducts.slice(0, 8).map(p => ({
        name: p.name ? (p.name.length > 18 ? p.name.slice(0, 18) + '…' : p.name) : 'Unnamed Product',
        revenue: parseFloat(p.revenue || 0),
        units: p.units_sold || 0,
    })) : [];

    // Chart 4: Monthly Revenue Trend (Area)
    const areaChartData = Array.isArray(monthlyRevenue) ? monthlyRevenue.map(m => ({
        name: m.month ? new Date(m.month + '-01').toLocaleString('default', { month: 'short', year: '2-digit' }) : 'N/A',
        revenue: parseFloat(m.revenue || 0),
        orders: m.orders || 0,
    })) : [];

    // Chart 5: Net Revenue vs Refunds (Stacked Bar)
    const stackedBarData = Array.isArray(refundData) ? refundData.map(d => ({
        name: d.week || 'N/A',
        'Net Revenue': parseFloat(d.net_revenue || 0),
        'Refunds': parseFloat(d.refunds || 0),
    })) : [];

    const generateReport = () => {
        const rows = [
            ['Metric', 'Value'],
            ['Today Revenue', `₹${formatPrice(todayRevenue)}`],
            ['Today Orders', todayOrders.length],
            ['Month Revenue', `₹${formatPrice(monthRevenue)}`],
            ['Month Orders', monthOrders.length],
            ['Total Revenue', `₹${formatPrice(totalRevenue)}`],
            ['Total Orders', orders.length],
            ['Total Stock', totalStock],
            ['Low Stock Items', lowStockItems.length],
            ['Out of Stock', outOfStockItems.length],
        ];
        const csv = 'data:text/csv;charset=utf-8,' + rows.map(r => r.join(',')).join('\n');
        const link = document.createElement('a');
        link.setAttribute('href', encodeURI(csv));
        link.setAttribute('download', 'FeelLuxury_Dashboard_Report.csv');
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
    };

    const topCards = [
        { title: "Today's Revenue", value: `₹${formatPrice(todayRevenue)}`, sub: `${todayOrders.length} orders today`, icon: DollarSign, color: '#c5a059', bg: 'bg-amber-50' },
        { title: 'This Month', value: `₹${formatPrice(monthRevenue)}`, sub: `${monthOrders.length} orders this month`, icon: TrendingUp, color: '#10b981', bg: 'bg-emerald-50' },
        { title: 'Net Revenue', value: `₹${formatPrice(totalRevenue)}`, sub: `${revenueOrders.length} active orders`, icon: ShoppingCart, color: '#6366f1', bg: 'bg-indigo-50' },
        { title: 'Available Stock', value: totalStock, sub: `${Array.isArray(products) ? products.length : 0} total products`, icon: Package, color: '#8b5cf6', bg: 'bg-purple-50' },
    ];

    const SectionHeader = ({ title, children }) => (
        <div className="flex justify-between items-center border-b border-luxury-gray/10 pb-4 mb-8">
            <h2 className="text-sm font-sans font-medium uppercase tracking-[0.15em] text-luxury-charcoal">{title}</h2>
            {children}
        </div>
    );

    if (loading) return <div className="p-10 flex justify-center items-center h-64 text-luxury-charcoal uppercase tracking-widest text-xs animate-pulse">Initializing Luxury Analytics...</div>;

    return (
        <div className="font-sans">
            {/* Header */}
            <div className="mb-10 flex justify-between items-start flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-display font-medium text-luxury-black mb-2">Executive Overview</h1>
                    <p className="text-luxury-gray text-xs font-light tracking-[0.05em]">
                        Live data · Last refreshed: {lastRefresh.toLocaleTimeString()}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={fetchData} className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-medium text-luxury-charcoal border border-luxury-gray/20 px-4 py-2 hover:border-luxury-gold hover:text-luxury-gold transition">
                        <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} strokeWidth={2} /> Refresh
                    </button>
                    <button onClick={generateReport} className="text-[10px] font-medium uppercase tracking-widest border-b border-luxury-black text-luxury-black hover:text-luxury-gold hover:border-luxury-gold transition py-1">
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {topCards.map((card, idx) => (
                    <div key={idx} className="bg-white border border-luxury-gray/20 p-7 hover:shadow-lg transition duration-500 group relative overflow-hidden">
                        <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 transition duration-500" style={{ backgroundColor: card.color }}></div>
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-luxury-gray">{card.title}</p>
                            <div className={`p-2.5 ${card.bg} border border-luxury-gray/10 transition duration-300`}>
                                <card.icon className="w-4 h-4" style={{ color: card.color }} strokeWidth={1.5} />
                            </div>
                        </div>
                        <h3 className="text-3xl font-display font-medium text-luxury-black mb-1">{card.value}</h3>
                        <p className="text-[10px] text-luxury-gray font-light">{card.sub}</p>
                    </div>
                ))}
            </div>

            {/* Row 1: Line Chart + Pie Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2 bg-white border border-luxury-gray/20 p-8 shadow-sm">
                    <SectionHeader title="Revenue & Orders Trend">
                        <div className="flex gap-2">
                            {['7d', '30d', 'monthly'].map(m => (
                                <button key={m} onClick={() => setChartMode(m)}
                                    className={`text-[9px] uppercase tracking-widest font-medium px-3 py-1 border transition ${chartMode === m ? 'bg-luxury-black text-white border-luxury-black' : 'border-luxury-gray/30 text-luxury-gray hover:border-luxury-black'}`}>
                                    {m === '7d' ? '7 Days' : m === '30d' ? '30 Days' : 'Monthly'}
                                </button>
                            ))}
                        </div>
                    </SectionHeader>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={lineChartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8c8c8c', fontSize: 11 }} dy={8} />
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#8c8c8c', fontSize: 11 }} tickFormatter={v => `₹${v}`} />
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#8c8c8c', fontSize: 11 }} />
                                <Tooltip content={<EliteTooltip formatter={(val, name) => [name === 'revenue' ? `₹${formatPrice(val)}` : val, name === 'revenue' ? 'Revenue' : 'Orders']} />} />
                                <Legend formatter={v => v === 'revenue' ? 'Revenue' : 'Orders'} wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#c5a059" strokeWidth={2.5} dot={{ fill: '#c5a059', r: 3 }} activeDot={{ r: 6 }} />
                                <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 3 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white border border-luxury-gray/20 p-8 shadow-sm">
                    <SectionHeader title="Order Status Distribution" />
                    {pieData.length > 0 ? (
                        <>
                            <div className="h-48 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                                            {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: 'none', borderRadius: 4, color: '#fff', fontSize: 11 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 space-y-2">
                                {pieData.map((entry, i) => (
                                    <div key={i} className="flex items-center justify-between text-[10px]">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}></div>
                                            <span className="text-luxury-charcoal font-light">{entry.name}</span>
                                        </div>
                                        <span className="font-medium text-luxury-black">{entry.value}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="h-48 flex items-center justify-center text-luxury-gray text-xs">No orders yet</div>
                    )}
                </div>
            </div>

            {/* Row 2: Top Products + Inventory */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2 bg-white border border-luxury-gray/20 p-8 shadow-sm">
                    <SectionHeader title="Top Products by Revenue" />
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topProdChartData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#8c8c8c', fontSize: 10 }} tickFormatter={v => `₹${v}`} />
                                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8c8c8c', fontSize: 10 }} width={110} />
                                <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: 'none', borderRadius: 4, color: '#fff', fontSize: 11 }} />
                                <Legend wrapperStyle={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }} />
                                <Bar dataKey="revenue" name="revenue" fill="#c5a059" radius={[0, 3, 3, 0]} barSize={14} />
                                <Bar dataKey="units" name="units" fill="#6366f1" radius={[0, 3, 3, 0]} barSize={14} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white border border-luxury-gray/20 p-8 shadow-sm flex flex-col">
                    <h2 className="text-sm font-sans font-medium uppercase tracking-[0.15em] text-luxury-charcoal mb-6 border-b border-luxury-gray/10 pb-4">Inventory Health</h2>
                    <div className="space-y-3 flex-1">
                        <div className="flex justify-between items-center p-4 bg-green-50 border border-green-100">
                            <p className="text-[10px] uppercase tracking-widest font-medium text-green-700">In Stock</p>
                            <span className="text-lg font-display font-medium text-green-800">{revenueOrders.length} active orders</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-amber-50 border border-amber-100">
                            <p className="text-[10px] uppercase tracking-widest font-medium text-amber-700">Low Stock (≤5)</p>
                            <span className="text-lg font-display font-medium text-amber-800">{lowStockItems.length} items</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-red-50 border border-red-100">
                            <p className="text-[10px] uppercase tracking-widest font-medium text-red-700">Out of Stock</p>
                            <span className="text-lg font-display font-medium text-red-800">{outOfStockItems.length} items</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 3: Area Growth */}
            <div className="bg-white border border-luxury-gray/20 p-8 shadow-sm mb-6">
                <SectionHeader title="12-Month Revenue Growth (Area)" />
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={areaChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8c8c8c', fontSize: 11 }} dy={8} />
                            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#8c8c8c', fontSize: 11 }} tickFormatter={v => `₹${v}`} />
                            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#8c8c8c', fontSize: 11 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: 'none', borderRadius: 4, color: '#fff', fontSize: 11 }} />
                            <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#c5a059" fill="#c5a059" fillOpacity={0.1} />
                            <Area yAxisId="right" type="monotone" dataKey="orders" stroke="#6366f1" fill="#6366f1" fillOpacity={0.05} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
