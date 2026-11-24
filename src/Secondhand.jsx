import React, { useState } from 'react';
import { Camera, Check, Handshake, ImagePlus, Loader2, MapPin, MessageCircle, Package, Search, Send, ShieldCheck, Sparkles, Tag, Truck } from 'lucide-react';
import { AI_QUESTIONS, AI_TEMPLATES, CONDITIONS, DEMO_HANDOVER_CODE, PEOPLE, SH_CATEGORIES, SH_COMMISSION_RATE, rupees } from './data';
import { useStore } from './store';
import { ActionBar, Empty, ScreenTitle, TopBar, timeAgo } from './ui';

const person = (id, users) => PEOPLE[id] || { name: users.find((u) => u.id === id)?.name || 'Neighbour', area: users.find((u) => u.id === id)?.area || '', deals: 0 };

const DEAL_LABEL = {
  requested: ['Request sent', 'bg-[#FFF1EE] text-[#C2410C]'],
  accepted: ['Meet & hand over', 'bg-[#EEF0FF] text-[#3B2FD9]'],
  paid: ['Paid · awaiting shipping', 'bg-[#FEF6E4] text-[#B45309]'],
  shipped: ['Shipped', 'bg-[#FEF6E4] text-[#B45309]'],
  completed: ['Completed', 'bg-[#E7F7EE] text-[#157F3E]'],
  received: ['Received', 'bg-[#E7F7EE] text-[#157F3E]'],
  cancelled: ['Cancelled', 'bg-[#F1F1F4] text-[#7C8199]'],
  disputed: ['Under review', 'bg-[#FCEEF5] text-[#BE185D]'],
};
const DealChip = ({ status }) => <span className={`chip ${DEAL_LABEL[status][1]}`}>{DEAL_LABEL[status][0]}</span>;
const Cond = ({ c }) => <span className={`chip ${CONDITIONS[c].cls}`}>{CONDITIONS[c].label}</span>;
const Photo = ({ src, className = '' }) => (
  <div className={`bg-[#EEF0FF] overflow-hidden flex items-center justify-center text-[#3B2FD9] ${className}`}>
    {src ? <img src={src} alt="" className="w-full h-full object-cover" /> : <Package className="w-8 h-8" />}
  </div>
);

export default function Secondhand() {
  const { me, deals } = useStore();
  const [section, setSection] = useState('browse'); // browse | mine | deals
  const [view, setView] = useState(null); // { type: 'listing'|'sell'|'chat', id, otherId }
  const open = (v) => { setView(v); window.scrollTo(0, 0); };
  const back = () => setView(null);
  const actionable = deals.filter((d) => (d.sellerId === me.id && ['requested', 'accepted', 'paid'].includes(d.status)) || (d.buyerId === me.id && ['accepted', 'shipped'].includes(d.status))).length;

  if (view?.type === 'sell') return <SellFlow onDone={() => { setView(null); setSection('mine'); }} onBack={back} />;
  if (view?.type === 'listing') return <ListingDetail id={view.id} onBack={back} open={open} goDeals={() => { setView(null); setSection('deals'); }} />;
  if (view?.type === 'chat') return <Chat listingId={view.id} otherId={view.otherId} onBack={back} />;

  return (
    <div className="grid gap-4">
      <ScreenTitle sub="Buy and sell with people near you" right={<button className="btn btn-coral max-md:hidden" onClick={() => open({ type: 'sell' })}><Camera className="w-4 h-4" />Sell an item</button>}>Secondhand</ScreenTitle>
      <div className="grid grid-cols-3 gap-1 p-1 rounded-[14px] bg-[#EDEEF4] md:max-w-md" role="tablist" aria-label="Secondhand sections">
        {[['browse', 'Browse'], ['mine', 'My listings'], ['deals', 'Deals']].map(([id, l]) => (
          <button key={id} role="tab" aria-selected={section === id} onClick={() => setSection(id)} className={`h-10 rounded-[11px] text-[14px] font-semibold flex items-center justify-center gap-1 transition-colors ${section === id ? 'bg-white shadow-sm text-[#111322]' : 'text-[#4E5369]'}`}>
            {l}{id === 'deals' && actionable > 0 && <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF5A3D] text-white text-[10px] inline-flex items-center justify-center">{actionable}</span>}
          </button>
        ))}
      </div>
      <button className="md:hidden fixed right-4 bottom-[calc(72px+env(safe-area-inset-bottom))] z-20 btn btn-coral h-14 rounded-full pl-4 pr-5 text-[16px] shadow-[0_8px_24px_rgba(255,90,61,.45)]" onClick={() => open({ type: 'sell' })}><Camera className="w-5 h-5" />Sell</button>
      {section === 'browse' && <Feed open={open} />}
      {section === 'mine' && <MyListings open={open} />}
      {section === 'deals' && <Deals open={open} />}
    </div>
  );
}

