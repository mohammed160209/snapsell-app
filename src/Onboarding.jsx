import React, { useState } from 'react';
import { ChevronLeft, ShieldCheck, ShoppingBag, Store, Truck, Recycle, UserRound, LayoutDashboard, ChevronRight } from 'lucide-react';
import { CATEGORIES } from './data';
import { useStore } from './store';
import { Logo, Sheet, SheetRow } from './ui';

const AREAS = ['Koramangala', 'Indiranagar', 'HSR Layout', 'Jayanagar', 'BTM Layout', 'Whitefield'];
const HERO = ['./images/study-table-1.jpg', './images/hero-cycle.jpg', './images/headphones.jpg', './images/ikea-chair.jpg'];

export default function Onboarding() {
  const { signUp, loginAs } = useStore();
  const [role, setRole] = useState(null);
  const [demoOpen, setDemoOpen] = useState(false);
  const [step, setStep] = useState('phone'); // phone | otp | profile
  const [f, setF] = useState({ name: '', phone: '', otp: '', area: 'Koramangala', brandName: '', category: 'bakery', tagline: '' });
  const [err, setErr] = useState('');
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setErr(''); };

  const next = () => {
    if (step === 'phone') {
      if (f.phone.replace(/\D/g, '').length !== 10) return setErr('Enter a 10-digit mobile number');
      return setStep('otp');
    }
    if (step === 'otp') {
      if (f.otp !== '1234') return setErr('That code doesn’t match. For the demo, use 1234');
      return setStep('profile');
    }
    if (!f.name.trim()) return setErr('Enter your name');
    if (role === 'seller' && !f.brandName.trim()) return setErr('Enter your business name');
    signUp({ ...f, role });
  };
  const back = () => { setErr(''); if (step === 'phone') setRole(null); else setStep(step === 'profile' ? 'otp' : 'phone'); };

  if (!role) {
    return (
      <div className="min-h-[100dvh] flex flex-col pt-safe">
        <div className="max-w-5xl w-full mx-auto px-4 h-14 md:h-16 flex items-center"><Logo compact /></div>

        {/* Phone: app-style welcome — visual on top, choices in the thumb zone */}
        <div className="md:hidden flex-1 flex flex-col px-4 pb-[max(16px,env(safe-area-inset-bottom))]">
          <div className="grid grid-cols-2 gap-2 mt-2" aria-hidden="true">
            <div className="grid gap-2 min-w-0"><img src={HERO[0]} alt="" className="w-full h-[150px] object-cover rounded-[18px]" /><img src={HERO[2]} alt="" className="w-full h-[110px] object-cover rounded-[18px]" /></div>
            <div className="grid gap-2 min-w-0"><img src={HERO[1]} alt="" className="w-full h-[110px] object-cover rounded-[18px]" /><img src={HERO[3]} alt="" className="w-full h-[150px] object-cover rounded-[18px]" /></div>
          </div>
          <h1 className="text-[28px] font-extrabold leading-[1.12] tracking-tight mt-5">
            Your neighbourhood’s <span className="text-[#3B2FD9]">local shop</span> and <span className="text-[#FF5A3D]">swap market.</span>
          </h1>
          <p className="text-[15px] text-[#4E5369] mt-2">Buy from new local brands, or sell what you don’t need to people nearby.</p>
          <div className="flex-1 min-h-6" />
          <div className="grid gap-2.5 mt-6">
            <button className="btn btn-primary h-14 text-[16px] justify-between px-5" onClick={() => setRole('buyer')}><span className="flex items-center gap-2"><ShoppingBag className="w-5 h-5" />I want to shop and sell</span><ChevronRight className="w-5 h-5" /></button>
            <button className="btn btn-ghost h-14 text-[16px] justify-between px-5" onClick={() => setRole('seller')}><span className="flex items-center gap-2"><Store className="w-5 h-5 text-[#FF5A3D]" />I run a local business</span><ChevronRight className="w-5 h-5 text-[#7C8199]" /></button>
            <button className="min-h-[44px] text-[14px] font-semibold text-[#3B2FD9]" onClick={() => setDemoOpen(true)}>Try a demo account</button>
          </div>
        </div>

        {/* Desktop: two-column landing */}
        <div className="hidden md:grid flex-1 max-w-5xl w-full mx-auto px-4 pb-10 grid-cols-2 gap-8 items-center">
          <div>
            <span className="chip bg-[#EEF0FF] text-[#3B2FD9]">Hyperlocal marketplace · Bengaluru</span>
            <h1 className="text-[44px] font-extrabold leading-[1.1] tracking-tight mt-4">
              Shop from new local brands, <span className="text-[#3B2FD9]">right in your neighbourhood.</span>
            </h1>
            <p className="text-[15px] text-[#4E5369] mt-4 max-w-md">Home bakers, candle makers and small studios open a storefront in minutes. Neighbours order, pay online and get it delivered within 5 km — or swap secondhand items nearby.</p>
            <div className="flex flex-wrap gap-4 mt-6 text-[13px] text-[#4E5369]">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-[#157F3E]" /> Secure UPI payments</span>
              <span className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-[#3B2FD9]" /> Delivery or pickup</span>
              <span className="flex items-center gap-1.5"><Recycle className="w-4 h-4 text-[#FF5A3D]" /> Secondhand from neighbours</span>
            </div>
          </div>
          <div className="card p-6">
            <div className="text-[17px] font-bold">How do you want to use SnapSell?</div>
            <div className="text-[13px] text-[#7C8199] mt-1">Shoppers can also sell secondhand items. Businesses get their own seller dashboard.</div>
            <div className="grid gap-3 mt-4">
              <RoleCard icon={ShoppingBag} tone="indigo" title="I want to shop and sell" body="Discover local brands, order, and swap secondhand items." onClick={() => setRole('buyer')} />
              <RoleCard icon={Store} tone="coral" title="I run a local business" body="Open your storefront, manage stock, orders and payouts." onClick={() => setRole('seller')} />
            </div>
            <div className="mt-5 pt-4 border-t border-[#E8EAF2] flex items-center justify-between">
              <span className="text-[13px] text-[#7C8199]">Just looking around?</span>
              <button className="btn btn-ghost h-10" onClick={() => setDemoOpen(true)}>Try a demo account</button>
            </div>
          </div>
        </div>

        <Sheet open={demoOpen} onClose={() => setDemoOpen(false)} title="Try a demo account">
          <div className="text-[13px] text-[#4E5369] mb-2 px-2">Pre-filled accounts with orders, listings and deals.</div>
          <SheetRow icon={UserRound} label="Kabir · Shopper" hint="Shop local brands, buy and sell secondhand" onClick={() => loginAs('u-buyer')} />
          <SheetRow icon={Store} label="Ananya · Crumb & Co." hint="Business dashboard with live orders" onClick={() => loginAs('u-seller')} />
          <SheetRow icon={LayoutDashboard} label="Admin" hint="Approve sellers, see commission" onClick={() => loginAs('u-admin')} />
        </Sheet>
      </div>
    );
  }

  const seller = role === 'seller';
  const stepNo = { phone: 1, otp: 2, profile: 3 }[step];
  return (
    <div className="min-h-[100dvh] flex flex-col md:items-center md:justify-center md:py-10 pt-safe">
      <div className="w-full md:max-w-md md:card flex-1 md:flex-none flex flex-col">
        <div className="h-14 px-1 flex items-center gap-2 md:px-3 md:pt-3">
          <button onClick={back} className="icon-btn" aria-label="Back"><ChevronLeft className="w-6 h-6" /></button>
          <div className="flex-1 flex gap-1.5 pr-4" aria-label={`Step ${stepNo} of 3`}>
            {[1, 2, 3].map((n) => <span key={n} className={`h-1.5 flex-1 rounded-full ${n <= stepNo ? (seller ? 'bg-[#FF5A3D]' : 'bg-[#3B2FD9]') : 'bg-[#E8EAF2]'}`} />)}
          </div>
        </div>
        <form className="flex-1 flex flex-col px-4 md:px-6 pb-[max(16px,env(safe-area-inset-bottom))] md:pb-6" onSubmit={(e) => { e.preventDefault(); next(); }}>
          <span className={`chip w-fit mt-2 ${seller ? 'bg-[#FFF1EE] text-[#C2410C]' : 'bg-[#EEF0FF] text-[#3B2FD9]'}`}>{seller ? 'Business account' : 'Shopper account'}</span>
          <h2 className="text-[26px] font-extrabold tracking-tight mt-3 leading-tight">
            {step === 'phone' && 'What’s your mobile number?'}
            {step === 'otp' && 'Enter the code we sent'}
            {step === 'profile' && (seller ? 'Set up your storefront' : 'A little about you')}
          </h2>
          <p className="text-[14px] text-[#4E5369] mt-1">
            {step === 'phone' && 'We’ll text you a 4-digit code to verify it.'}
            {step === 'otp' && <>Sent to +91 {f.phone}. Demo code: <b>1234</b></>}
            {step === 'profile' && (seller ? 'Shoppers within 5 km will see this.' : 'We show items from sellers near your area.')}
          </p>
          <div className="grid gap-4 mt-6">
            {step === 'phone' && (
              <div className="flex gap-2">
                <div className="input w-[72px] flex items-center justify-center font-semibold shrink-0">+91</div>
                <input className="input text-[18px] tracking-wide" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="98450 24190" value={f.phone} onChange={set('phone')} autoFocus aria-label="Mobile number" />
              </div>
            )}
            {step === 'otp' && (
              <input className="input text-center tracking-[0.6em] text-[24px] font-bold h-16" inputMode="numeric" autoComplete="one-time-code" maxLength={4} placeholder="••••" value={f.otp} onChange={set('otp')} autoFocus aria-label="Verification code" />
            )}
            {step === 'profile' && (
              <>
                <Field label="Your name"><input className="input" autoComplete="name" placeholder="Ananya Rao" value={f.name} onChange={set('name')} autoFocus /></Field>
                <Field label="Your area"><select className="input" value={f.area} onChange={set('area')}>{AREAS.map((a) => <option key={a}>{a}</option>)}</select></Field>
                {seller && (
                  <>
                    <Field label="Business name"><input className="input" placeholder="Crumb & Co." value={f.brandName} onChange={set('brandName')} /></Field>
                    <Field label="What do you sell?"><select className="input" value={f.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
                    <Field label="One-line description"><input className="input" placeholder="Small-batch bakes from my home kitchen" value={f.tagline} onChange={set('tagline')} /></Field>
                  </>
                )}
              </>
            )}
            {err && <div className="text-[14px] text-[#C2410C]" role="alert">{err}</div>}
          </div>
          <div className="flex-1 min-h-6" />
          <button type="submit" className={`btn ${seller ? 'btn-coral' : 'btn-primary'} w-full h-14 text-[16px] mt-6`}>
            {step === 'profile' ? (seller ? 'Open my storefront' : 'Start exploring') : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}

const Field = ({ label, children }) => <label className="grid gap-1.5 text-[14px] font-semibold">{label}{children}</label>;

function RoleCard({ icon: Icon, tone, title, body, onClick }) {
  const c = tone === 'coral' ? 'bg-[#FFF1EE] text-[#FF5A3D]' : 'bg-[#EEF0FF] text-[#3B2FD9]';
  return (
    <button onClick={onClick} className="text-left p-4 rounded-[14px] border border-[#E8EAF2] hover:border-[#3B2FD9] hover:bg-[#F8F8FF] flex gap-3 items-start transition">
      <div className={`w-11 h-11 rounded-[12px] flex items-center justify-center shrink-0 ${c}`}><Icon className="w-5 h-5" /></div>
      <div><div className="font-bold">{title}</div><div className="text-[13px] text-[#4E5369]">{body}</div></div>
    </button>
  );
}
