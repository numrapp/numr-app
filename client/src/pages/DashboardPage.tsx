import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, FolderOpen, Settings, Send, RotateCcw, FileText, Star, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../i18n';
import LanguageSelector from '../components/LanguageSelector';

export default function DashboardPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.company_name?.split(' ')[0] || '';
  const [showRating, setShowRating] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('rated')) {
      const timer = setTimeout(() => setShowRating(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleRate = () => {
    localStorage.setItem('rated', 'true');
    setShowRating(false);
    window.open('https://apps.apple.com/app/numr/id6744145967?action=write-review', '_blank');
  };

  return (
    <div className="h-full flex flex-col safe-top">
      <div className="px-6 pt-6 flex items-center justify-between flex-shrink-0">
        <span className="text-xl font-black text-brand notranslate">numr</span>
        <div className="flex items-center gap-1.5">
          <LanguageSelector />
          <button onClick={() => navigate('/invoices')} className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors"><FolderOpen size={20} className="text-dark" /></button>
          <button onClick={() => navigate('/settings')} className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors"><Settings size={20} className="text-dark" /></button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <motion.p initial={{opacity:0}} animate={{opacity:1}} className="text-lg font-bold text-dark mb-10">{t('dashboard.hello')} {firstName}</motion.p>

        <div className="w-full max-w-sm space-y-3">
          <motion.button initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}}
            onClick={() => navigate('/offerte/new')}
            className="w-full flex items-center gap-5 p-5 rounded-3xl transition-all duration-200 active:scale-[0.97]"
            style={{ background: 'linear-gradient(135deg, #DBEAFE 0%, #93C5FD 100%)', boxShadow: '0 8px 32px rgba(59,130,246,0.2)' }}>
            <div className="w-16 h-16 rounded-2xl bg-white/30 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <FileText size={28} className="text-blue-700" strokeWidth={2.2} />
            </div>
            <div className="flex-1 text-left notranslate">
              <p className="text-lg font-extrabold text-dark">{t('dashboard.nieuwOfferte')}</p>
              <p className="text-sm text-blue-700/60 font-medium">{t('dashboard.offerteAanmaken')}</p>
            </div>
            <ChevronRight size={22} className="text-blue-300" />
          </motion.button>

          <motion.button initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.15}}
            onClick={() => navigate('/invoices/new')}
            className="w-full flex items-center gap-5 p-5 rounded-3xl transition-all duration-200 active:scale-[0.97]"
            style={{ background: 'linear-gradient(135deg, #DFFF00 0%, #B8D900 100%)', boxShadow: '0 8px 32px rgba(223,255,0,0.3)' }}>
            <div className="w-16 h-16 rounded-2xl bg-white/30 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <Send size={28} className="text-dark" strokeWidth={2.2} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-lg font-extrabold text-dark">{t('dashboard.nieuwFactuur')}</p>
              <p className="text-sm text-dark/60 font-medium">{t('dashboard.factuurAanmaken')}</p>
            </div>
            <ChevronRight size={22} className="text-dark/40" />
          </motion.button>

          <motion.button initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}}
            onClick={() => navigate('/credit/new')}
            className="w-full flex items-center gap-5 p-5 rounded-3xl transition-all duration-200 active:scale-[0.97]"
            style={{ background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)', boxShadow: '0 8px 32px rgba(239,68,68,0.12)' }}>
            <div className="w-16 h-16 rounded-2xl bg-white/50 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <RotateCcw size={28} className="text-red-500" strokeWidth={2.2} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-lg font-extrabold text-dark">{t('dashboard.creditFactuur')}</p>
              <p className="text-sm text-red-500/70 font-medium">{t('dashboard.creditAanmaken')}</p>
            </div>
            <ChevronRight size={22} className="text-red-300" />
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showRating && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-6">
            <motion.div initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} className="bg-white rounded-3xl p-6 w-full max-w-xs text-center shadow-2xl relative">
              <button onClick={() => setShowRating(false)} className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <X size={16} className="text-gray-500" />
              </button>
              <div className="flex justify-center gap-1 mb-4 mt-2">
                {[1,2,3,4,5].map(i => <Star key={i} size={28} className="text-brand fill-brand" />)}
              </div>
              <p className="text-base font-extrabold text-dark mb-2">{t('rating.title')}</p>
              <p className="text-sm text-gray-500 mb-5">{t('rating.desc')}</p>
              <button onClick={handleRate} className="w-full py-3.5 rounded-2xl bg-brand text-dark font-extrabold text-base active:scale-[0.97] transition-all">
                {t('rating.button')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
