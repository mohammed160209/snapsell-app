import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Eye, EyeOff, IndianRupee, LayoutDashboard, MoreHorizontal, Package, Pencil, Plus, Settings, ShoppingBag, Trash2, TrendingUp, ChevronRight, Truck, Store as StoreIcon, Clock, Wallet, Invoice, MapPin, Tag, Analytics } from './icons';
import { CATEGORIES, COMMISSION_RATE, STATUS_FLOW, orderCommission, orderSubtotal, rupees } from './data';
import { useStore } from './store';
import { ActionBar, BottomNav, CategoryIcon, Empty, Enter, Header, Item, Page, ScreenTitle, SectionTitle, Segmented, Sheet, SheetRow, Stagger, StatusChip, Stepper, TopBar, spring, timeAgo } from './ui';

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
          <div className="rounded-[16px] p-3.5 mb-5 flex gap-2.5 items-start bg-[#FEF6E4] text-[14px] text-[#8A4B0B]"><AlertTriangle className="w-5 h-5 shrink-0" />Your store is waiting for SnapSell approval. Shoppers will see it once it’s approved.</div>
        )}
        <Enter id={tab}>
          {tab === 'dashboard' && <Dashboard go={go} />}
          {tab === 'orders' && <SellerOrders />}
          {tab === 'products' && <Products />}
          {tab === 'store' && <StoreSettings />}
        </Enter>
      </Page>
    </>
  );
}

const Stat = ({ label, value, hint, icon: Icon, tone = 'indigo' }) => (
  <div className="card p-4">
    <div className={`w-9 h-9 rounded-[11px] flex items-center justify-center ${tone === 'coral' ? 'bg-[#FFF1EE] text-[#E8462B]' : tone === 'amber' ? 'bg-[#FEF6E4] text-[#B45309]' : 'bg-[#EEF0FF] text-[#3B2FD9]'}`}><Icon className="w-5 h-5" /></div>
    <div className="text-[24px] font-bold tracking-[-0.03em] mt-3 tabular-nums leading-none">{value}</div>
    <div className="text-[14px] font-semibold mt-1.5">{label}</div>
    {hint && <div className="text-[12px] text-[#8E8E93]">{hint}</div>}
  </div>
);

