export const COMMISSION_RATE = 0.08; // platform commission on every order
export const DELIVERY_FEE = 30;

export const CATEGORIES = [
  { id: 'bakery', name: 'Bakery', icon: 'Cake', tint: '#FFF1EE', ink: '#C2410C' },
  { id: 'decor', name: 'Candles & Decor', icon: 'Flame', tint: '#FEF6E4', ink: '#B45309' },
  { id: 'fashion', name: 'Fashion', icon: 'Shirt', tint: '#EEF0FF', ink: '#3B2FD9' },
  { id: 'skincare', name: 'Skincare', icon: 'Sparkles', tint: '#FCEEF5', ink: '#BE185D' },
  { id: 'plants', name: 'Plants', icon: 'Leaf', tint: '#E7F7EE', ink: '#157F3E' },
  { id: 'snacks', name: 'Snacks', icon: 'Cookie', tint: '#FDF3E7', ink: '#9A5B13' },
];

export const INITIAL_BRANDS = [
  { id: 'b1', name: 'Crumb & Co.', ownerId: 'u-seller', category: 'bakery', area: 'Koramangala', tagline: 'Small-batch sourdough and bakes from a home kitchen', since: 'Jun 2026', rating: 4.8, delivery: true, pickup: true, status: 'active' },
  { id: 'b2', name: 'Wick Studio', ownerId: 'u-s2', category: 'decor', area: 'Indiranagar', tagline: 'Hand-poured soy candles in recycled glass', since: 'Aug 2026', rating: 4.7, delivery: true, pickup: false, status: 'active' },
  { id: 'b3', name: 'Thread Tales', ownerId: 'u-s3', category: 'fashion', area: 'HSR Layout', tagline: 'Block-printed totes and scrunchies, stitched locally', since: 'Sep 2026', rating: 4.6, delivery: true, pickup: true, status: 'active' },
  { id: 'b4', name: 'Leaf Lab', ownerId: 'u-s4', category: 'plants', area: 'Jayanagar', tagline: 'Low-maintenance indoor plants for small flats', since: 'Oct 2026', rating: 4.9, delivery: true, pickup: true, status: 'active' },
  { id: 'b5', name: 'Glow Ritual', ownerId: 'u-s5', category: 'skincare', area: 'BTM Layout', tagline: 'Cold-processed soaps and natural body care', since: 'Nov 2026', rating: 4.5, delivery: true, pickup: false, status: 'pending' },
];

export const INITIAL_PRODUCTS = [
  { id: 'p1', brandId: 'b1', name: 'Classic Sourdough Loaf', price: 280, stock: 12, unit: '500 g', category: 'bakery', desc: '48-hour fermented sourdough with a crackly crust. Baked fresh every morning.', active: true },
  { id: 'p2', brandId: 'b1', name: 'Dark Chocolate Brownies (Box of 6)', price: 360, stock: 8, unit: 'box', category: 'bakery', desc: 'Fudgy brownies made with 70% Belgian dark chocolate. No preservatives.', active: true },
  { id: 'p3', brandId: 'b1', name: 'Banana Walnut Bread', price: 240, stock: 3, unit: '400 g', category: 'bakery', desc: 'Moist banana bread loaded with toasted walnuts. Eggless option on request.', active: true },
  { id: 'p4', brandId: 'b2', name: 'Lavender Soy Candle', price: 499, stock: 20, unit: '200 g', category: 'decor', desc: '40-hour burn time. Pure soy wax with lavender essential oil.', active: true },
  { id: 'p5', brandId: 'b2', name: 'Coffee & Vanilla Candle', price: 549, stock: 14, unit: '200 g', category: 'decor', desc: 'Warm café notes in an amber recycled jar.', active: true },
  { id: 'p6', brandId: 'b3', name: 'Block-Print Cotton Tote', price: 399, stock: 25, unit: 'piece', category: 'fashion', desc: 'Hand block-printed indigo tote with an inner pocket. Fits a 14" laptop.', active: true },
  { id: 'p7', brandId: 'b3', name: 'Scrunchie Set of 3', price: 199, stock: 40, unit: 'set', category: 'fashion', desc: 'Soft cotton scrunchies made from leftover fabric. Zero waste.', active: true },
  { id: 'p8', brandId: 'b4', name: 'Money Plant in Ceramic Pot', price: 349, stock: 18, unit: 'plant', category: 'plants', desc: 'Easy-care trailing plant. Thrives in indirect light, water once a week.', active: true },
  { id: 'p9', brandId: 'b4', name: 'Snake Plant (Medium)', price: 549, stock: 6, unit: 'plant', category: 'plants', desc: 'Air-purifying and almost impossible to kill. Comes in a 6" pot.', active: true },
  { id: 'p10', brandId: 'b5', name: 'Charcoal & Neem Soap', price: 180, stock: 30, unit: '100 g', category: 'skincare', desc: 'Cold-processed bar for oily skin. Handmade in small batches.', active: true },
  { id: 'p11', brandId: 'b1', name: 'Masala Peanut Chikki', price: 150, stock: 0, unit: '250 g', category: 'snacks', desc: 'Jaggery chikki with a hint of chaat masala.', active: true },
  { id: 'p12', brandId: 'b4', name: 'Succulent Trio', price: 450, stock: 9, unit: 'set', category: 'plants', desc: 'Three mini succulents in matching terracotta pots.', active: true },
];

