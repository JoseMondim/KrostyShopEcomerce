import { atom } from 'nanostores';

export type CartItem = {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
};

export const cartItems = atom<CartItem[]>([]);

export function addCartItem(item: CartItem) {
    const existingEntry = cartItems.get().find((i) => i.id === item.id);
    if (existingEntry) {
        cartItems.set(
            cartItems.get().map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            )
        );
    } else {
        cartItems.set([...cartItems.get(), item]);
    }
}

export function removeCartItem(itemId: string) {
    cartItems.set(cartItems.get().filter((i) => i.id !== itemId));
}
