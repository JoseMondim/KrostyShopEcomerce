import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Edit, Trash2, Plus, Loader2, Package } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    category: string;
    stock_status: string;
}

export const AdminProductList = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        const { data, error } = await supabase!
            .from('products')
            .select('*')
            .order('name');

        if (data) {
            setProducts(data);
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return;

        const { error } = await supabase!
            .from('products')
            .delete()
            .eq('id', id);

        if (!error) {
            fetchProducts();
        } else {
            alert('Error al eliminar producto: ' + error.message);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-white uppercase tracking-wide">
                    Mis Productos
                </h2>
                <a href="/admin/products/new">
                    <Button className="bg-primary text-black font-bold uppercase flex items-center gap-2">
                        <Plus size={20} /> Nuevo Producto
                    </Button>
                </a>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="animate-spin text-primary w-8 h-8" />
                </div>
            ) : (
                <div className="bg-[#18181b] border border-white/5 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/10 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    <th className="p-4">Imagen</th>
                                    <th className="p-4">Nombre</th>
                                    <th className="p-4">Categoría</th>
                                    <th className="p-4">Precio Base</th>
                                    <th className="p-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {products.map((product) => (
                                    <tr key={product.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <div className="w-12 h-16 bg-black/50 rounded overflow-hidden border border-white/10">
                                                <img
                                                    src={product.image_url || '/placeholder.png'}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </td>
                                        <td className="p-4 font-medium text-white">{product.name}</td>
                                        <td className="p-4 text-gray-400 text-sm">
                                            <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="p-4 text-primary font-bold">From ${product.price}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <a href={`/admin/products/${product.id}`}>
                                                    <button className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors" title="Editar">
                                                        <Edit size={18} />
                                                    </button>
                                                </a>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {products.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-gray-500">
                                            <Package size={48} className="mx-auto mb-4 opacity-50" />
                                            <p>No hay productos registrados.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
