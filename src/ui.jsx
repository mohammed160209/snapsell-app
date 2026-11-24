import React, { createContext, useContext, useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChevronLeft, Cake, Cookie, Flame, Leaf, Shirt, Sparkles, Store, LogOut, X, Plus, Minus } from './icons';
import { CATEGORIES, STATUS_LABEL } from './data';
import { useStore } from './store';

const ICONS = { Cake, Cookie, Flame, Leaf, Shirt, Sparkles };
export const catOf = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];

/* Motion presets — calm and quick, never bouncy. */
export const spring = { type: 'spring', stiffness: 420, damping: 38, mass: 0.9 };
export const softSpring = { type: 'spring', stiffness: 260, damping: 30 };
export const ease = [0.22, 1, 0.36, 1];

/* ───────────── App chrome ─────────────
   Phones follow native patterns:
   - Root tabs: glass brand bar on top, glass tab bar at the bottom.
   - Pushed screens (detail, forms, chat, sell flow): their own top bar with a back chevron,
     no tab bar, primary action pinned in the thumb zone, slide-in transition.
   Desktop keeps the web layout: header + pill nav + inline actions. */

const PushCtx = createContext({ pushed: 0, setPushed: () => {} });
export function ChromeProvider({ children }) {
  const [pushed, setPushed] = useState(0);
  return <PushCtx.Provider value={{ pushed, setPushed }}>{children}</PushCtx.Provider>;
}
export function usePushed(active = true) {
  const { setPushed } = useContext(PushCtx);
  useEffect(() => {
    if (!active) return undefined;
    setPushed((n) => n + 1);
    return () => setPushed((n) => n - 1);
  }, [active, setPushed]);
}
const useIsPushed = () => useContext(PushCtx).pushed > 0;

export function Logo({ sub }) {
  return (
    <div className="flex items-center gap-2.5 select-none min-w-0">
      <div className="w-9 h-9 rounded-[11px] bg-gradient-to-br from-[#5B4FF0] to-[#3B2FD9] text-white flex items-center justify-center shrink-0 shadow-[0_6px_14px_-6px_rgba(59,47,217,.7)]">
        <Store className="w-[19px] h-[19px]" strokeWidth={2} />
      </div>
      <div className="leading-tight min-w-0">
        <div className="text-[17px] font-bold tracking-[-0.02em] whitespace-nowrap">SnapSell <span className="text-[#3B2FD9]">Local</span></div>
        {sub && <div className="text-[12px] font-medium text-[#8E8E93] truncate">{sub}</div>}
      </div>
    </div>
  );
}

export function Header({ sub, right }) {
  const { me, logout } = useStore();
  const pushed = useIsPushed();
  return (
    <header className={`sticky top-0 z-30 glass hairline-b pt-safe ${pushed ? 'max-md:hidden' : ''}`}>
      <div className="max-w-5xl mx-auto px-5 h-[58px] md:h-16 flex items-center justify-between gap-2">
        <Logo sub={sub} />
        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          {right}
          <div className="hidden md:block text-right leading-tight mr-1">
            <div className="text-[13px] font-semibold">{me?.name}</div>
            <div className="text-[12px] text-[#8E8E93]">{me?.area}</div>
          </div>
          <button onClick={logout} className="icon-btn -mr-2 md:mr-0 text-[#6E6E73]" aria-label="Log out" title="Log out">
            <LogOut className="w-[21px] h-[21px]" />
          </button>
        </div>
      </div>
    </header>
  );
}

/** Top bar for pushed screens: back chevron + title on phones, a back link on desktop. */
export function TopBar({ title, onBack, right }) {
  usePushed(true);
  return (
    <>
      <div className="md:hidden sticky top-0 z-30 pt-safe glass hairline-b -mx-5 -mt-4 mb-4">
        <div className="h-[54px] px-1.5 flex items-center gap-0.5">
          <button onClick={onBack} className="icon-btn text-[#3B2FD9]" aria-label="Back"><ChevronLeft className="w-6 h-6" /></button>
          <div className="flex-1 min-w-0 text-[17px] font-semibold tracking-[-0.02em] truncate">{title}</div>
          <div className="flex items-center pr-2">{right}</div>
        </div>
      </div>
      <div className="hidden md:flex items-center justify-between mb-5">
        <button onClick={onBack} className="flex items-center gap-1 text-[15px] font-semibold text-[#3B2FD9] min-h-[44px] -ml-1"><ChevronLeft className="w-5 h-5" /> Back</button>
        {right}
      </div>
    </>
  );
}