function ListingCard({ l, onOpen, showStatus }) {
  const { users } = useStore();
  return (
    <button onClick={onOpen} className="card p-2 text-left flex flex-col md:hover:border-[#3B2FD9] active:bg-[#FAFAFE] transition">
      <div className="relative">
        <Photo src={l.photo} className="w-full aspect-[4/3] rounded-[12px]" />
        {l.aiWritten && <span className="absolute top-2 left-2 chip bg-white/95 text-[#3B2FD9] text-[10px]"><Sparkles className="w-3 h-3" />AI-written</span>}
        {showStatus && l.status !== 'active' && <span className="absolute top-2 right-2 chip bg-[#111322] text-white text-[10px] capitalize">{l.status}</span>}
      </div>
      <div className="font-extrabold text-[16px] mt-2">{rupees(l.price)}</div>
      <div className="text-[13px] font-semibold leading-snug line-clamp-2 min-h-[36px]">{l.title}</div>
      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap"><Cond c={l.condition} /><span className="chip bg-[#F1F1F4] text-[#4E5369] text-[10px]">{l.mode === 'ship' ? <><Truck className="w-3 h-3" />Ships</> : <><Handshake className="w-3 h-3" />Meet</>}</span></div>
      <div className="text-[11px] text-[#7C8199] mt-1.5 flex items-center gap-1"><MapPin className="w-3 h-3" />{l.area} · {timeAgo(l.createdAt)} · {person(l.sellerId, users).name.split(' ')[0]}</div>
    </button>
  );
}

function Feed({ open }) {
  const { listings, me } = useStore();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const list = listings.filter((l) => l.status === 'active' && l.sellerId !== me.id && (cat === 'all' || l.category === cat) && l.title.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <div className="rounded-[16px] p-3.5 bg-[#EEF0FF] flex gap-3 items-center">
        <ShieldCheck className="w-6 h-6 text-[#3B2FD9] shrink-0" />
        <div className="text-[13px] leading-snug text-[#2E23B8]"><b>Meet and check before you pay,</b> or get it shipped with payment held until you receive it.</div>
      </div>
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7C8199]" />
        <input className="input pl-11 rounded-[14px]" type="search" enterKeyHint="search" placeholder="Search study table, cycle, cooler…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search secondhand items" />
      </div>
      <div className="rail">
        {[{ id: 'all', name: 'All' }, ...SH_CATEGORIES].map((c) => (
          <button key={c.id} className="pill" aria-pressed={cat === c.id} onClick={() => setCat(c.id)}>{c.name}</button>
        ))}
      </div>
      <div className="text-[13px] text-[#4E5369] -mb-1">{list.length} items near {me.area}</div>
      {list.length === 0 ? <Empty icon={Search} title="Nothing matches yet" body="Try another category, or list something of your own." />
        : <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{list.map((l) => <ListingCard key={l.id} l={l} onOpen={() => open({ type: 'listing', id: l.id })} />)}</div>}
    </>
  );
}

