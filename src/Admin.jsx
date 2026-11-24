import React, { useState } from 'react';
import { motion } from 'motion/react';
import { IndianRupee, LayoutDashboard, Recycle, ShoppingBag, Store, TrendingUp, Users, Analytics, Handshake, Check, Clock, Coins, Verified, AlertTriangle } from './icons';
import { COMMISSION_RATE, SH_COMMISSION_RATE, orderCommission, orderSubtotal, rupees } from './data';
import { useStore } from './store';
import { BottomNav, CategoryIcon, Enter, Header, Item, Page, ScreenTitle, SectionTitle, Stagger, StatusChip, ease, timeAgo } from './ui';

export default function Admin() {
  const [tab, setTab] = useState('overview');
  const { brands, resetDemo } = useStore();
  const pending = brands.filter((b) => b.status === 'pending').length;
  return (
    <>
      <Header sub="Admin console" right={<button className="btn btn-soft h-10 min-h-0 px-3.5 text-[14px]" onClick={resetDemo}><span className="md:hidden">Reset</span><span className="max-md:hidden">Reset demo data</span></button>} />
      <BottomNav active={tab} onChange={(t) => { setTab(t); window.scrollTo(0, 0); }} tabs={[
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'sellers', label: 'Sellers', icon: Store, badge: pending },
        { id: 'orders', label: 'Orders', icon: ShoppingBag },
        { id: 'listings', label: 'Listings', icon: Recycle },
      ]} />
      <Page>
        <Enter id={tab}>
          {tab === 'overview' && <Overview />}
          {tab === 'sellers' && <Sellers />}
          {tab === 'orders' && <AllOrders />}
          {tab === 'listings' && <Listings />}
        </Enter>
      </Page>
    </>
  );
}

const Tile = ({ label, value, icon: Icon, tone = 'indigo' }) => (
  <Item className="card p-4">
    <div className={`w-9 h-9 rounded-[11px] flex items-center justify-center ${{ indigo: 'bg-[#EEF0FF] text-[#3B2FD9]', green: 'bg-[#E7F7EE] text-[#157F3E]', coral: 'bg-[#FFF1EE] text-[#E8462B]', amber: 'bg-[#FEF6E4] text-[#B45309]' }[tone]}`}><Icon className="w-5 h-5" /></div>
    <div className="text-[24px] font-bold tracking-[-0.03em] mt-3 tabular-nums leading-none">{value}</div>
    <div className="text-[13px] font-medium text-[#6E6E73] mt-1.5 leading-snug">{label}</div>
  </Item>
);

