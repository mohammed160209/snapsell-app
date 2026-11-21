import React, { createContext, useContext, useEffect, useState } from 'react';
import { INITIAL_BRANDS, INITIAL_ORDERS, INITIAL_PRODUCTS, INITIAL_USERS, STATUS_FLOW } from './data';

const KEY = 'snapsell-local-v1';
const fresh = () => ({
  users: INITIAL_USERS,
  brands: INITIAL_BRANDS,
  products: INITIAL_PRODUCTS,
  orders: INITIAL_ORDERS,
  session: null, // { userId }
  cart: [], // { productId, qty }
});

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...fresh(), ...JSON.parse(raw) };
  } catch { /* storage unavailable */ }
  return fresh();
}

const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);

export function StoreProvider({ children }) {
  const [s, setS] = useState(load);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ }
  }, [s]);

  const me = s.session ? s.users.find((u) => u.id === s.session.userId) : null;
  const myBrand = me?.brandId ? s.brands.find((b) => b.id === me.brandId) : null;

  const actions = {
    loginAs: (userId) => setS((p) => ({ ...p, session: { userId }, cart: [] })),
    logout: () => setS((p) => ({ ...p, session: null, cart: [] })),
    resetDemo: () => setS(fresh()),
    signUp: ({ name, phone, area, role, brandName, category, tagline }) =>
      setS((p) => {
        const id = 'u-' + Date.now();
        const user = { id, name, phone, area, role };
        let brands = p.brands;
        if (role === 'seller') {
          const brandId = 'b-' + Date.now();
          user.brandId = brandId;
          brands = [
            ...p.brands,
            { id: brandId, name: brandName, ownerId: id, category, area, tagline: tagline || 'New local brand on SnapSell', since: 'Nov 2026', rating: 5.0, delivery: true, pickup: true, status: 'active' },
          ];
        }
        return { ...p, users: [...p.users, user], brands, session: { userId: id }, cart: [] };
      }),

    addToCart: (productId, qty = 1) =>
      setS((p) => {
        const product = p.products.find((x) => x.id === productId);
        const inCart = p.cart.find((c) => c.productId === productId);
        const nextQty = Math.min((inCart?.qty || 0) + qty, product.stock);
        if (nextQty <= 0) return p;
        const cart = inCart
          ? p.cart.map((c) => (c.productId === productId ? { ...c, qty: nextQty } : c))
          : [...p.cart, { productId, qty: nextQty }];
        return { ...p, cart };
      }),
    setCartQty: (productId, qty) =>
      setS((p) => ({
        ...p,
        cart: qty <= 0 ? p.cart.filter((c) => c.productId !== productId) : p.cart.map((c) => (c.productId === productId ? { ...c, qty } : c)),
      })),
    clearCart: () => setS((p) => ({ ...p, cart: [] })),

    // One order per brand in the cart; stock is reduced at checkout.
    placeOrders: ({ fulfilment, address, payment }) => {
      const ids = [];
      setS((p) => {
        const byBrand = {};
        p.cart.forEach((c) => {
          const prod = p.products.find((x) => x.id === c.productId);
          (byBrand[prod.brandId] ||= []).push({ productId: prod.id, name: prod.name, price: prod.price, qty: c.qty });
        });
        let n = 1043 + p.orders.length;
        const newOrders = Object.entries(byBrand).map(([brandId, items]) => {
          const id = 'ORD-' + n++;
          ids.push(id);
          return { id, buyerId: p.session.userId, buyerName: p.users.find((u) => u.id === p.session.userId)?.name, brandId, items, fulfilment, address, payment, status: 'placed', createdAt: new Date().toISOString() };
        });
        const products = p.products.map((prod) => {
          const c = p.cart.find((x) => x.productId === prod.id);
          return c ? { ...prod, stock: Math.max(0, prod.stock - c.qty) } : prod;
        });
        return { ...p, orders: [...newOrders, ...p.orders], products, cart: [] };
      });
      return ids;
    },

    advanceOrder: (orderId) =>
      setS((p) => ({
        ...p,
        orders: p.orders.map((o) => {
          if (o.id !== orderId) return o;
          const flow = STATUS_FLOW[o.fulfilment];
          const i = flow.indexOf(o.status);
          return i >= 0 && i < flow.length - 1 ? { ...o, status: flow[i + 1] } : o;
        }),
      })),
    cancelOrder: (orderId) =>
      setS((p) => {
        const order = p.orders.find((o) => o.id === orderId);
        const products = p.products.map((prod) => {
          const it = order.items.find((i) => i.productId === prod.id);
          return it ? { ...prod, stock: prod.stock + it.qty } : prod;
        });
        return { ...p, products, orders: p.orders.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' } : o)) };
      }),

    saveProduct: (product) =>
      setS((p) => {
        const exists = p.products.some((x) => x.id === product.id);
        return {
          ...p,
          products: exists ? p.products.map((x) => (x.id === product.id ? product : x)) : [{ ...product, id: 'p-' + Date.now() }, ...p.products],
        };
      }),
    updateProduct: (id, patch) => setS((p) => ({ ...p, products: p.products.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
    deleteProduct: (id) => setS((p) => ({ ...p, products: p.products.filter((x) => x.id !== id) })),
    updateBrand: (id, patch) => setS((p) => ({ ...p, brands: p.brands.map((b) => (b.id === id ? { ...b, ...patch } : b)) })),
  };

  return <Ctx.Provider value={{ ...s, me, myBrand, ...actions }}>{children}</Ctx.Provider>;
}