function ListingDetail({ id, onBack, open, goDeals }) {
  const { listings, users, me, deals, startDeal, updateListing } = useStore();
  const [paying, setPaying] = useState(false);
  const l = listings.find((x) => x.id === id);
  const seller = person(l.sellerId, users);
  const mine = l.sellerId === me.id;
  const myDeal = deals.find((d) => d.listingId === id && d.buyerId === me.id && d.status !== 'cancelled');
  const buyShip = () => { setPaying(true); setTimeout(() => { startDeal(id, 'app'); setPaying(false); goDeals(); }, 1300); };
  return (
    <div>
      <TopBar title={mine ? 'Your listing' : seller.name} onBack={onBack} />
      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        <div className="-mx-4 -mt-3 md:m-0"><Photo src={l.photo} className="w-full aspect-[4/3] md:rounded-[16px]" /></div>
        <div className="grid gap-3 content-start">
          <div className="flex items-center gap-2 flex-wrap"><Cond c={l.condition} />{l.aiWritten && <span className="chip bg-[#EEF0FF] text-[#3B2FD9]"><Sparkles className="w-3 h-3" />Written with AI, checked by seller</span>}</div>
          <h1 className="text-[22px] font-extrabold leading-tight">{l.title}</h1>
          <div className="text-[26px] font-extrabold">{rupees(l.price)}</div>
          <p className="text-[15px] leading-relaxed text-[#4E5369]">{l.desc}</p>
          {l.facts?.length > 0 && (
            <div className="card p-3"><div className="text-[12px] font-semibold text-[#7C8199] mb-1">Confirmed by seller</div>
              {l.facts.map((f) => <div key={f} className="text-[13px] flex gap-2 items-center py-0.5"><Check className="w-3.5 h-3.5 text-[#157F3E]" />{f}</div>)}</div>
          )}
          <div className="card p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FFF1EE] text-[#C2410C] font-bold flex items-center justify-center">{seller.name[0]}</div>
            <div className="flex-1"><div className="font-bold">{mine ? 'You' : seller.name}</div><div className="text-[12px] text-[#7C8199]">{l.area} · {seller.deals} completed deals</div></div>
          </div>
          <div className="text-[13px] text-[#4E5369] flex gap-2 items-start">
            {l.mode === 'ship' ? <><Truck className="w-4 h-4 mt-0.5 shrink-0 text-[#3B2FD9]" />Ships to you. You pay online; the seller is paid only after you mark it received.</> : <><Handshake className="w-4 h-4 mt-0.5 shrink-0 text-[#3B2FD9]" />Meet in person, check the item, then pay cash or in the app.</>}
          </div>
          {mine ? (
            <ActionBar>
              {l.status === 'active' && <button className="btn btn-ghost flex-1 h-12" onClick={() => updateListing(id, { status: 'hidden' })}>Hide listing</button>}
              {l.status === 'hidden' && <button className="btn btn-ghost flex-1 h-12" onClick={() => updateListing(id, { status: 'active' })}>Show listing</button>}
              {l.status !== 'sold' && <button className="btn btn-primary flex-1 h-12" onClick={() => updateListing(id, { status: 'sold' })}>Mark as sold</button>}
              {l.status === 'sold' && <button className="btn btn-ghost flex-1 h-12" disabled>Sold</button>}
            </ActionBar>
          ) : myDeal ? (
            <ActionBar><button className="btn btn-primary flex-1 h-12" onClick={goDeals}>View your deal</button></ActionBar>
          ) : l.status !== 'active' ? (
            <ActionBar><button className="btn btn-ghost flex-1 h-12 capitalize" disabled>This item is {l.status}</button></ActionBar>
          ) : (
            <ActionBar note={l.mode === 'ship' ? 'Payment is held until you mark the item received' : 'No payment until you’ve seen the item'}>
              <button className="btn btn-ghost h-12" onClick={() => open({ type: 'chat', id, otherId: l.sellerId })}><MessageCircle className="w-4 h-4" />Message</button>
              {l.mode === 'ship'
                ? <button className="btn btn-primary h-12 flex-1" disabled={paying} onClick={buyShip}>{paying ? <><Loader2 className="w-4 h-4 animate-spin" />Processing…</> : `Buy & pay ${rupees(l.price)}`}</button>
                : <button className="btn btn-primary h-12 flex-1" onClick={() => { startDeal(id, 'cash'); goDeals(); }}>Request to buy</button>}
            </ActionBar>
          )}
        </div>
      </div>
    </div>
  );
}