function Overview() {
  const { orders, brands, users, listings, deals } = useStore();
  const shDone = deals.filter((d) => ['completed', 'received'].includes(d.status));
  const shApp = shDone.filter((d) => d.payment === 'app').reduce((s, d) => s + d.price, 0);
  const valid = orders.filter((o) => o.status !== 'cancelled');
  const gmv = valid.reduce((s, o) => s + orderSubtotal(o), 0);
  const commission = valid.reduce((s, o) => s + orderCommission(o), 0);
  const shoppers = new Set([...users.filter((u) => u.role === 'buyer').map((u) => u.id), ...orders.map((o) => o.buyerId)]).size;
  return (
    <div className="grid gap-6">
      <ScreenTitle sub="Local brands and secondhand, all areas">Overview</ScreenTitle>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease }}
        className="relative overflow-hidden rounded-[24px] p-5 text-white bg-gradient-to-br from-[#1D1D1F] to-[#3A3A3C] shadow-[0_16px_40px_-18px_rgba(0,0,0,.6)]">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-[#3B2FD9]/40 blur-2xl" />
        <div className="relative text-[14px] text-white/70 flex items-center gap-1.5"><Coins className="w-4 h-4" />Platform revenue</div>
        <div className="relative text-[38px] font-bold tracking-[-0.04em] leading-none mt-2 tabular-nums">{rupees(commission + shApp * SH_COMMISSION_RATE)}</div>
        <div className="relative text-[14px] text-white/70 mt-2">{COMMISSION_RATE * 100}% on local orders + {SH_COMMISSION_RATE * 100}% on in-app secondhand</div>
      </motion.div>
      <section>
        <SectionTitle icon={Store}>Local brands</SectionTitle>
        <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Tile label="Total sales (GMV)" value={rupees(gmv)} icon={TrendingUp} />
          <Tile label={`Commission (${COMMISSION_RATE * 100}%)`} value={rupees(commission)} icon={IndianRupee} tone="green" />
          <Tile label="Orders" value={valid.length} icon={ShoppingBag} tone="coral" />
          <Tile label="Sellers · shoppers" value={`${brands.length} · ${shoppers}`} icon={Users} tone="amber" />
        </Stagger>
      </section>
      <section>
        <SectionTitle icon={Recycle} tone="coral">Secondhand</SectionTitle>
        <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Tile label="Active listings" value={listings.filter((l) => l.status === 'active').length} icon={Recycle} tone="coral" />
          <Tile label="Open deals" value={deals.filter((d) => !['completed', 'received', 'cancelled'].includes(d.status)).length} icon={Handshake} />
          <Tile label="Completed deals" value={shDone.length} icon={Check} tone="green" />
          <Tile label={`In-app fee (${SH_COMMISSION_RATE * 100}%)`} value={rupees(shApp * SH_COMMISSION_RATE)} icon={Coins} tone="amber" />
        </Stagger>
      </section>
      <section className="card p-4">
        <SectionTitle icon={Analytics} tone="green">Sales by seller</SectionTitle>
        {brands.map((b, i) => {
          const mine = valid.filter((o) => o.brandId === b.id);
          const g = mine.reduce((s, o) => s + orderSubtotal(o), 0);
          return (
            <div key={b.id} className="flex items-center gap-3 py-3 border-t border-[#F2F2F5]">
              <CategoryIcon category={b.category} size="sm" />
              <div className="flex-1 min-w-0"><div className="text-[15px] font-semibold truncate">{b.name}</div>
                <div className="h-2 rounded-full bg-[#F2F2F5] mt-1.5 overflow-hidden"><motion.div className="h-full rounded-full bg-gradient-to-r from-[#5B4FF0] to-[#3B2FD9]" initial={{ width: 0 }} animate={{ width: `${gmv ? (g / gmv) * 100 : 0}%` }} transition={{ duration: 0.8, delay: 0.1 * i, ease }} /></div></div>
              <div className="text-right text-[14px] shrink-0"><div className="font-semibold tabular-nums">{rupees(g)}</div><div className="text-[12px] text-[#8E8E93]">{mine.length} orders</div></div>
            </div>
          );
        })}
      </section>
    </div>
  );
}

function Sellers() {
  const { brands, products, updateBrand } = useStore();
  return (
    <div className="grid gap-4">
      <ScreenTitle sub="Approve new brands before shoppers see them">Sellers</ScreenTitle>
      <Stagger className="grid gap-3">
        {brands.map((b) => (
          <Item as="article" key={b.id} className="card p-4 grid gap-3">
            <div className="flex items-center gap-3">
              <CategoryIcon category={b.category} size="sm" />
              <div className="flex-1 min-w-0"><div className="font-semibold text-[16px] flex items-center gap-1.5">{b.name}{b.status === 'active' && <Verified className="w-4 h-4 text-[#3B2FD9]" />}</div><div className="text-[13px] text-[#8E8E93]">{b.area} · since {b.since} · {products.filter((p) => p.brandId === b.id).length} products</div></div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className={`chip ${b.status === 'active' ? 'bg-[#E7F7EE] text-[#157F3E]' : b.status === 'pending' ? 'bg-[#FEF6E4] text-[#B45309]' : 'bg-[#F2F2F5] text-[#8E8E93]'}`}>{b.status === 'active' ? <><Check className="w-3.5 h-3.5" />Live</> : b.status === 'pending' ? <><Clock className="w-3.5 h-3.5" />Awaiting approval</> : <><AlertTriangle className="w-3.5 h-3.5" />Suspended</>}</span>
              {b.status === 'pending' && <button className="btn btn-primary h-11 min-h-0" onClick={() => updateBrand(b.id, { status: 'active' })}>Approve</button>}
              {b.status === 'active' && <button className="btn btn-ghost h-11 min-h-0" onClick={() => updateBrand(b.id, { status: 'suspended' })}>Suspend</button>}
              {b.status === 'suspended' && <button className="btn btn-ghost h-11 min-h-0" onClick={() => updateBrand(b.id, { status: 'active' })}>Restore</button>}
            </div>
          </Item>
        ))}
      </Stagger>
    </div>
  );
}

