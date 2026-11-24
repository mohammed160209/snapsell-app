import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Check, Handshake, ImagePlus, MapPin, MessageCircle, Package, Search, Send, ShieldCheck, Sparkles, Tag, Truck, Verified, AiMagic, QrCode, Box, Clock, Info, Coins } from './icons';
import { AI_QUESTIONS, AI_TEMPLATES, CONDITIONS, DEMO_HANDOVER_CODE, PEOPLE, SH_CATEGORIES, SH_COMMISSION_RATE, rupees } from './data';
import { useStore } from './store';
import { ActionBar, Empty, Enter, Item, ScreenTitle, SectionTitle, Segmented, Stagger, Success, TopBar, ease, spring, timeAgo } from './ui';

const person = (id, users) => PEOPLE[id] || { name: users.find((u) => u.id === id)?.name || 'Neighbour', area: users.find((u) => u.id === id)?.area || '', deals: 0 };

const DEAL_LABEL = {
  requested: ['Request sent', 'bg-[#FFF1EE] text-[#C2410C]'],
  accepted: ['Meet & hand over', 'bg-[#EEF0FF] text-[#3B2FD9]'],
  paid: ['Paid · awaiting shipping', 'bg-[#FEF6E4] text-[#B45309]'],
  shipped: ['Shipped', 'bg-[#FEF6E4] text-[#B45309]'],
  completed: ['Completed', 'bg-[#E7F7EE] text-[#157F3E]'],
  received: ['Received', 'bg-[#E7F7EE] text-[#157F3E]'],
  cancelled: ['Cancelled', 'bg-[#F2F2F5] text-[#8E8E93]'],
  disputed: ['Under review', 'bg-[#FCEEF5] text-[#BE185D]'],
};
const DealChip = ({ status }) => <span className={`chip shrink-0 ${DEAL_LABEL[status][1]}`}><span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />{DEAL_LABEL[status][0]}</span>;
const Cond = ({ c }) => <span className={`chip ${CONDITIONS[c].cls}`}>{CONDITIONS[c].label}</span>;
const Photo = ({ src, className = '' }) => (
  <div className={`bg-[#EEF0FF] overflow-hidden flex items-center justify-center text-[#3B2FD9] ${className}`}>
    {src ? <img src={src} alt="" className="w-full h-full object-cover" /> : <Package className="w-8 h-8" />}
  </div>
);
const Avatar = ({ name, tone = 'coral' }) => (
  <div className={`w-11 h-11 rounded-full font-semibold text-[16px] flex items-center justify-center shrink-0 ${tone === 'coral' ? 'bg-gradient-to-br from-[#FFE3DC] to-[#FFC9BD] text-[#B4321A]' : 'bg-gradient-to-br from-[#E6E4FF] to-[#CFCBFF] text-[#3B2FD9]'}`}>{name[0]}</div>
);

export default function Secondhand() {
  const { me, deals } = useStore();
  const [section, setSection] = useState('browse');
  const [stack, setStack] = useState([]); // pushed screens: { type: 'listing'|'sell'|'chat', id, otherId }
  const view = stack[stack.length - 1];
  const setView = (v) => setStack(v ? [v] : []);
  const open = (v) => { setStack((s) => [...s, v]); window.scrollTo(0, 0); };
  const back = () => { setStack((s) => s.slice(0, -1)); window.scrollTo(0, 0); };
  const actionable = deals.filter((d) => (d.sellerId === me.id && ['requested', 'accepted', 'paid'].includes(d.status)) || (d.buyerId === me.id && ['accepted', 'shipped'].includes(d.status))).length;

  if (view?.type === 'sell') return <Enter push id="sell"><SellFlow onDone={() => { setView(null); setSection('mine'); }} onBack={back} /></Enter>;
  if (view?.type === 'listing') return <Enter push id={`l-${view.id}-${stack.length}`}><ListingDetail id={view.id} onBack={back} open={open} goDeals={() => { setView(null); setSection('deals'); }} /></Enter>;
  if (view?.type === 'chat') return <Enter push id={`c-${view.id}`}><Chat listingId={view.id} otherId={view.otherId} onBack={back} /></Enter>;

  return (
    <div className="grid gap-5">
      <ScreenTitle sub="Buy and sell with people near you" right={<button className="btn btn-coral max-md:hidden" onClick={() => open({ type: 'sell' })}><Camera className="w-5 h-5" />Sell an item</button>}>Secondhand</ScreenTitle>
      <Segmented id="sh" value={section} onChange={setSection} className="md:max-w-md" options={[{ id: 'browse', label: 'Browse' }, { id: 'mine', label: 'My listings' }, { id: 'deals', label: 'Deals', badge: actionable }]} />
      <motion.button initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...spring, delay: 0.25 }} whileTap={{ scale: 0.92 }}
        className="md:hidden fixed right-5 bottom-[calc(78px+env(safe-area-inset-bottom))] z-20 btn btn-coral h-14 rounded-full pl-4 pr-5 text-[16px] shadow-[0_12px_28px_-8px_rgba(255,90,61,.7)]" onClick={() => open({ type: 'sell' })}><Camera className="w-[22px] h-[22px]" />Sell</motion.button>
      <Enter id={section}>
        {section === 'browse' && <Feed open={open} />}
        {section === 'mine' && <MyListings open={open} />}
        {section === 'deals' && <Deals open={open} />}
      </Enter>
      <div className="h-16 md:hidden" aria-hidden="true" />
    </div>
  );
}

