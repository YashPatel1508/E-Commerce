import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Plus, X, Upload, Trash2, Edit2 } from 'lucide-react';
import { formatPrice, getImageUrl } from '../../utils/format';

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubCategories] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    
    // Form State
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [description, setDescription] = useState('');
    const [categoryIds, setCategoryIds] = useState([]);
    const [subcategoryIds, setSubcategoryIds] = useState([]);
    const [imageFile, setImageFile] = useState(null);

    const fetchProducts = () => {
        api.get('/shop/products/').then(res => setProducts(res.data.results || res.data));
    };

    const fetchCategories = () => {
        api.get('/shop/categories/').then(res => setCategories(res.data.results || res.data));
        api.get('/shop/subcategories/').then(res => setSubCategories(res.data.results || res.data));
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const prodData = {
                name,
                price,
                stock,
                description,
                category_ids: categoryIds,
                subcategory_ids: subcategoryIds
            };
            
            let prodRes;
            if (editId) {
                prodRes = await api.put(`/shop/products/${editId}/`, prodData);
            } else {
                prodRes = await api.post('/shop/products/', prodData);
            }
            
            if (imageFile && prodRes.data.id) {
                const formData = new FormData();
                formData.append('product', prodRes.data.id);
                formData.append('image', imageFile);
                await api.post('/shop/images/', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            
            setModalOpen(false);
            setEditId(null);
            setName('');
            setPrice('');
            setStock('');
            setDescription('');
            setCategoryIds([]);
            setSubcategoryIds([]);
            setImageFile(null);
            fetchProducts();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Permanently remove this collection item?")) {
            try {
                await api.delete(`/shop/products/${id}/`);
                fetchProducts();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const toggleCategory = (id) => {
        setCategoryIds(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
    };

    const toggleSubcategory = (id) => {
        setSubcategoryIds(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
    };

    const openCreateModal = () => {
        setEditId(null);
        setName('');
        setPrice('');
        setStock('');
        setDescription('');
        setCategoryIds([]);
        setSubcategoryIds([]);
        setImageFile(null);
        setModalOpen(true);
    };

    const openEditModal = (p) => {
        setEditId(p.id);
        setName(p.name);
        setPrice(p.price);
        setStock(p.stock);
        setDescription(p.description);
        setCategoryIds(p.categories ? p.categories.map(c => c.id) : []);
        setSubcategoryIds(p.subcategories ? p.subcategories.map(s => s.id) : []);
        setImageFile(null);
        setModalOpen(true);
    };

    return (
        <div className="font-sans">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-display font-medium text-luxury-black mb-2">Inventory</h1>
                    <p className="text-luxury-gray text-xs font-light tracking-[0.05em]">Manage your exquisite collection.</p>
                </div>
                <button 
                    onClick={openCreateModal}
                    className="bg-luxury-black hover:bg-luxury-gold text-white flex items-center px-6 py-3 font-sans font-medium uppercase tracking-[0.15em] text-[10px] sm:text-xs transition duration-500"
                >
                    <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} />
                    Add Piece
                </button>
            </div>

            <div className="bg-white border border-luxury-gray/20 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-luxury-gray/10">
                        <thead className="bg-[#fcfaf5]">
                            <tr>
                                <th className="px-8 py-5 text-left font-sans font-medium text-luxury-gray uppercase tracking-[0.1em] text-[10px]">Product Details</th>
                                <th className="px-8 py-5 text-left font-sans font-medium text-luxury-gray uppercase tracking-[0.1em] text-[10px]">Classifications</th>
                                <th className="px-8 py-5 text-left font-sans font-medium text-luxury-gray uppercase tracking-[0.1em] text-[10px]">Pricing</th>
                                <th className="px-8 py-5 text-left font-sans font-medium text-luxury-gray uppercase tracking-[0.1em] text-[10px]">Stock</th>
                                <th className="px-8 py-5 text-right font-sans font-medium text-luxury-gray uppercase tracking-[0.1em] text-[10px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-luxury-gray/10">
                            {products.map(p => (
                                <tr key={p.id} className="hover:bg-luxury-cream/50 transition duration-300">
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-14 w-12 flex-shrink-0 bg-[#f5f5f5] mr-6 flex items-center justify-center overflow-hidden">
                                                {p.images?.[0] ? 
                                                    <img src={getImageUrl(p.images[0].image)} className="h-full w-full object-cover" /> 
                                                    : <span className="text-[8px] font-display text-luxury-gray/40">FL</span>
                                                }
                                            </div>
                                            <div className="font-medium text-luxury-black text-sm">{p.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 max-w-[200px]">
                                        <div className="flex flex-col gap-1">
                                            <div className="text-[10px] text-luxury-charcoal uppercase tracking-wider overflow-hidden text-ellipsis whitespace-nowrap">
                                                <span className="text-luxury-gray mr-2">C:</span>{p.categories?.map(c => c.name).join(', ') || '-'}
                                            </div>
                                            <div className="text-[10px] text-luxury-charcoal uppercase tracking-wider overflow-hidden text-ellipsis whitespace-nowrap">
                                                <span className="text-luxury-gray mr-2">S:</span>{p.subcategories?.map(s => s.name).join(', ') || '-'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="text-sm font-light text-luxury-charcoal">${formatPrice(p.price)}</div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <span className={`px-4 py-1 inline-flex text-[10px] font-medium uppercase tracking-[0.1em] border ${p.stock > 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                            {p.stock > 0 ? `${p.stock} Units` : 'Depleted'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-right">
                                        <button onClick={() => openEditModal(p)} className="text-luxury-gray hover:text-luxury-gold transition duration-300 p-2 mr-2">
                                            <Edit2 className="w-4 h-4" strokeWidth={1.5} />
                                        </button>
                                        <button onClick={() => handleDelete(p.id)} className="text-luxury-gray hover:text-red-800 transition duration-300 p-2">
                                            <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Product Modal with Multiselect */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-luxury-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex justify-between items-center px-8 py-6 border-b border-luxury-gray/20">
                            <h2 className="text-xl font-display font-medium text-luxury-black">{editId ? 'Edit Piece' : 'Add Collection Piece'}</h2>
                            <button onClick={() => setModalOpen(false)} className="text-luxury-gray hover:text-luxury-black transition"><X className="w-5 h-5" strokeWidth={1.5}/></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-medium uppercase tracking-[0.15em] text-luxury-charcoal mb-3">Piece Name</label>
                                    <input type="text" required value={name} onChange={e=>setName(e.target.value)} className="w-full bg-transparent border-b border-luxury-gray/40 px-0 py-2 text-sm focus:outline-none focus:border-luxury-gold transition font-light" placeholder="e.g. Signature Gold Chronograph" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-medium uppercase tracking-[0.15em] text-luxury-charcoal mb-3">Price (USD)</label>
                                    <input type="number" step="0.01" required value={price} onChange={e=>setPrice(e.target.value)} className="w-full bg-transparent border-b border-luxury-gray/40 px-0 py-2 text-sm focus:outline-none focus:border-luxury-gold transition font-light" placeholder="0.00" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-medium uppercase tracking-[0.15em] text-luxury-charcoal mb-3">Inventory Stock</label>
                                    <input type="number" required value={stock} onChange={e=>setStock(e.target.value)} className="w-full bg-transparent border-b border-luxury-gray/40 px-0 py-2 text-sm focus:outline-none focus:border-luxury-gold transition font-light" placeholder="0" />
                                </div>
                                
                                {/* Multiselect Categories */}
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-medium uppercase tracking-[0.15em] text-luxury-charcoal mb-3">Select Categories (Multiple)</label>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map(c => (
                                            <button
                                                type="button"
                                                key={c.id}
                                                onClick={() => toggleCategory(c.id)}
                                                className={`px-4 py-2 text-[10px] uppercase tracking-wider border transition duration-300 ${categoryIds.includes(c.id) ? 'bg-luxury-black text-white border-luxury-black' : 'border-luxury-gray/30 text-luxury-charcoal hover:border-luxury-black'}`}
                                            >
                                                {c.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Multiselect Subcategories */}
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-medium uppercase tracking-[0.15em] text-luxury-charcoal mb-3">Select Subcategories (Multiple)</label>
                                    <div className="flex flex-wrap gap-2">
                                        {subcategories.map(s => (
                                            <button
                                                type="button"
                                                key={s.id}
                                                onClick={() => toggleSubcategory(s.id)}
                                                className={`px-4 py-2 text-[10px] uppercase tracking-wider border transition duration-300 ${subcategoryIds.includes(s.id) ? 'bg-luxury-gold text-white border-luxury-gold' : 'border-luxury-gray/30 text-luxury-charcoal hover:border-luxury-gold'}`}
                                            >
                                                {s.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-medium uppercase tracking-[0.15em] text-luxury-charcoal mb-3">Description</label>
                                    <textarea required rows={4} value={description} onChange={e=>setDescription(e.target.value)} className="w-full bg-transparent border border-luxury-gray/20 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-luxury-gold transition font-light resize-none" placeholder="Provide an elegant description of the item..."></textarea>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-medium uppercase tracking-[0.15em] text-luxury-charcoal mb-3">Visual Asset</label>
                                    <div className="border border-dashed border-luxury-gray/40 p-10 flex flex-col items-center justify-center bg-[#fcfaf5] hover:bg-white transition duration-300 cursor-pointer relative group">
                                        <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                        <Upload className="w-6 h-6 text-luxury-gray mb-3 group-hover:text-luxury-gold transition" strokeWidth={1.5} />
                                        <span className="font-light text-luxury-charcoal text-xs">
                                            {imageFile ? imageFile.name : 'Click to append a high-resolution image'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-luxury-gray/20 flex justify-end items-center">
                                <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-3 font-medium uppercase text-[10px] tracking-[0.15em] text-luxury-gray hover:text-luxury-black mr-4 transition">Close</button>
                                <button type="submit" className="bg-luxury-black hover:bg-luxury-gold text-white px-10 py-4 font-medium uppercase tracking-[0.2em] text-[10px] transition duration-500 shadow-sm">{editId ? 'Save Edits' : 'Save to Collection'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
