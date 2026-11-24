import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, ShieldCheck, ShoppingBag, Store, Truck, Recycle, UserRound, LayoutDashboard, MapPin, Smartphone, Sparkles, Tag } from './icons';
import { CATEGORIES } from './data';
import { useStore } from './store';
import { Logo, Sheet, SheetRow, ease, softSpring } from './ui';

const AREAS = ['Koramangala', 'Indiranagar', 'HSR Layout', 'Jayanagar', 'BTM Layout', 'Whitefield'];
const HERO = ['./images/study-table-1.jpg', './images/hero-cycle.jpg', './images/headphones.jpg', './images/ikea-chair.jpg'];

const fadeUp = (delay = 0) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.55, ease, delay } });

export default function Onboarding() {
  const { signUp, loginAs } = useStore();
  const [role, setRole] = useState(null);
  const [demoOpen, setDemoOpen] = useState(false);
  const [step, setStep] = useState('phone'); // phone | otp | profile
  const [dir, setDir] = useState(1);
  const [f, setF] = useState({ name: '', phone: '', otp: '', area: 'Koramangala', brandName: '', category: 'bakery', tagline: '' });
  const [err, setErr] = useState('');
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setErr(''); };
  const goStep = (s, d) => { setDir(d); setErr(''); setStep(s); };

  const next = () => {
    if (step === 'phone') {
      if (f.phone.replace(/\D/g, '').length !== 10) return setErr('Enter a 10-digit mobile number');
      return goStep('otp', 1);
    }
    if (step === 'otp') {
      if (f.otp !== '1234') return setErr('That code doesn’t match. For the demo, use 1234');
      return goStep('profile', 1);
    }
    if (!f.name.trim()) return setErr('Enter your name');
    if (role === 'seller' && !f.brandName.trim()) return setErr('Enter your business name');
    signUp({ ...f, role });
  };
  const back = () => { if (step === 'phone') { setRole(null); setErr(''); } else goStep(step === 'profile' ? 'otp' : 'phone', -1); };

  if (!role) {
    return (
      <div className="min-h-[100dvh] flex flex-col pt-safe bg-[#F5F5F7]">
        <div className="max-w-5xl w-full mx-auto px-5 h-[58px] md:h-16 flex items-center"><Logo /></div>

        {/* Phone: photo collage, headline, choices in the thumb zone */}
        <div className="md:hidden flex-1 flex flex-col px-5 pb-[max(20px,env(safe-area-inset-bottom))]">
          <div className="grid grid-cols-2 gap-2.5 mt-1" aria-hidden="true">
            {[[0, 2], [1, 3]].map((col, c) => (
              <div key={c} className={`grid gap-2.5 min-w-0 content-start ${c === 1 ? 'pt-6' : ''}`}>
                {col.map((i, r) => (
                  <motion.img key={i} src={HERO[i]} alt="" {...fadeUp(0.08 * (c * 2 + r))}
                    className={`w-full object-cover rounded-[22px] shadow-[0_12px_30px_-14px_rgba(0,0,0,.35)] ${(c + r) % 2 === 0 ? 'h-[150px]' : 'h-[112px]'}`} />
                ))}
              </div>
            ))}
          </div>
          <motion.div {...fadeUp(0.3)} className="flex items-center gap-2 mt-6">
            <span className="chip bg-white text-[#3B2FD9] shadow-[0_0_0_1px_rgba(0,0,0,.05)] !py-1.5"><MapPin className="w-3.5 h-3.5" />Bengaluru neighbourhoods</span>
          </motion.div>
          <motion.h1 {...fadeUp(0.36)} className="text-[34px] font-bold leading-[1.06] tracking-[-0.035em] mt-3">
            Your neighbourhood, <span className="text-[#3B2FD9]">for sale.</span>
          </motion.h1>
          <motion.p {...fadeUp(0.42)} className="text-[16px] text-[#6E6E73] mt-3 leading-relaxed">Shop new local brands, or sell what you don’t need to people nearby.</motion.p>
          <div className="flex-1 min-h-6" />
          <motion.div {...fadeUp(0.5)} className="grid gap-3 mt-6">
            <button className="btn btn-primary h-[56px] text-[17px] justify-between px-5" onClick={() => setRole('buyer')}><span className="flex items-center gap-2.5"><ShoppingBag className="w-[22px] h-[22px]" />Shop and sell</span><ChevronRight className="w-5 h-5 opacity-80" /></button>
            <button className="btn btn-ghost h-[56px] text-[17px] justify-between px-5" onClick={() => setRole('seller')}><span className="flex items-center gap-2.5"><Store className="w-[22px] h-[22px] text-[#FF5A3D]" />I run a local business</span><ChevronRight className="w-5 h-5 text-[#C7C7CC]" /></button>
            <button className="min-h-[44px] text-[15px] font-semibold text-[#3B2FD9]" onClick={() => setDemoOpen(true)}>Try a demo account</button>
          </motion.div>
        </div>

        {/* Desktop: two-column landing */}
        <div className="hidden md:grid flex-1 max-w-5xl w-full mx-auto px-5 pb-12 grid-cols-2 gap-10 items-center">
          <div>
            <motion.span {...fadeUp(0)} className="chip bg-white text-[#3B2FD9] shadow-[0_0_0_1px_rgba(0,0,0,.05)] !py-1.5"><MapPin className="w-3.5 h-3.5" />Hyperlocal marketplace · Bengaluru</motion.span>
            <motion.h1 {...fadeUp(0.08)} className="text-[52px] font-bold leading-[1.04] tracking-[-0.04em] mt-5">Your neighbourhood, <span className="text-[#3B2FD9]">for sale.</span></motion.h1>
            <motion.p {...fadeUp(0.16)} className="text-[17px] text-[#6E6E73] mt-5 max-w-md leading-relaxed">Home bakers, candle makers and small studios open a storefront in minutes. Neighbours order, pay online and get it within 5 km — or swap secondhand items nearby.</motion.p>
            <motion.div {...fadeUp(0.24)} className="flex flex-wrap gap-5 mt-7 text-[14px] text-[#6E6E73]">
              <span className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-[#157F3E]" />Secure UPI payments</span>
              <span className="flex items-center gap-2"><Truck className="w-5 h-5 text-[#3B2FD9]" />Delivery or pickup</span>
              <span className="flex items-center gap-2"><Recycle className="w-5 h-5 text-[#FF5A3D]" />Secondhand from neighbours</span>
            </motion.div>
          </div>
          <motion.div {...fadeUp(0.2)} className="card p-7">
            <div className="text-[20px] font-bold tracking-[-0.02em]">How do you want to use SnapSell?</div>
            <div className="text-[14px] text-[#8E8E93] mt-1">Shoppers can also sell secondhand items. Businesses get their own dashboard.</div>
            <div className="grid gap-3 mt-5">
              <RoleCard icon={ShoppingBag} tone="indigo" title="Shop and sell" body="Discover local brands, order, and swap secondhand items." onClick={() => setRole('buyer')} />
              <RoleCard icon={Store} tone="coral" title="I run a local business" body="Open your storefront, manage stock, orders and payouts." onClick={() => setRole('seller')} />
            </div>
            <div className="mt-6 pt-5 border-t border-[#EBEBF0] flex items-center justify-between">
              <span className="text-[14px] text-[#8E8E93]">Just looking around?</span>
              <button className="btn btn-soft h-11" onClick={() => setDemoOpen(true)}>Try a demo account</button>
            </div>
          </motion.div>
        </div>

        <Sheet open={demoOpen} onClose={() => setDemoOpen(false)} title="Try a demo account">
          <div className="text-[14px] text-[#6E6E73] mb-3">Pre-filled accounts with orders, listings and deals.</div>
          <SheetRow icon={UserRound} label="Kabir · Shopper" hint="Shop local brands, buy and sell secondhand" onClick={() => loginAs('u-buyer')} />
          <SheetRow icon={Store} label="Ananya · Crumb & Co." hint="Business dashboard with live orders" onClick={() => loginAs('u-seller')} />
          <SheetRow icon={LayoutDashboard} label="Admin" hint="Approve sellers, see commission" onClick={() => loginAs('u-admin')} />
        </Sheet>
      </div>
    );
  }

  const seller = role === 'seller';
  const stepNo = { phone: 1, otp: 2, profile: 3 }[step];
  const accent = seller ? '#FF5A3D' : '#3B2FD9';
  return (
    <div className="min-h-[100dvh] flex flex-col md:items-center md:justify-center md:py-10 pt-safe bg-white md:bg-[#F5F5F7]">
      <div className="w-full md:max-w-md md:card flex-1 md:flex-none flex flex-col">
        <div className="h-[56px] px-1.5 flex items-center gap-2 md:px-4 md:pt-4">
          <button onClick={back} className="icon-btn" style={{ color: accent }} aria-label="Back"><ChevronLeft className="w-6 h-6" /></button>
          <div className="flex-1 flex gap-1.5 pr-5" aria-label={`Step ${stepNo} of 3`}>
            {[1, 2, 3].map((n) => (
              <span key={n} className="h-[5px] flex-1 rounded-full bg-[#E9E9EE] overflow-hidden">
                <motion.span className="block h-full rounded-full" style={{ background: accent }} initial={false} animate={{ width: n <= stepNo ? '100%' : '0%' }} transition={{ duration: 0.45, ease }} />
              </span>
            ))}
          </div>
        </div>
        <form className="flex-1 flex flex-col px-5 md:px-7 pb-[max(20px,env(safe-area-inset-bottom))] md:pb-7 overflow-hidden" onSubmit={(e) => { e.preventDefault(); next(); }}>
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.div key={step} initial={{ opacity: 0, x: dir * 36 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -36 }} transition={{ duration: 0.28, ease }} className="flex flex-col">
              <div className="w-14 h-14 rounded-[18px] flex items-center justify-center mt-3" style={{ background: seller ? '#FFF1EE' : '#EEF0FF', color: accent }}>
                {step === 'phone' && <Smartphone className="w-7 h-7" />}
                {step === 'otp' && <ShieldCheck className="w-7 h-7" />}
                {step === 'profile' && (seller ? <Store className="w-7 h-7" /> : <UserRound className="w-7 h-7" />)}
              </div>
              <h2 className="text-[30px] font-bold tracking-[-0.035em] mt-5 leading-[1.1]">
                {step === 'phone' && 'What’s your number?'}
                {step === 'otp' && 'Enter the code'}
                {step === 'profile' && (seller ? 'Set up your storefront' : 'A little about you')}
              </h2>
              <p className="text-[16px] text-[#6E6E73] mt-2 leading-relaxed">
                {step === 'phone' && 'We’ll text a 4-digit code to verify it. No spam, ever.'}
                {step === 'otp' && <>Sent to +91 {f.phone}. Demo code: <b className="text-[#1D1D1F]">1234</b></>}
                {step === 'profile' && (seller ? 'Shoppers within 5 km will see this.' : 'We show items from sellers near your area.')}
              </p>
              <div className="grid gap-4 mt-7">
                {step === 'phone' && (
                  <div className="flex gap-2">
                    <div className="input w-[76px] flex items-center justify-center font-semibold shrink-0">+91</div>
                    <input className="input text-[18px] tracking-[0.02em] font-medium" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="98450 24190" value={f.phone} onChange={set('phone')} autoFocus aria-label="Mobile number" />
                  </div>
                )}
                {step === 'otp' && <OtpBoxes value={f.otp} onChange={(v) => { setF({ ...f, otp: v }); setErr(''); }} accent={accent} />}
                {step === 'profile' && (
                  <>
                    <Field label="Your name" icon={UserRound}><input className="input pl-12" autoComplete="name" placeholder="Ananya Rao" value={f.name} onChange={set('name')} autoFocus /></Field>
                    <Field label="Your area" icon={MapPin}><select className="input pl-12" value={f.area} onChange={set('area')}>{AREAS.map((a) => <option key={a}>{a}</option>)}</select></Field>
                    {seller && (
                      <>
                        <Field label="Business name" icon={Store}><input className="input pl-12" placeholder="Crumb & Co." value={f.brandName} onChange={set('brandName')} /></Field>
                        <Field label="What do you sell?" icon={Tag}><select className="input pl-12" value={f.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
                        <Field label="One-line description" icon={Sparkles}><input className="input pl-12" placeholder="Small-batch bakes from my home kitchen" value={f.tagline} onChange={set('tagline')} /></Field>
                      </>
                    )}
                  </>
                )}
                <AnimatePresence>{err && <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[14px] text-[#D93B2B] font-medium" role="alert">{err}</motion.div>}</AnimatePresence>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="flex-1 min-h-8" />
          <motion.button whileTap={{ scale: 0.97 }} type="submit" className={`btn ${seller ? 'btn-coral' : 'btn-primary'} w-full h-[56px] text-[17px] mt-6`}>
            {step === 'profile' ? (seller ? 'Open my storefront' : 'Start exploring') : 'Continue'}
          </motion.button>
        </form>
      </div>
    </div>
  );
}

function OtpBoxes({ value, onChange, accent }) {
  const ref = useRef(null);
  return (
    <div className="relative" onClick={() => ref.current?.focus()}>
      <input ref={ref} className="absolute inset-0 opacity-0 w-full h-full" inputMode="numeric" autoComplete="one-time-code" maxLength={4} value={value} onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 4))} autoFocus aria-label="Verification code" />
      <div className="grid grid-cols-4 gap-3 pointer-events-none" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => {
          const ch = value[i];
          const active = i === Math.min(value.length, 3);
          return (
            <div key={i} className="h-16 rounded-[16px] flex items-center justify-center text-[28px] font-bold transition-shadow" style={{ boxShadow: active ? `0 0 0 2px ${accent}` : 'none', background: ch ? '#fff' : '#F2F2F5' }}>
              <AnimatePresence mode="popLayout">{ch && <motion.span key={ch + i} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={softSpring}>{ch}</motion.span>}</AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const Field = ({ label, icon: Icon, children }) => (
  <label className="grid gap-2 text-[14px] font-semibold text-[#3A3A3C]">{label}
    <span className="relative">{Icon && <Icon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#8E8E93] pointer-events-none z-10" />}{children}</span>
  </label>
);

function RoleCard({ icon: Icon, tone, title, body, onClick }) {
  const c = tone === 'coral' ? 'bg-[#FFF1EE] text-[#FF5A3D]' : 'bg-[#EEF0FF] text-[#3B2FD9]';
  return (
    <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} onClick={onClick} className="text-left p-4 rounded-[18px] bg-[#F5F5F7] hover:bg-white hover:shadow-[0_0_0_1.5px_#3B2FD9] flex gap-3.5 items-center transition-colors">
      <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 ${c}`}><Icon className="w-6 h-6" /></div>
      <div className="flex-1"><div className="font-semibold text-[16px]">{title}</div><div className="text-[14px] text-[#6E6E73]">{body}</div></div>
      <ChevronRight className="w-5 h-5 text-[#C7C7CC]" />
    </motion.button>
  );
}
