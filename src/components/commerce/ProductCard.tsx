import { Button } from '../ui/Button';
import { ShoppingCart } from 'lucide-react';
import { addCartItem } from '../../lib/store';
import { useState } from 'react';

interface Product {
    id: string;
    name: string;
    price: number;
    image_url: string;
    category: string;
    description?: string;
}

interface ProductCardProps {
    product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const [isHovered, setIsHovered] = useState(false);

    const handleAddToCart = () => {
        addCartItem({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.image_url,
        });
    };

    return (
        <div
            className="group relative flex flex-col items-center"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Data Link Wrapper - Entire Card Clickable */}
            <a href={`/product/${product.id}`} className="relative w-full aspect-[3/4] overflow-hidden rounded-xl bg-[#18181b] border border-white/5 transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] block cursor-pointer">

                <img
                    src={product.image_url || '/placeholder.png'}
                    alt={product.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/400x500?text=No+Image';
                    }}
                />

                {/* Optional: Add "View Details" text or icon overlay if desired, 
                    but pure clean image is often better for this premium look.
                    Removing the previous shopping cart button overlay. */}
            </a>
        </div>
    );
};