function AllOrders() {
  const { orders, brands } = useStore();
  return (
    <div className="grid gap-4">
      <ScreenTitle sub={`${orders.length} orders across all brands`}>Orders</ScreenTitle>
      <Stagger className="grid gap-3 md:hidden">
        {orders.map((o) => (
          <Item as="article" key={o.id} className="card p-4 grid gap-2">
            <div className="flex items-start justify-between gap-2"><div className="min-w-0"><div className="font-semibold truncate">{brands.find((b) => b.id === o.brandId)?.name}</div><div className="text-[13px] text-[#8E8E93]">{o.id} · {o.buyerName} · {timeAgo(o.createdAt)}</div></div><StatusChip status={o.status} /></div>
            <div className="flex justify-between text-[15px] pt-2 border-t border-[#F2F2F5]"><span className="font-semibold tabular-nums">{rupees(orderSubtotal(o))}</span><span className="text-[#6E6E73]">Commission {o.status === 'cancelled' ? '—' : rupees(orderCommission(o))}</span></div>
          </Item>
        ))}
      </Stagger>
      <div className="card overflow-x-auto max-md:hidden">
        <table className="w-full text-[14px] min-w-[640px]">
          <thead><tr className="text-left text-[#8E8E93] border-b border-[#EBEBF0]">{['Order', 'Seller', 'Buyer', 'Amount', 'Commission', 'Status'].map((h) => <th key={h} className="p-4 font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-[#F2F2F5] last:border-0">
                <td className="p-4"><div className="font-semibold">{o.id}</div><div className="text-[#8E8E93] text-[13px]">{timeAgo(o.createdAt)}</div></td>
                <td className="p-4">{brands.find((b) => b.id === o.brandId)?.name}</td>
                <td className="p-4">{o.buyerName}</td>
                <td className="p-4 tabular-nums">{rupees(orderSubtotal(o))}</td>
                <td className="p-4 tabular-nums">{o.status === 'cancelled' ? '—' : rupees(orderCommission(o))}</td>
                <td className="p-4"><StatusChip status={o.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Listings() {
  const { listings, updateListing } = useStore();
  return (
    <div className="grid gap-4">
      <ScreenTitle sub="Hide anything that breaks the rules">Listings</ScreenTitle>
      <Stagger className="grid gap-3">
        {listings.map((l) => (
          <Item as="article" key={l.id} className="card p-3.5 flex gap-3.5">
            <img src={l.photo} alt="" className="w-[72px] h-[72px] rounded-[14px] object-cover bg-[#EEF0FF] shrink-0" />
            <div className="flex-1 min-w-0 grid gap-1">
              <div className="font-semibold leading-snug line-clamp-2">{l.title}</div>
              <div className="text-[13px] text-[#8E8E93]">{rupees(l.price)} · {l.area} · {l.mode === 'ship' ? 'Ships' : 'Meet'} · {timeAgo(l.createdAt)}</div>
              <div className="flex items-center justify-between gap-2 mt-1">
                <span className="chip bg-[#F2F2F5] text-[#6E6E73] capitalize">{l.status}</span>
                {l.status === 'active' && <button className="btn btn-ghost h-10 min-h-0 px-4" onClick={() => updateListing(l.id, { status: 'hidden' })}>Hide</button>}
                {l.status === 'hidden' && <button className="btn btn-soft h-10 min-h-0 px-4" onClick={() => updateListing(l.id, { status: 'active' })}>Restore</button>}
              </div>
            </div>
          </Item>
        ))}
      </Stagger>
    </div>
  );
}