/** Primary actions: pinned to the bottom on phones (glass bar), inline on desktop. */
export function ActionBar({ children, note, aboveTabs }) {
  return (
    <>
      <div className={`${aboveTabs ? (note ? 'h-28' : 'h-20') : (note ? 'h-36' : 'h-28')} md:hidden`} aria-hidden="true" />
      <div className={`${aboveTabs ? 'max-md:bottom-[calc(62px+env(safe-area-inset-bottom))] max-md:pb-3' : 'max-md:bottom-0 max-md:pb-[max(14px,env(safe-area-inset-bottom))]'} max-md:fixed max-md:inset-x-0 max-md:z-20 max-md:bg-white/95 max-md:backdrop-blur-xl max-md:hairline-t max-md:px-5 max-md:pt-3 md:mt-5`}>
        {note && <div className="text-[12px] text-[#8E8E93] mb-2 text-center md:text-left">{note}</div>}
        <div className="flex gap-2.5 max-w-5xl mx-auto">{children}</div>
      </div>
    </>
  );
}

export function BottomNav({ tabs, active, onChange }) {
  const pushed = useIsPushed();
  return (
    <nav className={`fixed bottom-0 inset-x-0 z-30 glass hairline-t pb-safe md:static md:bg-transparent md:shadow-none md:[backdrop-filter:none] ${pushed ? 'max-md:hidden' : ''}`} aria-label="Main">
      <div className="max-w-5xl mx-auto grid md:flex md:gap-2 md:px-5 md:pt-5" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
        {tabs.map((t) => {
          const on = active === t.id;
          return (
            <button key={t.id} onClick={() => onChange(t.id)} aria-current={on ? 'page' : undefined}
              className={`relative flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-2 h-[62px] md:h-10 md:px-4 md:rounded-full text-[11px] md:text-[14px] font-semibold tracking-[-0.01em] transition-colors ${on ? 'text-[#3B2FD9] md:text-white' : 'text-[#8E8E93] md:text-[#6E6E73] md:bg-white md:shadow-[0_0_0_1px_rgba(0,0,0,.07)]'}`}>
              {on && <motion.span layoutId="nav-active" transition={spring} className="hidden md:block absolute inset-0 rounded-full bg-[#3B2FD9]" />}
              <span className="relative flex items-center justify-center w-16 h-8 md:w-auto md:h-auto">
                {on && <motion.span layoutId="nav-active-m" transition={spring} className="md:hidden absolute inset-0 rounded-full bg-[#EEF0FF]" />}
                <t.icon className="relative w-[23px] h-[23px] md:w-[18px] md:h-[18px]" strokeWidth={on ? 2.1 : 1.7} />
                <AnimatePresence>
                  {t.badge > 0 && (
                    <motion.span key={t.badge} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }} transition={spring}
                      className="absolute -top-0.5 right-2.5 md:static md:ml-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF5A3D] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white md:ring-0">{t.badge}</motion.span>
                  )}
                </AnimatePresence>
              </span>
              <span className="relative">{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export const Page = ({ children }) => (
  <main className="max-w-5xl mx-auto px-5 pt-4 md:pt-6 pb-[calc(96px+env(safe-area-inset-bottom))] md:pb-12">{children}</main>
);

/** Screen entrance: tabs fade up, pushed screens slide in from the right. */
export function Enter({ children, push, id }) {
  const reduce = useReducedMotion();
  return (
    <motion.div key={id} initial={reduce ? false : push ? { opacity: 0, x: 28 } : { opacity: 0, y: 10 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ duration: 0.32, ease }}>
      {children}
    </motion.div>
  );
}

/** Staggered list: children fade up one after another. */
export const Stagger = ({ children, className = '', as = 'div' }) => {
  const M = motion[as];
  return <M className={className} initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.045, delayChildren: 0.04 } } }}>{children}</M>;
};
export const Item = ({ children, className = '', as = 'div', ...rest }) => {
  const M = motion[as];
  return <M className={className} variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.38, ease } } }} {...rest}>{children}</M>;
};

/** Large title for root tab screens. */
export const ScreenTitle = ({ children, sub, right, icon: Icon }) => (
  <div className="flex items-end justify-between gap-3">
    <div className="min-w-0">
      <h1 className="text-[30px] md:text-[28px] font-bold tracking-[-0.03em] leading-[1.1] flex items-center gap-2.5">{Icon && <Icon className="w-7 h-7 text-[#3B2FD9]" strokeWidth={1.8} />}{children}</h1>
      {sub && <div className="text-[14px] text-[#6E6E73] mt-1">{sub}</div>}
    </div>
    {right}
  </div>
);

