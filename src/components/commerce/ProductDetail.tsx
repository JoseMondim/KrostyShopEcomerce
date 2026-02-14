import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { ShoppingCart, Gift } from 'lucide-react';
import { addCartItem } from '../../lib/store';
import { supabase } from '../../lib/supabase';

interface Product {
    id: string;
    name: string;
    price: number;
    image_url: string;
    category: string;
}

interface Product {
    id: string;
    name: string;
    price: number;
    image_url: string;
    category: string;
}

interface ProductDetailProps {
    product: Product;
}

interface Variant {
    id: string;
    name: string;
    price: number;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product }) => {
    const [quantity, setQuantity] = useState(1);
    const [variants, setVariants] = useState<Variant[]>([]);
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
    const [loading, setLoading] = useState(true);

    // If no variants found, fallback to base product price (legacy support)
    // But ideally we migrate all to variants.

    React.useEffect(() => {
        const fetchVariants = async () => {
            const { data } = await supabase! // Ensure supabase is imported or passed
                .from('product_variants')
                .select('*')
                .eq('product_id', product.id)
                .order('price', { ascending: true });

            if (data && data.length > 0) {
                setVariants(data);
                setSelectedVariant(data[0]);
            } else {
                // Fallback for products without variants (create a dummy one from base info)
                const baseVariant = { id: 'base', name: 'Standard', price: product.price };
                setVariants([baseVariant]);
                setSelectedVariant(baseVariant);
            }
            setLoading(false);
        };

        fetchVariants();
    }, [product.id, product.price]);

    const handleAddToCart = () => {
        if (!selectedVariant) return;

        addCartItem({
            id: product.id,
            name: `${product.name} - ${selectedVariant.name}`, // Append variant name
            price: selectedVariant.price,
            quantity: quantity,
            image: product.image_url,
            // We could store variant_id in metadata if needed later
        });
        // Toast logic (optional)
        const btn = document.getElementById('add-to-cart-btn');
        if (btn) {
            const originalText = btn.innerText;
            btn.innerText = '¡Agregado!';
            setTimeout(() => btn.innerText = originalText, 2000);
        }
    };

    if (loading) return <div className="text-gray-500 text-sm">Cargando opciones...</div>;

    return (
        <div className="space-y-6">
            {/* Selection Row */}
            <div className="flex flex-wrap items-center gap-6 md:gap-12 mt-2">
                {/* Variant Selector */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-white uppercase tracking-wider block">
                        Monto / Opción
                    </label>
                    <div className="relative">
                        <select
                            className="appearance-none bg-[#18181b] text-white text-xl font-bold border-2 border-primary/50 rounded-full py-2 pl-6 pr-12 cursor-pointer focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all"
                            value={selectedVariant?.id || ''}
                            onChange={(e) => {
                                const v = variants.find(v => v.id === e.target.value);
                                if (v) setSelectedVariant(v);
                            }}
                        >
                            {variants.map(v => (
                                <option key={v.id} value={v.id}>
                                    {v.name}
                                </option>
                            ))}
                        </select>
                        {/* Custom Arrow */}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary">
                            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* PRECIO Display */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-white uppercase tracking-wider block">
                        Precio
                    </label>
                    <div className="text-4xl md:text-5xl font-black text-primary tracking-tighter">
                        ${selectedVariant?.price}
                    </div>
                </div>
            </div>

            <div className="flex gap-4 pt-4">
                <Button
                    id="add-to-cart-btn"
                    variant="primary"
                    size="lg"
                    onClick={handleAddToCart}
                    className="flex-1 font-black uppercase tracking-widest text-sm py-4 bg-primary text-black hover:bg-primary/90 transition-all"
                >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Agregar al Carrito
                </Button>

                <Button
                    variant="secondary"
                    size="lg"
                    className="flex-1 font-black uppercase tracking-widest text-sm py-4 bg-white text-black hover:bg-gray-200 border-none hidden sm:flex"
                >
                    <Gift className="w-5 h-5 mr-2" />
                    Regalar
                </Button>
            </div>
        </div>
    );
};
