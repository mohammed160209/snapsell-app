// Builds user-flow boards (SVG only) from the real screenshots in docs/flows/screens.
// Run scripts/capture-screens.mjs first. Usage: node scripts/build-flows.mjs
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const DIR = new URL('../docs/flows/', import.meta.url).pathname;
const SHOTS = join(DIR, 'screens');
const TMP = mkdtempSync(join(tmpdir(), 'flows-'));

// Layout constants
const PW = 240, PH = Math.round(240 * 844 / 390); // phone frame (screen area)
const BEZ = 8;                                    // frame padding
const COLW = PW + 2 * BEZ + 170;                  // column pitch (room for edge labels)
const ROWH = PH + 2 * BEZ + 110;                  // row pitch (room for captions)
const MX = 60, MY = 170;                          // margins (title + legend on top)
const C = { ink: '#1D1D1F', sub: '#6E6E73', muted: '#8E8E93', line: '#C7C7CC', indigo: '#3B2FD9', coral: '#FF5A3D', green: '#157F3E', greenBg: '#E7F7EE', bg: '#F5F5F7', amber: '#B45309' };

const cache = new Map();
function img(name) {
  if (!cache.has(name)) {
    const out = join(TMP, `${name}.jpg`);
    execFileSync('magick', [join(SHOTS, `${name}.png`), '-resize', '480x', '-quality', '80', out]);
    cache.set(name, `data:image/jpeg;base64,${readFileSync(out).toString('base64')}`);
  }
  return cache.get(name);
}
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const textW = (s, size) => s.length * size * 0.56;