function SellFlow({ onDone, onBack }) {
  const { createListing, me } = useStore();
  const [step, setStep] = useState(1);
  const [cat, setCat] = useState('furniture');
  const [photos, setPhotos] = useState(0);
  const [answers, setAnswers] = useState({});
  const [draft, setDraft] = useState(null);
  const [mode, setMode] = useState('meet');
  const [err, setErr] = useState('');
  const t = AI_TEMPLATES[cat];

  const analyse = () => {
    if (photos === 0) return setErr('Add at least one photo');
    setErr(''); setStep(2); setTimeout(() => setStep(3), 1300);
  };
  const write = () => {
    if (AI_QUESTIONS.some((q) => !answers[q.id])) return setErr('Answer all three questions');
    const cond = answers.defects === 'None' ? (['Under 6 months', '6–18 months'].includes(answers.age) ? 'like_new' : 'good') : answers.defects === 'Needs repair' ? 'for_parts' : answers.defects === 'Visible wear' ? 'fair' : 'good';
    const facts = [`Age: ${answers.age}`, answers.defects === 'None' ? 'No defects' : answers.defects, answers.included];
    setErr(''); setDraft({ title: t.title, desc: t.desc, price: String(Math.round((t.low + t.high) / 2 / 50) * 50), condition: cond, facts }); setStep(4);
  };
  const publish = () => {
    if (!draft.title.trim()) return setErr('Add a title');
    if (!(Number(draft.price) > 0)) return setErr('Enter a price above ₹0');
    createListing({ title: draft.title, desc: draft.desc, price: Number(draft.price), condition: draft.condition, facts: draft.facts, category: cat, photo: t.photo, mode, area: me.area, aiWritten: true });
    onDone();
  };
  const price = Number(draft?.price || 0);

  return (
    <div className="grid gap-4 max-w-xl md:card md:p-5">
      <TopBar title="Sell an item" onBack={step === 1 ? onBack : () => { setErr(''); setStep(step === 4 ? 3 : step === 5 ? 4 : 1); }} right={<span className="text-[13px] font-semibold text-[#7C8199] pr-3">Step {{ 1: 1, 2: 2, 3: 2, 4: 3, 5: 4 }[step]} of 4</span>} />
      <div className="flex gap-1.5 -mt-2" aria-hidden="true">{[1, 2, 3, 4].map((n) => <span key={n} className={`h-1.5 flex-1 rounded-full ${n <= { 1: 1, 2: 2, 3: 2, 4: 3, 5: 4 }[step] ? 'bg-[#FF5A3D]' : 'bg-[#E8EAF2]'}`} />)}</div>
      {step === 1 && (
        <>
          <h1 className="text-[24px] font-extrabold tracking-tight">Snap your item</h1>
          <p className="text-[14px] text-[#4E5369] -mt-2">Pick a category and add up to 3 photos. AI writes the rest.</p>
          <div className="flex gap-2 flex-wrap">{SH_CATEGORIES.map((c) => <button key={c.id} onClick={() => { setCat(c.id); setPhotos(0); }} className="pill" aria-pressed={cat === c.id}>{c.name}</button>)}</div>
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => i < photos
              ? <Photo key={i} src={t.photo} className="aspect-square rounded-[12px]" />
              : <button key={i} onClick={() => setPhotos(photos + 1)} className="aspect-square rounded-[12px] border-2 border-dashed border-[#D6DAFF] text-[#3B2FD9] flex flex-col items-center justify-center gap-1 text-[12px] font-semibold"><ImagePlus className="w-6 h-6" />{i === photos ? 'Add photo' : ''}</button>)}
          </div>
          <div className="text-[12px] text-[#7C8199]">Tips: good daylight, show any scratches, include the brand label.</div>
          {err && <div className="text-[13px] text-[#C2410C]">{err}</div>}
          <ActionBar><button className="btn btn-coral flex-1 h-12" onClick={analyse}><Sparkles className="w-4 h-4" />Continue</button></ActionBar>
        </>
      )}
      {step === 2 && <div className="py-10 flex flex-col items-center gap-3 text-[#3B2FD9]"><Loader2 className="w-8 h-8 animate-spin" /><div className="font-semibold">Reading your photos…</div><div className="text-[12px] text-[#7C8199]">Identifying the item and checking for defects</div></div>}
      {step === 3 && (
        <>
          <div className="p-3 rounded-[12px] bg-[#EEF0FF] text-[#2E23B8] text-[14px] flex gap-2 items-center"><Sparkles className="w-4 h-4" />Looks like: <b>{t.guess}</b></div>
          {AI_QUESTIONS.map((q) => (
            <div key={q.id}><div className="text-[14px] font-semibold mb-1.5">{q.q}</div>
              <div className="flex flex-wrap gap-2">{q.options.map((o) => <button key={o} onClick={() => { setAnswers({ ...answers, [q.id]: o }); setErr(''); }} className="pill" aria-pressed={answers[q.id] === o}>{o}</button>)}</div></div>
          ))}
          {err && <div className="text-[13px] text-[#C2410C]">{err}</div>}
          <ActionBar><button className="btn btn-primary flex-1 h-12" onClick={write}><Sparkles className="w-4 h-4" />Write my listing</button></ActionBar>
        </>
      )}
      {step === 4 && draft && (
        <>
          <h1 className="text-[24px] font-extrabold tracking-tight">Review your listing</h1>
          <span className="chip bg-[#EEF0FF] text-[#3B2FD9] w-fit"><Sparkles className="w-3 h-3" />Written with AI, edit anything</span>
          <label className="grid gap-1.5 text-[14px] font-semibold">Title<input className="input" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></label>
          <label className="grid gap-1.5 text-[14px] font-semibold">Description<textarea className="input h-28 py-3 leading-relaxed" value={draft.desc} onChange={(e) => setDraft({ ...draft, desc: e.target.value })} /></label>
          <div><div className="text-[13px] font-semibold mb-1.5">Condition</div><div className="flex gap-2 flex-wrap">{Object.entries(CONDITIONS).map(([k, v]) => <button key={k} onClick={() => setDraft({ ...draft, condition: k })} className="pill" aria-pressed={draft.condition === k}>{v.label}</button>)}</div></div>
          <label className="grid gap-1.5 text-[14px] font-semibold">Price (₹)<input className="input" inputMode="numeric" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} /></label>
          <div className="text-[12px] text-[#157F3E] -mt-2">Similar items sell for {rupees(t.low)}–{rupees(t.high)} nearby</div>
          {err && <div className="text-[13px] text-[#C2410C]">{err}</div>}
          <ActionBar><button className="btn btn-primary flex-1 h-12" onClick={() => { setErr(''); setStep(5); }}>Next: how to sell</button></ActionBar>
        </>
      )}
      {step === 5 && (
        <>
          <h1 className="text-[24px] font-extrabold tracking-tight">How do you want to sell?</h1>
          {[['meet', Handshake, 'Meet in person', 'Buyer checks the item, then pays cash or in the app. Best for big or expensive items.'], ['ship', Truck, 'Ship it', 'Buyer pays online first. Ship within 48 hours; you get paid when they mark it received.']].map(([id, Icon, title, body]) => (
            <button key={id} onClick={() => setMode(id)} className={`text-left p-4 rounded-[14px] border flex gap-3 ${mode === id ? 'border-[#3B2FD9] bg-[#F8F8FF]' : 'border-[#E8EAF2]'}`}>
              <Icon className="w-5 h-5 text-[#3B2FD9] shrink-0 mt-0.5" /><div><div className="font-bold">{title}</div><div className="text-[13px] text-[#4E5369]">{body}</div></div>
            </button>
          ))}
          <div className="card p-3 text-[13px] grid gap-1">
            {mode === 'meet' && <div className="flex justify-between"><span>If paid in cash</span><b>{rupees(price)}</b></div>}
            <div className="flex justify-between"><span>If paid in the app (after {SH_COMMISSION_RATE * 100}% fee)</span><b>{rupees(price * (1 - SH_COMMISSION_RATE))}</b></div>
          </div>
          <ActionBar><button className="btn btn-coral flex-1 h-12" onClick={publish}><Tag className="w-4 h-4" />Publish listing</button></ActionBar>
        </>
      )}
    </div>
  );
}

