import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, FolderOpen, Settings, Send, RotateCcw, Inbox, FileText } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../i18n';
import LanguageSelector from '../components/LanguageSelector';

export default function DashboardPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.company_name?.split(' ')[0] || '';

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

          <motion.button initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.25}}
            onClick={() => navigate('/received')}
            className="w-full flex items-center gap-5 p-5 rounded-3xl transition-all duration-200 active:scale-[0.97]"
            style={{ background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', boxShadow: '0 8px 32px rgba(245,158,11,0.15)' }}>
            <div className="w-16 h-16 rounded-2xl bg-white/50 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <Inbox size={28} className="text-amber-600" strokeWidth={2.2} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-lg font-extrabold text-dark">{t('dashboard.ontvangenFactuur')}</p>
              <p className="text-sm text-amber-600/70 font-medium">{t('dashboard.ontvangenBekijken')}</p>
            </div>
            <ChevronRight size={22} className="text-amber-400" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