/** Section heading with an icon tile and optional trailing action. */
export const SectionTitle = ({ icon: Icon, children, action, tone = 'indigo' }) => {
  const t = { indigo: 'bg-[#EEF0FF] text-[#3B2FD9]', coral: 'bg-[#FFF1EE] text-[#E8462B]', green: 'bg-[#E7F7EE] text-[#157F3E]', amber: 'bg-[#FEF6E4] text-[#B45309]', gray: 'bg-[#F2F2F5] text-[#6E6E73]' }[tone];
  return (
    <div className="flex items-center justify-between gap-3 mb-3">
      <h2 className="text-[18px] font-bold tracking-[-0.02em] flex items-center gap-2.5 min-w-0">
        {Icon && <span className={`w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 ${t}`}><Icon className="w-[18px] h-[18px]" /></span>}
        <span className="truncate">{children}</span>
      </h2>
      {action}
    </div>
  );
};

/** iOS-style segmented control with a sliding thumb. */
export function Segmented({ options, value, onChange, id, className = '' }) {
  return (
    <div className={`grid gap-1 p-1 rounded-[14px] bg-[#E9E9EE] ${className}`} style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }} role="tablist">
      {options.map((o) => {
        const on = value === o.id;
        return (
          <button key={o.id} role="tab" aria-selected={on} disabled={o.disabled} onClick={() => onChange(o.id)}
            className={`relative h-10 rounded-[11px] text-[14px] font-semibold tracking-[-0.01em] flex items-center justify-center gap-1.5 disabled:opacity-40 transition-colors ${on ? 'text-[#1D1D1F]' : 'text-[#6E6E73]'}`}>
            {on && <motion.span layoutId={`seg-${id}`} transition={spring} className="absolute inset-0 rounded-[11px] bg-white shadow-[0_1px_2px_rgba(0,0,0,.08),0_4px_10px_-2px_rgba(0,0,0,.08)]" />}
            <span className="relative flex items-center gap-1.5">{o.icon && <o.icon className="w-[18px] h-[18px]" />}{o.label}{o.badge > 0 && <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF5A3D] text-white text-[10px] inline-flex items-center justify-center">{o.badge}</span>}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Bottom sheet on phones (spring + drag to dismiss), centred dialog on desktop. */
export function Sheet({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);
  const isPhone = typeof window !== 'undefined' && window.innerWidth < 768;
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" role="dialog" aria-modal="true" aria-label={title}>
          <motion.button className="absolute inset-0 bg-black/35" onClick={onClose} aria-label="Close" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} />
          <motion.div
            className="relative w-full md:max-w-md bg-white rounded-t-[28px] md:rounded-[24px] px-5 pt-2.5 pb-[max(18px,env(safe-area-inset-bottom))] md:p-6 max-h-[88dvh] overflow-y-auto shadow-[0_-10px_40px_rgba(0,0,0,.12)]"
            initial={isPhone ? { y: '100%' } : { opacity: 0, scale: 0.96, y: 8 }}
            animate={isPhone ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
            exit={isPhone ? { y: '100%' } : { opacity: 0, scale: 0.96, y: 8 }}
            transition={softSpring}
            drag={isPhone ? 'y' : false} dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => { if (info.offset.y > 110 || info.velocity.y > 600) onClose(); }}>
            <div className="w-10 h-[5px] rounded-full bg-[#D1D1D6] mx-auto mb-3 md:hidden" />
            <div className="flex items-center justify-between mb-3">
              <div className="text-[20px] font-bold tracking-[-0.02em]">{title}</div>
              <button onClick={onClose} className="w-9 h-9 rounded-full bg-[#F2F2F5] flex items-center justify-center text-[#6E6E73] -mr-1" aria-label="Close"><X className="w-[18px] h-[18px]" /></button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export const SheetRow = ({ icon: Icon, label, hint, danger, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3.5 min-h-[60px] px-2 -mx-2 rounded-[14px] text-left active:bg-[#F5F5F7] transition-colors ${danger ? 'text-[#D93B2B]' : ''}`}>
    <span className={`w-11 h-11 rounded-[13px] flex items-center justify-center shrink-0 ${danger ? 'bg-[#FDECEA]' : 'bg-[#F2F2F5]'}`}><Icon className="w-[22px] h-[22px]" /></span>
    <span className="flex-1 min-w-0"><span className="block text-[16px] font-semibold tracking-[-0.01em]">{label}</span>{hint && <span className="block text-[13px] text-[#8E8E93]">{hint}</span>}</span>
  </button>
);

/** Category artwork: soft gradient tile with a large glyph. */
export function CategoryIcon({ category, size = 'md' }) {
  const c = catOf(category);
  const Icon = ICONS[c.icon];
  const dims = { sm: 'w-12 h-12 rounded-[14px]', md: 'w-full aspect-square rounded-[16px]', lg: 'w-full aspect-[4/3] md:aspect-[16/11] md:rounded-[24px]' }[size];
  const iconSize = { sm: 'w-6 h-6', md: 'w-12 h-12', lg: 'w-24 h-24' }[size];
  return (
    <div className={`${dims} relative overflow-hidden flex items-center justify-center shrink-0`} style={{ background: `radial-gradient(120% 90% at 30% 20%, #ffffff 0%, ${c.tint} 55%, ${c.tint} 100%)`, color: c.ink }}>
      <div className="absolute -right-6 -bottom-6 w-2/3 aspect-square rounded-full opacity-40" style={{ background: c.tint, filter: 'blur(2px)' }} />
      <Icon className={`${iconSize} relative`} strokeWidth={size === 'sm' ? 1.8 : 1.4} />
    </div>
  );
}

const STATUS_STYLE = {
  placed: 'bg-[#FFF1EE] text-[#C2410C]',
  accepted: 'bg-[#EEF0FF] text-[#3B2FD9]',
  out_for_delivery: 'bg-[#FEF6E4] text-[#B45309]',
  ready_for_pickup: 'bg-[#FEF6E4] text-[#B45309]',
  delivered: 'bg-[#E7F7EE] text-[#157F3E]',
  cancelled: 'bg-[#F2F2F5] text-[#8E8E93]',
};
export const StatusChip = ({ status }) => <span className={`chip shrink-0 ${STATUS_STYLE[status]}`}><span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />{STATUS_LABEL[status]}</span>;

export function Empty({ icon: Icon, title, body, action }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }} className="card px-6 py-12 text-center flex flex-col items-center gap-2">
      <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-[#F3F2FF] to-[#E6E4FF] text-[#3B2FD9] flex items-center justify-center mb-1"><Icon className="w-8 h-8" strokeWidth={1.6} /></div>
      <div className="font-bold text-[19px] tracking-[-0.02em]">{title}</div>
      <div className="text-[15px] text-[#6E6E73] max-w-xs leading-relaxed">{body}</div>
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}

export const Stepper = ({ value, onDec, onInc, label = 'quantity', size = 'md' }) => (
  <div className={`flex items-center rounded-[14px] bg-[#F2F2F5] shrink-0 ${size === 'sm' ? 'h-10' : 'h-[52px]'}`}>
    <button className={`${size === 'sm' ? 'w-10' : 'w-12'} h-full flex items-center justify-center text-[#1D1D1F] active:scale-90 transition-transform`} onClick={onDec} aria-label={`Decrease ${label}`}><Minus className="w-4 h-4" /></button>
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span key={value} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 8, opacity: 0 }} transition={{ duration: 0.18 }} className="min-w-7 text-center font-bold tabular-nums" aria-live="polite">{value}</motion.span>
    </AnimatePresence>
    <button className={`${size === 'sm' ? 'w-10' : 'w-12'} h-full flex items-center justify-center text-[#1D1D1F] active:scale-90 transition-transform`} onClick={onInc} aria-label={`Increase ${label}`}><Plus className="w-4 h-4" /></button>
  </div>
);

/** Full-screen confirmation with a drawn check — used after paying and publishing. */
export function Success({ open, title, body, primary, onPrimary, secondary, onSecondary }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center px-8 text-center pt-safe pb-safe" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} role="dialog" aria-modal="true" aria-label={title}>
          <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...softSpring, delay: 0.05 }} className="w-24 h-24 rounded-full bg-[#E7F7EE] flex items-center justify-center">
            <svg viewBox="0 0 52 52" className="w-14 h-14" aria-hidden="true">
              <motion.circle cx="26" cy="26" r="23" fill="none" stroke="#1F9D55" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, ease, delay: 0.1 }} />
              <motion.path d="M15 27l7 7 15-16" fill="none" stroke="#1F9D55" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, ease, delay: 0.5 }} />
            </svg>
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.4, ease }} className="text-[28px] font-bold tracking-[-0.03em] mt-6">{title}</motion.h2>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.4, ease }} className="text-[16px] text-[#6E6E73] mt-2 max-w-xs leading-relaxed">{body}</motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65, duration: 0.4, ease }} className="grid gap-2.5 w-full max-w-sm mt-8">
            <button className="btn btn-primary h-[52px]" onClick={onPrimary}>{primary}</button>
            {secondary && <button className="btn h-[52px] text-[#3B2FD9]" onClick={onSecondary}>{secondary}</button>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const timeAgo = (iso) => {
  const m = Math.round((Date.now() - new Date(iso)) / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h} hr ago` : `${Math.round(h / 24)} d ago`;
};