function ListingCard({ l, onOpen, showStatus }) {
  const { users } = useStore();
  return (
    <motion.button whileTap={{ scale: 0.98 }} onClick={onOpen} className="w-full text-left flex flex-col">
      <div className="relative">
        <Photo src={l.photo} className="w-full aspect-square rounded-[18px]" />
        {l.aiWritten && <span className="absolute top-2.5 left-2.5 chip glass text-[#3B2FD9] text-[11px]"><Sparkles className="w-3 h-3" />AI-written</span>}
        {showStatus && l.status !== 'active' && <span className="absolute top-2.5 right-2.5 chip bg-[#1D1D1F]/85 text-white text-[11px] capitalize">{l.status}</span>}
        <span className="absolute bottom-2.5 left-2.5 chip glass text-[#1D1D1F] text-[11px]">{l.mode === 'ship' ? <><Truck className="w-3.5 h-3.5" />Ships</> : <><Handshake className="w-3.5 h-3.5" />Meet</>}</span>
      </div>
      <div className="px-0.5 pt-2.5">
        <div className="font-bold text-[17px] tracking-[-0.02em]">{rupees(l.price)}</div>
        <div className="text-[14px] font-medium leading-snug line-clamp-2 min-h-[38px] text-[#3A3A3C]">{l.title}</div>
        <div className="text-[12px] text-[#8E8E93] mt-1 flex items-center gap-1 truncate"><MapPin className="w-3.5 h-3.5 shrink-0" />{l.area} · {person(l.sellerId, users).name.split(' ')[0]}</div>
      </div>
    </motion.button>
  );
}

