import React, { useState } from 'react';
import { IndianRupee, LayoutDashboard, Recycle, ShoppingBag, Store, TrendingUp, Users } from 'lucide-react';
import { COMMISSION_RATE, SH_COMMISSION_RATE, orderCommission, orderSubtotal, rupees } from './data';
import { useStore } from './store';
import { BottomNav, CategoryIcon, Header, Page, ScreenTitle, StatusChip, timeAgo } from './ui';

export default function Admin() {
  const [tab, setTab] = useState('overview');
  const { brands, resetDemo } = useStore();
  const pending = brands.filter((b) => b.status === 'pending').length;
  return (
    <>
      <Header sub="Admin console" right={<button className="btn btn-ghost h-10 min-h-0 px-3 text-[13px]" onClick={resetDemo}><span className="md:hidden">Reset</span><span className="max-md:hidden">Reset demo data</span></button>} />
      <BottomNav active={tab} onChange={setTab} tabs={[
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'sellers', label: 'Sellers', icon: Store, badge: pending },
        { id: 'orders', label: 'Orders', icon: ShoppingBag },
        { id: 'listings', label: 'Listings', icon: Recycle },
      ]} />
      <Page>
        {tab === 'overview' && <Overview />}
        {tab === 'sellers' && <Sellers />}
        {tab === 'orders' && <AllOrders />}
        {tab === 'listings' && <Listings />}
      </Page>
    </>
  );
}

