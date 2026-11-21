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

// ───────────── Platform 2: Secondhand (every user can buy and sell) ─────────────
export const SH_COMMISSION_RATE = 0.05; // only on in-app payments; cash deals are free
export const DEMO_HANDOVER_CODE = '4827';

export const SH_CATEGORIES = [
  { id: 'furniture', name: 'Furniture' },
  { id: 'electronics', name: 'Electronics' },
  { id: 'books', name: 'Books' },
  { id: 'cycles', name: 'Cycles' },
  { id: 'appliances', name: 'Appliances' },
  { id: 'bags', name: 'Bags & Fashion' },
];

export const CONDITIONS = {
  like_new: { label: 'Like new', cls: 'bg-[#E7F7EE] text-[#157F3E]' },
  good: { label: 'Good', cls: 'bg-[#EEF0FF] text-[#3B2FD9]' },
  fair: { label: 'Fair', cls: 'bg-[#FEF6E4] text-[#B45309]' },
  for_parts: { label: 'For parts', cls: 'bg-[#F1F1F4] text-[#4E5369]' },
};

// What the (simulated) AI writes for each category in the sell flow.
export const AI_TEMPLATES = {
  furniture: { guess: 'Wooden study table', title: 'Wooden study table with drawer', desc: 'Sturdy engineered-wood study table with one drawer and a cable cut-out. Fits a laptop and monitor comfortably. Easy to dismantle for moving.', low: 2500, high: 3500, photo: './images/study-table-2.jpg' },
  electronics: { guess: 'Over-ear headphones', title: 'Wireless over-ear headphones', desc: 'Bluetooth headphones with active noise cancellation and around 25 hours of battery. Ear cushions in clean condition. Charging cable included.', low: 3000, high: 5000, photo: './images/headphones.jpg' },
  books: { guess: 'Set of textbooks', title: 'Competitive exam textbook set', desc: 'Complete set of reference books with light pencil notes. No torn pages. Great for first-time aspirants.', low: 800, high: 1400, photo: './images/textbooks.jpg' },
  cycles: { guess: 'Geared bicycle', title: '21-speed geared bicycle', desc: '26-inch geared cycle with front suspension and disc brakes. Recently serviced, tyres in good shape. Ideal for daily commute.', low: 4000, high: 6000, photo: './images/hero-cycle.jpg' },
  appliances: { guess: 'Air cooler', title: 'Personal air cooler, 25 L', desc: 'Compact air cooler with three speeds and honeycomb pads. Cools a 120 sq ft room well. Pads replaced this summer.', low: 1800, high: 2800, photo: './images/prestige-cooler.jpg' },
  bags: { guess: 'Laptop backpack', title: '30 L laptop backpack', desc: 'Water-resistant backpack with a padded 15.6" laptop sleeve and two side bottle pockets. Zips work smoothly.', low: 700, high: 1200, photo: './images/backpack.jpg' },
};

export const AI_QUESTIONS = [
  { id: 'age', q: 'How old is it?', options: ['Under 6 months', '6–18 months', '1–3 years', '3+ years'] },
  { id: 'defects', q: 'Any defects or wear?', options: ['None', 'Minor scratches', 'Visible wear', 'Needs repair'] },
  { id: 'included', q: "What's included?", options: ['Item only', 'Original box', 'Bill + box', 'Extra accessories'] },
];

export const PEOPLE = {
  'u-buyer': { name: 'Kabir Mehta', area: 'Koramangala', deals: 3 },
  'u-p1': { name: 'Riya Sharma', area: 'Koramangala', deals: 6 },
  'u-p2': { name: 'Arjun Nair', area: 'HSR Layout', deals: 2 },
  'u-p3': { name: 'Meera Iyer', area: 'Indiranagar', deals: 9 },
  'u-p4': { name: 'Rohan Das', area: 'Jayanagar', deals: 4 },
  'u-p5': { name: 'Sana Khan', area: 'BTM Layout', deals: 1 },
  'u-p6': { name: 'Vikram Joshi', area: 'Koramangala', deals: 5 },
};

