import React from 'react';
import { StoreProvider, useStore } from './store';
import { ChromeProvider } from './ui';
import Onboarding from './Onboarding';
import Buyer from './Buyer';
import Seller from './Seller';
import Admin from './Admin';

function Router() {
  const { me, myBrand } = useStore();
  if (!me) return <Onboarding />;
  if (me.role === 'admin') return <Admin />;
  if (me.role === 'seller' && myBrand) return <Seller />;
  return <Buyer />;
}

export default function App() {
  return (
    <StoreProvider>
      <ChromeProvider>
        <Router />
      </ChromeProvider>
    </StoreProvider>
  );
}
