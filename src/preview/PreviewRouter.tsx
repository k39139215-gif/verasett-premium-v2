import { useEffect, useState } from 'react';
import { Preview } from './Preview';
import { VerasettDashboard } from '../components/verasett-dashboard';

export function PreviewRouter() {
  const [dashboard, setDashboard] = useState(() => window.location.hash === '#dashboard');
  useEffect(() => {
    function visitSection() {
      let hash: string;
      try { hash = decodeURIComponent(window.location.hash.slice(1)); } catch { return; }
      setDashboard(hash === 'dashboard');
      if (hash === 'dashboard') { window.scrollTo({ top: 0, behavior: 'auto' }); return; }
      if (!hash) return;
      const target = document.getElementById(hash) ?? document.getElementById(hash.split('/')[0]);
      target?.scrollIntoView?.({ block: 'start', behavior: 'auto' });
      target?.focus({ preventScroll: true });
    }
    visitSection();
    window.addEventListener('hashchange', visitSection);
    return () => window.removeEventListener('hashchange', visitSection);
  }, []);
  useEffect(() => {
    if (dashboard) return;
    const hash = window.location.hash.slice(1);
    const target = document.getElementById(hash) ?? document.getElementById(hash.split('/')[0]);
    target?.scrollIntoView?.({ block: 'start', behavior: 'auto' });
    target?.focus({ preventScroll: true });
  }, [dashboard]);
  return dashboard ? <VerasettDashboard /> : <Preview />;
}