export const INITIAL_LISTINGS = [
  { id: 'L1', sellerId: 'u-p1', title: 'Solid sheesham study table with drawer', category: 'furniture', condition: 'like_new', price: 3200, photo: './images/study-table-1.jpg', desc: 'Moving out of my PG, selling my study table. Solid sheesham top, one drawer, very stable. Small scratch on the left edge (shown in photo 2).', facts: ['Bought in 2024', 'Small scratch on left edge', 'Chair not included'], mode: 'meet', area: 'Koramangala', status: 'active', aiWritten: true, createdAt: ago(2) },
  { id: 'L2', sellerId: 'u-p6', title: 'Hero Sprint 21-speed cycle', category: 'cycles', condition: 'good', price: 4800, photo: './images/hero-cycle.jpg', desc: '21-speed geared cycle, serviced last month. Front suspension works well, new brake pads.', facts: ['Serviced Oct 2026', 'New brake pads', 'Lock included'], mode: 'meet', area: 'Koramangala', status: 'active', aiWritten: true, createdAt: ago(5) },
  { id: 'L3', sellerId: 'u-p3', title: 'Sony wireless noise-cancelling headphones', category: 'electronics', condition: 'like_new', price: 4500, photo: './images/headphones.jpg', desc: 'Used for 4 months, works perfectly. ANC is excellent. Comes with case and cable.', facts: ['Bill available', 'Case + cable included', 'No scratches'], mode: 'ship', area: 'Indiranagar', status: 'active', aiWritten: true, createdAt: ago(8) },
  { id: 'L4', sellerId: 'u-p4', title: 'Prestige 25 L personal air cooler', category: 'appliances', condition: 'good', price: 2100, photo: './images/prestige-cooler.jpg', desc: 'Cools a small room well. Honeycomb pads replaced this summer. Three speed settings.', facts: ['Pads replaced 2026', 'Remote not included'], mode: 'meet', area: 'Jayanagar', status: 'active', aiWritten: false, createdAt: ago(20) },
  { id: 'L5', sellerId: 'u-p2', title: 'UPSC CSE GS book set (12 volumes)', category: 'books', condition: 'good', price: 1150, photo: './images/textbooks.jpg', desc: 'Complete GS set including Laxmikanth, Spectrum and NCERTs. Light pencil marks only.', facts: ['12 books', 'Light pencil notes', 'No torn pages'], mode: 'ship', area: 'HSR Layout', status: 'active', aiWritten: true, createdAt: ago(26) },
  { id: 'L6', sellerId: 'u-p5', title: 'IKEA Poäng armchair, beige cushion', category: 'furniture', condition: 'good', price: 2400, photo: './images/ikea-chair.jpg', desc: 'Comfortable bentwood armchair. Cushion cover washed recently. Pickup only, it does not fit in an auto.', facts: ['Cushion cover washable', 'Pickup from BTM'], mode: 'meet', area: 'BTM Layout', status: 'active', aiWritten: true, createdAt: ago(30) },
  { id: 'L7', sellerId: 'u-p6', title: 'Bajaj 750 W mixer grinder, 3 jars', category: 'appliances', condition: 'fair', price: 1300, photo: './images/mixer-grinder.jpg', desc: 'Motor works fine, small jar lid is slightly loose. All three jars included.', facts: ['3 jars', 'Small jar lid loose'], mode: 'meet', area: 'Koramangala', status: 'active', aiWritten: false, createdAt: ago(40) },
  { id: 'L8', sellerId: 'u-buyer', title: 'Decathlon Quechua 30 L backpack', category: 'bags', condition: 'like_new', price: 950, photo: './images/backpack.jpg', desc: 'Used for one trek. Padded laptop sleeve, rain cover included.', facts: ['Rain cover included', 'Used once'], mode: 'meet', area: 'Koramangala', status: 'reserved', aiWritten: true, createdAt: ago(10) },
  { id: 'L9', sellerId: 'u-p1', title: 'Engineered-wood study table, white', category: 'furniture', condition: 'fair', price: 1200, photo: './images/study-table-3.jpg', desc: 'Basic study table, a bit wobbly on one leg (needs one screw). Good for a student budget.', facts: ['One leg needs a screw', 'Pickup only'], mode: 'meet', area: 'Koramangala', status: 'sold', aiWritten: true, createdAt: ago(72) },
];

export const INITIAL_DEALS = [
  // Someone wants to buy Kabir's backpack: Kabir (seller) can accept and complete it.
  { id: 'D1', listingId: 'L8', buyerId: 'u-p2', sellerId: 'u-buyer', mode: 'meet', payment: 'app', status: 'requested', price: 950, code: DEMO_HANDOVER_CODE, createdAt: ago(1) },
  // Kabir bought headphones shipped from Meera: he can mark received.
  { id: 'D2', listingId: 'L10', title: 'boAt Rockerz 450 headphones', photo: './images/headphones.jpg', buyerId: 'u-buyer', sellerId: 'u-p3', mode: 'ship', payment: 'app', status: 'shipped', price: 900, courier: 'Delhivery', tracking: 'DLV 4402 1187 63', createdAt: ago(30) },
];

export const INITIAL_MESSAGES = [
  { id: 'M1', listingId: 'L8', fromId: 'u-p2', toId: 'u-buyer', text: 'Hi Kabir, is the backpack still available?', createdAt: ago(1.2) },
  { id: 'M2', listingId: 'L8', fromId: 'u-buyer', toId: 'u-p2', text: 'Yes! Can meet near Forum Mall after 6.', createdAt: ago(1.1) },
  { id: 'M3', listingId: 'L8', fromId: 'u-p2', toId: 'u-buyer', text: 'Perfect, sent a request to buy. See you at 6.', createdAt: ago(1) },
];