export const INITIAL_USERS = [
  { id: 'u-buyer', name: 'Kabir Mehta', phone: '98450 24190', area: 'Koramangala', role: 'buyer' },
  { id: 'u-seller', name: 'Ananya Rao', phone: '99001 55230', area: 'Koramangala', role: 'seller', brandId: 'b1' },
  { id: 'u-admin', name: 'SnapSell Admin', phone: '90000 00000', area: 'Bengaluru', role: 'admin' },
];

const ago = (h) => new Date(Date.now() - h * 3600 * 1000).toISOString();

export const INITIAL_ORDERS = [
  { id: 'ORD-1042', buyerId: 'u-b2', buyerName: 'Riya Sharma', brandId: 'b1', items: [{ productId: 'p1', name: 'Classic Sourdough Loaf', price: 280, qty: 2 }], fulfilment: 'delivery', address: '4th Block, Koramangala', payment: 'upi', status: 'placed', createdAt: ago(0.5) },
  { id: 'ORD-1039', buyerId: 'u-b3', buyerName: 'Arjun Nair', brandId: 'b1', items: [{ productId: 'p2', name: 'Dark Chocolate Brownies (Box of 6)', price: 360, qty: 1 }], fulfilment: 'pickup', address: 'Pickup from Crumb & Co.', payment: 'upi', status: 'accepted', createdAt: ago(3) },
  { id: 'ORD-1031', buyerId: 'u-buyer', buyerName: 'Kabir Mehta', brandId: 'b1', items: [{ productId: 'p3', name: 'Banana Walnut Bread', price: 240, qty: 1 }], fulfilment: 'delivery', address: '6th Block, Koramangala', payment: 'upi', status: 'delivered', createdAt: ago(28) },
  { id: 'ORD-1027', buyerId: 'u-b4', buyerName: 'Meera Iyer', brandId: 'b2', items: [{ productId: 'p4', name: 'Lavender Soy Candle', price: 499, qty: 2 }], fulfilment: 'delivery', address: 'HAL 2nd Stage, Indiranagar', payment: 'upi', status: 'delivered', createdAt: ago(50) },
  { id: 'ORD-1020', buyerId: 'u-b5', buyerName: 'Rohan Das', brandId: 'b4', items: [{ productId: 'p8', name: 'Money Plant in Ceramic Pot', price: 349, qty: 1 }, { productId: 'p12', name: 'Succulent Trio', price: 450, qty: 1 }], fulfilment: 'delivery', address: '9th Block, Jayanagar', payment: 'cod', status: 'out_for_delivery', createdAt: ago(6) },
];

export const STATUS_FLOW = {
  delivery: ['placed', 'accepted', 'out_for_delivery', 'delivered'],
  pickup: ['placed', 'accepted', 'ready_for_pickup', 'delivered'],
};

export const STATUS_LABEL = {
  placed: 'New order',
  accepted: 'Accepted',
  out_for_delivery: 'Out for delivery',
  ready_for_pickup: 'Ready for pickup',
  delivered: 'Completed',
  cancelled: 'Cancelled',
};

export const orderSubtotal = (o) => o.items.reduce((s, i) => s + i.price * i.qty, 0);
export const orderTotal = (o) => orderSubtotal(o) + (o.fulfilment === 'delivery' ? DELIVERY_FEE : 0);
export const orderCommission = (o) => Math.round(orderSubtotal(o) * COMMISSION_RATE);
export const rupees = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
