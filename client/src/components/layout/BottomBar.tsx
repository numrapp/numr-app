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
    <div className="flex-shrink-0 bg-white/95 backdrop-blur-lg border-t border-gray-200/60 safe-bottom z-40">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        <button onClick={() => navigate('/')}
          className={`flex flex-col items-center gap-0.5 w-20 h-14 justify-center rounded-2xl transition-all ${isHome ? 'text-dark' : 'text-gray-400'}`}>
          <Home size={22} strokeWidth={isHome ? 2.5 : 1.8} />
          <span className={`text-[9px] ${isHome ? 'font-extrabold' : 'font-medium'}`}>Home</span>
        </button>
        <button onClick={() => navigate('/status')}
          className={`flex flex-col items-center gap-0.5 w-20 h-14 justify-center rounded-2xl transition-all ${isStatus ? 'text-dark' : 'text-gray-400'}`}>
          <PlayCircle size={22} strokeWidth={isStatus ? 2.5 : 1.8} />
          <span className={`text-[9px] ${isStatus ? 'font-extrabold' : 'font-medium'}`}>Status</span>
        </button>
      </div>
    </div>
  );
}
