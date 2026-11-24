import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Home, Recycle, MapPin, Package, Plus, Search, ShieldCheck, ShoppingCart, Star, Store, Truck, Wallet, Smartphone, ChevronRight, X, Sparkles, StoreLocation, Invoice, Route, Clock, ShoppingBagCheck } from './icons';
import { CATEGORIES, DELIVERY_FEE, STATUS_FLOW, STATUS_LABEL, orderTotal, rupees } from './data';
import { useStore } from './store';
import Secondhand from './Secondhand';
import { ActionBar, BottomNav, CategoryIcon, Empty, Enter, Header, Item, Page, ScreenTitle, SectionTitle, Segmented, Sheet, Stagger, StatusChip, Stepper, Success, TopBar, catOf, spring, timeAgo } from './ui';

export default function Buyer() {
  const { cart, orders, me } = useStore();
  const [tab, setTab] = useState('home');
  const [stack, setStack] = useState([]); // pushed screens: { type: 'brand'|'product', id }
  const view = stack[stack.length - 1];
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const active = orders.filter((o) => o.buyerId === me.id && !['delivered', 'cancelled'].includes(o.status)).length;
  const go = (t) => { setTab(t); setStack([]); window.scrollTo(0, 0); };
  const open = (v) => { setStack((s) => [...s, v]); window.scrollTo(0, 0); };
  const back = () => { setStack((s) => s.slice(0, -1)); window.scrollTo(0, 0); };

  return (
    <>
      <Header sub={`Delivering to ${me.area}`} />
      <BottomNav active={tab} onChange={go} tabs={[
        { id: 'home', label: 'Local', icon: Home },
        { id: 'secondhand', label: 'Secondhand', icon: Recycle },
        { id: 'cart', label: 'Cart', icon: ShoppingCart, badge: cartCount },
        { id: 'orders', label: 'Orders', icon: Package, badge: active },
      ]} />
      <Page>
        {view ? (
          <Enter push id={`${view.type}-${view.id}-${stack.length}`}>
            {view.type === 'product' && <ProductDetail id={view.id} onBack={back} openBrand={(id) => open({ type: 'brand', id })} goCart={() => go('cart')} />}
            {view.type === 'brand' && <BrandStore id={view.id} onBack={back} openProduct={(id) => open({ type: 'product', id })} />}
          </Enter>
        ) : (
          <Enter id={tab}>
            {tab === 'home' && <Shop open={open} />}
            {tab === 'secondhand' && <Secondhand />}
            {tab === 'cart' && <Cart onDone={() => go('orders')} onShop={() => go('home')} />}
            {tab === 'orders' && <Orders onShop={() => go('home')} />}
          </Enter>
        )}
      </Page>
    </>
  );
}

function ProductCard({ p, onOpen }) {
  const { brands, addToCart, cart } = useStore();
  const brand = brands.find((b) => b.id === p.brandId);
  const out = p.stock === 0;
  const inCart = cart.find((c) => c.productId === p.id)?.qty || 0;
  return (
    <div className="relative">
      <button onClick={onOpen} className="w-full text-left flex flex-col" aria-label={`${p.name}, ${rupees(p.price)}`}>
        <div className="relative"><CategoryIcon category={p.category} />
          {out && <span className="absolute inset-0 rounded-[16px] bg-white/55 flex items-end p-2.5"><span className="chip bg-[#1D1D1F] text-white">Sold out</span></span>}
          {!out && p.stock <= 3 && <span className="absolute bottom-2.5 left-2.5 chip bg-white/95 text-[#C2410C] shadow-sm">Only {p.stock} left</span>}
        </div>
        <div className="px-0.5 pt-2.5">
          <div className="text-[12px] text-[#8E8E93] truncate">{brand?.name}</div>
          <div className="text-[15px] font-semibold leading-snug tracking-[-0.01em] line-clamp-2 min-h-[40px]">{p.name}</div>
          <div className="mt-1 flex items-baseline gap-1"><span className="font-bold text-[16px] tracking-[-0.02em]">{rupees(p.price)}</span><span className="text-[12px] text-[#8E8E93]">/ {p.unit}</span></div>
        </div>
      </button>
      {!out && (
        <motion.button whileTap={{ scale: 0.88 }} onClick={() => addToCart(p.id)} disabled={inCart >= p.stock}
          className={`absolute top-2.5 right-2.5 w-11 h-11 rounded-full flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,.14)] transition-colors ${inCart ? 'bg-[#3B2FD9] text-white' : 'bg-white text-[#1D1D1F]'}`} aria-label={`Add ${p.name} to cart`}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={inCart} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={spring} className="flex">
              {inCart ? <span className="text-[15px] font-bold">{inCart}</span> : <Plus className="w-5 h-5" />}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      )}
    </div>
  );
}

