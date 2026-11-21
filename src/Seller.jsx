import React, { useState } from 'react';
import { AlertTriangle, Eye, EyeOff, IndianRupee, LayoutDashboard, Minus, Package, Pencil, Plus, Settings, ShoppingBag, Trash2, TrendingUp, X } from 'lucide-react';
import { CATEGORIES, COMMISSION_RATE, STATUS_FLOW, STATUS_LABEL, orderCommission, orderSubtotal, rupees } from './data';
import { useStore } from './store';
import { BottomNav, CategoryIcon, Empty, Header, Page, StatusChip, timeAgo } from './ui';

export default function Seller() {
  const { myBrand, orders } = useStore();
  const [tab, setTab] = useState('dashboard');
  const newOrders = orders.filter((o) => o.brandId === myBrand.id && o.status === 'placed').length;
  const go = (t) => { setTab(t); window.scrollTo(0, 0); };
  return (
    <>
      <Header sub={`${myBrand.name} · Business`} />
      <BottomNav active={tab} onChange={go} tabs={[
        { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
        { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: newOrders },
        { id: 'products', label: 'Products', icon: Package },
        { id: 'store', label: 'Store', icon: Settings },
      ]} />
      <Page>
        {myBrand.status === 'pending' && (
          <div className="card p-3 mb-4 flex gap-2 items-center bg-[#FEF6E4] border-[#F7DFA8] text-[13px] text-[#8A4B0B]"><AlertTriangle className="w-4 h-4 shrink-0" />Your store is waiting for SnapSell approval. Shoppers will see it once it’s approved.</div>
        )}
        {tab === 'dashboard' && <Dashboard go={go} />}
        {tab === 'orders' && <SellerOrders />}
        {tab === 'products' && <Products />}
        {tab === 'store' && <StoreSettings />}
      </Page>
    </>
  );
}

const Stat = ({ label, value, hint, icon: Icon }) => (
  <div className="card p-4">
    <div className="flex items-center justify-between text-[12px] font-semibold text-[#7C8199]">{label}<Icon className="w-4 h-4" /></div>
    <div className="text-[22px] font-extrabold mt-1 tabular-nums">{value}</div>
    {hint && <div className="text-[12px] text-[#4E5369]">{hint}</div>}
  </div>
);

function Dashboard({ go }) {
  const { myBrand, orders, products, me } = useStore();
  const mine = orders.filter((o) => o.brandId === myBrand.id && o.status !== 'cancelled');
  const gross = mine.reduce((s, o) => s + orderSubtotal(o), 0);
  const commission = mine.reduce((s, o) => s + orderCommission(o), 0);
  const open = mine.filter((o) => o.status !== 'delivered');
  const low = products.filter((p) => p.brandId === myBrand.id && p.stock <= 3);
  return (
    <div className="grid gap-5">
      <div>
        <h1 className="text-[22px] font-extrabold">Hi {me.name.split(' ')[0]}, here’s your store today</h1>
        <div className="text-[13px] text-[#4E5369]">{myBrand.area} · Delivering within 5 km</div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total sales" value={rupees(gross)} hint={`${mine.length} orders`} icon={TrendingUp} />
        <Stat label="Your earnings" value={rupees(gross - commission)} hint={`After ${COMMISSION_RATE * 100}% commission`} icon={IndianRupee} />
        <Stat label="Open orders" value={open.length} hint="Need your action" icon={ShoppingBag} />
        <Stat label="Low stock" value={low.length} hint="3 or fewer left" icon={AlertTriangle} />
      </div>
      <section className="card p-4">
        <div className="flex items-center justify-between mb-2"><h2 className="font-bold">Orders to handle</h2><button className="text-[13px] font-semibold text-[#3B2FD9]" onClick={() => go('orders')}>View all</button></div>
        {open.length === 0 ? <div className="text-[13px] text-[#7C8199] py-3">All caught up. New orders will show here.</div> : open.slice(0, 4).map((o) => (
          <div key={o.id} className="flex items-center justify-between py-2.5 border-t border-[#F0F1F6] first:border-0">
            <div className="min-w-0"><div className="text-[14px] font-semibold truncate">{o.buyerName} · {o.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}</div><div className="text-[12px] text-[#7C8199]">{o.id} · {timeAgo(o.createdAt)}</div></div>
            <StatusChip status={o.status} />
          </div>
        ))}
      </section>
      {low.length > 0 && (
        <section className="card p-4">
          <div className="flex items-center justify-between mb-2"><h2 className="font-bold">Restock soon</h2><button className="text-[13px] font-semibold text-[#3B2FD9]" onClick={() => go('products')}>Manage stock</button></div>
          {low.map((p) => <div key={p.id} className="flex justify-between py-2 text-[14px] border-t border-[#F0F1F6] first:border-0"><span>{p.name}</span><span className={`font-bold ${p.stock === 0 ? 'text-[#C2410C]' : 'text-[#B45309]'}`}>{p.stock === 0 ? 'Sold out' : `${p.stock} left`}</span></div>)}
        </section>
      )}
    </div>
  );
}

function SellerOrders() {
  const { myBrand, orders, advanceOrder, cancelOrder } = useStore();
  const [filter, setFilter] = useState('open');
  const mine = orders.filter((o) => o.brandId === myBrand.id);
  const list = mine.filter((o) => (filter === 'open' ? !['delivered', 'cancelled'].includes(o.status) : filter === 'done' ? o.status === 'delivered' : o.status === 'cancelled'));
  const nextLabel = (o) => {
    const flow = STATUS_FLOW[o.fulfilment];
    const n = flow[flow.indexOf(o.status) + 1];
    return n ? { placed: '', accepted: 'Accept order', out_for_delivery: 'Mark out for delivery', ready_for_pickup: 'Mark ready for pickup', delivered: o.fulfilment === 'pickup' ? 'Mark picked up' : 'Mark delivered' }[n] : null;
  };
  return (
    <div className="grid gap-3">
      <h1 className="text-[22px] font-extrabold">Orders</h1>
      <div className="flex gap-2">
        {[['open', 'Open'], ['done', 'Completed'], ['cancelled', 'Cancelled']].map(([id, l]) => (
          <button key={id} onClick={() => setFilter(id)} className={`chip h-9 px-4 text-[13px] ${filter === id ? 'bg-[#3B2FD9] text-white' : 'bg-white border border-[#E8EAF2]'}`}>{l} ({mine.filter((o) => (id === 'open' ? !['delivered', 'cancelled'].includes(o.status) : id === 'done' ? o.status === 'delivered' : o.status === 'cancelled')).length})</button>
        ))}
      </div>
      {list.length === 0 ? <Empty icon={ShoppingBag} title="Nothing here" body="Orders from shoppers will appear here." /> : list.map((o) => (
        <div key={o.id} className="card p-4 grid gap-2">
          <div className="flex items-start justify-between gap-2">
            <div><div className="font-bold">{o.buyerName}</div><div className="text-[12px] text-[#7C8199]">{o.id} · {timeAgo(o.createdAt)} · {o.fulfilment === 'delivery' ? 'Delivery' : 'Pickup'} · {o.payment === 'upi' ? 'Paid online' : 'Collect cash'}</div></div>
            <StatusChip status={o.status} />
          </div>
          {o.items.map((i) => <div key={i.productId} className="flex justify-between text-[14px]"><span>{i.qty} × {i.name}</span><span>{rupees(i.price * i.qty)}</span></div>)}
          <div className="text-[12px] text-[#4E5369]">{o.address}</div>
          <div className="flex items-center justify-between border-t border-[#F0F1F6] pt-2 text-[13px]">
            <span>You earn <b>{rupees(orderSubtotal(o) - orderCommission(o))}</b> <span className="text-[#7C8199]">(commission {rupees(orderCommission(o))})</span></span>
          </div>
          {!['delivered', 'cancelled'].includes(o.status) && (
            <div className="flex gap-2">
              <button className="btn btn-primary flex-1" onClick={() => advanceOrder(o.id)}>{nextLabel(o)}</button>
              {o.status === 'placed' && <button className="btn btn-ghost" onClick={() => cancelOrder(o.id)}>Decline</button>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const blank = (brand) => ({ id: null, brandId: brand.id, name: '', price: '', stock: '', unit: 'piece', category: brand.category, desc: '', active: true });

function Products() {
  const { myBrand, products, updateProduct, deleteProduct } = useStore();
  const [editing, setEditing] = useState(null);
  const mine = products.filter((p) => p.brandId === myBrand.id);
  if (editing) return <ProductForm initial={editing} onClose={() => setEditing(null)} />;
  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between"><h1 className="text-[22px] font-extrabold">Products</h1><button className="btn btn-coral" onClick={() => setEditing(blank(myBrand))}><Plus className="w-4 h-4" />Add product</button></div>
      {mine.length === 0 ? <Empty icon={Package} title="Add your first product" body="It takes a minute: name, price and how many you have in stock." /> : mine.map((p) => (
        <div key={p.id} className={`card p-3 flex items-center gap-3 ${p.active ? '' : 'opacity-60'}`}>
          <CategoryIcon category={p.category} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-semibold truncate">{p.name}</div>
            <div className="text-[12px] text-[#7C8199]">{rupees(p.price)} · {p.unit}{!p.active && ' · Hidden'}</div>
          </div>
          <div className="flex items-center border border-[#E8EAF2] rounded-[10px]" title="Stock">
            <button className="w-8 h-8 flex items-center justify-center" onClick={() => updateProduct(p.id, { stock: Math.max(0, p.stock - 1) })} aria-label="Reduce stock"><Minus className="w-3.5 h-3.5" /></button>
            <span className={`w-8 text-center text-[14px] font-bold ${p.stock === 0 ? 'text-[#C2410C]' : ''}`}>{p.stock}</span>
            <button className="w-8 h-8 flex items-center justify-center" onClick={() => updateProduct(p.id, { stock: p.stock + 1 })} aria-label="Add stock"><Plus className="w-3.5 h-3.5" /></button>
          </div>
          <button className="w-8 h-8 flex items-center justify-center text-[#4E5369]" onClick={() => updateProduct(p.id, { active: !p.active })} aria-label={p.active ? 'Hide product' : 'Show product'}>{p.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}</button>
          <button className="w-8 h-8 flex items-center justify-center text-[#4E5369]" onClick={() => setEditing(p)} aria-label="Edit product"><Pencil className="w-4 h-4" /></button>
          <button className="w-8 h-8 flex items-center justify-center text-[#C2410C]" onClick={() => deleteProduct(p.id)} aria-label="Delete product"><Trash2 className="w-4 h-4" /></button>
        </div>
      ))}
    </div>
  );
}

function ProductForm({ initial, onClose }) {
  const { saveProduct } = useStore();
  const [f, setF] = useState({ ...initial, price: String(initial.price), stock: String(initial.stock) });
  const [err, setErr] = useState('');
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setErr(''); };
  const save = () => {
    if (!f.name.trim()) return setErr('Enter a product name');
    if (!(Number(f.price) > 0)) return setErr('Enter a price above ₹0');
    if (f.stock === '' || Number(f.stock) < 0) return setErr('Enter how many you have in stock');
    saveProduct({ ...f, price: Number(f.price), stock: Number(f.stock) });
    onClose();
  };
  return (
    <div className="card p-5 grid gap-3 max-w-xl">
      <div className="flex items-center justify-between"><h1 className="text-[20px] font-extrabold">{initial.id ? 'Edit product' : 'Add a product'}</h1><button onClick={onClose} aria-label="Close"><X className="w-5 h-5" /></button></div>
      <label className="text-[13px] font-semibold">Product name<input className="input mt-1" placeholder="Classic Sourdough Loaf" value={f.name} onChange={set('name')} autoFocus /></label>
      <div className="grid grid-cols-3 gap-3">
        <label className="text-[13px] font-semibold">Price (₹)<input className="input mt-1" inputMode="numeric" placeholder="280" value={f.price} onChange={set('price')} /></label>
        <label className="text-[13px] font-semibold">In stock<input className="input mt-1" inputMode="numeric" placeholder="10" value={f.stock} onChange={set('stock')} /></label>
        <label className="text-[13px] font-semibold">Unit<input className="input mt-1" placeholder="500 g" value={f.unit} onChange={set('unit')} /></label>
      </div>
      <label className="text-[13px] font-semibold">Category<select className="input mt-1" value={f.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      <label className="text-[13px] font-semibold">Description<textarea className="input mt-1 h-24 py-2" placeholder="What makes it special, ingredients, size…" value={f.desc} onChange={set('desc')} /></label>
      {err && <div className="text-[13px] text-[#C2410C]">{err}</div>}
      <div className="flex gap-2"><button className="btn btn-primary flex-1" onClick={save}>{initial.id ? 'Save changes' : 'Publish product'}</button><button className="btn btn-ghost" onClick={onClose}>Cancel</button></div>
    </div>
  );
}

function StoreSettings() {
  const { myBrand, updateBrand, orders } = useStore();
  const done = orders.filter((o) => o.brandId === myBrand.id && o.status === 'delivered');
  const gross = done.reduce((s, o) => s + orderSubtotal(o), 0);
  const com = done.reduce((s, o) => s + orderCommission(o), 0);
  return (
    <div className="grid md:grid-cols-2 gap-4 items-start">
      <div className="card p-5 grid gap-3">
        <h1 className="text-[20px] font-extrabold">Storefront</h1>
        <label className="text-[13px] font-semibold">Business name<input className="input mt-1" value={myBrand.name} onChange={(e) => updateBrand(myBrand.id, { name: e.target.value })} /></label>
        <label className="text-[13px] font-semibold">Description<input className="input mt-1" value={myBrand.tagline} onChange={(e) => updateBrand(myBrand.id, { tagline: e.target.value })} /></label>
        {[['delivery', 'Offer delivery (within 5 km, ₹30)'], ['pickup', 'Allow pickup from my location']].map(([k, l]) => (
          <label key={k} className="flex items-center gap-2 text-[14px]"><input type="checkbox" className="accent-[#3B2FD9] w-4 h-4" checked={myBrand[k]} onChange={(e) => updateBrand(myBrand.id, { [k]: e.target.checked })} />{l}</label>
        ))}
        <div className="text-[12px] text-[#7C8199]">Changes save automatically.</div>
      </div>
      <div className="card p-5 grid gap-2">
        <h2 className="text-[20px] font-extrabold">Payouts</h2>
        <div className="text-[13px] text-[#4E5369]">From completed orders. Paid to your bank account weekly.</div>
        <div className="flex justify-between text-[14px] mt-2"><span>Completed sales</span><span>{rupees(gross)}</span></div>
        <div className="flex justify-between text-[14px]"><span>SnapSell commission ({COMMISSION_RATE * 100}%)</span><span>− {rupees(com)}</span></div>
        <div className="flex justify-between text-[17px] font-extrabold border-t border-[#E8EAF2] pt-2"><span>Your payout</span><span>{rupees(gross - com)}</span></div>
      </div>
    </div>
  );
}
