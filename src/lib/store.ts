import { atom, computed } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';

export type CartItem = {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
};

export const cartItems = persistentAtom<CartItem[]>('cart', [], {
    encode: JSON.stringify,
    decode: JSON.parse,
});
export const isCartOpen = atom(false);

export const cartTotal = computed(cartItems, (items: CartItem[]) => {
    return items.reduce((total: number, item: CartItem) => total + item.price * item.quantity, 0);
});

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
    isCartOpen.set(true); // Open cart when adding item
}

export function removeCartItem(itemId: string) {
    cartItems.set(cartItems.get().filter((i) => i.id !== itemId));
}

export function setCartOpen(isOpen: boolean) {
    isCartOpen.set(isOpen);
}

export type User = {
    id: string;
    email?: string;
    user_metadata?: {
        full_name?: string;
        avatar_url?: string;
    };
} | null;

export const currentUser = atom<User>(null);

export function setUser(user: User) {
    currentUser.set(user);
}
