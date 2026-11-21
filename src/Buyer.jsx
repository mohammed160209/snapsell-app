import React, { useMemo, useState } from 'react';
import { ArrowLeft, Check, Home, Recycle, MapPin, Minus, Package, Plus, Search, ShieldCheck, ShoppingCart, Star, Store, Truck } from 'lucide-react';
import { CATEGORIES, DELIVERY_FEE, STATUS_FLOW, STATUS_LABEL, orderSubtotal, orderTotal, rupees } from './data';
import { useStore } from './store';
import Secondhand from './Secondhand';
import { BottomNav, CategoryIcon, Empty, Header, Page, StatusChip, catOf, timeAgo } from './ui';

export default function Buyer() {
  const { cart, orders, me } = useStore();
  const [tab, setTab] = useState('home');
  const [view, setView] = useState(null); // { type: 'brand'|'product', id }
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const active = orders.filter((o) => o.buyerId === me.id && !['delivered', 'cancelled'].includes(o.status)).length;
  const go = (t) => { setTab(t); setView(null); window.scrollTo(0, 0); };
  const open = (v) => { setView(v); window.scrollTo(0, 0); };

  return (
    <>
      <Header sub="Shopping near you" />
      <BottomNav active={tab} onChange={go} tabs={[
        { id: 'home', label: 'Local brands', icon: Home },
        { id: 'secondhand', label: 'Secondhand', icon: Recycle },
        { id: 'cart', label: 'Cart', icon: ShoppingCart, badge: cartCount },
        { id: 'orders', label: 'Orders', icon: Package, badge: active },
      ]} />
      <Page>
        {view?.type === 'product' && <ProductDetail id={view.id} onBack={() => setView(null)} openBrand={(id) => open({ type: 'brand', id })} goCart={() => go('cart')} />}
        {view?.type === 'brand' && <BrandStore id={view.id} onBack={() => setView(null)} openProduct={(id) => open({ type: 'product', id })} />}
        {!view && tab === 'home' && <Shop open={open} />}
        {!view && tab === 'secondhand' && <Secondhand />}
        {!view && tab === 'cart' && <Cart onDone={() => go('orders')} onShop={() => go('home')} />}
        {!view && tab === 'orders' && <Orders onShop={() => go('home')} />}
      </Page>
    </>
  );
}