function MyListings({ open }) {
  const { listings, me } = useStore();
  const mine = listings.filter((l) => l.sellerId === me.id);
  if (mine.length === 0) return <Empty icon={Camera} title="List your first item in 2 minutes" body="Snap a photo, answer three questions, and AI writes the listing for you." />;
  return <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{mine.map((l) => <ListingCard key={l.id} l={l} showStatus onOpen={() => open({ type: 'listing', id: l.id })} />)}</div>;
}

function DealCard({ d, open }) {
  const { listings, users, me, setDeal } = useStore();
  const [code, setCode] = useState('');
  const [ship, setShip] = useState({ courier: 'Delhivery', tracking: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const l = listings.find((x) => x.id === d.listingId);
  const title = l?.title || d.title;
  const isSeller = d.sellerId === me.id;
  const other = person(isSeller ? d.buyerId : d.sellerId, users);
  const payInApp = () => { setBusy(true); setTimeout(() => { setDeal(d.id, { status: 'completed', payment: 'app' }); setBusy(false); }, 1200); };

  return (
    <div className="card p-4 grid gap-3">
      <div className="flex gap-3">
        <Photo src={l?.photo || d.photo} className="w-16 h-16 rounded-[12px] shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2"><div className="font-bold leading-snug">{title}</div><DealChip status={d.status} /></div>
          <div className="text-[12px] text-[#7C8199] mt-0.5">{isSeller ? 'Buyer' : 'Seller'}: {other.name} · {rupees(d.price)} · {d.mode === 'ship' ? 'Shipped' : 'Meet in person'} · {timeAgo(d.createdAt)}</div>
        </div>
      </div>

      {/* Buyer side */}
      {!isSeller && d.status === 'requested' && <div className="text-[13px] text-[#4E5369]">Waiting for {other.name.split(' ')[0]} to accept. You’ll get a message here.</div>}
      {!isSeller && d.status === 'accepted' && (
        <div className="grid gap-2">
          <div className="p-3 rounded-[12px] bg-[#EEF0FF] text-center"><div className="text-[12px] text-[#2E23B8]">Show this code to the seller at handover</div><div className="text-[28px] font-extrabold tracking-[0.4em] text-[#3B2FD9]">{d.code}</div></div>
          <div className="flex gap-2">
            <button className="btn btn-ghost flex-1" onClick={() => setDeal(d.id, { status: 'completed', payment: 'cash' })}>Paid cash · got it</button>
            <button className="btn btn-primary flex-1" disabled={busy} onClick={payInApp}>{busy ? 'Processing…' : `Pay ${rupees(d.price)} in app`}</button>
          </div>
        </div>
      )}
      {!isSeller && d.status === 'paid' && <div className="text-[13px] text-[#4E5369]">Payment held safely. The seller ships within 48 hours.</div>}
      {!isSeller && d.status === 'shipped' && (
        <div className="grid gap-2">
          <div className="text-[13px] flex items-center gap-2"><Truck className="w-4 h-4 text-[#B45309]" />{d.courier} · <span className="font-mono">{d.tracking}</span></div>
          <div className="flex gap-2"><button className="btn btn-primary flex-1" onClick={() => setDeal(d.id, { status: 'received' })}>I received it</button><button className="btn btn-ghost" onClick={() => setDeal(d.id, { status: 'disputed' })}>Report a problem</button></div>
        </div>
      )}

      {/* Seller side */}
      {isSeller && d.status === 'requested' && (
        <div className="flex gap-2"><button className="btn btn-primary flex-1" onClick={() => setDeal(d.id, { status: 'accepted' })}>Accept request</button><button className="btn btn-ghost" onClick={() => setDeal(d.id, { status: 'cancelled' })}>Decline</button></div>
      )}
      {isSeller && d.status === 'accepted' && (
        <div className="grid gap-2">
          <div className="text-[13px] text-[#4E5369]">At the meetup, enter the 4-digit code the buyer shows you. <span className="text-[#7C8199]">(Demo: {DEMO_HANDOVER_CODE})</span></div>
          <div className="flex gap-2"><input className="input text-center tracking-[0.4em] font-bold" maxLength={4} inputMode="numeric" placeholder="••••" value={code} onChange={(e) => { setCode(e.target.value); setErr(''); }} />
            <button className="btn btn-primary" onClick={() => (code === d.code ? setDeal(d.id, { status: 'completed' }) : setErr('Code doesn’t match'))}>Confirm handover</button></div>
          {err && <div className="text-[13px] text-[#C2410C]">{err}</div>}
        </div>
      )}
      {isSeller && d.status === 'paid' && (
        <div className="grid gap-2">
          <div className="text-[13px] text-[#4E5369]">Buyer has paid. Ship within 48 hours and add tracking.</div>
          <div className="flex gap-2"><input className="input w-36" value={ship.courier} onChange={(e) => setShip({ ...ship, courier: e.target.value })} aria-label="Courier" /><input className="input" placeholder="Tracking number" value={ship.tracking} onChange={(e) => setShip({ ...ship, tracking: e.target.value })} /></div>
          <button className="btn btn-primary" onClick={() => (ship.tracking.trim() ? setDeal(d.id, { status: 'shipped', ...ship }) : setErr('Add the tracking number'))}>Mark as shipped</button>
          {err && <div className="text-[13px] text-[#C2410C]">{err}</div>}
        </div>
      )}
      {isSeller && d.status === 'shipped' && <div className="text-[13px] text-[#4E5369]">Waiting for the buyer to confirm delivery. Money is released when they do.</div>}
      {['completed', 'received'].includes(d.status) && (
        <div className="text-[13px] text-[#157F3E] flex items-center gap-1.5"><Check className="w-4 h-4" />
          {isSeller ? `Sold. ${d.payment === 'app' ? `You receive ${rupees(d.price * (1 - SH_COMMISSION_RATE))} after the ${SH_COMMISSION_RATE * 100}% fee.` : 'Paid in cash, no fee.'}` : 'Deal complete. Enjoy your item!'}</div>
      )}
      {l && !['cancelled'].includes(d.status) && <button className="text-[13px] font-semibold text-[#3B2FD9] flex items-center gap-1 w-fit" onClick={() => open({ type: 'chat', id: d.listingId, otherId: isSeller ? d.buyerId : d.sellerId })}><MessageCircle className="w-4 h-4" />Chat with {other.name.split(' ')[0]}</button>}
    </div>
  );
}

function Deals({ open }) {
  const { deals, me } = useStore();
  const [side, setSide] = useState('buying');
  const list = deals.filter((d) => (side === 'buying' ? d.buyerId === me.id : d.sellerId === me.id));
  return (
    <div className="grid gap-3">
      <div className="flex gap-2">{[['buying', 'Buying'], ['selling', 'Selling']].map(([id, l]) => <button key={id} onClick={() => setSide(id)} className="pill" aria-pressed={side === id}>{l} ({deals.filter((d) => (id === 'buying' ? d.buyerId === me.id : d.sellerId === me.id)).length})</button>)}</div>
      {list.length === 0 ? <Empty icon={Handshake} title={side === 'buying' ? 'No purchases yet' : 'No buyers yet'} body={side === 'buying' ? 'Request to buy an item and it will show here.' : 'When someone wants your item, the request shows here.'} />
        : list.map((d) => <DealCard key={d.id} d={d} open={open} />)}
    </div>
  );
}

function Chat({ listingId, otherId, onBack }) {
  const { messages, listings, users, me, sendMessage } = useStore();
  const [text, setText] = useState('');
  const l = listings.find((x) => x.id === listingId);
  const other = person(otherId, users);
  const thread = messages.filter((m) => m.listingId === listingId && ((m.fromId === me.id && m.toId === otherId) || (m.fromId === otherId && m.toId === me.id)));
  const send = (t) => { if (!t.trim()) return; sendMessage(listingId, otherId, t.trim()); setText(''); };
  return (
    <div className="max-w-2xl md:card md:overflow-hidden flex flex-col">
      <TopBar title={other.name} onBack={onBack} />
      <div className="p-3 -mt-3 -mx-4 md:m-0 bg-white border-b border-[#EDEEF4] flex items-center gap-3">
        <Photo src={l?.photo} className="w-11 h-11 rounded-[10px]" />
        <div className="min-w-0 flex-1"><div className="font-bold truncate">{other.name}</div><div className="text-[12px] text-[#7C8199] truncate">{l?.title} · {rupees(l?.price || 0)}</div></div>
      </div>
      <div className="flex-1 p-4 -mx-4 md:mx-0 grid gap-2 content-start bg-[#FAFAFC] min-h-[60dvh] pb-40 md:pb-4">
        <div className="text-center text-[11px] text-[#7C8199]">Phone numbers stay hidden. Keep the chat on SnapSell.</div>
        {thread.length === 0 && <div className="text-center text-[13px] text-[#7C8199] mt-6">Say hi and ask anything about the item.</div>}
        {thread.map((m) => (
          <div key={m.id} className={`max-w-[80%] px-3 py-2 rounded-[14px] text-[14px] ${m.fromId === me.id ? 'ml-auto bg-[#3B2FD9] text-white rounded-br-[4px]' : 'bg-white border border-[#E8EAF2] rounded-bl-[4px]'}`}>
            {m.text}<div className={`text-[10px] mt-0.5 ${m.fromId === me.id ? 'text-white/70' : 'text-[#7C8199]'}`}>{timeAgo(m.createdAt)}</div>
          </div>
        ))}
      </div>
      <div className="max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:z-30 bg-white/95 backdrop-blur-md border-t border-[#EDEEF4] p-3 pb-[max(12px,env(safe-area-inset-bottom))] grid gap-2">
        <div className="flex gap-2 overflow-x-auto -mx-3 px-3" style={{ scrollbarWidth: 'none' }}>{['Is it still available?', 'Can we meet at 6 pm?', `Would you take ${rupees(Math.round((l?.price || 0) * 0.9 / 50) * 50)}?`].map((q) => <button key={q} onClick={() => send(q)} className="pill h-9 text-[13px]">{q}</button>)}</div>
        <div className="flex gap-2"><input className="input" placeholder={`Message ${other.name.split(' ')[0]}…`} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send(text)} />
          <button className="btn btn-primary w-12 h-12 px-0 rounded-full shrink-0" onClick={() => send(text)} aria-label="Send"><Send className="w-4 h-4" /></button></div>
      </div>
    </div>
  );
}
