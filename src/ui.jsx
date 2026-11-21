import React from 'react';
import { Cake, Cookie, Flame, Leaf, Shirt, Sparkles, Store, LogOut } from 'lucide-react';
import { CATEGORIES, STATUS_LABEL } from './data';
import { useStore } from './store';

const ICONS = { Cake, Cookie, Flame, Leaf, Shirt, Sparkles };
export const catOf = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];

export function Logo({ sub }) {
  return (
    <div className="flex items-center gap-2 select-none">
      <div className="w-9 h-9 rounded-[11px] bg-[#3B2FD9] text-white flex items-center justify-center">
        <Store className="w-5 h-5" strokeWidth={2.3} />
      </div>
      <div className="leading-tight">
        <div className="text-[18px] font-extrabold tracking-tight">
          Snap<span className="text-[#3B2FD9]">Sell</span> <span className="text-[#FF5A3D]">Local</span>
        </div>
        {sub && <div className="text-[11px] font-medium text-[#7C8199]">{sub}</div>}
      </div>
    </div>
  );
}

export function CategoryIcon({ category, size = 'md' }) {
  const c = catOf(category);
  const Icon = ICONS[c.icon];
  const dims = { sm: 'w-10 h-10 rounded-[10px]', md: 'w-full aspect-[4/3] rounded-[12px]', lg: 'w-full aspect-[16/10] rounded-[16px]' }[size];
  const iconSize = { sm: 'w-5 h-5', md: 'w-10 h-10', lg: 'w-16 h-16' }[size];
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
export const StatusChip = ({ status }) => <span className={`chip ${STATUS_STYLE[status]}`}>{STATUS_LABEL[status]}</span>;

export function Header({ sub, right }) {
  const { me, logout } = useStore();
  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-[#E8EAF2]">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        <Logo sub={sub} />
        <div className="flex items-center gap-2">
          {right}
          <div className="hidden sm:block text-right leading-tight">
            <div className="text-[13px] font-semibold">{me?.name}</div>
            <div className="text-[11px] text-[#7C8199]">{me?.area}</div>
          </div>
          <button onClick={logout} className="w-10 h-10 rounded-full border border-[#E8EAF2] flex items-center justify-center text-[#4E5369] hover:bg-[#F7F7FA]" aria-label="Log out" title="Log out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

export function BottomNav({ tabs, active, onChange }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-20 bg-white border-t border-[#E8EAF2] md:static md:border-0 md:bg-transparent">
      <div className="max-w-5xl mx-auto grid md:flex md:gap-2 md:px-4 md:pt-4" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
        {tabs.map((t) => {
          const on = active === t.id;
          return (
            <button key={t.id} onClick={() => onChange(t.id)}
              className={`relative flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 py-2.5 md:py-2 md:px-4 md:rounded-full text-[11px] md:text-[14px] font-semibold transition ${on ? 'text-[#3B2FD9] md:bg-[#3B2FD9] md:text-white' : 'text-[#7C8199] md:bg-white md:border md:border-[#E8EAF2] md:text-[#4E5369]'}`}>
              <t.icon className="w-5 h-5 md:w-4 md:h-4" />
              {t.label}
              {t.badge > 0 && <span className="absolute top-1.5 right-[28%] md:static min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF5A3D] text-white text-[10px] flex items-center justify-center">{t.badge}</span>}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export const Page = ({ children }) => <main className="max-w-5xl mx-auto px-4 pt-4 pb-28 md:pb-12">{children}</main>;

export function Empty({ icon: Icon, title, body, action }) {
  return (
    <div className="card p-8 text-center flex flex-col items-center gap-2">
      <div className="w-12 h-12 rounded-full bg-[#EEF0FF] text-[#3B2FD9] flex items-center justify-center"><Icon className="w-6 h-6" /></div>
      <div className="font-bold text-[16px] mt-1">{title}</div>
      <div className="text-[13px] text-[#4E5369] max-w-xs">{body}</div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export const timeAgo = (iso) => {
  const m = Math.round((Date.now() - new Date(iso)) / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h} hr ago` : `${Math.round(h / 24)} d ago`;
};
