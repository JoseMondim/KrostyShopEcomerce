import React, { useState, useEffect } from 'react';
import { ProductCard } from './ProductCard';
import { Search, Filter, Grid, Tag } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    price: number;
    image_url: string;
    category: string;
    // ... other fields
}

interface ProductCatalogProps {
    initialProducts: Product[];
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ initialProducts }) => {
    const [products, setProducts] = useState(initialProducts);
    const [filteredProducts, setFilteredProducts] = useState(initialProducts);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');

    useEffect(() => {
        // Read URL param for initial category
        const params = new URLSearchParams(window.location.search);
        const categoryParam = params.get('category');
        if (categoryParam) {
            setActiveCategory(categoryParam);
        }
    }, []);

    useEffect(() => {
        let result = products;

        // 1. Filter by Category
        if (activeCategory !== 'all') {
            result = result.filter(p => p.category === activeCategory);
        }

        // 2. Filter by Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(query)
            );
        }

        setFilteredProducts(result);
    }, [products, activeCategory, searchQuery]);

    const handleCategoryChange = (category: string) => {
        setActiveCategory(category);
        // Update URL without reload
        const url = new URL(window.location.href);
        if (category === 'all') {
            url.searchParams.delete('category');
        } else {
            url.searchParams.set('category', category);
        }
        window.history.pushState({}, '', url);
    };

    return (
        <div className="space-y-8">
            {/* Header / Filters */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#18181b] p-4 rounded-2xl border border-white/10 sticky top-24 z-30 shadow-xl backdrop-blur-md bg-opacity-90">
                {/* Search */}
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar productos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                    />
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-2 w-full md:w-auto pb-0 md:pb-0 justify-center md:justify-start">
                    <button
                        onClick={() => handleCategoryChange('all')}
                        className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${activeCategory === 'all' ? 'bg-white text-black' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => handleCategoryChange('gift_cards')}
                        className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 ${activeCategory === 'gift_cards' ? 'bg-[#3b82f6] text-white' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
                    >
                        <Tag className="w-4 h-4" /> Tarjetas de Regalo
                    </button>
                    <button
                        onClick={() => handleCategoryChange('game_reloads')}
                        className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 ${activeCategory === 'game_reloads' ? 'bg-[#10b981] text-black' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
                    >
                        <Grid className="w-4 h-4" /> Recargas de Juegos
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                        <div key={product.id} className="animate-in fade-in zoom-in duration-300">
                            <ProductCard product={product} />
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-24 text-center text-gray-500">
                        <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-xl font-bold">No se encontraron productos.</p>
                        <p className="text-sm">Intenta con otros términos o filtros.</p>
                        <button
                            onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                            className="text-primary mt-4 hover:underline"
                        >
                            Limpiar filtros
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
