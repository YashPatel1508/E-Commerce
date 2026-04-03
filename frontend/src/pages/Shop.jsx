import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../api/apiService';
import { Filter, X, ChevronRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function Shop() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [selectedCat, setSelectedCat] = useState('');
    const [selectedSub, setSelectedSub] = useState('');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('-created_at');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        apiService.products.categories().then(res => setCategories(res.data.results || res.data));
        apiService.products.subcategories().then(res => setSubCategories(res.data.results || res.data));
    }, []);

    useEffect(() => {
        setLoading(true);
        const params = {
            ordering: sort,
            categories__id: selectedCat || undefined,
            subcategories__id: selectedSub || undefined,
            search: search || undefined
        };

        apiService.products.list(params).then(res => {
            setProducts(res.data.results || res.data);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, [selectedCat, selectedSub, search, sort]);

    return (
        <div className="bg-luxury-cream min-h-screen text-luxury-black font-sans pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-16 pb-8 border-b border-luxury-gray/20">
                    <h1 className="text-4xl md:text-5xl font-display font-medium tracking-wide mb-6 md:mb-0">The Collection</h1>
                    <div className="flex items-center space-x-4 w-full md:w-auto">
                        <input 
                            type="text" 
                            placeholder="Search collection..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-transparent border-b border-luxury-black/30 px-2 py-2 text-sm focus:outline-none focus:border-luxury-gold w-full md:w-64 transition font-light placeholder:text-luxury-gray"
                        />
                        <button 
                            className="md:hidden p-2 text-luxury-black border border-luxury-gray/30"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Filter className="w-5 h-5" strokeWidth={1.5} />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-12">
                    
                    {/* Sidebar Filters */}
                    <div className={`fixed inset-0 z-50 bg-luxury-cream p-8 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-500 md:relative md:transform-none md:p-0 md:bg-transparent md:w-1/4 md:block`}>
                        <div className="flex justify-between items-center md:hidden mb-10">
                            <span className="font-display text-2xl">Filters</span>
                            <button onClick={() => setIsSidebarOpen(false)}><X className="w-6 h-6" strokeWidth={1.5}/></button>
                        </div>

                        <div className="space-y-12">
                            <div>
                                <h3 className="font-sans text-xs uppercase tracking-[0.2em] font-medium mb-6 text-luxury-gray">Sort By</h3>
                                <select 
                                    value={sort} 
                                    onChange={(e) => setSort(e.target.value)}
                                    className="w-full bg-transparent border-b border-luxury-black/20 text-sm py-2 focus:outline-none focus:border-luxury-gold cursor-pointer font-light hover:border-luxury-black transition"
                                >
                                    <option value="-created_at">Newest Arrivals</option>
                                    <option value="price">Price: Low to High</option>
                                    <option value="-price">Price: High to Low</option>
                                    <option value="name">Name: A to Z</option>
                                </select>
                            </div>

                            <div>
                                <h3 className="font-sans text-xs uppercase tracking-[0.2em] font-medium mb-6 text-luxury-gray">Categories</h3>
                                <ul className="space-y-4">
                                    <li>
                                        <button 
                                            onClick={() => setSelectedCat('')} 
                                            className={`text-sm font-light transition hover:text-luxury-gold ${selectedCat === '' ? 'text-luxury-gold font-normal' : 'text-luxury-charcoal'}`}
                                        >
                                            All Collections
                                        </button>
                                    </li>
                                    {categories.map(c => (
                                        <li key={c.id}>
                                            <button 
                                                onClick={() => setSelectedCat(c.id)} 
                                                className={`text-sm font-light transition hover:text-luxury-gold ${selectedCat === c.id ? 'text-luxury-gold font-normal' : 'text-luxury-charcoal'}`}
                                            >
                                                {c.name}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-sans text-xs uppercase tracking-[0.2em] font-medium mb-6 text-luxury-gray">Classifications</h3>
                                <ul className="space-y-4">
                                    <li>
                                        <button 
                                            onClick={() => setSelectedSub('')} 
                                            className={`text-sm font-light transition hover:text-luxury-gold ${selectedSub === '' ? 'text-luxury-gold font-normal' : 'text-luxury-charcoal'}`}
                                        >
                                            All Items
                                        </button>
                                    </li>
                                    {subcategories.map(s => (
                                        <li key={s.id}>
                                            <button 
                                                onClick={() => setSelectedSub(s.id)} 
                                                className={`text-sm font-light transition hover:text-luxury-gold ${selectedSub === s.id ? 'text-luxury-gold font-normal' : 'text-luxury-charcoal'}`}
                                            >
                                                {s.name}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="md:w-3/4">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <span className="animate-pulse text-luxury-gray tracking-[0.2em] uppercase text-xs">Curating Collection...</span>
                            </div>
                        ) : products.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                                {products.map((product, idx) => (
                                    <ProductCard 
                                        key={product.id} 
                                        product={product} 
                                        index={idx} 
                                        showLimitedBadge={true} 
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-32 text-center">
                                <div className="w-16 h-px bg-luxury-gold mb-8"></div>
                                <h2 className="text-2xl font-display text-luxury-black mb-4">No pieces found</h2>
                                <p className="text-luxury-gray font-light max-w-md">Our curators couldn't find any items matching your exact specifications. Please adjust your filters.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