function Feed({ open }) {
  const { listings, me } = useStore();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const list = listings.filter((l) => l.status === 'active' && l.sellerId !== me.id && (cat === 'all' || l.category === cat) && l.title.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="grid gap-5">
      <div className="rounded-[20px] p-4 bg-gradient-to-br from-[#F3F2FF] to-[#E9E7FF] flex gap-3.5 items-center">
        <span className="w-11 h-11 rounded-[14px] bg-white text-[#3B2FD9] flex items-center justify-center shrink-0 shadow-[0_4px_12px_-4px_rgba(59,47,217,.35)]"><ShieldCheck className="w-6 h-6" /></span>
        <div className="text-[14px] leading-snug text-[#2E23B8]"><b>Check before you pay.</b> Meet in person, or get it shipped with payment held until it arrives.</div>
      </div>
      <div className="relative">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#8E8E93]" />
        <input className="input pl-12" type="search" enterKeyHint="search" placeholder="Study table, cycle, cooler…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search secondhand items" />
      </div>
      <div className="rail -mt-1">
        {[{ id: 'all', name: 'All' }, ...SH_CATEGORIES].map((c) => <button key={c.id} className="pill" aria-pressed={cat === c.id} onClick={() => setCat(c.id)}>{c.name}</button>)}
      </div>
      <section>
        <SectionTitle icon={MapPin} tone="coral" action={<span className="text-[13px] text-[#8E8E93]">{list.length} items</span>}>Near {me.area}</SectionTitle>
        {list.length === 0 ? <Empty icon={Search} title="Nothing matches yet" body="Try another category, or list something of your own." />
          : <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-5">{list.map((l) => <Item key={l.id}><ListingCard l={l} onOpen={() => open({ type: 'listing', id: l.id })} /></Item>)}</Stagger>}
      </section>
    </div>
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
      <TopBar title={mine ? 'Your listing' : l.title} onBack={onBack} />
      <div className="grid md:grid-cols-2 gap-5 md:gap-8">
        <div className="-mx-5 -mt-4 md:m-0"><Photo src={l.photo} className="w-full aspect-[4/3] md:aspect-square md:rounded-[24px]" /></div>
        <div className="grid gap-4 content-start">
          <div className="flex items-center gap-2 flex-wrap"><Cond c={l.condition} />{l.aiWritten && <span className="chip bg-[#EEF0FF] text-[#3B2FD9]"><Sparkles className="w-3.5 h-3.5" />Written with AI, checked by seller</span>}</div>
          <div>
            <h1 className="text-[26px] font-bold leading-[1.15] tracking-[-0.03em]">{l.title}</h1>
            <div className="text-[28px] font-bold tracking-[-0.03em] mt-1.5">{rupees(l.price)}</div>
            <div className="text-[13px] text-[#8E8E93] flex items-center gap-1 mt-1"><Clock className="w-3.5 h-3.5" />Listed {timeAgo(l.createdAt)} · {l.area}</div>
          </div>
          <p className="text-[16px] leading-relaxed text-[#6E6E73]">{l.desc}</p>
          {l.facts?.length > 0 && (
            <div className="card p-4"><div className="eyebrow mb-2">Confirmed by seller</div>
              <div className="grid gap-2">{l.facts.map((f) => <div key={f} className="text-[15px] flex gap-2.5 items-center"><span className="w-6 h-6 rounded-full bg-[#E7F7EE] text-[#157F3E] flex items-center justify-center shrink-0"><Check className="w-3.5 h-3.5" /></span>{f}</div>)}</div></div>
          )}
          <div className="card p-3.5 flex items-center gap-3">
            <Avatar name={mine ? me.name : seller.name} />
            <div className="flex-1 min-w-0"><div className="font-semibold flex items-center gap-1.5">{mine ? 'You' : seller.name}{!mine && <Verified className="w-4 h-4 text-[#3B2FD9]" />}</div><div className="text-[13px] text-[#8E8E93]">{seller.deals} completed deals · {l.area}</div></div>
          </div>
          <div className="rounded-[18px] bg-white p-4 flex gap-3 items-start shadow-[0_0_0_1px_rgba(0,0,0,.05)]">
            <span className="w-10 h-10 rounded-[12px] bg-[#EEF0FF] text-[#3B2FD9] flex items-center justify-center shrink-0">{l.mode === 'ship' ? <Truck className="w-5 h-5" /> : <Handshake className="w-5 h-5" />}</span>
            <div><div className="font-semibold">{l.mode === 'ship' ? 'Shipped to you' : 'Meet in person'}</div><div className="text-[14px] text-[#6E6E73] leading-snug">{l.mode === 'ship' ? 'You pay online. The seller is paid only after you mark it received.' : 'Check the item first, then pay cash or in the app.'}</div></div>
          </div>
          {mine ? (
            <ActionBar>
              {l.status === 'active' && <button className="btn btn-ghost flex-1 h-[52px]" onClick={() => updateListing(id, { status: 'hidden' })}>Hide listing</button>}
              {l.status === 'hidden' && <button className="btn btn-ghost flex-1 h-[52px]" onClick={() => updateListing(id, { status: 'active' })}>Show listing</button>}
              {l.status !== 'sold' && <button className="btn btn-primary flex-1 h-[52px]" onClick={() => updateListing(id, { status: 'sold' })}>Mark as sold</button>}
              {l.status === 'sold' && <button className="btn btn-ghost flex-1 h-[52px]" disabled>Sold</button>}
            </ActionBar>
          ) : myDeal ? (
            <ActionBar><button className="btn btn-primary flex-1 h-[52px]" onClick={goDeals}>View your deal</button></ActionBar>
          ) : l.status !== 'active' ? (
            <ActionBar><button className="btn btn-ghost flex-1 h-[52px] capitalize" disabled>This item is {l.status}</button></ActionBar>
          ) : (
            <ActionBar note={l.mode === 'ship' ? 'Payment is held until you mark the item received' : 'No payment until you’ve seen the item'}>
              <button className="btn btn-ghost h-[52px] px-5" onClick={() => open({ type: 'chat', id, otherId: l.sellerId })}><MessageCircle className="w-5 h-5" />Message</button>
              {l.mode === 'ship'
                ? <button className="btn btn-primary h-[52px] flex-1" disabled={paying} onClick={buyShip}>{paying ? <><motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }} className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white" />Processing…</> : `Buy & pay ${rupees(l.price)}`}</button>
                : <button className="btn btn-primary h-[52px] flex-1" onClick={() => { startDeal(id, 'cash'); goDeals(); }}>Request to buy</button>}
            </ActionBar>
          )}
        </div>
      </div>
    </div>
  );
}

const STEP_NO = { 1: 1, 2: 2, 3: 2, 4: 3, 5: 4 };

