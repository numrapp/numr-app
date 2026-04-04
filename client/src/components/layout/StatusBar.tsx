import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Plus, MessageCircle, User } from 'lucide-react';
import { useI18n } from '../../i18n';

export default function StatusBar() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const loc = useLocation().pathname;
  const items = [
    { path: '/status', icon: Home, label: 'Home' },
    { path: '/status/upload', icon: Plus, label: t('status.upload') },
    { path: '/status/messages', icon: MessageCircle, label: t('status.berichten') },
    { path: '/status/profile', icon: User, label: t('status.profiel') },
  ];
  return (
    <div className="flex-shrink-0 bg-white/95 backdrop-blur-lg border-t border-gray-200/60 safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {items.map(it => {
          const active = loc === it.path;
          return (
            <button key={it.path} onClick={() => navigate(it.path)} className={`flex flex-col items-center gap-0.5 ${active ? 'text-dark' : 'text-gray-400'}`}>
              <it.icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span className={`text-[9px] ${active ? 'font-extrabold' : 'font-medium'}`}>{it.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