function Dashboard({ go }) {
  const { myBrand, orders, products, me } = useStore();
  const mine = orders.filter((o) => o.brandId === myBrand.id && o.status !== 'cancelled');
  const gross = mine.reduce((s, o) => s + orderSubtotal(o), 0);
  const commission = mine.reduce((s, o) => s + orderCommission(o), 0);
  const open = mine.filter((o) => o.status !== 'delivered');
  const low = products.filter((p) => p.brandId === myBrand.id && p.stock <= 3);
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  return (
    <div className="grid gap-5">
      <div><div className="eyebrow">{today}</div><ScreenTitle>Hi {me.name.split(' ')[0]}</ScreenTitle></div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
        className="relative overflow-hidden rounded-[24px] p-5 text-white bg-gradient-to-br from-[#4A3FE6] via-[#3B2FD9] to-[#2A1FB0] shadow-[0_16px_40px_-16px_rgba(59,47,217,.7)]">
        <div className="absolute -right-10 -top-12 w-44 h-44 rounded-full bg-white/10" />
        <div className="relative text-[14px] text-white/75 flex items-center gap-1.5"><Wallet className="w-4 h-4" />Your earnings</div>
        <div className="relative text-[38px] font-bold tracking-[-0.04em] leading-none mt-2 tabular-nums">{rupees(gross - commission)}</div>
        <div className="relative text-[14px] text-white/75 mt-2">{rupees(gross)} in sales · {COMMISSION_RATE * 100}% commission {rupees(commission)}</div>
        <div className="relative flex gap-2 mt-4">
          <span className="chip bg-white/15 text-white !py-1.5"><TrendingUp className="w-4 h-4" />{mine.length} orders</span>
          <span className="chip bg-white/15 text-white !py-1.5"><MapPin className="w-4 h-4" />{myBrand.area}</span>
        </div>
      </motion.div>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => go('orders')} className="text-left"><Stat label="Open orders" value={open.length} hint="Need your action" icon={ShoppingBag} tone="coral" /></button>
        <button onClick={() => go('products')} className="text-left"><Stat label="Low stock" value={low.length} hint="3 or fewer left" icon={AlertTriangle} tone="amber" /></button>
      </div>
      <section className="card p-4">
        <SectionTitle icon={Clock} tone="coral" action={<button className="text-[15px] font-semibold text-[#3B2FD9] flex items-center min-h-[44px]" onClick={() => go('orders')}>View all<ChevronRight className="w-4 h-4" /></button>}>Orders to handle</SectionTitle>
        {open.length === 0 ? <div className="text-[15px] text-[#8E8E93] py-2">All caught up. New orders will show here.</div> : open.slice(0, 4).map((o) => (
          <div key={o.id} className="flex items-center justify-between gap-3 py-3 border-t border-[#F2F2F5]">
            <div className="min-w-0"><div className="text-[15px] font-semibold truncate">{o.buyerName}</div><div className="text-[13px] text-[#8E8E93] truncate">{o.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}</div></div>
            <StatusChip status={o.status} />
          </div>
        ))}
      </section>
      {low.length > 0 && (
        <section className="card p-4">
          <SectionTitle icon={Package} tone="amber" action={<button className="text-[15px] font-semibold text-[#3B2FD9] flex items-center min-h-[44px]" onClick={() => go('products')}>Restock<ChevronRight className="w-4 h-4" /></button>}>Running low</SectionTitle>
          {low.map((p) => <div key={p.id} className="flex justify-between gap-3 py-3 text-[15px] border-t border-[#F2F2F5]"><span className="truncate">{p.name}</span><span className={`font-semibold shrink-0 ${p.stock === 0 ? 'text-[#D93B2B]' : 'text-[#B45309]'}`}>{p.stock === 0 ? 'Sold out' : `${p.stock} left`}</span></div>)}
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
    <div className="grid gap-4">
      <ScreenTitle sub={`${mine.filter(isOpen).length} need your action`}>Orders</ScreenTitle>
      <Segmented id="sell-orders" value={filter} onChange={setFilter} className="md:max-w-md" options={FILTERS.map(([id, l, fn]) => ({ id, label: `${l} ${mine.filter(fn).length}` }))} />
      {list.length === 0 ? <Empty icon={ShoppingBag} title={filter === 'open' ? 'No open orders' : 'Nothing here'} body="Orders from shoppers near you will appear here." /> : (
        <Stagger className="grid gap-3">
          {list.map((o) => (
            <Item as="article" key={o.id} layout className="card p-4 grid gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0"><div className="font-semibold text-[16px]">{o.buyerName}</div><div className="text-[13px] text-[#8E8E93] flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{timeAgo(o.createdAt)} · {o.id}</div></div>
                <StatusChip status={o.status} />
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="chip bg-[#F2F2F5] text-[#6E6E73] !py-1">{o.fulfilment === 'delivery' ? <><Truck className="w-3.5 h-3.5" />Delivery</> : <><StoreIcon className="w-3.5 h-3.5" />Pickup</>}</span>
                <span className={`chip !py-1 ${o.payment === 'upi' ? 'bg-[#E7F7EE] text-[#157F3E]' : 'bg-[#FEF6E4] text-[#B45309]'}`}><Wallet className="w-3.5 h-3.5" />{o.payment === 'upi' ? 'Paid online' : 'Collect cash'}</span>
              </div>
              <div className="rounded-[14px] bg-[#F5F5F7] p-3 grid gap-1.5">{o.items.map((i) => <div key={i.productId} className="flex justify-between gap-3 text-[15px]"><span>{i.qty} × {i.name}</span><span className="tabular-nums font-medium">{rupees(i.price * i.qty)}</span></div>)}</div>
              {o.fulfilment === 'delivery' && <div className="text-[14px] text-[#6E6E73] flex items-center gap-1.5"><MapPin className="w-4 h-4 text-[#FF5A3D]" />{o.address}</div>}
              <div className="text-[14px] flex items-center gap-1.5"><Invoice className="w-4 h-4 text-[#8E8E93]" />You earn <b>{rupees(orderSubtotal(o) - orderCommission(o))}</b> <span className="text-[#8E8E93]">· commission {rupees(orderCommission(o))}</span></div>
              {isOpen(o) && (
                <div className="flex gap-2.5">
                  {o.status === 'placed' && <button className="btn btn-ghost h-[52px] px-5" onClick={() => setDecline(o.id)}>Decline</button>}
                  <motion.button whileTap={{ scale: 0.97 }} className="btn btn-primary flex-1 h-[52px]" onClick={() => advanceOrder(o.id)}>{nextLabel(o)}</motion.button>
                </div>
              )}
            </Item>
          ))}
        </Stagger>
      )}
      <Sheet open={!!decline} onClose={() => setDecline(null)} title="Decline this order?">
        <p className="text-[15px] text-[#6E6E73] mb-5 leading-relaxed">The shopper is notified and refunded, and the items go back into your stock.</p>
        <div className="grid gap-2.5">
          <button className="btn btn-danger w-full h-[52px]" onClick={() => { cancelOrder(decline); setDecline(null); }}>Decline order</button>
          <button className="btn btn-ghost w-full h-[52px]" onClick={() => setDecline(null)}>Keep it</button>
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
  if (editing) return <Enter push id="form"><ProductForm initial={editing} onClose={() => { setEditing(null); window.scrollTo(0, 0); }} /></Enter>;
  return (
    <div className="grid gap-4">
      <ScreenTitle sub={`${mine.length} products · tap ⋯ to edit, hide or delete`} right={<button className="btn btn-coral max-md:hidden" onClick={() => setEditing(blank(myBrand))}><Plus className="w-5 h-5" />Add product</button>}>Products</ScreenTitle>
      {mine.length === 0 ? <Empty icon={Package} title="Add your first product" body="It takes a minute: name, price and how many you have in stock." /> : (
        <Stagger className="grid gap-3">
          {mine.map((p) => (
            <Item as="article" key={p.id} className={`card p-3.5 grid gap-2.5 ${p.active ? '' : 'opacity-60'}`}>
              <div className="flex items-start gap-3">
                <CategoryIcon category={p.category} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="text-[16px] font-semibold leading-snug tracking-[-0.01em]">{p.name}</div>
                  <div className="text-[14px] text-[#8E8E93]">{rupees(p.price)} · {p.unit}{!p.active && ' · Hidden'}</div>
                </div>
                <button className="icon-btn -mr-1.5 -mt-1.5 text-[#8E8E93]" onClick={() => setMenu(p.id)} aria-label={`More options for ${p.name}`}><MoreHorizontal className="w-6 h-6" /></button>
              </div>
              <div className="flex items-center justify-between gap-3 pl-[60px]">
                <span className={`chip ${p.stock === 0 ? 'bg-[#FDECEA] text-[#D93B2B]' : p.stock <= 3 ? 'bg-[#FEF6E4] text-[#B45309]' : 'bg-[#E7F7EE] text-[#157F3E]'}`}>{p.stock === 0 ? 'Sold out' : `${p.stock} in stock`}</span>
                <Stepper size="sm" value={p.stock} onDec={() => updateProduct(p.id, { stock: Math.max(0, p.stock - 1) })} onInc={() => updateProduct(p.id, { stock: p.stock + 1 })} label={`stock of ${p.name}`} />
              </div>
            </Item>
          ))}
        </Stagger>
      )}
      <div className="h-16 md:hidden" aria-hidden="true" />
      <motion.button initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...spring, delay: 0.25 }} whileTap={{ scale: 0.92 }}
        className="md:hidden fixed right-5 bottom-[calc(78px+env(safe-area-inset-bottom))] z-20 btn btn-coral h-14 rounded-full pl-4 pr-5 text-[16px] shadow-[0_12px_28px_-8px_rgba(255,90,61,.7)]" onClick={() => setEditing(blank(myBrand))}><Plus className="w-[22px] h-[22px]" />Add product</motion.button>

      <Sheet open={!!menuProduct} onClose={() => setMenu(null)} title={menuProduct?.name || ''}>
        <SheetRow icon={Pencil} label="Edit product" hint="Name, price, stock, description" onClick={() => { setEditing(menuProduct); setMenu(null); }} />
        <SheetRow icon={menuProduct?.active ? EyeOff : Eye} label={menuProduct?.active ? 'Hide from shoppers' : 'Show to shoppers'} hint={menuProduct?.active ? 'Keeps it in your list' : 'Makes it visible again'} onClick={() => { updateProduct(menu, { active: !menuProduct.active }); setMenu(null); }} />
        <SheetRow icon={Trash2} danger label="Delete product" hint="This can’t be undone" onClick={() => { setConfirmDelete(menu); setMenu(null); }} />
      </Sheet>
      <Sheet open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete this product?">
        <p className="text-[15px] text-[#6E6E73] mb-5 leading-relaxed">{mine.find((p) => p.id === confirmDelete)?.name} will be removed from your store. Past orders stay in your history.</p>
        <div className="grid gap-2.5">
          <button className="btn btn-danger w-full h-[52px]" onClick={() => { deleteProduct(confirmDelete); setConfirmDelete(null); }}>Delete product</button>
          <button className="btn btn-ghost w-full h-[52px]" onClick={() => setConfirmDelete(null)}>Cancel</button>
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
    <div className="grid gap-5 max-w-xl md:card md:p-6">
      <TopBar title={initial.id ? 'Edit product' : 'New product'} onBack={onClose} />
      <div className="flex items-center gap-3.5">
        <CategoryIcon category={f.category} size="sm" />
        <div><h1 className="text-[26px] font-bold tracking-[-0.03em] leading-tight">{initial.id ? 'Edit product' : 'Add a product'}</h1><div className="text-[14px] text-[#8E8E93]">Shoppers within 5 km will see it</div></div>
      </div>
      <Field label="Product name"><input className="input" placeholder="Classic Sourdough Loaf" value={f.name} onChange={set('name')} autoFocus={!initial.id} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Price"><span className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-[#8E8E93]">₹</span><input className="input pl-8" inputMode="numeric" placeholder="280" value={f.price} onChange={set('price')} /></span></Field>
        <Field label="In stock"><input className="input" inputMode="numeric" placeholder="10" value={f.stock} onChange={set('stock')} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Unit"><input className="input" placeholder="500 g" value={f.unit} onChange={set('unit')} /></Field>
        <Field label="Category"><select className="input" value={f.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
      </div>
      <Field label="Description"><textarea className="input h-32 py-3.5 leading-relaxed" placeholder="What makes it special, ingredients, size…" value={f.desc} onChange={set('desc')} /></Field>
      {err && <div className="text-[14px] text-[#D93B2B] font-medium" role="alert">{err}</div>}
      <ActionBar>
        <button className="btn btn-ghost h-[52px] max-md:hidden" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary flex-1 h-[52px]" onClick={save}><Tag className="w-5 h-5" />{initial.id ? 'Save changes' : 'Publish product'}</button>
      </ActionBar>
    </div>
  );
}

const Field = ({ label, children }) => <label className="grid gap-2 text-[14px] font-semibold text-[#3A3A3C]">{label}{children}</label>;

function Toggle({ checked, onChange, label, hint, icon: Icon }) {
  return (
    <label className="flex items-center gap-3 min-h-[64px] cursor-pointer">
      {Icon && <span className="w-10 h-10 rounded-[12px] bg-[#F2F2F5] text-[#6E6E73] flex items-center justify-center shrink-0"><Icon className="w-5 h-5" /></span>}
      <span className="flex-1"><span className="block text-[16px] font-semibold">{label}</span>{hint && <span className="block text-[13px] text-[#8E8E93]">{hint}</span>}</span>
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="w-[51px] h-[31px] rounded-full bg-[#E9E9EE] peer-checked:bg-[#34C759] relative transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-[27px] after:h-[27px] after:rounded-full after:bg-white after:shadow-[0_3px_8px_rgba(0,0,0,.15)] after:transition-transform after:duration-200 peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-[#3B2FD9]/40" aria-hidden="true" />
    </label>
  );
}

function StoreSettings() {
  const { myBrand, updateBrand, orders } = useStore();
  const done = orders.filter((o) => o.brandId === myBrand.id && o.status === 'delivered');
  const gross = done.reduce((s, o) => s + orderSubtotal(o), 0);
  const com = done.reduce((s, o) => s + orderCommission(o), 0);
  return (
    <div className="grid gap-5">
      <ScreenTitle sub="Changes save automatically">Store</ScreenTitle>
      <div className="grid md:grid-cols-2 gap-4 items-start">
        <section className="card p-4 grid gap-4">
          <SectionTitle icon={StoreIcon}>Storefront</SectionTitle>
          <Field label="Business name"><input className="input" value={myBrand.name} onChange={(e) => updateBrand(myBrand.id, { name: e.target.value })} /></Field>
          <Field label="Description"><input className="input" value={myBrand.tagline} onChange={(e) => updateBrand(myBrand.id, { tagline: e.target.value })} /></Field>
          <div className="divide-y divide-[#F2F2F5] -mb-2">
            <Toggle icon={Truck} checked={myBrand.delivery} onChange={(v) => updateBrand(myBrand.id, { delivery: v })} label="Offer delivery" hint="Within 5 km · ₹30 per order" />
            <Toggle icon={StoreIcon} checked={myBrand.pickup} onChange={(v) => updateBrand(myBrand.id, { pickup: v })} label="Allow pickup" hint="Shoppers collect from you" />
          </div>
        </section>
        <section className="card p-4 grid gap-2.5">
          <SectionTitle icon={Analytics} tone="green">Payouts</SectionTitle>
          <div className="text-[14px] text-[#6E6E73] -mt-1">From completed orders. Paid to your bank account every Monday.</div>
          <div className="flex justify-between text-[15px] mt-1"><span className="text-[#6E6E73]">Completed sales</span><span className="tabular-nums">{rupees(gross)}</span></div>
          <div className="flex justify-between text-[15px]"><span className="text-[#6E6E73]">SnapSell commission ({COMMISSION_RATE * 100}%)</span><span className="tabular-nums">− {rupees(com)}</span></div>
          <div className="flex justify-between text-[20px] font-bold tracking-[-0.02em] border-t border-[#EBEBF0] pt-3 mt-1"><span>Your payout</span><span className="tabular-nums text-[#157F3E]">{rupees(gross - com)}</span></div>
        </section>
      </div>
    </div>
  );
}
