import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Plus } from 'lucide-react';

export default function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubCategories] = useState([]);
    const [newCatName, setNewCatName] = useState('');
    const [newSubName, setNewSubName] = useState('');
    const [selectedCatId, setSelectedCatId] = useState('');

    const fetchData = () => {
        api.get('/shop/categories/').then(res => setCategories(res.data.results || res.data));
        api.get('/shop/subcategories/').then(res => setSubCategories(res.data.results || res.data));
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        try {
            await api.post('/shop/categories/', { name: newCatName });
            setNewCatName('');
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateSubcategory = async (e) => {
        e.preventDefault();
        try {
            await api.post('/shop/subcategories/', { name: newSubName, category_id: selectedCatId });
            setNewSubName('');
            setSelectedCatId('');
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="font-sans">
            <div className="mb-10 border-b border-luxury-gray/10 pb-6">
                <h1 className="text-3xl font-display font-medium text-luxury-black mb-2">Taxonomy</h1>
                <p className="text-luxury-gray text-xs font-light tracking-[0.05em]">Classify your collections via categories and subcategories.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Categories */}
                <div className="bg-white p-8 border border-luxury-gray/20 shadow-sm">
                    <h2 className="text-sm font-sans font-medium uppercase tracking-[0.1em] text-luxury-black mb-6 border-b border-luxury-gray/10 pb-3">Active Categories</h2>
                    <form onSubmit={handleCreateCategory} className="flex gap-4 mb-8">
                        <input type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)} required placeholder="Add New Category" className="flex-1 bg-transparent border-b border-luxury-gray/40 px-0 py-2 text-sm focus:outline-none focus:border-luxury-gold transition font-light" />
                        <button type="submit" className="bg-luxury-black hover:bg-luxury-gold transition text-white px-5 py-2 font-medium"><Plus className="w-4 h-4" strokeWidth={1.5}/></button>
                    </form>
                    <ul className="divide-y divide-luxury-gray/10">
                        {categories.map(c => <li key={c.id} className="py-4 flex justify-between font-light text-luxury-charcoal text-sm">{c.name}</li>)}
                    </ul>
                </div>

                {/* Subcategories */}
                <div className="bg-[#fcfaf5] p-8 border border-luxury-gray/20 shadow-sm">
                    <h2 className="text-sm font-sans font-medium uppercase tracking-[0.1em] text-luxury-black mb-6 border-b border-luxury-gray/10 pb-3">Subcategory Mapping</h2>
                    <form onSubmit={handleCreateSubcategory} className="flex flex-col gap-5 mb-8">
                        <input type="text" value={newSubName} onChange={e => setNewSubName(e.target.value)} required placeholder="Subcategory Name" className="bg-transparent border-b border-luxury-gray/40 px-0 py-2 text-sm focus:outline-none focus:border-luxury-gold transition font-light" />
                        <select value={selectedCatId} onChange={e => setSelectedCatId(e.target.value)} required className="bg-transparent border-b border-luxury-gray/40 px-0 py-2 text-sm focus:outline-none focus:border-luxury-gold transition font-light cursor-pointer">
                            <option value="" className="text-luxury-gray">Link to Parent Category</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <button type="submit" className="bg-luxury-black hover:bg-luxury-gold transition text-white px-8 py-3 text-[10px] uppercase tracking-[0.15em] font-medium flex justify-center items-center mt-2 shadow-sm"><Plus className="w-3 h-3 mr-2" strokeWidth={2}/> Create Subcategory</button>
                    </form>
                    <ul className="divide-y divide-luxury-gray/10">
                        {subcategories.map(s => (
                            <li key={s.id} className="py-4 flex justify-between items-center font-light text-luxury-charcoal text-sm">
                                {s.name} 
                                <span className="text-[9px] text-luxury-gray font-medium uppercase tracking-widest border border-luxury-gray/20 px-2 py-1 bg-white">{s.category_details?.name || s.category?.name || 'Unlinked'}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
