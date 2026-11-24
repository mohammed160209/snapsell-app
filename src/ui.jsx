import React, { createContext, useContext, useEffect, useState } from 'react';
import { ChevronLeft, Cake, Cookie, Flame, Leaf, Shirt, Sparkles, Store, LogOut, X } from 'lucide-react';
import { CATEGORIES, STATUS_LABEL } from './data';
import { useStore } from './store';

const ICONS = { Cake, Cookie, Flame, Leaf, Shirt, Sparkles };
export const catOf = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];

/* ───────────── App chrome ─────────────
   Mobile follows native app patterns:
   - Root tabs: compact brand bar on top, tab bar at the bottom.
   - Pushed screens (detail, forms, chat): their own top bar with a back chevron,
     no tab bar, and the primary action pinned at the bottom (thumb zone).
   Desktop keeps the web layout: header + pill nav + inline actions. */

const PushCtx = createContext({ pushed: 0, setPushed: () => {} });
export function ChromeProvider({ children }) {
  const [pushed, setPushed] = useState(0);
  return <PushCtx.Provider value={{ pushed, setPushed }}>{children}</PushCtx.Provider>;
}
/** Call inside a pushed screen: hides the tab bar and brand header on phones while mounted. */
export function usePushed(active = true) {
  const { setPushed } = useContext(PushCtx);
  useEffect(() => {
    if (!active) return undefined;
    setPushed((n) => n + 1);
    return () => setPushed((n) => n - 1);
  }, [active, setPushed]);
}
const useIsPushed = () => useContext(PushCtx).pushed > 0;

export function Logo({ sub, compact }) {
  return (
    <div className="flex items-center gap-2 select-none min-w-0">
      <div className={`${compact ? 'w-8 h-8 rounded-[10px]' : 'w-9 h-9 rounded-[11px]'} bg-[#3B2FD9] text-white flex items-center justify-center shrink-0`}>
        <Store className="w-[18px] h-[18px]" strokeWidth={2.3} />
      </div>
      <div className="leading-tight min-w-0">
        <div className={`${compact ? 'text-[17px]' : 'text-[18px]'} font-extrabold tracking-tight whitespace-nowrap`}>
          Snap<span className="text-[#3B2FD9]">Sell</span> <span className="text-[#FF5A3D]">Local</span>
        </div>
        {sub && <div className="text-[11px] font-medium text-[#7C8199] truncate">{sub}</div>}
      </div>
    </div>
  );
}

/** Brand header for root tabs. Hidden on phones while a pushed screen is open. */
export function Header({ sub, right }) {
  const { me, logout } = useStore();
  const pushed = useIsPushed();
  return (
    <header className={`sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#EDEEF4] pt-safe ${pushed ? 'max-md:hidden' : ''}`}>
      <div className="max-w-5xl mx-auto px-4 h-14 md:h-16 flex items-center justify-between gap-2">
        <Logo sub={sub} compact />
        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          {right}
          <div className="hidden md:block text-right leading-tight mr-1">
            <div className="text-[13px] font-semibold">{me?.name}</div>
            <div className="text-[11px] text-[#7C8199]">{me?.area}</div>
          </div>
          <button onClick={logout} className="icon-btn md:border md:border-[#E8EAF2] text-[#4E5369]" aria-label="Log out" title="Log out">
            <LogOut className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </header>
  );
}

/** Top bar for pushed screens: back chevron + title on phones, a back link on desktop. */
export function TopBar({ title, onBack, right, transparent }) {
  usePushed(true);
  return (
    <>
      <div className={`md:hidden sticky top-0 z-30 pt-safe ${transparent ? 'bg-transparent' : 'bg-white/90 backdrop-blur-md border-b border-[#EDEEF4]'} -mx-4 -mt-4 mb-3`}>
        <div className="h-14 px-1 flex items-center gap-1">
          <button onClick={onBack} className="icon-btn" aria-label="Back"><ChevronLeft className="w-6 h-6" /></button>
          <div className="flex-1 min-w-0 text-[17px] font-bold truncate">{title}</div>
          <div className="flex items-center pr-1">{right}</div>
        </div>
      </div>
      <div className="hidden md:flex items-center justify-between mb-4">
        <button onClick={onBack} className="flex items-center gap-1 text-[14px] font-semibold text-[#4E5369] min-h-[44px]"><ChevronLeft className="w-5 h-5" /> Back</button>
        {right}
      </div>
    </>
  );
}

