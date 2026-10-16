import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, MsProduct, ProductVariant } from '@repo/shared';

interface CartState {
  cart: CartItem[];
  addToCart: (product: MsProduct, variant?: ProductVariant, quantity?: number) => void;
  updateQty: (itemKey: string, qty: number) => void;
  removeItem: (itemKey: string) => void;
  clearCart: () => void;
  getTotalCount: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],

      addToCart: (product: MsProduct, variant?: ProductVariant, quantity = 1) => {
        set((state) => {
          const itemKey = variant ? `${product.kodeSKU}__${variant.id}` : product.kodeSKU;
          const effectivePrice = Number(product.hargaJual) + Number(variant?.addPrice || 0);
          const effectiveName = variant
            ? `${product.namaSKU} (${variant.namaVarian})`
            : product.namaSKU;

          const found = state.cart.find((c) => (c.id || c.product.kodeSKU) === itemKey);
          if (found) {
            return {
              cart: state.cart.map((c) =>
                (c.id || c.product.kodeSKU) === itemKey
                  ? { ...c, qty: c.qty + quantity }
                  : c,
              ),
            };
          }

          return {
            cart: [
              ...state.cart,
              {
                id: itemKey,
                product: {
                  ...product,
                  namaSKU: effectiveName,
                  hargaJual: effectivePrice,
                },
                qty: quantity,
                selectedVariant: variant,
              },
            ],
          };
        });
      },

      updateQty: (itemKey: string, qty: number) => {
        set((state) => {
          if (qty <= 0) {
            return {
              cart: state.cart.filter((c) => (c.id || c.product.kodeSKU) !== itemKey),
            };
          }
          return {
            cart: state.cart.map((c) =>
              (c.id || c.product.kodeSKU) === itemKey ? { ...c, qty } : c,
            ),
          };
        });
      },

      removeItem: (itemKey: string) => {
        set((state) => ({
          cart: state.cart.filter((c) => (c.id || c.product.kodeSKU) !== itemKey),
        }));
      },

      clearCart: () => set({ cart: [] }),

      getTotalCount: () => {
        return get().cart.reduce((acc, curr) => acc + curr.qty, 0);
      },

      getTotalPrice: () => {
        return get().cart.reduce(
          (acc, curr) => acc + curr.qty * curr.product.hargaJual,
          0,
        );
      },
    }),
    {
      name: 'ei_embeauty_cart',
    },
  ),
);
