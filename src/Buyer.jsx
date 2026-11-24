import React, { useMemo, useState } from 'react';
import { Check, Home, Recycle, MapPin, Package, Plus, Search, ShieldCheck, ShoppingCart, Star, Store, Truck, Wallet, Smartphone, ChevronRight, X } from 'lucide-react';
import { CATEGORIES, DELIVERY_FEE, STATUS_FLOW, STATUS_LABEL, orderSubtotal, orderTotal, rupees } from './data';
import { useStore } from './store';
import Secondhand from './Secondhand';
import { ActionBar, BottomNav, CategoryIcon, Empty, Header, Page, ScreenTitle, Sheet, StatusChip, Stepper, TopBar, catOf, timeAgo } from './ui';

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
      <Header sub={`Shopping near ${me.area}`} />
      <BottomNav active={tab} onChange={go} tabs={[
        { id: 'home', label: 'Local', icon: Home },
        { id: 'secondhand', label: 'Secondhand', icon: Recycle },
        { id: 'cart', label: 'Cart', icon: ShoppingCart, badge: cartCount },
        { id: 'orders', label: 'Orders', icon: Package, badge: active },
      ]} />
      <Page>
        {view?.type === 'product' && <ProductDetail key={view.id} id={view.id} onBack={back} openBrand={(id) => open({ type: 'brand', id })} goCart={() => go('cart')} />}
        {view?.type === 'brand' && <BrandStore key={view.id} id={view.id} onBack={back} openProduct={(id) => open({ type: 'product', id })} />}
        {!view && tab === 'home' && <Shop open={open} />}
        {!view && tab === 'secondhand' && <Secondhand />}
        {!view && tab === 'cart' && <Cart onDone={() => go('orders')} onShop={() => go('home')} />}
        {!view && tab === 'orders' && <Orders onShop={() => go('home')} />}
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
    <div className="relative card p-2 flex flex-col">
      <button onClick={onOpen} className="text-left flex flex-col" aria-label={`${p.name}, ${rupees(p.price)}`}>
        <CategoryIcon category={p.category} />
        <div className="text-[11px] text-[#7C8199] mt-2 truncate">{brand?.name}</div>
        <div className="text-[14px] font-semibold leading-snug line-clamp-2 min-h-[38px]">{p.name}</div>
        <div className="mt-1 flex items-baseline gap-1"><span className="font-extrabold text-[15px]">{rupees(p.price)}</span><span className="text-[11px] text-[#7C8199]">/ {p.unit}</span></div>
        {!out && p.stock <= 3 && <div className="text-[11px] text-[#C2410C] font-semibold mt-0.5">Only {p.stock} left</div>}
      </button>
      {out ? <span className="absolute top-3.5 left-3.5 chip bg-white/95 text-[#4E5369]">Sold out</span> : (
        <button onClick={() => addToCart(p.id)} disabled={inCart >= p.stock}
          className={`absolute top-3 right-3 w-11 h-11 rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(17,19,34,.15)] ${inCart ? 'bg-[#3B2FD9] text-white' : 'bg-white text-[#3B2FD9]'}`} aria-label={`Add ${p.name} to cart`}>
          {inCart ? <span className="text-[14px] font-bold">{inCart}</span> : <Plus className="w-5 h-5" strokeWidth={2.5} />}
        </button>
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
    <div className="grid gap-4">
      <ScreenTitle sub={<span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[#FF5A3D]" />Delivering to <b>{me.area}</b> · within 5 km</span>}>Local brands</ScreenTitle>
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7C8199]" />
        <input className="input pl-11 pr-11 rounded-[14px]" type="search" enterKeyHint="search" placeholder="Search sourdough, candles, plants…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search products" />
        {q && <button className="icon-btn absolute right-0.5 top-1/2 -translate-y-1/2 text-[#7C8199]" onClick={() => setQ('')} aria-label="Clear search"><X className="w-4 h-4" /></button>}
      </div>
      <div className="rail">
        <button className="pill" aria-pressed={cat === 'all'} onClick={() => setCat('all')}>All</button>
        {CATEGORIES.map((c) => <button key={c.id} className="pill" aria-pressed={cat === c.id} onClick={() => setCat(c.id)}>{c.name}</button>)}
      </div>
      {browsing && (
        <section>
          <div className="flex items-center justify-between mb-2"><h2 className="text-[17px] font-bold">Brands near you</h2><span className="text-[12px] text-[#7C8199]">{liveBrands.length} open now</span></div>
          <div className="rail">
            {liveBrands.map((b) => (
              <button key={b.id} onClick={() => open({ type: 'brand', id: b.id })} className="card p-3 w-[220px] text-left flex gap-3 items-center active:bg-[#F8F8FF]">
                <CategoryIcon category={b.category} size="sm" />
                <div className="min-w-0"><div className="font-bold truncate">{b.name}</div>
                  <div className="text-[12px] text-[#7C8199] flex items-center gap-1"><Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />{b.rating} · {b.area}</div></div>
              </button>
            ))}
          </div>
        </section>
      )}
      <section>
        <h2 className="text-[17px] font-bold mb-2">{browsing ? 'Fresh from local makers' : `${list.length} result${list.length === 1 ? '' : 's'}`}</h2>
        {list.length === 0 ? <Empty icon={Search} title="No matches nearby" body="Try another word or category. New brands join every week." />
          : <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{list.map((p) => <ProductCard key={p.id} p={p} onOpen={() => open({ type: 'product', id: p.id })} />)}</div>}
      </section>
    </div>
  );
}

function BrandStore({ id, onBack, openProduct }) {
  const { brands, products } = useStore();
  const b = brands.find((x) => x.id === id);
  const items = products.filter((p) => p.brandId === id && p.active);
  return (
    <div className="grid gap-4">
      <TopBar title={b.name} onBack={onBack} />
      <div className="card p-4 flex gap-4 items-center">
        <CategoryIcon category={b.category} size="sm" />
        <div className="min-w-0">
          <h1 className="text-[20px] md:text-[22px] font-extrabold leading-tight">{b.name}</h1>
          <div className="text-[13px] text-[#4E5369]">{b.tagline}</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 text-[12px]">
        <span className="chip bg-[#FEF6E4] text-[#B45309]"><Star className="w-3 h-3" />{b.rating}</span>
        <span className="chip bg-[#EEF0FF] text-[#3B2FD9]"><MapPin className="w-3 h-3" />{b.area}</span>
        {b.delivery && <span className="chip bg-[#E7F7EE] text-[#157F3E]"><Truck className="w-3 h-3" />Delivers</span>}
        {b.pickup && <span className="chip bg-[#F1F1F4] text-[#4E5369]"><Store className="w-3 h-3" />Pickup</span>}
      </div>
      <h2 className="text-[17px] font-bold -mb-1">{items.length} products</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{items.map((p) => <ProductCard key={p.id} p={p} onOpen={() => openProduct(p.id)} />)}</div>
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
      <div className="md:grid md:grid-cols-2 md:gap-6">
        <div className="-mx-4 -mt-3 md:m-0"><CategoryIcon category={p.category} size="lg" /></div>
        <div className="grid gap-3 content-start mt-4 md:mt-0">
          <span className="chip bg-[#EEF0FF] text-[#3B2FD9] w-fit">{catOf(p.category).name}</span>
          <h1 className="text-[24px] font-extrabold leading-tight tracking-tight">{p.name}</h1>
          <div className="text-[26px] font-extrabold">{rupees(p.price)} <span className="text-[14px] font-medium text-[#7C8199]">/ {p.unit}</span></div>
          <div className={`text-[13px] font-semibold ${p.stock === 0 ? 'text-[#7C8199]' : p.stock <= 3 ? 'text-[#C2410C]' : 'text-[#157F3E]'}`}>
            {p.stock === 0 ? 'Sold out' : `${p.stock} in stock`}{inCart > 0 && ` · ${inCart} in your cart`}
          </div>
          <p className="text-[15px] leading-relaxed text-[#4E5369]">{p.desc}</p>
          <button onClick={() => openBrand(b.id)} className="card p-3 flex items-center gap-3 text-left active:bg-[#F8F8FF] min-h-[64px]">
            <CategoryIcon category={b.category} size="sm" />
            <div className="flex-1 min-w-0"><div className="font-bold">{b.name}</div><div className="text-[12px] text-[#7C8199]">{b.area} · ★ {b.rating} · {b.delivery ? 'Delivers' : 'Pickup only'}</div></div>
            <ChevronRight className="w-5 h-5 text-[#7C8199]" />
          </button>
          {p.stock === 0 ? (
            <ActionBar><button className="btn btn-ghost flex-1 h-12" disabled>Sold out</button></ActionBar>
          ) : (
            <ActionBar>
              <Stepper value={Math.min(qty, Math.max(left, 1))} onDec={() => setQty(Math.max(1, qty - 1))} onInc={() => setQty(Math.min(Math.max(left, 1), qty + 1))} />
              <button className="btn btn-primary flex-1 h-12" disabled={left <= 0} onClick={() => { addToCart(p.id, qty); goCart(); }}>
                {left <= 0 ? 'All in your cart' : `Add · ${rupees(p.price * Math.min(qty, left))}`}
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
  const lines = cart.map((c) => ({ ...c, p: products.find((x) => x.id === c.productId) })).filter((l) => l.p);
  const groups = useMemo(() => [...new Set(lines.map((l) => l.p.brandId))], [lines]);
  const subtotal = lines.reduce((s, l) => s + l.p.price * l.qty, 0);
  const itemCount = lines.reduce((s, l) => s + l.qty, 0);
  const pickupOk = groups.every((id) => brands.find((b) => b.id === id)?.pickup);
  const mode = pickupOk ? fulfilment : 'delivery';
  const fee = mode === 'delivery' ? DELIVERY_FEE * groups.length : 0;

  if (lines.length === 0) return (
    <div className="grid gap-4"><ScreenTitle>Cart</ScreenTitle>
      <Empty icon={ShoppingCart} title="Your cart is empty" body="Add something from a local brand near you." action={<button className="btn btn-primary" onClick={onShop}>Browse local brands</button>} /></div>
  );

  const pay = () => {
    setPaying(true);
    setTimeout(() => { placeOrders({ fulfilment: mode, address: mode === 'pickup' ? 'Pickup from store' : address, payment }); setPaying(false); onDone(); }, payment === 'upi' ? 1400 : 400);
  };

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_340px] md:items-start">
      <div className="grid gap-3">
        <ScreenTitle sub={`${itemCount} item${itemCount === 1 ? '' : 's'} from ${groups.length} store${groups.length > 1 ? 's' : ''}`}>Cart</ScreenTitle>
        {groups.map((bid) => (
          <section key={bid} className="card p-3 grid gap-1">
            <div className="font-bold flex items-center gap-2 px-1 pb-1"><Store className="w-4 h-4 text-[#3B2FD9]" />{brands.find((b) => b.id === bid)?.name}</div>
            {lines.filter((l) => l.p.brandId === bid).map((l) => (
              <div key={l.productId} className="flex items-center gap-3 py-1.5">
                <CategoryIcon category={l.p.category} size="sm" />
                <div className="flex-1 min-w-0"><div className="text-[14px] font-semibold leading-snug line-clamp-2">{l.p.name}</div><div className="text-[13px] text-[#4E5369] font-semibold">{rupees(l.p.price * l.qty)}</div></div>
                <Stepper size="sm" value={l.qty} onDec={() => setCartQty(l.productId, l.qty - 1)} onInc={() => setCartQty(l.productId, Math.min(l.p.stock, l.qty + 1))} label={l.p.name} />
              </div>
            ))}
          </section>
        ))}
      </div>
      <div className="grid gap-3 md:card md:p-4 md:sticky md:top-20">
        <section className="card p-4 md:p-0 md:border-0 grid gap-3">
          <h2 className="font-bold">How do you want it?</h2>
          <div className="grid grid-cols-2 gap-1 p-1 rounded-[14px] bg-[#F1F1F6]" role="radiogroup" aria-label="Delivery or pickup">
            {[['delivery', 'Delivery', Truck], ['pickup', 'Pickup', Store]].map(([id, label, Icon]) => (
              <button key={id} role="radio" aria-checked={mode === id} disabled={id === 'pickup' && !pickupOk} onClick={() => setFulfilment(id)}
                className={`h-11 rounded-[11px] text-[14px] font-semibold flex items-center justify-center gap-1.5 disabled:opacity-40 ${mode === id ? 'bg-white shadow-sm text-[#3B2FD9]' : 'text-[#4E5369]'}`}><Icon className="w-4 h-4" />{label}</button>
            ))}
          </div>
          {!pickupOk && <div className="text-[12px] text-[#7C8199] -mt-1">Pickup isn’t available: one of these brands only delivers.</div>}
          {mode === 'delivery' && <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} aria-label="Delivery address" autoComplete="street-address" />}
        </section>
        <section className="card p-4 md:p-0 md:border-0 grid gap-2">
          <h2 className="font-bold">Payment</h2>
          {[['upi', 'UPI or card', 'Razorpay · instant', Smartphone], ['cod', 'Pay on delivery', 'Cash or UPI at the door', Wallet]].map(([id, label, hint, Icon]) => (
            <label key={id} className={`flex items-center gap-3 min-h-[56px] px-3 rounded-[12px] border cursor-pointer ${payment === id ? 'border-[#3B2FD9] bg-[#F8F8FF]' : 'border-[#E8EAF2]'}`}>
              <Icon className="w-5 h-5 text-[#3B2FD9]" />
              <span className="flex-1"><span className="block text-[15px] font-semibold">{label}</span><span className="block text-[12px] text-[#7C8199]">{hint}</span></span>
              <input type="radio" name="payment" checked={payment === id} onChange={() => setPayment(id)} className="accent-[#3B2FD9] w-5 h-5" />
            </label>
          ))}
        </section>
        <section className="card p-4 md:p-0 md:border-0 grid gap-1.5 text-[14px]">
          <div className="flex justify-between"><span className="text-[#4E5369]">Items</span><span>{rupees(subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-[#4E5369]">Delivery{groups.length > 1 && mode === 'delivery' && ` (${groups.length} stores)`}</span><span>{fee ? rupees(fee) : 'Free'}</span></div>
          <div className="flex justify-between font-extrabold text-[17px] pt-1.5 border-t border-[#EDEEF4] mt-1"><span>Total</span><span>{rupees(subtotal + fee)}</span></div>
        </section>
        <ActionBar aboveTabs note={<span className="inline-flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-[#157F3E]" />Demo checkout · no real money is charged</span>}>
          <button className="btn btn-primary w-full h-12" disabled={paying} onClick={pay}>
            {paying ? 'Processing payment…' : payment === 'upi' ? `Pay ${rupees(subtotal + fee)}` : `Place order · ${rupees(subtotal + fee)}`}
          </button>
        </ActionBar>
      </div>
    </div>
  );
}

function Orders({ onShop }) {
  const { orders, brands, me, cancelOrder } = useStore();
  const [cancelId, setCancelId] = useState(null);
  const mine = orders.filter((o) => o.buyerId === me.id);
  if (mine.length === 0) return (
    <div className="grid gap-4"><ScreenTitle>Orders</ScreenTitle>
      <Empty icon={Package} title="No orders yet" body="When you order from a local brand, you can track it here." action={<button className="btn btn-primary" onClick={onShop}>Start shopping</button>} /></div>
  );
  return (
    <div className="grid gap-3">
      <ScreenTitle>Orders</ScreenTitle>
      {mine.map((o) => {
        const flow = STATUS_FLOW[o.fulfilment];
        const idx = flow.indexOf(o.status);
        const brand = brands.find((b) => b.id === o.brandId);
        return (
          <article key={o.id} className="card p-4 grid gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex gap-3 min-w-0"><CategoryIcon category={brand?.category} size="sm" />
                <div className="min-w-0"><div className="font-bold truncate">{brand?.name}</div><div className="text-[12px] text-[#7C8199]">{o.id} · {timeAgo(o.createdAt)}</div></div></div>
              <StatusChip status={o.status} />
            </div>
            <div className="text-[14px] text-[#4E5369]">{o.items.map((i) => `${i.qty} × ${i.name}`).join(', ')}</div>
            {o.status !== 'cancelled' && (
              <ol className="flex items-start" aria-label="Order progress">
                {flow.map((s, i) => (
                  <li key={s} className="flex-1 flex flex-col items-center gap-1 relative">
                    {i > 0 && <span className={`absolute top-3 right-1/2 w-full h-0.5 ${i <= idx ? 'bg-[#3B2FD9]' : 'bg-[#E8EAF2]'}`} />}
                    <span className={`relative w-6 h-6 rounded-full flex items-center justify-center ${i <= idx ? 'bg-[#3B2FD9] text-white' : 'bg-[#E8EAF2] text-[#7C8199]'}`}>{i <= idx ? <Check className="w-3.5 h-3.5" /> : <span className="text-[10px] font-bold">{i + 1}</span>}</span>
                    <span className={`text-[10px] text-center leading-tight px-0.5 ${i === idx ? 'text-[#111322] font-bold' : 'text-[#7C8199]'}`}>{STATUS_LABEL[s]}</span>
                  </li>
                ))}
              </ol>
            )}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#F0F1F6]">
              <div className="text-[13px]"><b className="text-[15px]">{rupees(orderTotal(o))}</b> <span className="text-[#7C8199]">· {o.payment === 'upi' ? 'Paid online' : 'Pay on delivery'}</span></div>
              {o.status === 'placed' && <button className="min-h-[44px] px-2 text-[14px] font-semibold text-[#C2410C]" onClick={() => setCancelId(o.id)}>Cancel</button>}
            </div>
          </article>
        );
      })}
      <Sheet open={!!cancelId} onClose={() => setCancelId(null)} title="Cancel this order?">
        <p className="text-[14px] text-[#4E5369] mb-4">The store hasn’t accepted it yet. {mine.find((o) => o.id === cancelId)?.payment === 'upi' ? 'Your payment will be refunded.' : ''}</p>
        <div className="grid gap-2">
          <button className="btn w-full h-12 bg-[#C2410C] text-white" onClick={() => { cancelOrder(cancelId); setCancelId(null); }}>Yes, cancel order</button>
          <button className="btn btn-ghost w-full h-12" onClick={() => setCancelId(null)}>Keep order</button>
        </div>
      </Sheet>
    </div>
  );
}

