import { useNavigate, useLocation } from 'react-router-dom';
import { Home, FileText, PlayCircle, User } from 'lucide-react';

export default function BottomBar() {
  const navigate = useNavigate();
  const loc = useLocation().pathname;

  const tabs = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/invoices', icon: FileText, label: 'Docs' },
    { path: '__fab__', icon: null, label: '' },
    { path: '/status', icon: PlayCircle, label: 'Feed' },
    { path: '/settings', icon: User, label: 'Profiel' },
  ];

  const isActive = (p: string) => {
    if (p === '/') return loc === '/';
    return loc.startsWith(p);
  };

  return (
    <div className="flex-shrink-0 z-40" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid #EEF0F3', paddingBottom: 'max(20px, env(safe-area-inset-bottom, 20px))' }}>
      <div className="flex items-center justify-around h-[70px] max-w-lg mx-auto px-5">
        {tabs.map((tab, i) => {
          if (tab.path === '__fab__') {
            return (
              <button key={i} onClick={() => navigate('/invoices/new')} className="relative -mt-7">
                <div className="w-14 h-14 rounded-full bg-dark flex items-center justify-center" style={{ boxShadow: '0 8px 20px rgba(14,17,22,0.25)' }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </div>
              </button>
            );
          }
          const Icon = tab.icon!;
          const active = isActive(tab.path);
          return (
            <button key={i} onClick={() => navigate(tab.path)} className={`flex flex-col items-center gap-1 ${active ? 'text-dark' : 'text-v3-mute'}`}>
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className="font-mono-v3 text-[9px] font-semibold uppercase tracking-[0.08em]">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