function Overview() {
  const { orders, brands, users, listings, deals } = useStore();
  const shDone = deals.filter((d) => ['completed', 'received'].includes(d.status));
  const shApp = shDone.filter((d) => d.payment === 'app').reduce((s, d) => s + d.price, 0);
  const valid = orders.filter((o) => o.status !== 'cancelled');
  const gmv = valid.reduce((s, o) => s + orderSubtotal(o), 0);
  const commission = valid.reduce((s, o) => s + orderCommission(o), 0);
  const tiles = [
    ['Total sales (GMV)', rupees(gmv), TrendingUp],
    [`Commission earned (${COMMISSION_RATE * 100}%)`, rupees(commission), IndianRupee],
    ['Orders', valid.length, ShoppingBag],
    ['Sellers / shoppers', `${brands.length} / ${new Set([...users.filter((u) => u.role === 'buyer').map((u) => u.id), ...orders.map((o) => o.buyerId)]).size}`, Users],
  ];
  return (
    <div className="grid gap-5">
      <ScreenTitle sub="Local brands and secondhand, all areas">Overview</ScreenTitle>
      <h2 className="text-[17px] font-bold -mb-2">Local brands</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tiles.map(([l, v, Icon]) => (
          <div key={l} className="card p-4"><div className="flex items-center justify-between text-[12px] font-semibold text-[#7C8199]">{l}<Icon className="w-4 h-4" /></div><div className="text-[22px] font-extrabold mt-1 tabular-nums">{v}</div></div>
        ))}
      </div>
      <h2 className="text-[17px] font-bold -mb-2">Secondhand</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[['Active listings', listings.filter((l) => l.status === 'active').length], ['Open deals', deals.filter((d) => !['completed', 'received', 'cancelled'].includes(d.status)).length], ['Completed deals', shDone.length], [`In-app fee (${SH_COMMISSION_RATE * 100}%)`, rupees(shApp * SH_COMMISSION_RATE)]].map(([l, v]) => (
          <div key={l} className="card p-4"><div className="text-[12px] font-semibold text-[#7C8199]">{l}</div><div className="text-[22px] font-extrabold mt-1 tabular-nums">{v}</div></div>
        ))}
      </div>
      <div className="card p-4">
        <h2 className="font-bold mb-2">Sales by seller</h2>
        {brands.map((b) => {
          const mine = valid.filter((o) => o.brandId === b.id);
          const g = mine.reduce((s, o) => s + orderSubtotal(o), 0);
          return (
            <div key={b.id} className="flex items-center gap-3 py-2 border-t border-[#F0F1F6] first:border-0">
              <CategoryIcon category={b.category} size="sm" />
              <div className="flex-1 min-w-0"><div className="text-[14px] font-semibold">{b.name}</div>
                <div className="h-1.5 rounded-full bg-[#F0F1F6] mt-1"><div className="h-1.5 rounded-full bg-[#3B2FD9]" style={{ width: `${gmv ? (g / gmv) * 100 : 0}%` }} /></div></div>
              <div className="text-right text-[13px]"><div className="font-bold">{rupees(g)}</div><div className="text-[#7C8199]">{mine.length} orders</div></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Sellers() {
  const { brands, products, updateBrand } = useStore();
  return (
    <div className="grid gap-3">
      <ScreenTitle sub="Approve new brands before shoppers see them">Sellers</ScreenTitle>
      {brands.map((b) => (
        <div key={b.id} className="card p-4 flex flex-wrap items-center gap-3">
          <CategoryIcon category={b.category} size="sm" />
          <div className="flex-1 min-w-[160px]"><div className="font-bold">{b.name}</div><div className="text-[12px] text-[#7C8199]">{b.area} · since {b.since} · {products.filter((p) => p.brandId === b.id).length} products</div></div>
          <span className={`chip ${b.status === 'active' ? 'bg-[#E7F7EE] text-[#157F3E]' : b.status === 'pending' ? 'bg-[#FEF6E4] text-[#B45309]' : 'bg-[#F1F1F4] text-[#7C8199]'}`}>{b.status === 'active' ? 'Live' : b.status === 'pending' ? 'Awaiting approval' : 'Suspended'}</span>
          {b.status === 'pending' && <button className="btn btn-primary h-9" onClick={() => updateBrand(b.id, { status: 'active' })}>Approve</button>}
          {b.status === 'active' && <button className="btn btn-ghost h-9" onClick={() => updateBrand(b.id, { status: 'suspended' })}>Suspend</button>}
          {b.status === 'suspended' && <button className="btn btn-ghost h-9" onClick={() => updateBrand(b.id, { status: 'active' })}>Restore</button>}
        </div>
      ))}
    </div>
  );
}

function AllOrders() {
  const { orders, brands } = useStore();
  return (
    <div className="grid gap-3">
      <ScreenTitle sub={`${orders.length} orders across all brands`}>Orders</ScreenTitle>
      <div className="grid gap-2 md:hidden">
        {orders.map((o) => (
          <article key={o.id} className="card p-3.5 grid gap-1">
            <div className="flex items-start justify-between gap-2"><div className="min-w-0"><div className="font-bold truncate">{brands.find((b) => b.id === o.brandId)?.name}</div><div className="text-[12px] text-[#7C8199]">{o.id} · {o.buyerName} · {timeAgo(o.createdAt)}</div></div><StatusChip status={o.status} /></div>
            <div className="flex justify-between text-[14px] pt-1"><span>{rupees(orderSubtotal(o))}</span><span className="text-[#4E5369]">Commission {o.status === 'cancelled' ? '—' : rupees(orderCommission(o))}</span></div>
          </article>
        ))}
      </div>
      <div className="card overflow-x-auto max-md:hidden">
        <table className="w-full text-[13px] min-w-[640px]">
          <thead><tr className="text-left text-[#7C8199] border-b border-[#E8EAF2]">{['Order', 'Seller', 'Buyer', 'Amount', 'Commission', 'Status'].map((h) => <th key={h} className="p-3 font-semibold">{h}</th>)}</tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-[#F0F1F6] last:border-0">
                <td className="p-3"><div className="font-semibold">{o.id}</div><div className="text-[#7C8199]">{timeAgo(o.createdAt)}</div></td>
                <td className="p-3">{brands.find((b) => b.id === o.brandId)?.name}</td>
                <td className="p-3">{o.buyerName}</td>
                <td className="p-3 tabular-nums">{rupees(orderSubtotal(o))}</td>
                <td className="p-3 tabular-nums">{o.status === 'cancelled' ? '—' : rupees(orderCommission(o))}</td>
                <td className="p-3"><StatusChip status={o.status} /></td>
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
    <div className="grid gap-3">
      <ScreenTitle sub="Hide anything that breaks the rules">Secondhand listings</ScreenTitle>
      {listings.map((l) => (
        <div key={l.id} className="card p-3 flex gap-3">
          <img src={l.photo} alt="" className="w-16 h-16 rounded-[12px] object-cover bg-[#EEF0FF] shrink-0" />
          <div className="flex-1 min-w-0 grid gap-1">
            <div className="font-semibold leading-snug line-clamp-2">{l.title}</div>
            <div className="text-[12px] text-[#7C8199]">{rupees(l.price)} · {l.area} · {l.mode === 'ship' ? 'Ships' : 'Meet'} · {timeAgo(l.createdAt)}</div>
            <div className="flex items-center justify-between gap-2 mt-1">
              <span className="chip bg-[#F1F1F4] text-[#4E5369] capitalize">{l.status}</span>
              {l.status === 'active' && <button className="btn btn-ghost h-10 min-h-0" onClick={() => updateListing(l.id, { status: 'hidden' })}>Hide</button>}
              {l.status === 'hidden' && <button className="btn btn-ghost h-10 min-h-0" onClick={() => updateListing(l.id, { status: 'active' })}>Restore</button>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