/** Primary actions: pinned to the bottom of the screen on phones, inline on desktop. */
export function ActionBar({ children, note, aboveTabs }) {
  return (
    <>
      <div className={`${aboveTabs ? 'h-20' : 'h-24'} md:hidden`} aria-hidden="true" />
      <div className={`${aboveTabs ? 'max-md:bottom-[calc(58px+env(safe-area-inset-bottom))] max-md:pb-3' : 'max-md:bottom-0 max-md:pb-[max(12px,env(safe-area-inset-bottom))]'} max-md:fixed max-md:inset-x-0 max-md:z-20 max-md:bg-white/95 max-md:backdrop-blur-md max-md:border-t max-md:border-[#EDEEF4] max-md:px-4 max-md:pt-3 md:mt-4`}>
        {note && <div className="text-[12px] text-[#7C8199] mb-2 text-center md:text-left">{note}</div>}
        <div className="flex gap-2 max-w-5xl mx-auto">{children}</div>
      </div>
    </>
  );
}

export function BottomNav({ tabs, active, onChange }) {
  const pushed = useIsPushed();
  return (
    <nav className={`fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#EDEEF4] pb-safe md:static md:border-0 md:bg-transparent md:backdrop-blur-none ${pushed ? 'max-md:hidden' : ''}`} aria-label="Main">
      <div className="max-w-5xl mx-auto grid md:flex md:gap-2 md:px-4 md:pt-4" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
        {tabs.map((t) => {
          const on = active === t.id;
          return (
            <button key={t.id} onClick={() => onChange(t.id)} aria-current={on ? 'page' : undefined}
              className={`relative flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-2 h-[58px] md:h-10 md:px-4 md:rounded-full text-[11px] md:text-[14px] font-semibold transition-colors ${on ? 'text-[#3B2FD9] md:bg-[#3B2FD9] md:text-white' : 'text-[#7C8199] md:bg-white md:border md:border-[#E8EAF2] md:text-[#4E5369]'}`}>
              <span className={`relative flex items-center justify-center w-14 h-7 rounded-full transition-colors md:w-auto md:h-auto ${on ? 'bg-[#EEF0FF] md:bg-transparent' : ''}`}>
                <t.icon className="w-[22px] h-[22px] md:w-4 md:h-4" strokeWidth={on ? 2.4 : 2} />
                {t.badge > 0 && <span className="absolute -top-1 right-2 md:static md:ml-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF5A3D] text-white text-[10px] font-bold flex items-center justify-center">{t.badge}</span>}
              </span>
              {t.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export const Page = ({ children }) => (
  <main className="max-w-5xl mx-auto px-4 pt-4 pb-[calc(88px+env(safe-area-inset-bottom))] md:pb-12">{children}</main>
);

/** Large title for root tab screens (phones), regular heading on desktop. */
export const ScreenTitle = ({ children, sub, right }) => (
  <div className="flex items-end justify-between gap-3">
    <div className="min-w-0"><h1 className="text-[26px] md:text-[24px] font-extrabold tracking-tight leading-tight">{children}</h1>{sub && <div className="text-[13px] text-[#4E5369] mt-0.5">{sub}</div>}</div>
    {right}
  </div>
);

/** Bottom sheet on phones, centred dialog on desktop. */
export function Sheet({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <button className="absolute inset-0 bg-[#111322]/45 fade-enter" onClick={onClose} aria-label="Close" />
      <div className="relative w-full md:max-w-md bg-white rounded-t-[24px] md:rounded-[20px] px-4 pt-2 pb-[max(16px,env(safe-area-inset-bottom))] md:p-5 sheet-enter md:fade-enter max-h-[85dvh] overflow-y-auto">
        <div className="w-10 h-1.5 rounded-full bg-[#E2E4EE] mx-auto mb-3 md:hidden" />
        <div className="flex items-center justify-between mb-3">
          <div className="text-[18px] font-bold">{title}</div>
          <button onClick={onClose} className="icon-btn -mr-2" aria-label="Close"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Row inside a sheet menu. */
export const SheetRow = ({ icon: Icon, label, hint, danger, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 min-h-[56px] px-2 rounded-[12px] text-left active:bg-[#F7F7FA] ${danger ? 'text-[#C2410C]' : ''}`}>
    <span className={`w-10 h-10 rounded-full flex items-center justify-center ${danger ? 'bg-[#FFF1EE]' : 'bg-[#F1F1F6]'}`}><Icon className="w-5 h-5" /></span>
    <span className="flex-1"><span className="block text-[15px] font-semibold">{label}</span>{hint && <span className="block text-[12px] text-[#7C8199]">{hint}</span>}</span>
  </button>
);

export function CategoryIcon({ category, size = 'md' }) {
  const c = catOf(category);
  const Icon = ICONS[c.icon];
  const dims = { sm: 'w-11 h-11 rounded-[12px]', md: 'w-full aspect-square rounded-[12px]', lg: 'w-full aspect-[4/3] md:aspect-[16/10] md:rounded-[16px]' }[size];
  const iconSize = { sm: 'w-5 h-5', md: 'w-10 h-10', lg: 'w-20 h-20' }[size];
  return (
    <div className={`${dims} flex items-center justify-center shrink-0`} style={{ background: c.tint, color: c.ink }}>
      <Icon className={iconSize} strokeWidth={1.6} />
    </div>
  );
}

const STATUS_STYLE = {
  placed: 'bg-[#FFF1EE] text-[#C2410C]',
  accepted: 'bg-[#EEF0FF] text-[#3B2FD9]',
  out_for_delivery: 'bg-[#FEF6E4] text-[#B45309]',
  ready_for_pickup: 'bg-[#FEF6E4] text-[#B45309]',
  delivered: 'bg-[#E7F7EE] text-[#157F3E]',
  cancelled: 'bg-[#F1F1F4] text-[#7C8199]',
};
export const StatusChip = ({ status }) => <span className={`chip shrink-0 ${STATUS_STYLE[status]}`}>{STATUS_LABEL[status]}</span>;

export function Empty({ icon: Icon, title, body, action }) {
  return (
    <div className="card px-6 py-10 text-center flex flex-col items-center gap-2">
      <div className="w-14 h-14 rounded-full bg-[#EEF0FF] text-[#3B2FD9] flex items-center justify-center"><Icon className="w-7 h-7" /></div>
      <div className="font-bold text-[17px] mt-1">{title}</div>
      <div className="text-[14px] text-[#4E5369] max-w-xs">{body}</div>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

/** − n + stepper with 44px targets. */
export const Stepper = ({ value, onDec, onInc, label = 'quantity', size = 'md' }) => (
  <div className={`flex items-center border border-[#E2E4EE] rounded-[12px] bg-white shrink-0 ${size === 'sm' ? 'h-10' : 'h-12'}`}>
    <button className={`${size === 'sm' ? 'w-10' : 'w-11'} h-full flex items-center justify-center text-[20px] font-semibold`} onClick={onDec} aria-label={`Decrease ${label}`}>−</button>
    <span className="min-w-7 text-center font-bold tabular-nums" aria-live="polite">{value}</span>
    <button className={`${size === 'sm' ? 'w-10' : 'w-11'} h-full flex items-center justify-center text-[20px] font-semibold`} onClick={onInc} aria-label={`Increase ${label}`}>+</button>
  </div>
);

export const timeAgo = (iso) => {
  const m = Math.round((Date.now() - new Date(iso)) / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h} hr ago` : `${Math.round(h / 24)} d ago`;
};
