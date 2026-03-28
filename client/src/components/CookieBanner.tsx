import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '../i18n';

export default function CookieBanner() {
  const { t } = useI18n();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('cookieConsent')) setShow(true);
  }, []);

  const accept = (type: string) => {
    localStorage.setItem('cookieConsent', type);
    setShow(false);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 safe-bottom">
        <div className="bg-dark text-white rounded-2xl p-5 max-w-lg mx-auto shadow-2xl">
          <p className="text-sm font-medium leading-relaxed mb-4">{t('cookie.title')}</p>
          <div className="flex gap-2">
            <button onClick={() => accept('all')} className="flex-1 py-3 bg-brand text-dark font-extrabold text-sm rounded-xl active:scale-95 transition-all">
              {t('cookie.accept')}
            </button>
            <button onClick={() => accept('necessary')} className="flex-1 py-3 bg-white/10 text-white font-bold text-sm rounded-xl active:scale-95 transition-all">
              {t('cookie.necessary')}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