function board({ file, title, subtitle, nodes, edges }) {
  const pos = {};
  let maxX = 0, maxY = 0;
  for (const n of nodes) {
    const x = MX + n.col * COLW, y = MY + n.row * ROWH;
    const pill = n.kind === 'end' || n.kind === 'start';
    const w = pill ? Math.max(210, ...n.title.split('\n').map((t, i) => textW(t, i === 0 ? 15 : 13) + 44)) : PW + 2 * BEZ;
    const h = n.kind === 'end' || n.kind === 'start' ? 66 : PH + 2 * BEZ;
    const cy = y + (PH + 2 * BEZ) / 2;                       // vertical centre line of the row
    const top = n.kind === 'end' || n.kind === 'start' ? cy - h / 2 + (n.dy || 0) : y;
    pos[n.id] = { x, y: top, w, h, cy: top + h / 2, n };
    maxX = Math.max(maxX, x + w); maxY = Math.max(maxY, top + h + 60);
  }
  const W = maxX + MX, H = maxY + 20;
  const out = [];
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Inter, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif">`);
  out.push(`<defs>
    <marker id="a-tap" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${C.indigo}"/></marker>
    <marker id="a-auto" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${C.muted}"/></marker>
    <marker id="a-error" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${C.coral}"/></marker>
    <filter id="sh" x="-20%" y="-10%" width="140%" height="130%"><feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#000" flood-opacity=".14"/></filter>
    <clipPath id="scr"><rect width="${PW}" height="${PH}" rx="26"/></clipPath>
  </defs>`);
  out.push(`<rect width="${W}" height="${H}" fill="${C.bg}"/>`);
  // Title + legend
  out.push(`<text x="${MX}" y="62" font-size="34" font-weight="700" fill="${C.ink}" letter-spacing="-0.8">${esc(title)}</text>`);
  out.push(`<text x="${MX}" y="94" font-size="17" fill="${C.sub}">${esc(subtitle)}</text>`);
  const lg = [['tap', 'Tap / user action'], ['auto', 'Happens automatically'], ['error', 'Error or alternate branch']];
  let lx = MX;
  lg.forEach(([k, label]) => {
    const col = k === 'tap' ? C.indigo : k === 'auto' ? C.muted : C.coral;
    out.push(`<line x1="${lx}" y1="128" x2="${lx + 38}" y2="128" stroke="${col}" stroke-width="2.5" ${k === 'auto' ? 'stroke-dasharray="6 5"' : ''} marker-end="url(#a-${k})"/>`);
    out.push(`<text x="${lx + 48}" y="133" font-size="14" fill="${C.sub}">${label}</text>`);
    lx += 48 + textW(label, 14) + 36;
  });
  out.push(`<rect x="${lx}" y="116" width="26" height="24" rx="12" fill="${C.greenBg}" stroke="${C.green}" stroke-width="1.5"/><text x="${lx + 36}" y="133" font-size="14" fill="${C.sub}">End state</text>`);

  // Edges first (under the phones)
  const labels = [];
  for (const e of edges) {
    const a = pos[e.from], b = pos[e.to];
    const kind = e.kind || 'tap';
    const col = kind === 'tap' ? C.indigo : kind === 'auto' ? C.muted : C.coral;
    const sx = a.x + a.w, sy = e.sy ?? a.cy, tx = b.x, ty = b.cy;
    const midX = e.midX ?? (b.x - 85);
    const d = Math.abs(sy - ty) < 2 ? `M${sx} ${sy}H${tx - 3}` : `M${sx} ${sy}H${midX - 14}Q${midX} ${sy} ${midX} ${sy + Math.sign(ty - sy) * 14}V${ty - Math.sign(ty - sy) * 14}Q${midX} ${ty} ${midX + 14} ${ty}H${tx - 3}`;
    out.push(`<path d="${d}" fill="none" stroke="${col}" stroke-width="2.5" ${kind === 'auto' ? 'stroke-dasharray="7 6"' : ''} marker-end="url(#a-${kind})"/>`);
    if (e.label) labels.push({ x: Math.abs(sy - ty) < 2 ? (sx + tx) / 2 : midX, y: ty, text: e.label, col, kind });
  }
  // Nodes
  for (const { x, y, w, h, n } of Object.values(pos)) {
    if (n.kind === 'end' || n.kind === 'start') {
      const end = n.kind === 'end';
      const fill = end ? (n.tone === 'gray' ? '#ECECF0' : n.tone === 'coral' ? '#FFF1EE' : C.greenBg) : '#FFFFFF';
      const stroke = end ? (n.tone === 'gray' ? C.line : n.tone === 'coral' ? C.coral : C.green) : C.indigo;
      out.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>`);
      const lines = n.title.split('\n');
      lines.forEach((t, i) => out.push(`<text x="${x + w / 2}" y="${y + h / 2 + 6 + (i - (lines.length - 1) / 2) * 19}" text-anchor="middle" font-size="${i === 0 ? 15 : 13}" font-weight="${i === 0 ? 650 : 400}" fill="${i === 0 ? C.ink : C.sub}">${esc(t)}</text>`));
      continue;
    }
    out.push(`<g filter="url(#sh)"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="34" fill="#111"/></g>`);
    out.push(`<g transform="translate(${x + BEZ} ${y + BEZ})"><image width="${PW}" height="${PH}" preserveAspectRatio="xMidYMin slice" clip-path="url(#scr)" href="${img(n.shot)}" xlink:href="${img(n.shot)}"/></g>`);
    // Step badge + caption
    out.push(`<circle cx="${x + 2}" cy="${y + 2}" r="17" fill="${n.tone === 'error' ? C.coral : C.indigo}" stroke="#fff" stroke-width="3"/><text x="${x + 2}" y="${y + 7.5}" text-anchor="middle" font-size="14" font-weight="700" fill="#fff">${esc(n.step)}</text>`);
    out.push(`<text x="${x + w / 2}" y="${y + h + 30}" text-anchor="middle" font-size="17" font-weight="700" fill="${C.ink}">${esc(n.title)}</text>`);
    if (n.note) out.push(`<text x="${x + w / 2}" y="${y + h + 52}" text-anchor="middle" font-size="13.5" fill="${C.sub}">${esc(n.note)}</text>`);
    if (n.tap) { // highlight where the user taps next
      const [px, py] = n.tap; out.push(`<circle cx="${x + BEZ + px * PW}" cy="${y + BEZ + py * PH}" r="26" fill="none" stroke="${C.coral}" stroke-width="3" stroke-dasharray="5 4"/>`);
    }
  }
  // Edge labels on top
  for (const l of labels) {
    const tw = textW(l.text, 13) + 22;
    out.push(`<g><rect x="${l.x - tw / 2}" y="${l.y - 15}" width="${tw}" height="30" rx="15" fill="#fff" stroke="${l.col}" stroke-width="1.5"/><text x="${l.x}" y="${l.y + 4.5}" text-anchor="middle" font-size="13" font-weight="600" fill="${l.kind === 'auto' ? C.sub : l.col}" ${l.kind === 'auto' ? 'font-style="italic"' : ''}>${esc(l.text)}</text></g>`);
  }
  out.push('</svg>');
  const svgPath = join(DIR, `${file}.svg`);
  writeFileSync(svgPath, out.join('\n'));
  console.log('✓', file, `${W}×${H}`);
}

const P = (id, shot, col, row, step, title, note, extra = {}) => ({ id, shot, col, row, step, title, note, ...extra });
const E = (from, to, label, kind = 'tap', extra = {}) => ({ from, to, label, kind, ...extra });
const End = (id, col, row, title, tone, dy) => ({ id, kind: 'end', col, row, title, tone, dy });
const Start = (id, col, row, title) => ({ id, kind: 'start', col, row, title });

board({
  file: '01-onboarding', title: 'Onboarding & sign-in', subtitle: 'From the welcome screen to the right app: shopper, business, or a demo account.',
  nodes: [
    P('w', '01-welcome', 0, 0, 1, 'Welcome', 'Photo collage, two choices', { tap: [0.5, 0.79] }),
    P('demo', '02-demo-sheet', 1, 2, 2, 'Demo accounts sheet', 'Bottom sheet, swipe down to close'),
    P('ph', '03-signup-phone', 1, 0, 3, 'Mobile number', '+91 and 10 digits'),
    P('phe', '04-signup-phone-error', 2, 1, '!', 'Invalid number', 'Inline error, stays on step', { tone: 'error' }),
    P('otp', '05-signup-otp', 2, 0, 4, 'Verification code', 'Four boxes, demo code 1234'),
    P('otpe', '06-signup-otp-error', 3, 1, '!', 'Wrong code', 'Inline error, try again', { tone: 'error' }),
    P('prof', '07-signup-profile', 3, 0, 5, 'Shopper profile', 'Name + area'),
    P('biz', '08-business-profile', 3, 3, 5, 'Business storefront', 'Name, area, business, category'),
    End('toShop', 4, 0, 'Shopper app\nBoard 02 · Local brands', 'green'),
    End('toBiz', 4, 3, 'Business app\nBoard 05', 'green'),
    End('dK', 2, 2, 'Kabir · Shopper\n→ Shopper app', 'green', -95),
    End('dA', 2, 2, 'Ananya · Crumb & Co.\n→ Business app', 'green', 0),
    End('dAd', 2, 2, 'Admin\n→ Board 06', 'green', 95),
  ],
  edges: [
    E('w', 'ph', '“Shop and sell”'),
    E('w', 'demo', '“Try a demo account”'),
    E('w', 'biz', '“I run a local business” → same number + code steps', 'tap', { midX: 60 + COLW - 85 }),
    E('ph', 'otp', '“Continue”'),
    E('ph', 'phe', 'Fewer than 10 digits', 'error'),
    E('otp', 'prof', 'Code 1234 · “Continue”'),
    E('otp', 'otpe', 'Any other code', 'error'),
    E('prof', 'toShop', '“Start exploring”'),
    E('biz', 'toBiz', '“Open my storefront”'),
    E('demo', 'dK', 'Tap a row'), E('demo', 'dA', ''), E('demo', 'dAd', ''),
  ],
});

board({
  file: '02-shopper-local-brands', title: 'Shopper · Local brands', subtitle: 'Discover a brand, add to cart, pay, and track the order. Tab bar: Local · Secondhand · Cart · Orders.',
  nodes: [
    P('home', '10-shop-home', 0, 0, 1, 'Local brands (home)', 'Search, categories, featured, brands', { tap: [0.17, 0.66] }),
    P('cat', '13-shop-category', 1, 1, 2, 'Category filter', 'e.g. Plants · results update live'),
    P('empty', '12-shop-search-empty', 1, 2, '!', 'No search results', 'Empty state with a hint', { tone: 'error' }),
    P('brand', '14-brand-store', 1, 0, 3, 'Brand store', 'Rating, products, delivery/pickup'),
    P('sold', '15-product-sold-out', 2, 1, '!', 'Sold-out product', 'Add button disabled', { tone: 'error' }),
    P('prod', '16-product-detail', 2, 0, 4, 'Product detail', 'Quantity + pinned “Add” bar', { tap: [0.72, 0.945] }),
    P('cart', '17-cart', 3, 0, 5, 'Cart & checkout', 'Delivery/Pickup, payment, total', { tap: [0.5, 0.92] }),
    P('pick', '18-cart-pickup', 4, 1, 6, 'Pickup selected', 'Address hidden, no delivery fee'),
    P('cartE', '22-cart-empty', 3, 2, '–', 'Empty cart', '“Browse local brands”'),
    Start('cartStart', 2, 2, 'Cart tab\nwith nothing added'),
    P('placed', '19-order-placed', 4, 0, 7, 'Order placed', 'Animated check, two next steps'),
    P('orders', '20-orders', 5, 0, 8, 'Orders', 'Live progress tracker per store', { tap: [0.88, 0.335] }),
    P('cancel', '21-cancel-sheet', 6, 0, 9, 'Cancel sheet', 'Only while “New order”'),
    End('cY', 7, 0, '“Yes, cancel order”\nCancelled · stock returned', 'gray', -45),
    End('cN', 7, 0, '“Keep order”\nBack to Orders', 'green', 45),
    End('keep', 5, 1, '“Keep shopping”\nBack to Local brands', 'green'),
  ],
  edges: [
    E('home', 'brand', 'Tap a brand'),
    E('home', 'cat', 'Tap a category'),
    E('home', 'empty', 'Search with no match', 'error'),
    E('brand', 'prod', 'Tap a product'),
    E('brand', 'sold', 'Sold-out item', 'error'),
    E('prod', 'cart', '“Add · ₹280”'),
    E('cartStart', 'cartE', ''),
    E('cart', 'placed', '“Pay ₹310”'),
    E('cart', 'pick', 'Tap “Pickup”'),
    E('placed', 'orders', '“Track my order”'),
    E('placed', 'keep', '“Keep shopping”'),
    E('orders', 'cancel', '“Cancel”'),
    E('cancel', 'cY', ''), E('cancel', 'cN', ''),
  ],
});

board({
  file: '03-shopper-secondhand-buy', title: 'Secondhand · Buying (and the seller side)', subtitle: 'Meet in person or get it shipped. Mock sellers reply on their own in the demo so you can show it solo.',
  nodes: [
    P('feed', '30-sh-browse', 0, 0, 1, 'Secondhand feed', 'Segments: Browse · My listings · Deals'),
    P('meet', '31-listing-meet', 1, 0, 2, 'Listing · Meet in person', 'Pinned “Message” + “Request to buy”', { tap: [0.71, 0.945] }),
    P('chat', '32-chat', 2, 1, 3, 'Chat', 'Quick replies, numbers hidden'),
    P('req', '34-deal-requested', 2, 0, 3, 'Deal · Request sent', 'Waiting for the seller'),
    P('code', '35-deal-accepted-code', 3, 0, 4, 'Meet & hand over', 'Show the 4-digit code'),
    End('cash', 4, 0, '“Paid cash · got it”\nDeal completed', 'green', -45),
    End('app', 4, 0, '“Pay ₹2,100” in app\nDeal completed', 'green', 45),
    P('ship', '33-listing-ship', 1, 2, 2, 'Listing · Ships', 'Pinned “Buy & pay”'),
    P('shipped', '51-deals-buying-shipped', 2, 2, 3, 'Deal · Shipped', 'Courier + tracking number'),
    End('recv', 3, 2, '“I received it”\nMoney released to seller', 'green', -45),
    End('disp', 3, 2, '“Report a problem”\nUnder review by admin', 'coral', 45),
    Start('sellStart', 0, 3, 'Deals → “Selling” tab\nSomeone wants your item'),
    P('sreq', '49-deals-selling-request', 1, 3, 'S1', 'Seller · New request', '“Decline” or “Accept request”'),
    P('scode', '50-deals-selling-code', 2, 3, 'S2', 'Seller · Enter code', 'Type the buyer’s code (4827)'),
    End('sold', 3, 3, '“Confirm”\nSold · listing marked sold', 'green', -45),
    End('wrong', 3, 3, 'Wrong code\n“Code doesn’t match”', 'coral', 45),
  ],
  edges: [
    E('feed', 'meet', 'Tap an item (Meet)'),
    E('feed', 'ship', 'Tap an item (Ships)'),
    E('meet', 'req', '“Request to buy”'),
    E('meet', 'chat', '“Message”'),
    E('req', 'code', 'Seller accepts', 'auto'),
    E('code', 'cash', ''), E('code', 'app', ''),
    E('ship', 'shipped', '“Buy & pay” → seller ships', 'auto'),
    E('shipped', 'recv', ''), E('shipped', 'disp', '', 'error'),
    E('sellStart', 'sreq', ''),
    E('sreq', 'scode', '“Accept request”'),
    E('scode', 'sold', ''), E('scode', 'wrong', '', 'error'),
  ],
});

board({
  file: '04-secondhand-sell', title: 'Secondhand · Sell an item with AI', subtitle: 'Four steps from photo to live listing. Tap the coral “Sell” button on the Secondhand tab.',
  nodes: [
    Start('s', 0, 0, 'Secondhand tab\nTap coral “Sell”'),
    P('s1', '40-sell-step1', 1, 0, 1, 'Snap your item', 'Pick category, add photos'),
    P('s1e', '41-sell-photo-error', 2, 1, '!', 'No photo yet', '“Add at least one photo”', { tone: 'error' }),
    P('s1p', '42-sell-photos', 2, 0, 1, 'Photos added', 'Up to 3 photos'),
    P('read', '43-sell-reading', 3, 0, 2, 'AI reading photos', 'Scanning animation'),
    P('q', '44-sell-questions', 4, 0, 2, 'AI questions', 'Age, defects, what’s included'),
    P('rev', '45-sell-review', 5, 0, 3, 'Review listing', 'AI draft, all fields editable'),
    P('mode', '46-sell-mode', 6, 0, 4, 'How to sell', 'Meet in person or Ship it'),
    P('pub', '47-sell-published', 7, 0, '✓', 'Your item is live', 'Animated success'),
    P('mine', '48-my-listings', 8, 0, '→', 'My listings', 'New item first, AI-written badge'),
  ],
  edges: [
    E('s', 's1', ''),
    E('s1', 's1p', '“Add photo”'),
    E('s1', 's1e', '“Continue” with no photo', 'error'),
    E('s1p', 'read', '“Continue”'),
    E('read', 'q', 'About 2 seconds', 'auto'),
    E('q', 'rev', '“Write my listing”'),
    E('rev', 'mode', '“Next: how to sell”'),
    E('mode', 'pub', '“Publish listing”'),
    E('pub', 'mine', '“See my listings”'),
  ],
});

board({
  file: '05-business', title: 'Business · Crumb & Co.', subtitle: 'Run a local brand: handle orders, manage products and stock, see payouts. Tab bar: Home · Orders · Products · Store.',
  nodes: [
    P('home', '60-biz-home', 0, 0, 1, 'Business home', 'Earnings card, open orders, low stock'),
    P('orders', '61-biz-orders', 1, 0, 2, 'Orders', 'Open · Completed · Cancelled', { tap: [0.66, 0.55] }),
    P('acc', '63-biz-order-accepted', 2, 0, 3, 'Order accepted', 'Next: “Mark out for delivery”'),
    End('deliv', 3, 0, '“Mark out for delivery”\n→ “Mark delivered” → Completed', 'green'),
    P('dec', '62-biz-decline-sheet', 2, 1, '!', 'Decline sheet', 'Refund + stock returned', { tone: 'error' }),
    P('prods', '64-biz-products', 1, 2, 4, 'Products', 'Stock stepper on every row'),
    P('menu', '65-biz-product-menu', 2, 2, 5, 'Product menu (⋯)', 'Edit · Hide · Delete'),
    P('del', '66-biz-delete-confirm', 3, 2, '!', 'Delete confirm', 'Can’t be undone', { tone: 'error' }),
    P('form', '67-biz-product-form', 2, 3, 6, 'Add product', 'Name, price, stock, unit'),
    End('pubP', 3, 3, '“Publish product”\nLive in the shop', 'green'),
    P('store', '68-biz-store', 1, 4, 7, 'Store settings', 'Switches save instantly, payouts'),
  ],
  edges: [
    E('home', 'orders', 'Orders tab / “View all”'),
    E('orders', 'acc', '“Accept order”'),
    E('orders', 'dec', '“Decline”', 'error'),
    E('acc', 'deliv', ''),
    E('home', 'prods', 'Products tab'),
    E('prods', 'menu', 'Tap “⋯”'),
    E('menu', 'del', '“Delete product”', 'error'),
    E('prods', 'form', 'Coral “Add product”'),
    E('form', 'pubP', ''),
    E('home', 'store', 'Store tab'),
  ],
});

board({
  file: '06-admin', title: 'Admin console', subtitle: 'Approve brands, watch commission, moderate secondhand listings. Tab bar: Overview · Sellers · Orders · Listings.',
  nodes: [
    P('ov', '70-admin-overview', 0, 0, 1, 'Overview', 'Platform revenue, KPIs, sales by seller'),
    P('sel', '71-admin-sellers', 1, 0, 2, 'Sellers', 'Approve · Suspend · Restore'),
    End('appr', 2, 0, '“Approve”\nBrand appears in Local brands', 'green', -45),
    End('susp', 2, 0, '“Suspend”\nHidden from shoppers', 'gray', 45),
    P('ord', '72-admin-orders', 1, 1, 3, 'All orders', 'Amount + commission per order'),
    P('lst', '73-admin-listings', 1, 2, 4, 'Secondhand listings', 'Hide anything that breaks rules'),
    End('hide', 2, 2, '“Hide”\nRemoved from the feed', 'gray'),
  ],
  edges: [
    E('ov', 'sel', 'Sellers tab'), E('sel', 'appr', ''), E('sel', 'susp', ''),
    E('ov', 'ord', 'Orders tab'),
    E('ov', 'lst', 'Listings tab'), E('lst', 'hide', ''),
  ],
});

board({
  file: '00-app-map', title: 'SnapSell Local · App map', subtitle: 'Every role starts at Welcome. Each board in this folder zooms into one path.',
  nodes: [
    P('w', '01-welcome', 0, 0, 1, 'Welcome', 'Board 01'),
    P('shop', '10-shop-home', 1, 0, 2, 'Shopper · Local brands', 'Board 02'),
    P('sh', '30-sh-browse', 2, 0, 3, 'Shopper · Secondhand', 'Boards 03 + 04'),
    P('biz', '60-biz-home', 1, 1, 4, 'Business app', 'Board 05'),
    P('adm', '70-admin-overview', 1, 2, 5, 'Admin console', 'Board 06'),
    End('x1', 2, 1, 'Shopper order\nappears in Business “Orders”', 'green'),
    End('x2', 2, 2, 'Admin “Approve”\nbrand shows in Local brands', 'green'),
  ],
  edges: [
    E('w', 'shop', '“Shop and sell”'),
    E('shop', 'sh', 'Secondhand tab'),
    E('w', 'biz', '“I run a local business”'),
    E('w', 'adm', 'Demo · Admin'),
    E('biz', 'x1', '', 'auto'),
    E('adm', 'x2', '', 'auto'),
  ],
});