function SellFlow({ onDone, onBack }) {
  const { createListing, me } = useStore();
  const [step, setStep] = useState(1);
  const [cat, setCat] = useState('furniture');
  const [photos, setPhotos] = useState(0);
  const [answers, setAnswers] = useState({});
  const [draft, setDraft] = useState(null);
  const [mode, setMode] = useState('meet');
  const [err, setErr] = useState('');
  const [published, setPublished] = useState(false);
  const t = AI_TEMPLATES[cat];
  const go = (s) => { setErr(''); setStep(s); window.scrollTo(0, 0); };

  const analyse = () => {
    if (photos === 0) return setErr('Add at least one photo');
    go(2); setTimeout(() => setStep(3), 1700);
  };
  const write = () => {
    if (AI_QUESTIONS.some((q) => !answers[q.id])) return setErr('Answer all three questions');
    const cond = answers.defects === 'None' ? (['Under 6 months', '6–18 months'].includes(answers.age) ? 'like_new' : 'good') : answers.defects === 'Needs repair' ? 'for_parts' : answers.defects === 'Visible wear' ? 'fair' : 'good';
    const facts = [`Age: ${answers.age}`, answers.defects === 'None' ? 'No defects' : answers.defects, answers.included];
    setDraft({ title: t.title, desc: t.desc, price: String(Math.round((t.low + t.high) / 2 / 50) * 50), condition: cond, facts }); go(4);
  };
  const publish = () => {
    if (!draft.title.trim()) return setErr('Add a title');
    if (!(Number(draft.price) > 0)) return setErr('Enter a price above ₹0');
    createListing({ title: draft.title, desc: draft.desc, price: Number(draft.price), condition: draft.condition, facts: draft.facts, category: cat, photo: t.photo, mode, area: me.area, aiWritten: true });
    setPublished(true);
  };
  const price = Number(draft?.price || 0);
  const Err = () => <AnimatePresence>{err && <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[14px] text-[#D93B2B] font-medium" role="alert">{err}</motion.div>}</AnimatePresence>;

  return (
    <div className="max-w-xl md:card md:p-6">
      <TopBar title="Sell an item" onBack={step === 1 ? onBack : () => go(step === 4 ? 3 : step === 5 ? 4 : 1)} right={<span className="text-[14px] font-medium text-[#8E8E93]">{STEP_NO[step]} of 4</span>} />
      <div className="flex gap-1.5 -mt-1 mb-6" aria-hidden="true">
        {[1, 2, 3, 4].map((n) => <span key={n} className="h-[5px] flex-1 rounded-full bg-[#E9E9EE] overflow-hidden"><motion.span className="block h-full bg-[#FF5A3D] rounded-full" initial={false} animate={{ width: n <= STEP_NO[step] ? '100%' : '0%' }} transition={{ duration: 0.45, ease }} /></span>)}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.28, ease }} className="grid gap-5">
          {step === 1 && (
            <>
              <div><h1 className="text-[28px] font-bold tracking-[-0.03em] leading-tight">Snap your item</h1><p className="text-[16px] text-[#6E6E73] mt-1.5">Pick a category and add up to 3 photos. AI writes the rest.</p></div>
              <div className="flex gap-2 flex-wrap">{SH_CATEGORIES.map((c) => <button key={c.id} onClick={() => { setCat(c.id); setPhotos(0); setErr(''); }} className="pill" aria-pressed={cat === c.id}>{c.name}</button>)}</div>
              <div className="grid grid-cols-3 gap-2.5">
                {[0, 1, 2].map((i) => i < photos
                  ? <motion.div key={`p${i}`} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={spring}><Photo src={t.photo} className="aspect-square rounded-[18px]" /></motion.div>
                  : <motion.button key={`e${i}`} whileTap={{ scale: 0.95 }} onClick={() => { setPhotos(photos + 1); setErr(''); }} className={`aspect-square rounded-[18px] border-2 border-dashed flex flex-col items-center justify-center gap-1.5 text-[13px] font-semibold transition-colors ${i === photos ? 'border-[#FF5A3D]/50 bg-[#FFF6F3] text-[#E8462B]' : 'border-[#E5E5EA] text-[#C7C7CC]'}`}><ImagePlus className="w-7 h-7" />{i === photos ? 'Add photo' : ''}</motion.button>)}
              </div>
              <div className="rounded-[16px] bg-[#F5F5F7] p-3.5 text-[14px] text-[#6E6E73] flex gap-2.5"><Info className="w-5 h-5 shrink-0 text-[#8E8E93]" />Good daylight, show any scratches, and include the brand label.</div>
              <Err />
              <ActionBar><button className="btn btn-coral flex-1 h-[52px]" onClick={analyse}><AiMagic className="w-5 h-5" />Continue</button></ActionBar>
            </>
          )}
          {step === 2 && (
            <div className="py-16 flex flex-col items-center text-center">
              <div className="relative w-28 h-28">
                <motion.div className="absolute inset-0 rounded-[30px] bg-gradient-to-br from-[#5B4FF0] to-[#FF5A3D]" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: 'linear' }} style={{ filter: 'blur(14px)', opacity: 0.45 }} />
                <div className="absolute inset-2 rounded-[26px] overflow-hidden"><img src={t.photo} alt="" className="w-full h-full object-cover" /></div>
                <motion.div className="absolute inset-x-2 h-1 rounded-full bg-white shadow-[0_0_14px_4px_rgba(255,255,255,.9)]" initial={{ top: 12 }} animate={{ top: [12, 100, 12] }} transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }} />
              </div>
              <div className="text-[22px] font-bold tracking-[-0.02em] mt-7 flex items-center gap-2"><Sparkles className="w-6 h-6 text-[#3B2FD9]" />Reading your photos</div>
              <div className="text-[15px] text-[#8E8E93] mt-1">Identifying the item and checking for defects</div>
            </div>
          )}
          {step === 3 && (
            <>
              <div className="rounded-[20px] p-4 bg-gradient-to-br from-[#F3F2FF] to-[#E9E7FF] flex gap-3.5 items-center">
                <Photo src={t.photo} className="w-14 h-14 rounded-[14px] shrink-0" />
                <div><div className="eyebrow !text-[#5B4FF0]">AI detected</div><div className="text-[18px] font-bold tracking-[-0.02em] text-[#2E23B8]">{t.guess}</div></div>
              </div>
              <p className="text-[16px] text-[#6E6E73] -mt-1">A few quick questions so buyers trust your listing.</p>
              {AI_QUESTIONS.map((q, qi) => (
                <div key={q.id}><div className="text-[16px] font-semibold mb-2.5 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-[#1D1D1F] text-white text-[12px] flex items-center justify-center">{qi + 1}</span>{q.q}</div>
                  <div className="flex flex-wrap gap-2">{q.options.map((o) => <button key={o} onClick={() => { setAnswers({ ...answers, [q.id]: o }); setErr(''); }} className="pill" aria-pressed={answers[q.id] === o}>{answers[q.id] === o && <Check className="w-4 h-4" />}{o}</button>)}</div></div>
              ))}
              <Err />
              <ActionBar><button className="btn btn-primary flex-1 h-[52px]" onClick={write}><Sparkles className="w-5 h-5" />Write my listing</button></ActionBar>
            </>
          )}
          {step === 4 && draft && (
            <>
              <div><h1 className="text-[28px] font-bold tracking-[-0.03em] leading-tight">Review your listing</h1><span className="chip bg-[#EEF0FF] text-[#3B2FD9] mt-2"><Sparkles className="w-3.5 h-3.5" />Written with AI · edit anything</span></div>
              <label className="grid gap-2 text-[14px] font-semibold text-[#3A3A3C]">Title<input className="input" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></label>
              <label className="grid gap-2 text-[14px] font-semibold text-[#3A3A3C]">Description<textarea className="input h-32 py-3.5 leading-relaxed" value={draft.desc} onChange={(e) => setDraft({ ...draft, desc: e.target.value })} /></label>
              <div><div className="text-[14px] font-semibold text-[#3A3A3C] mb-2">Condition</div><div className="flex gap-2 flex-wrap">{Object.entries(CONDITIONS).map(([k, v]) => <button key={k} onClick={() => setDraft({ ...draft, condition: k })} className="pill" aria-pressed={draft.condition === k}>{v.label}</button>)}</div></div>
              <label className="grid gap-2 text-[14px] font-semibold text-[#3A3A3C]">Price<span className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-[18px] font-semibold text-[#8E8E93]">₹</span><input className="input pl-9 text-[18px] font-semibold" inputMode="numeric" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} /></span></label>
              <div className="rounded-[14px] bg-[#E7F7EE] text-[#157F3E] text-[14px] font-medium p-3 flex items-center gap-2 -mt-2"><Coins className="w-5 h-5" />Similar items sell for {rupees(t.low)}–{rupees(t.high)} nearby</div>
              <Err />
              <ActionBar><button className="btn btn-primary flex-1 h-[52px]" onClick={() => go(5)}>Next: how to sell</button></ActionBar>
            </>
          )}
          {step === 5 && (
            <>
              <h1 className="text-[28px] font-bold tracking-[-0.03em] leading-tight">How do you want to sell?</h1>
              {[['meet', Handshake, 'Meet in person', 'Buyer checks the item, then pays cash or in the app. Best for big or expensive items.'], ['ship', Truck, 'Ship it', 'Buyer pays online first. Ship within 48 hours; you’re paid when they mark it received.']].map(([id, Icon, title, body]) => (
                <motion.button whileTap={{ scale: 0.98 }} key={id} onClick={() => setMode(id)} className={`text-left p-4 rounded-[20px] flex gap-3.5 items-start transition-colors ${mode === id ? 'bg-[#F3F2FF] shadow-[0_0_0_2px_#3B2FD9]' : 'bg-white shadow-[0_0_0_1px_rgba(0,0,0,.07)]'}`}>
                  <span className={`w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0 ${mode === id ? 'bg-[#3B2FD9] text-white' : 'bg-[#F2F2F5] text-[#6E6E73]'}`}><Icon className="w-6 h-6" /></span>
                  <div className="flex-1"><div className="font-semibold text-[16px]">{title}</div><div className="text-[14px] text-[#6E6E73] leading-snug mt-0.5">{body}</div></div>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${mode === id ? 'bg-[#3B2FD9] text-white' : 'shadow-[0_0_0_1.5px_#D1D1D6]'}`}>{mode === id && <Check className="w-3.5 h-3.5" />}</span>
                </motion.button>
              ))}
              <div className="card p-4 grid gap-2 text-[15px]">
                <div className="eyebrow">You’ll receive</div>
                {mode === 'meet' && <div className="flex justify-between"><span className="text-[#6E6E73]">Paid in cash</span><b>{rupees(price)}</b></div>}
                <div className="flex justify-between"><span className="text-[#6E6E73]">Paid in the app · {SH_COMMISSION_RATE * 100}% fee</span><b>{rupees(price * (1 - SH_COMMISSION_RATE))}</b></div>
              </div>
              <ActionBar><button className="btn btn-coral flex-1 h-[52px]" onClick={publish}><Tag className="w-5 h-5" />Publish listing</button></ActionBar>
            </>
          )}
        </motion.div>
      </AnimatePresence>
      <Success open={published} title="Your item is live" body={`${draft?.title || 'Your listing'} is now visible to neighbours in ${me.area}.`} primary="See my listings" onPrimary={onDone} />
    </div>
  );
}

function MyListings({ open }) {
  const { listings, me } = useStore();
  const mine = listings.filter((l) => l.sellerId === me.id);
  if (mine.length === 0) return <Empty icon={Camera} title="List your first item in 2 minutes" body="Snap a photo, answer three questions, and AI writes the listing for you." />;
  return <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-5">{mine.map((l) => <Item key={l.id}><ListingCard l={l} showStatus onOpen={() => open({ type: 'listing', id: l.id })} /></Item>)}</Stagger>;
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
  const Note = ({ icon: Icon = Info, children }) => <div className="rounded-[14px] bg-[#F5F5F7] p-3 text-[14px] text-[#6E6E73] flex gap-2.5 items-start"><Icon className="w-5 h-5 shrink-0 text-[#8E8E93]" />{children}</div>;

  return (
    <motion.article layout className="card p-4 grid gap-3.5">
      <div className="flex gap-3">
        <Photo src={l?.photo || d.photo} className="w-[68px] h-[68px] rounded-[16px] shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2"><div className="font-semibold leading-snug tracking-[-0.01em] line-clamp-2">{title}</div></div>
          <div className="text-[17px] font-bold tracking-[-0.02em] mt-0.5">{rupees(d.price)}</div>
          <div className="mt-1"><DealChip status={d.status} /></div>
        </div>
      </div>
      <div className="flex items-center gap-2.5 text-[14px]">
        <Avatar name={other.name} tone={isSeller ? 'indigo' : 'coral'} />
        <div className="flex-1 min-w-0"><div className="font-semibold">{other.name}</div><div className="text-[13px] text-[#8E8E93]">{isSeller ? 'Buyer' : 'Seller'} · {d.mode === 'ship' ? 'Shipped' : 'Meet in person'} · {timeAgo(d.createdAt)}</div></div>
        {l && d.status !== 'cancelled' && <button className="icon-btn bg-[#EEF0FF] text-[#3B2FD9]" onClick={() => open({ type: 'chat', id: d.listingId, otherId: isSeller ? d.buyerId : d.sellerId })} aria-label={`Chat with ${other.name}`}><MessageCircle className="w-5 h-5" /></button>}
      </div>

      {!isSeller && d.status === 'requested' && <Note icon={Clock}>Waiting for {other.name.split(' ')[0]} to accept. You’ll get a message here.</Note>}
      {!isSeller && d.status === 'accepted' && (
        <div className="grid gap-3">
          <div className="rounded-[18px] bg-gradient-to-br from-[#F3F2FF] to-[#E9E7FF] p-4 text-center">
            <div className="text-[13px] font-medium text-[#5B4FF0] flex items-center justify-center gap-1.5"><QrCode className="w-4 h-4" />Show this code at handover</div>
            <div className="flex justify-center gap-2 mt-2.5">{d.code.split('').map((c, i) => <motion.span key={i} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...spring, delay: i * 0.06 }} className="w-12 h-14 rounded-[12px] bg-white text-[28px] font-bold text-[#3B2FD9] flex items-center justify-center shadow-[0_4px_12px_-6px_rgba(59,47,217,.5)]">{c}</motion.span>)}</div>
          </div>
          <div className="flex gap-2.5">
            <button className="btn btn-ghost flex-1 h-[52px] px-3" onClick={() => setDeal(d.id, { status: 'completed', payment: 'cash' })}>Paid cash · got it</button>
            <button className="btn btn-primary flex-1 h-[52px] px-3" disabled={busy} onClick={payInApp}>{busy ? 'Processing…' : `Pay ${rupees(d.price)}`}</button>
          </div>
        </div>
      )}
      {!isSeller && d.status === 'paid' && <Note icon={ShieldCheck}>Payment held safely. The seller ships within 48 hours.</Note>}
      {!isSeller && d.status === 'shipped' && (
        <div className="grid gap-3">
          <div className="rounded-[14px] bg-[#FEF6E4] p-3 text-[14px] text-[#8A4B0B] flex items-center gap-2.5"><Box className="w-5 h-5" />{d.courier} · <span className="font-mono tracking-tight">{d.tracking}</span></div>
          <div className="flex gap-2.5"><button className="btn btn-primary flex-1 h-[52px]" onClick={() => setDeal(d.id, { status: 'received' })}>I received it</button><button className="btn btn-ghost h-[52px] px-4" onClick={() => setDeal(d.id, { status: 'disputed' })}>Report a problem</button></div>
        </div>
      )}

      {isSeller && d.status === 'requested' && (
        <div className="flex gap-2.5"><button className="btn btn-ghost h-[52px] px-5" onClick={() => setDeal(d.id, { status: 'cancelled' })}>Decline</button><button className="btn btn-primary flex-1 h-[52px]" onClick={() => setDeal(d.id, { status: 'accepted' })}>Accept request</button></div>
      )}
      {isSeller && d.status === 'accepted' && (
        <div className="grid gap-2.5">
          <Note icon={QrCode}>At the meetup, enter the code the buyer shows you. <span className="text-[#8E8E93]">Demo: {DEMO_HANDOVER_CODE}</span></Note>
          <div className="flex gap-2.5"><input className="input text-center tracking-[0.5em] text-[20px] font-bold" maxLength={4} inputMode="numeric" placeholder="••••" value={code} onChange={(e) => { setCode(e.target.value.replace(/\D/g, '')); setErr(''); }} aria-label="Handover code" />
            <button className="btn btn-primary h-[52px] shrink-0" onClick={() => (code === d.code ? setDeal(d.id, { status: 'completed' }) : setErr('Code doesn’t match'))}>Confirm</button></div>
          {err && <div className="text-[14px] text-[#D93B2B] font-medium">{err}</div>}
        </div>
      )}
      {isSeller && d.status === 'paid' && (
        <div className="grid gap-2.5">
          <Note icon={Truck}>Buyer has paid. Ship within 48 hours and add tracking.</Note>
          <div className="flex gap-2.5"><input className="input w-36" value={ship.courier} onChange={(e) => setShip({ ...ship, courier: e.target.value })} aria-label="Courier" /><input className="input" placeholder="Tracking number" value={ship.tracking} onChange={(e) => { setShip({ ...ship, tracking: e.target.value }); setErr(''); }} /></div>
          <button className="btn btn-primary h-[52px]" onClick={() => (ship.tracking.trim() ? setDeal(d.id, { status: 'shipped', ...ship }) : setErr('Add the tracking number'))}>Mark as shipped</button>
          {err && <div className="text-[14px] text-[#D93B2B] font-medium">{err}</div>}
        </div>
      )}
      {isSeller && d.status === 'shipped' && <Note icon={Clock}>Waiting for the buyer to confirm delivery. Money is released when they do.</Note>}
      {['completed', 'received'].includes(d.status) && (
        <div className="rounded-[14px] bg-[#E7F7EE] p-3 text-[14px] font-medium text-[#157F3E] flex items-center gap-2.5"><Check className="w-5 h-5" />
          {isSeller ? `Sold. ${d.payment === 'app' ? `You receive ${rupees(d.price * (1 - SH_COMMISSION_RATE))} after the ${SH_COMMISSION_RATE * 100}% fee.` : 'Paid in cash, no fee.'}` : 'Deal complete. Enjoy your item!'}</div>
      )}
    </motion.article>
  );
}

function Deals({ open }) {
  const { deals, me } = useStore();
  const [side, setSide] = useState('buying');
  const count = (id) => deals.filter((d) => (id === 'buying' ? d.buyerId === me.id : d.sellerId === me.id)).length;
  const list = deals.filter((d) => (side === 'buying' ? d.buyerId === me.id : d.sellerId === me.id));
  return (
    <div className="grid gap-4">
      <div className="flex gap-2">{[['buying', 'Buying'], ['selling', 'Selling']].map(([id, l]) => <button key={id} onClick={() => setSide(id)} className="pill" aria-pressed={side === id}>{l} · {count(id)}</button>)}</div>
      {list.length === 0 ? <Empty icon={Handshake} title={side === 'buying' ? 'No purchases yet' : 'No buyers yet'} body={side === 'buying' ? 'Request to buy an item and it will show here.' : 'When someone wants your item, the request shows here.'} />
        : <Stagger className="grid gap-3">{list.map((d) => <Item key={d.id}><DealCard d={d} open={open} /></Item>)}</Stagger>}
    </div>
  );
}

function Chat({ listingId, otherId, onBack }) {
  const { messages, listings, users, me, sendMessage } = useStore();
  const [text, setText] = useState('');
  const endRef = useRef(null);
  const l = listings.find((x) => x.id === listingId);
  const other = person(otherId, users);
  const thread = messages.filter((m) => m.listingId === listingId && ((m.fromId === me.id && m.toId === otherId) || (m.fromId === otherId && m.toId === me.id)));
  const send = (t) => { if (!t.trim()) return; sendMessage(listingId, otherId, t.trim()); setText(''); };
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [thread.length]);
  return (
    <div className="max-w-2xl md:card md:overflow-hidden flex flex-col">
      <TopBar title={other.name} onBack={onBack} />
      <div className="p-3 -mt-4 -mx-5 md:m-0 bg-white/70 flex items-center gap-3 hairline-b">
        <Photo src={l?.photo} className="w-12 h-12 rounded-[12px]" />
        <div className="min-w-0 flex-1"><div className="font-semibold truncate">{l?.title}</div><div className="text-[14px] text-[#6E6E73]">{rupees(l?.price || 0)} · {l?.area}</div></div>
      </div>
      <div className="flex-1 py-4 grid gap-2 content-start min-h-[60dvh] pb-44 md:pb-4 md:px-4">
        <div className="mx-auto text-center text-[12px] text-[#8E8E93] bg-white rounded-full px-3 py-1 shadow-[0_0_0_1px_rgba(0,0,0,.04)] flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-[#157F3E]" />Phone numbers stay hidden</div>
        {thread.length === 0 && <div className="text-center text-[15px] text-[#8E8E93] mt-8">Say hi and ask anything about the item.</div>}
        <AnimatePresence initial={false}>
          {thread.map((m) => {
            const mine = m.fromId === me.id;
            return (
              <motion.div key={m.id} initial={{ opacity: 0, y: 12, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={spring} style={{ originX: mine ? 1 : 0 }}
                className={`max-w-[78%] px-4 py-2.5 text-[16px] leading-snug ${mine ? 'ml-auto bg-[#3B2FD9] text-white rounded-[20px] rounded-br-[6px]' : 'bg-white text-[#1D1D1F] rounded-[20px] rounded-bl-[6px] shadow-[0_0_0_1px_rgba(0,0,0,.05)]'}`}>
                {m.text}<div className={`text-[11px] mt-0.5 ${mine ? 'text-white/65' : 'text-[#8E8E93]'}`}>{timeAgo(m.createdAt)}</div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={endRef} />
      </div>
      <div className="max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:z-30 glass hairline-t px-5 md:px-4 pt-3 pb-[max(14px,env(safe-area-inset-bottom))] grid gap-2.5">
        <div className="flex gap-2 overflow-x-auto -mx-5 px-5 md:-mx-4 md:px-4 no-scrollbar">{['Is it still available?', 'Can we meet at 6 pm?', `Would you take ${rupees(Math.round((l?.price || 0) * 0.9 / 50) * 50)}?`].map((q) => <button key={q} onClick={() => send(q)} className="pill h-9 text-[14px] shrink-0">{q}</button>)}</div>
        <div className="flex gap-2.5 items-center"><input className="input rounded-full" placeholder={`Message ${other.name.split(' ')[0]}…`} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send(text)} aria-label="Message" />
          <motion.button whileTap={{ scale: 0.88 }} className="btn btn-primary w-[52px] h-[52px] px-0 rounded-full shrink-0" onClick={() => send(text)} aria-label="Send"><Send className="w-5 h-5" /></motion.button></div>
      </div>
    </div>
  );
}
