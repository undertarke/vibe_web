import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';

// Tiny path router (no router lib): extra pages are code-split and loaded only when visited
const ROUTES = {
  '/iphone': lazy(() => import('./pages/IphoneLineup.jsx')),
  '/admin/iphones': lazy(() => import('./admin/IphoneAdmin.jsx')),
};
const Page = ROUTES[window.location.pathname.replace(/\/+$/, '')] ?? App;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={<div className="page-status" aria-busy="true"><span className="spinner" /></div>}>
      <Page />
    </Suspense>
  </StrictMode>
);
