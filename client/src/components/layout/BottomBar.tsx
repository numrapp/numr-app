import { useNavigate, useLocation } from 'react-router-dom';
import { Home, PlayCircle } from 'lucide-react';
import { useI18n } from '../../i18n';

export default function BottomBar() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const loc = useLocation();
  const isStatus = loc.pathname.startsWith('/status');
  const isHome = !isStatus;

  return (
    <div className="flex-shrink-0 bg-white border-t border-gray-200/60 z-40" style={{ paddingBottom: 'max(0px, env(safe-area-inset-bottom, 0px))' }}>
      <div className="flex items-center justify-around h-20 max-w-lg mx-auto">
        <button onClick={() => navigate('/')}
          className={`flex flex-col items-center gap-1 flex-1 h-full justify-center transition-all ${isHome ? 'text-dark' : 'text-gray-400'}`}>
          <Home size={26} strokeWidth={isHome ? 2.5 : 1.8} />
          <span className={`text-[11px] ${isHome ? 'font-extrabold' : 'font-medium'}`}>Home</span>
        </button>
        <button onClick={() => navigate('/status')}
          className={`flex flex-col items-center gap-1 flex-1 h-full justify-center transition-all ${isStatus ? 'text-dark' : 'text-gray-400'}`}>
          <PlayCircle size={26} strokeWidth={isStatus ? 2.5 : 1.8} />
          <span className={`text-[11px] ${isStatus ? 'font-extrabold' : 'font-medium'}`}>Status</span>
        </button>
      </div>
    </div>
  );
}