function ProductCard({ p, onOpen }) {
  const { brands, addToCart } = useStore();
  const brand = brands.find((b) => b.id === p.brandId);
  const out = p.stock === 0;
  return (
    <div className="card p-2.5 flex flex-col">
      <button onClick={onOpen} className="text-left">
        <CategoryIcon category={p.category} />
        <div className="text-[11px] text-[#7C8199] mt-2 truncate">{brand?.name} · {brand?.area}</div>
        <div className="text-[14px] font-semibold leading-snug line-clamp-2 min-h-[38px]">{p.name}</div>
      </button>
      <div className="flex items-center justify-between mt-2">
        <div><div className="font-bold">{rupees(p.price)}</div><div className="text-[11px] text-[#7C8199]">{p.unit}</div></div>
        {out ? <span className="chip bg-[#F1F1F4] text-[#7C8199]">Sold out</span>
          : <button onClick={() => addToCart(p.id)} className="w-9 h-9 rounded-[10px] bg-[#3B2FD9] text-white flex items-center justify-center" aria-label={`Add ${p.name} to cart`}><Plus className="w-4 h-4" /></button>}
      </div>
      {!out && p.stock <= 3 && <div className="text-[11px] text-[#C2410C] font-semibold mt-1">Only {p.stock} left</div>}
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

  return (
    <div className="grid gap-5">
      <div className="flex items-center gap-1.5 text-[13px] text-[#4E5369]"><MapPin className="w-4 h-4 text-[#FF5A3D]" /> Delivering to <b>{me.area}</b> · within 5 km</div>
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7C8199]" />
        <input className="input pl-10 h-12" placeholder="Search sourdough, candles, plants…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        <button onClick={() => setCat('all')} className={`chip h-9 px-4 text-[13px] whitespace-nowrap ${cat === 'all' ? 'bg-[#3B2FD9] text-white' : 'bg-white border border-[#E8EAF2]'}`}>All</button>
        {CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => setCat(c.id)} className={`chip h-9 px-4 text-[13px] whitespace-nowrap ${cat === c.id ? 'bg-[#3B2FD9] text-white' : 'bg-white border border-[#E8EAF2]'}`}>{c.name}</button>
        ))}
      </div>
      {q === '' && cat === 'all' && (
        <section>
          <h2 className="text-[17px] font-bold mb-3">Local brands near you</h2>
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4">
            {liveBrands.map((b) => (
              <button key={b.id} onClick={() => open({ type: 'brand', id: b.id })} className="card p-3 min-w-[220px] text-left flex gap-3 items-center hover:border-[#3B2FD9]">
                <CategoryIcon category={b.category} size="sm" />
                <div className="min-w-0"><div className="font-bold truncate">{b.name}</div>
                  <div className="text-[12px] text-[#7C8199] flex items-center gap-1"><Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />{b.rating} · {b.area}</div></div>
              </button>
            ))}
          </div>
        </section>
      )}
      <section>
        <h2 className="text-[17px] font-bold mb-3">{q || cat !== 'all' ? `${list.length} results` : 'Fresh from local makers'}</h2>
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
      <button onClick={onBack} className="flex items-center gap-1 text-[13px] font-semibold text-[#4E5369]"><ArrowLeft className="w-4 h-4" /> Back</button>
      <div className="card p-5 flex gap-4 items-center">
        <CategoryIcon category={b.category} size="sm" />
        <div className="min-w-0">
          <h1 className="text-[22px] font-extrabold">{b.name}</h1>
          <div className="text-[13px] text-[#4E5369]">{b.tagline}</div>
          <div className="flex flex-wrap gap-2 mt-2 text-[12px]">
            <span className="chip bg-[#FEF6E4] text-[#B45309]"><Star className="w-3 h-3" />{b.rating}</span>
            <span className="chip bg-[#EEF0FF] text-[#3B2FD9]"><MapPin className="w-3 h-3" />{b.area}</span>
            {b.delivery && <span className="chip bg-[#E7F7EE] text-[#157F3E]"><Truck className="w-3 h-3" />Delivers</span>}
            {b.pickup && <span className="chip bg-[#F1F1F4] text-[#4E5369]"><Store className="w-3 h-3" />Pickup</span>}
          </div>
        </div>
      </div>
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
  return (
    <div className="grid gap-4">
      <button onClick={onBack} className="flex items-center gap-1 text-[13px] font-semibold text-[#4E5369]"><ArrowLeft className="w-4 h-4" /> Back</button>
      <div className="grid md:grid-cols-2 gap-5">
        <CategoryIcon category={p.category} size="lg" />
        <div className="grid gap-3 content-start">
          <span className="chip bg-[#EEF0FF] text-[#3B2FD9] w-fit">{catOf(p.category).name}</span>
          <h1 className="text-[24px] font-extrabold leading-tight">{p.name}</h1>
          <div className="text-[26px] font-extrabold">{rupees(p.price)} <span className="text-[14px] font-medium text-[#7C8199]">/ {p.unit}</span></div>
          <p className="text-[14px] text-[#4E5369]">{p.desc}</p>
          <button onClick={() => openBrand(b.id)} className="card p-3 flex items-center gap-3 text-left hover:border-[#3B2FD9]">
            <CategoryIcon category={b.category} size="sm" />
            <div><div className="font-bold">{b.name}</div><div className="text-[12px] text-[#7C8199]">{b.area} · ★ {b.rating} · View store</div></div>
          </button>
          {p.stock === 0 ? <div className="chip bg-[#F1F1F4] text-[#7C8199] w-fit">Sold out</div> : (
            <>
              <div className="text-[13px] text-[#157F3E] font-semibold">{p.stock} in stock{inCart > 0 && ` · ${inCart} in your cart`}</div>
              <div className="flex gap-3">
                <div className="flex items-center border border-[#E8EAF2] rounded-[12px] bg-white">
                  <button className="w-11 h-12 flex items-center justify-center" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease"><Minus className="w-4 h-4" /></button>
                  <span className="w-8 text-center font-bold">{qty}</span>
                  <button className="w-11 h-12 flex items-center justify-center" onClick={() => setQty(Math.min(p.stock - inCart, qty + 1))} aria-label="Increase"><Plus className="w-4 h-4" /></button>
                </div>
                <button className="btn btn-primary flex-1 h-12" disabled={inCart >= p.stock} onClick={() => { addToCart(p.id, qty); goCart(); }}>Add to cart · {rupees(p.price * qty)}</button>
              </div>
            </>
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
  const pickupOk = groups.every((id) => brands.find((b) => b.id === id)?.pickup);
  const fee = fulfilment === 'delivery' ? DELIVERY_FEE * groups.length : 0;

  if (lines.length === 0) return <Empty icon={ShoppingCart} title="Your cart is empty" body="Add something from a local brand near you." action={<button className="btn btn-primary" onClick={onShop}>Browse the shop</button>} />;

  const pay = () => {
    setPaying(true);
    setTimeout(() => { placeOrders({ fulfilment, address: fulfilment === 'pickup' ? 'Pickup from store' : address, payment }); setPaying(false); onDone(); }, payment === 'upi' ? 1400 : 400);
  };

  return (
    <div className="grid md:grid-cols-[1fr_340px] gap-5 items-start">
      <div className="grid gap-3">
        <h1 className="text-[22px] font-extrabold">Your cart</h1>
        {groups.map((bid) => (
          <div key={bid} className="card p-4 grid gap-3">
            <div className="font-bold flex items-center gap-2"><Store className="w-4 h-4 text-[#3B2FD9]" />{brands.find((b) => b.id === bid)?.name}</div>
            {lines.filter((l) => l.p.brandId === bid).map((l) => (
              <div key={l.productId} className="flex items-center gap-3">
                <CategoryIcon category={l.p.category} size="sm" />
                <div className="flex-1 min-w-0"><div className="text-[14px] font-semibold truncate">{l.p.name}</div><div className="text-[12px] text-[#7C8199]">{rupees(l.p.price)} · {l.p.unit}</div></div>
                <div className="flex items-center border border-[#E8EAF2] rounded-[10px]">
                  <button className="w-8 h-8 flex items-center justify-center" onClick={() => setCartQty(l.productId, l.qty - 1)} aria-label="Decrease"><Minus className="w-3.5 h-3.5" /></button>
                  <span className="w-6 text-center text-[14px] font-bold">{l.qty}</span>
                  <button className="w-8 h-8 flex items-center justify-center" onClick={() => setCartQty(l.productId, Math.min(l.p.stock, l.qty + 1))} aria-label="Increase"><Plus className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="card p-4 grid gap-3 md:sticky md:top-20">
        <div className="font-bold">How do you want it?</div>
        <div className="grid grid-cols-2 gap-2">
          {[['delivery', 'Delivery', Truck], ['pickup', 'Pickup', Store]].map(([id, label, Icon]) => (
            <button key={id} disabled={id === 'pickup' && !pickupOk} onClick={() => setFulfilment(id)}
              className={`h-11 rounded-[12px] border text-[13px] font-semibold flex items-center justify-center gap-1.5 disabled:opacity-40 ${fulfilment === id ? 'border-[#3B2FD9] bg-[#EEF0FF] text-[#3B2FD9]' : 'border-[#E8EAF2]'}`}><Icon className="w-4 h-4" />{label}</button>
          ))}
        </div>
        {!pickupOk && <div className="text-[12px] text-[#7C8199]">One of these brands only delivers.</div>}
        {fulfilment === 'delivery' && <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} aria-label="Delivery address" />}
        <div className="font-bold mt-1">Payment</div>
        {[['upi', 'UPI / card (Razorpay)'], ['cod', 'Pay on delivery']].map(([id, label]) => (
          <label key={id} className={`flex items-center gap-2 p-3 rounded-[12px] border cursor-pointer text-[14px] ${payment === id ? 'border-[#3B2FD9] bg-[#F8F8FF]' : 'border-[#E8EAF2]'}`}>
            <input type="radio" checked={payment === id} onChange={() => setPayment(id)} className="accent-[#3B2FD9]" />{label}
          </label>
        ))}
        <div className="border-t border-[#E8EAF2] pt-3 grid gap-1 text-[14px]">
          <div className="flex justify-between"><span>Items</span><span>{rupees(subtotal)}</span></div>
          <div className="flex justify-between"><span>Delivery{groups.length > 1 && ` (${groups.length} stores)`}</span><span>{fee ? rupees(fee) : 'Free'}</span></div>
          <div className="flex justify-between font-extrabold text-[17px] mt-1"><span>Total</span><span>{rupees(subtotal + fee)}</span></div>
        </div>
        <button className="btn btn-primary h-12 w-full" disabled={paying} onClick={pay}>
          {paying ? 'Processing payment…' : payment === 'upi' ? `Pay ${rupees(subtotal + fee)}` : 'Place order'}
        </button>
        <div className="text-[11px] text-[#7C8199] flex items-center gap-1 justify-center"><ShieldCheck className="w-3.5 h-3.5 text-[#157F3E]" />Demo checkout · no real money is charged</div>
      </div>
    </div>
  );
}

function Orders({ onShop }) {
  const { orders, brands, me, cancelOrder } = useStore();
  const mine = orders.filter((o) => o.buyerId === me.id);
  if (mine.length === 0) return <Empty icon={Package} title="No orders yet" body="When you order from a local brand, you can track it here." action={<button className="btn btn-primary" onClick={onShop}>Start shopping</button>} />;
  return (
    <div className="grid gap-3">
      <h1 className="text-[22px] font-extrabold">Your orders</h1>
      {mine.map((o) => {
        const flow = STATUS_FLOW[o.fulfilment];
        const idx = flow.indexOf(o.status);
        return (
          <div key={o.id} className="card p-4 grid gap-3">
            <div className="flex items-start justify-between gap-2">
              <div><div className="font-bold">{brands.find((b) => b.id === o.brandId)?.name}</div><div className="text-[12px] text-[#7C8199]">{o.id} · {timeAgo(o.createdAt)} · {o.payment === 'upi' ? 'Paid online' : 'Pay on delivery'}</div></div>
              <StatusChip status={o.status} />
            </div>
            <div className="text-[13px] text-[#4E5369]">{o.items.map((i) => `${i.qty} × ${i.name}`).join(', ')}</div>
            {o.status !== 'cancelled' && (
              <div className="flex items-center">
                {flow.map((s, i) => (
                  <React.Fragment key={s}>
                    <div className="flex flex-col items-center gap-1 w-16 shrink-0">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${i <= idx ? 'bg-[#3B2FD9] text-white' : 'bg-[#E8EAF2] text-[#7C8199]'}`}>{i <= idx ? <Check className="w-3.5 h-3.5" /> : <span className="text-[10px]">{i + 1}</span>}</div>
                      <div className={`text-[10px] text-center leading-tight ${i <= idx ? 'text-[#111322] font-semibold' : 'text-[#7C8199]'}`}>{STATUS_LABEL[s]}</div>
                    </div>
                    {i < flow.length - 1 && <div className={`flex-1 h-0.5 -mt-4 ${i < idx ? 'bg-[#3B2FD9]' : 'bg-[#E8EAF2]'}`} />}
                  </React.Fragment>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="font-bold">{rupees(orderTotal(o))} <span className="text-[12px] font-medium text-[#7C8199]">({rupees(orderSubtotal(o))} + delivery)</span></div>
              {o.status === 'placed' && <button className="text-[13px] font-semibold text-[#C2410C]" onClick={() => cancelOrder(o.id)}>Cancel order</button>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
