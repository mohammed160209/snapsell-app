import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, ShoppingBag, Store, Truck } from 'lucide-react';
import { CATEGORIES } from './data';
import { useStore } from './store';
import { Logo } from './ui';

const AREAS = ['Koramangala', 'Indiranagar', 'HSR Layout', 'Jayanagar', 'BTM Layout', 'Whitefield'];

export default function Onboarding() {
  const { signUp, loginAs } = useStore();
  const [role, setRole] = useState(null);
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

  if (!role) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="max-w-5xl w-full mx-auto px-4 h-16 flex items-center"><Logo /></div>
        <div className="flex-1 max-w-5xl w-full mx-auto px-4 pb-10 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <span className="chip bg-[#EEF0FF] text-[#3B2FD9]">Hyperlocal marketplace · Bengaluru</span>
            <h1 className="text-[32px] md:text-[44px] font-extrabold leading-[1.1] tracking-tight mt-4">
              Shop from new local brands, <span className="text-[#3B2FD9]">right in your neighbourhood.</span>
            </h1>
            <p className="text-[15px] text-[#4E5369] mt-4 max-w-md">
              Home bakers, candle makers and small studios open a storefront in minutes. Neighbours order, pay online and get it delivered within 5 km.
            </p>
            <div className="flex flex-wrap gap-4 mt-6 text-[13px] text-[#4E5369]">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-[#157F3E]" /> Secure UPI payments</span>
              <span className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-[#3B2FD9]" /> Delivery or pickup</span>
            </div>
          </div>
          <div className="card p-5 md:p-6">
            <div className="text-[17px] font-bold">How do you want to use SnapSell?</div>
            <div className="text-[13px] text-[#7C8199] mt-1">You can always shop. Businesses get their own seller dashboard.</div>
            <div className="grid gap-3 mt-4">
              <button onClick={() => setRole('buyer')} className="text-left p-4 rounded-[14px] border border-[#E8EAF2] hover:border-[#3B2FD9] hover:bg-[#F8F8FF] flex gap-3 items-start transition">
                <div className="w-11 h-11 rounded-[12px] bg-[#EEF0FF] text-[#3B2FD9] flex items-center justify-center shrink-0"><ShoppingBag className="w-5 h-5" /></div>
                <div><div className="font-bold">I want to shop local</div><div className="text-[13px] text-[#4E5369]">Discover brands near you, order and track deliveries.</div></div>
              </button>
              <button onClick={() => setRole('seller')} className="text-left p-4 rounded-[14px] border border-[#E8EAF2] hover:border-[#FF5A3D] hover:bg-[#FFF8F6] flex gap-3 items-start transition">
                <div className="w-11 h-11 rounded-[12px] bg-[#FFF1EE] text-[#FF5A3D] flex items-center justify-center shrink-0"><Store className="w-5 h-5" /></div>
                <div><div className="font-bold">I run a local business</div><div className="text-[13px] text-[#4E5369]">Open your storefront, manage stock, orders and payouts.</div></div>
              </button>
            </div>
            <div className="mt-5 pt-4 border-t border-[#E8EAF2]">
              <div className="text-[12px] font-semibold text-[#7C8199] uppercase tracking-wide">Try a demo account</div>
              <div className="flex flex-wrap gap-2 mt-2">
                <button className="btn btn-ghost h-9 text-[13px]" onClick={() => loginAs('u-buyer')}>Buyer · Kabir</button>
                <button className="btn btn-ghost h-9 text-[13px]" onClick={() => loginAs('u-seller')}>Business · Crumb &amp; Co.</button>
                <button className="btn btn-ghost h-9 text-[13px]" onClick={() => loginAs('u-admin')}>Admin</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const seller = role === 'seller';
  return (
    <div className="min-h-screen flex items-start md:items-center justify-center px-4 py-8">
      <div className="card p-6 w-full max-w-md">
        <button onClick={() => (step === 'phone' ? setRole(null) : setStep(step === 'profile' ? 'otp' : 'phone'))} className="flex items-center gap-1 text-[13px] font-semibold text-[#4E5369] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <span className={`chip ${seller ? 'bg-[#FFF1EE] text-[#C2410C]' : 'bg-[#EEF0FF] text-[#3B2FD9]'}`}>{seller ? 'Business account' : 'Shopper account'}</span>
        <h2 className="text-[22px] font-extrabold mt-3">
          {step === 'phone' && 'Enter your mobile number'}
          {step === 'otp' && 'Verify your number'}
          {step === 'profile' && (seller ? 'Set up your storefront' : 'Tell us about you')}
        </h2>
        <div className="grid gap-3 mt-4">
          {step === 'phone' && (
            <div className="flex gap-2">
              <div className="input w-16 flex items-center justify-center font-semibold">+91</div>
              <input className="input" inputMode="numeric" placeholder="98450 24190" value={f.phone} onChange={set('phone')} autoFocus />
            </div>
          )}
          {step === 'otp' && (
            <>
              <div className="text-[13px] text-[#4E5369]">We sent a 4-digit code to +91 {f.phone}. Demo code: <b>1234</b></div>
              <input className="input text-center tracking-[0.5em] text-[18px] font-bold" inputMode="numeric" maxLength={4} placeholder="••••" value={f.otp} onChange={set('otp')} autoFocus />
            </>
          )}
          {step === 'profile' && (
            <>
              <label className="text-[13px] font-semibold">Your name<input className="input mt-1" placeholder="Ananya Rao" value={f.name} onChange={set('name')} autoFocus /></label>
              <label className="text-[13px] font-semibold">Area<select className="input mt-1" value={f.area} onChange={set('area')}>{AREAS.map((a) => <option key={a}>{a}</option>)}</select></label>
              {seller && (
                <>
                  <label className="text-[13px] font-semibold">Business name<input className="input mt-1" placeholder="Crumb & Co." value={f.brandName} onChange={set('brandName')} /></label>
                  <label className="text-[13px] font-semibold">What do you sell?<select className="input mt-1" value={f.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
                  <label className="text-[13px] font-semibold">One-line description<input className="input mt-1" placeholder="Small-batch bakes from my home kitchen" value={f.tagline} onChange={set('tagline')} /></label>
                </>
              )}
            </>
          )}
          {err && <div className="text-[13px] text-[#C2410C]">{err}</div>}
          <button className={`btn ${seller ? 'btn-coral' : 'btn-primary'} w-full h-12 mt-1`} onClick={next}>
            {step === 'profile' ? (seller ? 'Open my storefront' : 'Start shopping') : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
