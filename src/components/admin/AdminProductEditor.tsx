import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Save, ArrowLeft, Plus, Trash2, Loader2, DollarSign } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    category: string;
    stock_status: string;
}

interface ProductVariant {
    id: string;
    product_id: string;
    name: string;
    price: number;
}

interface AdminProductEditorProps {
    productId?: string; // If undefined, it's new mode
}

export const AdminProductEditor: React.FC<AdminProductEditorProps> = ({ productId }) => {
    const isNew = !productId || productId === 'new';
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);

    // Product State
    const [product, setProduct] = useState<Partial<Product>>({
        name: '',
        description: '',
        price: 0,
        image_url: '',
        category: 'gift_cards',
        stock_status: 'in_stock'
    });

    // Variants State
    const [variants, setVariants] = useState<Partial<ProductVariant>[]>([]);
    const [newVariant, setNewVariant] = useState({ name: '', price: '' });

    useEffect(() => {
        if (!isNew && productId) {
            fetchProductData(productId);
        }
    }, [productId]);

    const fetchProductData = async (id: string) => {
        setLoading(true);
        // Fetch Product
        const { data: prodData, error: prodError } = await supabase!
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (prodError) {
            alert('Error cargando producto');
            setLoading(false);
            return;
        }

        setProduct(prodData);

        // Fetch Variants
        const { data: varData, error: varError } = await supabase!
            .from('product_variants')
            .select('*')
            .eq('product_id', id)
            .order('price', { ascending: true });

        if (varData) {
            setVariants(varData);
        }
        setLoading(false);
    };

    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            let pid = productId;

            // 1. Upsert Product
            const productData = {
                name: product.name,
                description: product.description,
                price: product.price, // This is the "From" price
                image_url: product.image_url,
                category: product.category,
                stock_status: product.stock_status
            };

            if (isNew) {
                const { data, error } = await supabase!
                    .from('products')
                    .insert([productData])
                    .select()
                    .single();

                if (error) throw error;
                pid = data.id;
                // Redirect to edit mode to enable variants
                window.location.href = `/admin/products/${pid}`;
                return;
            } else {
                const { error } = await supabase!
                    .from('products')
                    .update(productData)
                    .eq('id', pid);

                if (error) throw error;
            }

            alert('Producto guardado correctamente');
        } catch (error: any) {
            alert('Error al guardar: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleAddVariant = async () => {
        if (!newVariant.name || !newVariant.price) return;
        if (isNew) {
            alert('Primero guarda el producto antes de agregar variantes.');
            return;
        }

        const priceNum = parseFloat(newVariant.price);

        const { data, error } = await supabase!
            .from('product_variants')
            .insert([{
                product_id: productId,
                name: newVariant.name,
                price: priceNum
            }])
            .select()
            .single();

        if (error) {
            alert('Error al crear variante: ' + error.message);
        } else {
            setVariants([...variants, data]);
            setNewVariant({ name: '', price: '' });
            // Optionally update product base price if this is lower
            if (product.price === 0 || priceNum < (product.price || 999999)) {
                // Update local state primarily, DB update can happen next save or auto
                setProduct(prev => ({ ...prev, price: priceNum }));
            }
        }
    };

    const handleDeleteVariant = async (variantId: string) => {
        if (!confirm('¿Eliminar variante?')) return;

        const { error } = await supabase!
            .from('product_variants')
            .delete()
            .eq('id', variantId);

        if (error) {
            alert('Error: ' + error.message);
        } else {
            setVariants(variants.filter(v => v.id !== variantId));
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <a href="/admin/products" className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                    <ArrowLeft size={24} />
                </a>
                <h2 className="text-2xl font-black text-white uppercase tracking-wide">
                    {isNew ? 'Nuevo Producto' : 'Editar Producto'}
                </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Product Info */}
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleSaveProduct} className="bg-[#18181b] border border-white/5 rounded-xl p-6 space-y-4">
                        <h3 className="text-lg font-bold text-white mb-4">Información General</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase">Nombre</label>
                                <input
                                    type="text"
                                    value={product.name}
                                    onChange={e => setProduct({ ...product, name: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase">Categoría</label>
                                <select
                                    value={product.category}
                                    onChange={e => setProduct({ ...product, category: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                                >
                                    <option value="gift_cards">Gift Cards</option>
                                    <option value="game_reloads">Recargas de Juegos</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase">Descripción</label>
                            <textarea
                                value={product.description || ''}
                                onChange={e => setProduct({ ...product, description: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none h-24"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase">URL de Imagen</label>
                            <input
                                type="text"
                                value={product.image_url || ''}
                                onChange={e => setProduct({ ...product, image_url: e.target.value })}
                                placeholder="https://..."
                                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase">Precio Base (Referencia)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                                <input
                                    type="number"
                                    step="0.01"
                                    value={product.price}
                                    onChange={e => setProduct({ ...product, price: parseFloat(e.target.value) })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 pl-10 text-white focus:border-primary focus:outline-none"
                                    required
                                />
                            </div>
                            <p className="text-[10px] text-gray-500">Este precio se muestra en el catálogo ("Desde $X").</p>
                        </div>

                        <div className="pt-4">
                            <Button type="submit" disabled={saving} className="w-full bg-primary text-black font-bold uppercase">
                                {saving ? <Loader2 className="animate-spin" /> : <><Save size={18} className="mr-2" /> Guardar Producto</>}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Right Column: Variants */}
                <div className="space-y-6">
                    <div className="bg-[#18181b] border border-white/5 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Variantes (Montos)</h3>

                        {isNew ? (
                            <div className="text-center py-8 text-gray-500 text-sm">
                                Guarda el producto primero para agregar variantes.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Variant List */}
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {variants.map(variant => (
                                        <div key={variant.id} className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/5 group hover:border-white/20 transition-colors">
                                            <div>
                                                <p className="text-sm font-bold text-white">{variant.name}</p>
                                                <p className="text-xs text-primary font-mono">${variant.price}</p>
                                            </div>
                                            <button
                                                onClick={() => variant.id && handleDeleteVariant(variant.id)}
                                                className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {variants.length === 0 && (
                                        <p className="text-gray-500 text-sm text-center italic">No hay variantes.</p>
                                    )}
                                </div>

                                {/* Add Variant Form */}
                                <div className="pt-4 border-t border-white/10 space-y-2">
                                    <input
                                        type="text"
                                        placeholder="Nombre (ej: $10 USD)"
                                        value={newVariant.name}
                                        onChange={e => setNewVariant({ ...newVariant, name: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm text-white"
                                    />
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            placeholder="Precio"
                                            value={newVariant.price}
                                            onChange={e => setNewVariant({ ...newVariant, price: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm text-white"
                                        />
                                        <button
                                            onClick={handleAddVariant}
                                            disabled={!newVariant.name || !newVariant.price}
                                            className="bg-white/10 hover:bg-white/20 text-white rounded p-2 disabled:opacity-50"
                                        >
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Image Preview */}
                    {product.image_url && (
                        <div className="bg-[#18181b] border border-white/5 rounded-xl p-4">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Vista Previa</p>
                            <div className="aspect-[3/4] rounded-lg overflow-hidden bg-black/50">
                                <img src={product.image_url} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
