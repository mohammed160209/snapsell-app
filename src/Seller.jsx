import React, { useState } from 'react';
import { AlertTriangle, Eye, EyeOff, IndianRupee, LayoutDashboard, MoreHorizontal, Package, Pencil, Plus, Settings, ShoppingBag, Trash2, TrendingUp, ChevronRight, Truck, Store as StoreIcon } from 'lucide-react';
import { CATEGORIES, COMMISSION_RATE, STATUS_FLOW, orderCommission, orderSubtotal, rupees } from './data';
import { useStore } from './store';
import { ActionBar, BottomNav, CategoryIcon, Empty, Header, Page, ScreenTitle, Sheet, SheetRow, StatusChip, Stepper, TopBar, timeAgo } from './ui';

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
          <div className="rounded-[14px] p-3 mb-4 flex gap-2 items-start bg-[#FEF6E4] text-[13px] text-[#8A4B0B]"><AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />Your store is waiting for SnapSell approval. Shoppers will see it once it’s approved.</div>
        )}
        {tab === 'dashboard' && <Dashboard go={go} />}
        {tab === 'orders' && <SellerOrders />}
        {tab === 'products' && <Products />}
        {tab === 'store' && <StoreSettings />}
      </Page>
    </>
  );
}

const Stat = ({ label, value, hint, icon: Icon, tone = 'indigo' }) => (
  <div className="card p-3.5">
    <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center ${tone === 'coral' ? 'bg-[#FFF1EE] text-[#C2410C]' : tone === 'green' ? 'bg-[#E7F7EE] text-[#157F3E]' : 'bg-[#EEF0FF] text-[#3B2FD9]'}`}><Icon className="w-4 h-4" /></div>
    <div className="text-[22px] font-extrabold mt-2 tabular-nums leading-none">{value}</div>
    <div className="text-[13px] font-semibold mt-1">{label}</div>
    {hint && <div className="text-[12px] text-[#7C8199]">{hint}</div>}
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
    <div className="grid gap-4">
      <ScreenTitle sub={`${myBrand.area} · delivering within 5 km`}>Hi {me.name.split(' ')[0]}</ScreenTitle>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total sales" value={rupees(gross)} hint={`${mine.length} orders`} icon={TrendingUp} />
        <Stat label="Your earnings" value={rupees(gross - commission)} hint={`After ${COMMISSION_RATE * 100}% commission`} icon={IndianRupee} tone="green" />
        <Stat label="Open orders" value={open.length} hint="Need your action" icon={ShoppingBag} tone="coral" />
        <Stat label="Low stock" value={low.length} hint="3 or fewer left" icon={AlertTriangle} tone="coral" />
      </div>
      <section className="card p-4">
        <button className="w-full flex items-center justify-between mb-1 min-h-[44px]" onClick={() => go('orders')}><h2 className="font-bold text-[16px]">Orders to handle</h2><span className="text-[14px] font-semibold text-[#3B2FD9] flex items-center">View all<ChevronRight className="w-4 h-4" /></span></button>
        {open.length === 0 ? <div className="text-[14px] text-[#7C8199] py-3">All caught up. New orders will show here.</div> : open.slice(0, 4).map((o) => (
          <div key={o.id} className="flex items-center justify-between gap-3 py-3 border-t border-[#F0F1F6]">
            <div className="min-w-0"><div className="text-[14px] font-semibold truncate">{o.buyerName}</div><div className="text-[12px] text-[#7C8199] truncate">{o.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}</div></div>
            <StatusChip status={o.status} />
          </div>
        ))}
      </section>
      {low.length > 0 && (
        <section className="card p-4">
          <button className="w-full flex items-center justify-between mb-1 min-h-[44px]" onClick={() => go('products')}><h2 className="font-bold text-[16px]">Restock soon</h2><span className="text-[14px] font-semibold text-[#3B2FD9] flex items-center">Manage stock<ChevronRight className="w-4 h-4" /></span></button>
          {low.map((p) => <div key={p.id} className="flex justify-between gap-3 py-3 text-[14px] border-t border-[#F0F1F6]"><span className="truncate">{p.name}</span><span className={`font-bold shrink-0 ${p.stock === 0 ? 'text-[#C2410C]' : 'text-[#B45309]'}`}>{p.stock === 0 ? 'Sold out' : `${p.stock} left`}</span></div>)}
        </section>
      )}
    </div>
  );
}

const isOpen = (o) => !['delivered', 'cancelled'].includes(o.status);
const FILTERS = [['open', 'Open', isOpen], ['done', 'Completed', (o) => o.status === 'delivered'], ['cancelled', 'Cancelled', (o) => o.status === 'cancelled']];

function SellerOrders() {
  const { myBrand, orders, advanceOrder, cancelOrder } = useStore();
  const [filter, setFilter] = useState('open');
  const [decline, setDecline] = useState(null);
  const mine = orders.filter((o) => o.brandId === myBrand.id);
  const list = mine.filter(FILTERS.find((f) => f[0] === filter)[2]);
  const nextLabel = (o) => {
    const flow = STATUS_FLOW[o.fulfilment];
    const n = flow[flow.indexOf(o.status) + 1];
    return n ? { accepted: 'Accept order', out_for_delivery: 'Mark out for delivery', ready_for_pickup: 'Mark ready for pickup', delivered: o.fulfilment === 'pickup' ? 'Mark picked up' : 'Mark delivered' }[n] : null;
  };
  return (
    <div className="grid gap-3">
      <ScreenTitle>Orders</ScreenTitle>
      <div className="grid grid-cols-3 gap-1 p-1 rounded-[14px] bg-[#EDEEF4] md:max-w-md" role="tablist">
        {FILTERS.map(([id, l, fn]) => (
          <button key={id} role="tab" aria-selected={filter === id} onClick={() => setFilter(id)} className={`h-10 rounded-[11px] text-[13px] font-semibold ${filter === id ? 'bg-white shadow-sm' : 'text-[#4E5369]'}`}>{l} <span className="text-[#7C8199]">{mine.filter(fn).length}</span></button>
        ))}
      </div>
      {list.length === 0 ? <Empty icon={ShoppingBag} title={filter === 'open' ? 'No open orders' : 'Nothing here'} body="Orders from shoppers near you will appear here." /> : list.map((o) => (
        <article key={o.id} className="card p-4 grid gap-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0"><div className="font-bold">{o.buyerName}</div><div className="text-[12px] text-[#7C8199]">{o.id} · {timeAgo(o.createdAt)}</div></div>
            <StatusChip status={o.status} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="chip bg-[#F1F1F4] text-[#4E5369]">{o.fulfilment === 'delivery' ? <><Truck className="w-3 h-3" />Delivery</> : <><StoreIcon className="w-3 h-3" />Pickup</>}</span>
            <span className={`chip ${o.payment === 'upi' ? 'bg-[#E7F7EE] text-[#157F3E]' : 'bg-[#FEF6E4] text-[#B45309]'}`}>{o.payment === 'upi' ? 'Paid online' : 'Collect cash'}</span>
          </div>
          <div className="grid gap-1">{o.items.map((i) => <div key={i.productId} className="flex justify-between gap-3 text-[14px]"><span>{i.qty} × {i.name}</span><span className="tabular-nums">{rupees(i.price * i.qty)}</span></div>)}</div>
          {o.fulfilment === 'delivery' && <div className="text-[13px] text-[#4E5369]">{o.address}</div>}
          <div className="text-[13px] border-t border-[#F0F1F6] pt-2">You earn <b>{rupees(orderSubtotal(o) - orderCommission(o))}</b> <span className="text-[#7C8199]">· commission {rupees(orderCommission(o))}</span></div>
          {isOpen(o) && (
            <div className="flex gap-2">
              {o.status === 'placed' && <button className="btn btn-ghost h-12" onClick={() => setDecline(o.id)}>Decline</button>}
              <button className="btn btn-primary flex-1 h-12" onClick={() => advanceOrder(o.id)}>{nextLabel(o)}</button>
            </div>
          )}
        </article>
      ))}
      <Sheet open={!!decline} onClose={() => setDecline(null)} title="Decline this order?">
        <p className="text-[14px] text-[#4E5369] mb-4">The shopper is notified and refunded, and the items go back into your stock.</p>
        <div className="grid gap-2">
          <button className="btn w-full h-12 bg-[#C2410C] text-white" onClick={() => { cancelOrder(decline); setDecline(null); }}>Decline order</button>
          <button className="btn btn-ghost w-full h-12" onClick={() => setDecline(null)}>Keep it</button>
        </div>
      </Sheet>
    </div>
  );
}

const blank = (brand) => ({ id: null, brandId: brand.id, name: '', price: '', stock: '', unit: 'piece', category: brand.category, desc: '', active: true });

function Products() {
  const { myBrand, products, updateProduct, deleteProduct } = useStore();
  const [editing, setEditing] = useState(null);
  const [menu, setMenu] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const mine = products.filter((p) => p.brandId === myBrand.id);
  const menuProduct = mine.find((p) => p.id === menu);
  if (editing) return <ProductForm initial={editing} onClose={() => { setEditing(null); window.scrollTo(0, 0); }} />;
  return (
    <div className="grid gap-3">
      <ScreenTitle sub={`${mine.length} products · tap ⋯ to edit, hide or delete`} right={<button className="btn btn-coral max-md:hidden" onClick={() => setEditing(blank(myBrand))}><Plus className="w-4 h-4" />Add product</button>}>Products</ScreenTitle>
      {mine.length === 0 ? <Empty icon={Package} title="Add your first product" body="It takes a minute: name, price and how many you have in stock." /> : mine.map((p) => (
        <article key={p.id} className={`card p-3 grid gap-2 ${p.active ? '' : 'opacity-60'}`}>
          <div className="flex items-start gap-3">
            <CategoryIcon category={p.category} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-semibold leading-snug">{p.name}</div>
              <div className="text-[13px] text-[#7C8199]">{rupees(p.price)} · {p.unit}{!p.active && ' · Hidden'}</div>
            </div>
            <button className="icon-btn -mr-1.5 -mt-1.5 text-[#4E5369]" onClick={() => setMenu(p.id)} aria-label={`More options for ${p.name}`}><MoreHorizontal className="w-5 h-5" /></button>
          </div>
          <div className="flex items-center justify-between gap-3 pl-14">
            <div className={`text-[13px] font-semibold ${p.stock === 0 ? 'text-[#C2410C]' : p.stock <= 3 ? 'text-[#B45309]' : 'text-[#157F3E]'}`}>{p.stock === 0 ? 'Sold out' : `${p.stock} in stock`}</div>
            <Stepper size="sm" value={p.stock} onDec={() => updateProduct(p.id, { stock: Math.max(0, p.stock - 1) })} onInc={() => updateProduct(p.id, { stock: p.stock + 1 })} label={`stock of ${p.name}`} />
          </div>
        </article>
      ))}
      <button className="md:hidden fixed right-4 bottom-[calc(72px+env(safe-area-inset-bottom))] z-20 btn btn-coral h-14 rounded-full pl-4 pr-5 text-[16px] shadow-[0_8px_24px_rgba(255,90,61,.45)]" onClick={() => setEditing(blank(myBrand))}><Plus className="w-5 h-5" />Add product</button>

      <Sheet open={!!menuProduct} onClose={() => setMenu(null)} title={menuProduct?.name || ''}>
        <SheetRow icon={Pencil} label="Edit product" hint="Name, price, stock, description" onClick={() => { setEditing(menuProduct); setMenu(null); }} />
        <SheetRow icon={menuProduct?.active ? EyeOff : Eye} label={menuProduct?.active ? 'Hide from shoppers' : 'Show to shoppers'} hint={menuProduct?.active ? 'Keeps it in your list' : 'Makes it visible again'} onClick={() => { updateProduct(menu, { active: !menuProduct.active }); setMenu(null); }} />
        <SheetRow icon={Trash2} danger label="Delete product" hint="This can’t be undone" onClick={() => { setConfirmDelete(menu); setMenu(null); }} />
      </Sheet>
      <Sheet open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete this product?">
        <p className="text-[14px] text-[#4E5369] mb-4">{mine.find((p) => p.id === confirmDelete)?.name} will be removed from your store. Past orders stay in your history.</p>
        <div className="grid gap-2">
          <button className="btn w-full h-12 bg-[#C2410C] text-white" onClick={() => { deleteProduct(confirmDelete); setConfirmDelete(null); }}>Delete product</button>
          <button className="btn btn-ghost w-full h-12" onClick={() => setConfirmDelete(null)}>Cancel</button>
        </div>
      </Sheet>
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
    <div className="grid gap-4 max-w-xl md:card md:p-5">
      <TopBar title={initial.id ? 'Edit product' : 'New product'} onBack={onClose} />
      <h1 className="text-[24px] font-extrabold tracking-tight max-md:hidden">{initial.id ? 'Edit product' : 'Add a product'}</h1>
      <Field label="Product name"><input className="input" placeholder="Classic Sourdough Loaf" value={f.name} onChange={set('name')} autoFocus={!initial.id} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Price (₹)"><input className="input" inputMode="numeric" placeholder="280" value={f.price} onChange={set('price')} /></Field>
        <Field label="In stock"><input className="input" inputMode="numeric" placeholder="10" value={f.stock} onChange={set('stock')} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Unit"><input className="input" placeholder="500 g" value={f.unit} onChange={set('unit')} /></Field>
        <Field label="Category"><select className="input" value={f.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
      </div>
      <Field label="Description"><textarea className="input h-28 py-3 leading-relaxed" placeholder="What makes it special, ingredients, size…" value={f.desc} onChange={set('desc')} /></Field>
      {err && <div className="text-[14px] text-[#C2410C]" role="alert">{err}</div>}
      <ActionBar>
        <button className="btn btn-ghost h-12 max-md:hidden" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary flex-1 h-12" onClick={save}>{initial.id ? 'Save changes' : 'Publish product'}</button>
      </ActionBar>
    </div>
  );
}

const Field = ({ label, children }) => <label className="grid gap-1.5 text-[14px] font-semibold">{label}{children}</label>;

function Toggle({ checked, onChange, label, hint }) {
  return (
    <label className="flex items-center gap-3 min-h-[56px] cursor-pointer">
      <span className="flex-1"><span className="block text-[15px] font-semibold">{label}</span>{hint && <span className="block text-[12px] text-[#7C8199]">{hint}</span>}</span>
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="w-12 h-7 rounded-full bg-[#D6D8E2] peer-checked:bg-[#3B2FD9] relative transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-6 after:h-6 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-[#3B2FD9]/40" aria-hidden="true" />
    </label>
  );
}

function StoreSettings() {
  const { myBrand, updateBrand, orders } = useStore();
  const done = orders.filter((o) => o.brandId === myBrand.id && o.status === 'delivered');
  const gross = done.reduce((s, o) => s + orderSubtotal(o), 0);
  const com = done.reduce((s, o) => s + orderCommission(o), 0);
  return (
    <div className="grid gap-4">
      <ScreenTitle sub="Changes save automatically">Store</ScreenTitle>
      <div className="grid md:grid-cols-2 gap-4 items-start">
        <section className="card p-4 grid gap-3">
          <h2 className="font-bold text-[16px]">Storefront</h2>
          <Field label="Business name"><input className="input" value={myBrand.name} onChange={(e) => updateBrand(myBrand.id, { name: e.target.value })} /></Field>
          <Field label="Description"><input className="input" value={myBrand.tagline} onChange={(e) => updateBrand(myBrand.id, { tagline: e.target.value })} /></Field>
          <div className="divide-y divide-[#F0F1F6]">
            <Toggle checked={myBrand.delivery} onChange={(v) => updateBrand(myBrand.id, { delivery: v })} label="Offer delivery" hint="Within 5 km · ₹30 per order" />
            <Toggle checked={myBrand.pickup} onChange={(v) => updateBrand(myBrand.id, { pickup: v })} label="Allow pickup" hint="Shoppers collect from your location" />
          </div>
        </section>
        <section className="card p-4 grid gap-2">
          <h2 className="font-bold text-[16px]">Payouts</h2>
          <div className="text-[13px] text-[#4E5369]">From completed orders. Paid to your bank account weekly.</div>
          <div className="flex justify-between text-[14px] mt-2"><span>Completed sales</span><span className="tabular-nums">{rupees(gross)}</span></div>
          <div className="flex justify-between text-[14px]"><span>SnapSell commission ({COMMISSION_RATE * 100}%)</span><span className="tabular-nums">− {rupees(com)}</span></div>
          <div className="flex justify-between text-[18px] font-extrabold border-t border-[#E8EAF2] pt-2 mt-1"><span>Your payout</span><span className="tabular-nums">{rupees(gross - com)}</span></div>
        </section>
      </div>
    </div>
  );
}