function Shop({ open }) {
  const { products, brands, me } = useStore();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const liveBrands = brands.filter((b) => b.status === 'active');
  const list = products.filter((p) => p.active && liveBrands.some((b) => b.id === p.brandId)
    && (cat === 'all' || p.category === cat)
    && (q === '' || (p.name + ' ' + brands.find((b) => b.id === p.brandId)?.name).toLowerCase().includes(q.toLowerCase())));
  const browsing = q === '' && cat === 'all';

  return (
    <div className="grid gap-5">
      <ScreenTitle sub={<span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-[#FF5A3D]" />{me.area} · within 5 km</span>}>Local brands</ScreenTitle>
      <div className="relative">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#8E8E93]" />
        <input className="input pl-12 pr-12" type="search" enterKeyHint="search" placeholder="Sourdough, candles, plants…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search products" />
        {q && <button className="icon-btn absolute right-1 top-1/2 -translate-y-1/2 text-[#8E8E93]" onClick={() => setQ('')} aria-label="Clear search"><X className="w-4 h-4" /></button>}
      </div>
      <div className="rail -mt-1">
        <button className="pill" aria-pressed={cat === 'all'} onClick={() => setCat('all')}>All</button>
        {CATEGORIES.map((c) => <button key={c.id} className="pill" aria-pressed={cat === c.id} onClick={() => setCat(c.id)}>{c.name}</button>)}
      </div>
      {browsing && (
        <>
          <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }} onClick={() => open({ type: 'brand', id: liveBrands[0]?.id })}
            className="relative overflow-hidden rounded-[24px] p-5 text-left text-white bg-gradient-to-br from-[#4A3FE6] via-[#3B2FD9] to-[#2A1FB0] shadow-[0_16px_40px_-16px_rgba(59,47,217,.7)]">
            <div className="absolute -right-8 -top-10 w-44 h-44 rounded-full bg-white/10" />
            <div className="absolute right-10 -bottom-14 w-32 h-32 rounded-full bg-[#FF5A3D]/30 blur-xl" />
            <span className="eyebrow !text-white/70 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" />Featured this week</span>
            <div className="relative text-[22px] font-bold tracking-[-0.02em] mt-1.5 leading-tight max-w-[15rem]">Fresh sourdough from {liveBrands[0]?.name}</div>
            <div className="relative text-[14px] text-white/75 mt-1">Baked every morning in {liveBrands[0]?.area}</div>
            <span className="relative inline-flex items-center gap-1 mt-4 text-[14px] font-semibold bg-white text-[#3B2FD9] rounded-full pl-4 pr-3 h-9">Visit store<ChevronRight className="w-4 h-4" /></span>
          </motion.button>
          <section>
            <SectionTitle icon={StoreLocation} action={<span className="text-[13px] text-[#8E8E93]">{liveBrands.length} open now</span>}>Brands near you</SectionTitle>
            <div className="rail">
              {liveBrands.map((b) => (
                <motion.button whileTap={{ scale: 0.97 }} key={b.id} onClick={() => open({ type: 'brand', id: b.id })} className="card p-3 w-[230px] text-left flex gap-3 items-center">
                  <CategoryIcon category={b.category} size="sm" />
                  <div className="min-w-0"><div className="font-semibold tracking-[-0.01em] truncate">{b.name}</div>
                    <div className="text-[13px] text-[#8E8E93] flex items-center gap-1"><Star className="w-3.5 h-3.5 text-[#F5A524] fill-[#F5A524]" />{b.rating} · {b.area}</div></div>
                </motion.button>
              ))}
            </div>
          </section>
        </>
      )}
      <section>
        <SectionTitle icon={browsing ? Sparkles : Search} tone={browsing ? 'coral' : 'gray'}>{browsing ? 'Fresh from local makers' : `${list.length} result${list.length === 1 ? '' : 's'}`}</SectionTitle>
        {list.length === 0 ? <Empty icon={Search} title="No matches nearby" body="Try another word or category. New brands join every week." />
          : <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-5">{list.map((p) => <Item key={p.id}><ProductCard p={p} onOpen={() => open({ type: 'product', id: p.id })} /></Item>)}</Stagger>}
      </section>
    </div>
  );
}

function BrandStore({ id, onBack, openProduct }) {
  const { brands, products } = useStore();
  const b = brands.find((x) => x.id === id);
  const items = products.filter((p) => p.brandId === id && p.active);
  return (
    <div className="grid gap-5">
      <TopBar title={b.name} onBack={onBack} />
      <div className="flex gap-4 items-center">
        <CategoryIcon category={b.category} size="sm" />
        <div className="min-w-0">
          <h1 className="text-[26px] font-bold tracking-[-0.03em] leading-tight">{b.name}</h1>
          <div className="text-[14px] text-[#6E6E73]">{b.tagline}</div>
        </div>
      </div>
      <div className="card grid grid-cols-3 divide-x divide-[#EBEBF0] py-3 text-center">
        <div><div className="text-[17px] font-bold flex items-center justify-center gap-1"><Star className="w-4 h-4 text-[#F5A524] fill-[#F5A524]" />{b.rating}</div><div className="text-[12px] text-[#8E8E93]">Rating</div></div>
        <div><div className="text-[17px] font-bold">{items.length}</div><div className="text-[12px] text-[#8E8E93]">Products</div></div>
        <div className="min-w-0"><div className="text-[15px] font-bold truncate px-2">{b.area}</div><div className="text-[12px] text-[#8E8E93]">Since {b.since}</div></div>
      </div>
      <div className="flex flex-wrap gap-2">
        {b.delivery && <span className="chip bg-[#E7F7EE] text-[#157F3E] !py-1.5 !px-3"><Truck className="w-4 h-4" />Delivers in 5 km</span>}
        {b.pickup && <span className="chip bg-[#F2F2F5] text-[#6E6E73] !py-1.5 !px-3"><Store className="w-4 h-4" />Pickup available</span>}
      </div>
      <section>
        <SectionTitle icon={Package}>All products</SectionTitle>
        <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-5">{items.map((p) => <Item key={p.id}><ProductCard p={p} onOpen={() => openProduct(p.id)} /></Item>)}</Stagger>
      </section>
    </div>
  );
}

function ProductDetail({ id, onBack, openBrand, goCart }) {
  const { products, brands, addToCart, cart } = useStore();
  const p = products.find((x) => x.id === id);
  const b = brands.find((x) => x.id === p.brandId);
  const [qty, setQty] = useState(1);
  const inCart = cart.find((c) => c.productId === id)?.qty || 0;
  const left = p.stock - inCart;
  return (
    <div>
      <TopBar title={b.name} onBack={onBack} />
      <div className="md:grid md:grid-cols-2 md:gap-8">
        <div className="-mx-5 -mt-4 md:m-0"><CategoryIcon category={p.category} size="lg" /></div>
        <div className="grid gap-4 content-start mt-5 md:mt-0">
          <div className="flex items-center gap-2"><span className="chip bg-[#EEF0FF] text-[#3B2FD9]">{catOf(p.category).name}</span>
            <span className={`chip ${p.stock === 0 ? 'bg-[#F2F2F5] text-[#8E8E93]' : p.stock <= 3 ? 'bg-[#FFF1EE] text-[#C2410C]' : 'bg-[#E7F7EE] text-[#157F3E]'}`}>{p.stock === 0 ? 'Sold out' : `${p.stock} in stock`}</span></div>
          <div>
            <h1 className="text-[28px] font-bold leading-[1.15] tracking-[-0.03em]">{p.name}</h1>
            <div className="text-[24px] font-bold tracking-[-0.02em] mt-2">{rupees(p.price)} <span className="text-[15px] font-medium text-[#8E8E93]">/ {p.unit}</span></div>
          </div>
          <p className="text-[16px] leading-relaxed text-[#6E6E73]">{p.desc}</p>
          {inCart > 0 && <div className="text-[14px] text-[#3B2FD9] font-semibold flex items-center gap-1.5"><ShoppingCart className="w-4 h-4" />{inCart} already in your cart</div>}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-[16px] bg-white p-3.5 shadow-[0_0_0_1px_rgba(0,0,0,.05)]"><Truck className="w-5 h-5 text-[#3B2FD9]" /><div className="text-[14px] font-semibold mt-2">{b.delivery ? 'Delivery ₹30' : 'Pickup only'}</div><div className="text-[12px] text-[#8E8E93]">Within 5 km</div></div>
            <div className="rounded-[16px] bg-white p-3.5 shadow-[0_0_0_1px_rgba(0,0,0,.05)]"><ShieldCheck className="w-5 h-5 text-[#157F3E]" /><div className="text-[14px] font-semibold mt-2">Secure payment</div><div className="text-[12px] text-[#8E8E93]">UPI or on delivery</div></div>
          </div>
          <button onClick={() => openBrand(b.id)} className="card p-3.5 flex items-center gap-3 text-left active:scale-[.99] transition-transform">
            <CategoryIcon category={b.category} size="sm" />
            <div className="flex-1 min-w-0"><div className="font-semibold">{b.name}</div><div className="text-[13px] text-[#8E8E93] flex items-center gap-1"><Star className="w-3.5 h-3.5 text-[#F5A524] fill-[#F5A524]" />{b.rating} · {b.area}</div></div>
            <ChevronRight className="w-5 h-5 text-[#C7C7CC]" />
          </button>
          {p.stock === 0 ? (
            <ActionBar><button className="btn btn-ghost flex-1 h-[52px]" disabled>Sold out</button></ActionBar>
          ) : (
            <ActionBar>
              <Stepper value={Math.min(qty, Math.max(left, 1))} onDec={() => setQty(Math.max(1, qty - 1))} onInc={() => setQty(Math.min(Math.max(left, 1), qty + 1))} />
              <button className="btn btn-primary flex-1 h-[52px]" disabled={left <= 0} onClick={() => { addToCart(p.id, qty); goCart(); }}>
                {left <= 0 ? 'All in your cart' : <><ShoppingCart className="w-5 h-5" />Add · {rupees(p.price * Math.min(qty, left))}</>}
              </button>
            </ActionBar>
          )}
        </div>
      </div>
    </div>
  );
}

function Cart({ onDone, onShop }) {
  const { cart, products, brands, setCartQty, placeOrders, me } = useStore();
  const [fulfilment, setFulfilment] = useState('delivery');
  const [address, setAddress] = useState(`Flat 302, ${me.area}`);
  const [payment, setPayment] = useState('upi');
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(null);
  const lines = cart.map((c) => ({ ...c, p: products.find((x) => x.id === c.productId) })).filter((l) => l.p);
  const groups = useMemo(() => [...new Set(lines.map((l) => l.p.brandId))], [lines]);
  const subtotal = lines.reduce((s, l) => s + l.p.price * l.qty, 0);
  const itemCount = lines.reduce((s, l) => s + l.qty, 0);
  const pickupOk = groups.every((id) => brands.find((b) => b.id === id)?.pickup);
  const mode = pickupOk ? fulfilment : 'delivery';
  const fee = mode === 'delivery' ? DELIVERY_FEE * groups.length : 0;

  const success = <Success open={!!done} title="Order placed" body={done ? `${done.stores} ${done.count > 1 ? 'have' : 'has'} your order. You’ll see updates here as each store accepts it.` : ''} primary="Track my order" onPrimary={onDone} secondary="Keep shopping" onSecondary={onShop} />;

  if (lines.length === 0) return (
    <div className="grid gap-5"><ScreenTitle>Cart</ScreenTitle>
      <Empty icon={ShoppingCart} title="Your cart is empty" body="Add something from a local brand near you." action={<button className="btn btn-primary" onClick={onShop}>Browse local brands</button>} />{success}</div>
  );

  const pay = () => {
    setPaying(true);
    const stores = groups.map((id) => brands.find((b) => b.id === id)?.name).join(' and ');
    setTimeout(() => { placeOrders({ fulfilment: mode, address: mode === 'pickup' ? 'Pickup from store' : address, payment }); setPaying(false); setDone({ count: groups.length, stores }); }, payment === 'upi' ? 1400 : 500);
  };

  return (
    <div className="grid gap-5 md:grid-cols-[1fr_360px] md:items-start">
      <div className="grid gap-4">
        <ScreenTitle sub={`${itemCount} item${itemCount === 1 ? '' : 's'} from ${groups.length} store${groups.length > 1 ? 's' : ''}`}>Cart</ScreenTitle>
        {groups.map((bid) => (
          <section key={bid} className="card p-4">
            <div className="font-semibold flex items-center gap-2 mb-1"><Store className="w-[18px] h-[18px] text-[#3B2FD9]" />{brands.find((b) => b.id === bid)?.name}</div>
            <AnimatePresence initial={false}>
              {lines.filter((l) => l.p.brandId === bid).map((l) => (
                <motion.div key={l.productId} layout exit={{ opacity: 0, height: 0 }} className="flex items-center gap-3 py-2.5 border-t border-[#F2F2F5] first:border-0">
                  <CategoryIcon category={l.p.category} size="sm" />
                  <div className="flex-1 min-w-0"><div className="text-[15px] font-semibold leading-snug line-clamp-2">{l.p.name}</div><div className="text-[14px] text-[#6E6E73]">{rupees(l.p.price * l.qty)}</div></div>
                  <Stepper size="sm" value={l.qty} onDec={() => setCartQty(l.productId, l.qty - 1)} onInc={() => setCartQty(l.productId, Math.min(l.p.stock, l.qty + 1))} label={l.p.name} />
                </motion.div>
              ))}
            </AnimatePresence>
          </section>
        ))}
      </div>
      <div className="grid gap-4 md:sticky md:top-24">
        <section className="card p-4 grid gap-3">
          <SectionTitle icon={Route}>How do you want it?</SectionTitle>
          <Segmented id="fulfil" value={mode} onChange={setFulfilment} options={[{ id: 'delivery', label: 'Delivery', icon: Truck }, { id: 'pickup', label: 'Pickup', icon: Store, disabled: !pickupOk }]} />
          {!pickupOk && <div className="text-[13px] text-[#8E8E93] -mt-1">Pickup isn’t available: one of these brands only delivers.</div>}
          <AnimatePresence initial={false}>
            {mode === 'delivery' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="relative"><MapPin className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#FF5A3D]" /><input className="input pl-12" value={address} onChange={(e) => setAddress(e.target.value)} aria-label="Delivery address" autoComplete="street-address" /></div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
        <section className="card p-4 grid gap-2">
          <SectionTitle icon={Wallet} tone="green">Payment</SectionTitle>
          {[['upi', 'UPI or card', 'Razorpay · instant', Smartphone], ['cod', 'Pay on delivery', 'Cash or UPI at the door', Wallet]].map(([id, label, hint, Icon]) => (
            <label key={id} className={`flex items-center gap-3 min-h-[60px] px-3.5 rounded-[14px] cursor-pointer transition-colors ${payment === id ? 'bg-[#F3F2FF] shadow-[0_0_0_1.5px_#3B2FD9]' : 'bg-[#F5F5F7]'}`}>
              <Icon className="w-[22px] h-[22px] text-[#3B2FD9]" />
              <span className="flex-1"><span className="block text-[15px] font-semibold">{label}</span><span className="block text-[13px] text-[#8E8E93]">{hint}</span></span>
              <input type="radio" name="payment" checked={payment === id} onChange={() => setPayment(id)} className="accent-[#3B2FD9] w-5 h-5" />
            </label>
          ))}
        </section>
        <section className="card p-4 grid gap-2 text-[15px]">
          <div className="flex justify-between"><span className="text-[#6E6E73]">Items</span><span>{rupees(subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-[#6E6E73]">Delivery{groups.length > 1 && mode === 'delivery' && ` · ${groups.length} stores`}</span><span>{fee ? rupees(fee) : 'Free'}</span></div>
          <div className="flex justify-between font-bold text-[19px] tracking-[-0.02em] pt-2.5 border-t border-[#EBEBF0] mt-1"><span>Total</span><span>{rupees(subtotal + fee)}</span></div>
        </section>
        <ActionBar aboveTabs note={<span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-[#157F3E]" />Demo checkout · no real money is charged</span>}>
          <button className="btn btn-primary w-full h-[52px]" disabled={paying} onClick={pay}>
            {paying ? <><motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }} className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white" />Processing…</> : payment === 'upi' ? `Pay ${rupees(subtotal + fee)}` : `Place order · ${rupees(subtotal + fee)}`}
          </button>
        </ActionBar>
      </div>
      {success}
    </div>
  );
}

function Orders({ onShop }) {
  const { orders, brands, me, cancelOrder } = useStore();
  const [cancelId, setCancelId] = useState(null);
  const mine = orders.filter((o) => o.buyerId === me.id);
  if (mine.length === 0) return (
    <div className="grid gap-5"><ScreenTitle>Orders</ScreenTitle>
      <Empty icon={Package} title="No orders yet" body="When you order from a local brand, you can track it here." action={<button className="btn btn-primary" onClick={onShop}>Start shopping</button>} /></div>
  );
  return (
    <div className="grid gap-4">
      <ScreenTitle sub={`${mine.filter((o) => !['delivered', 'cancelled'].includes(o.status)).length} in progress`}>Orders</ScreenTitle>
      <Stagger className="grid gap-3">
        {mine.map((o) => {
          const flow = STATUS_FLOW[o.fulfilment];
          const idx = flow.indexOf(o.status);
          const brand = brands.find((b) => b.id === o.brandId);
          return (
            <Item as="article" key={o.id} className="card p-4 grid gap-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex gap-3 min-w-0"><CategoryIcon category={brand?.category} size="sm" />
                  <div className="min-w-0"><div className="font-semibold tracking-[-0.01em] truncate">{brand?.name}</div><div className="text-[13px] text-[#8E8E93] flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{timeAgo(o.createdAt)} · {o.id}</div></div></div>
                <StatusChip status={o.status} />
              </div>
              <div className="text-[15px] text-[#3A3A3C]">{o.items.map((i) => `${i.qty} × ${i.name}`).join(', ')}</div>
              {o.status !== 'cancelled' && (
                <ol className="flex items-start" aria-label="Order progress">
                  {flow.map((s, i) => (
                    <li key={s} className="flex-1 flex flex-col items-center gap-1.5 relative">
                      {i > 0 && <span className="absolute top-[11px] right-1/2 w-full h-[3px] rounded-full bg-[#EBEBF0] overflow-hidden"><motion.span className="block h-full bg-[#3B2FD9] origin-left" initial={{ scaleX: 0 }} animate={{ scaleX: i <= idx ? 1 : 0 }} transition={{ duration: 0.6, delay: 0.1 * i, ease: [0.22, 1, 0.36, 1] }} /></span>}
                      <motion.span initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ ...spring, delay: 0.1 * i }} className={`relative w-[25px] h-[25px] rounded-full flex items-center justify-center ${i <= idx ? 'bg-[#3B2FD9] text-white shadow-[0_4px_10px_-4px_rgba(59,47,217,.8)]' : 'bg-white text-[#AEAEB2] shadow-[0_0_0_1.5px_#E5E5EA]'}`}>{i <= idx ? <Check className="w-3.5 h-3.5" /> : <span className="text-[11px] font-bold">{i + 1}</span>}</motion.span>
                      <span className={`text-[11px] text-center leading-tight px-0.5 ${i === idx ? 'text-[#1D1D1F] font-semibold' : 'text-[#8E8E93]'}`}>{STATUS_LABEL[s]}</span>
                    </li>
                  ))}
                </ol>
              )}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#F2F2F5]">
                <div className="text-[14px] flex items-center gap-1.5 min-w-0"><Invoice className="w-4 h-4 text-[#8E8E93] shrink-0" /><b className="text-[16px] tracking-[-0.02em]">{rupees(orderTotal(o))}</b><span className="text-[#8E8E93] truncate">· {o.payment === 'upi' ? 'Paid online' : 'Pay on delivery'}</span></div>
                {o.status === 'placed' && <button className="min-h-[44px] px-2 -mr-2 text-[15px] font-semibold text-[#D93B2B]" onClick={() => setCancelId(o.id)}>Cancel</button>}
                {o.status === 'delivered' && <span className="text-[13px] font-semibold text-[#157F3E] flex items-center gap-1 shrink-0"><ShoppingBagCheck className="w-4 h-4" />Delivered</span>}
              </div>
            </Item>
          );
        })}
      </Stagger>
      <Sheet open={!!cancelId} onClose={() => setCancelId(null)} title="Cancel this order?">
        <p className="text-[15px] text-[#6E6E73] mb-5 leading-relaxed">The store hasn’t accepted it yet. {mine.find((o) => o.id === cancelId)?.payment === 'upi' ? 'Your payment will be refunded to your UPI account.' : ''}</p>
        <div className="grid gap-2.5">
          <button className="btn btn-danger w-full h-[52px]" onClick={() => { cancelOrder(cancelId); setCancelId(null); }}>Yes, cancel order</button>
          <button className="btn btn-ghost w-full h-[52px]" onClick={() => setCancelId(null)}>Keep order</button>
        </div>
      </Sheet>
    </div>
  );
}
