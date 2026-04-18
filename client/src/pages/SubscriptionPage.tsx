import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, RotateCw, X, AlertTriangle } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../i18n';
import { purchaseMonthly, purchaseYearly, restorePurchases, initStore, isStoreReady } from '../services/storeService';
import api from '../services/api';

export default function SubscriptionPage() {
  const { t } = useI18n();
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState('');
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState('');
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (isNative && !isStoreReady()) { initStore(); }
  }, [isNative]);

  const handlePurchase = async (type: 'monthly' | 'yearly' | 'trial') => {
    setLoading(type); setError('');
    try {
      if (isNative && type !== 'trial') {
        const success = type === 'yearly' ? await purchaseYearly() : await purchaseMonthly();
        if (!success) { setError(t('sub.purchaseError')); setLoading(''); return; }
      }
      await api.post('/auth/subscribe', { type: type === 'trial' ? 'trial' : type });
      await refreshUser();
      navigate('/');
    } catch (err) {
      setError(t('sub.purchaseError'));
      console.error('Purchase error:', err);
    } finally { setLoading(''); }
  };

  const handleRestore = async () => {
    setRestoring(true); setError('');
    try {
      if (isNative) await restorePurchases();
      await refreshUser();
      navigate('/');
    } catch {} finally { setRestoring(false); }
  };

  return (
    <div className="h-full flex flex-col safe-top bg-white">
      <div className="px-6 pt-4 flex justify-end">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100"><X size={20} className="text-gray-400" /></button>
      </div>
      <div className="flex-1 overflow-y-auto px-6 pb-8">
        <div className="max-w-sm mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-brand/20 flex items-center justify-center mx-auto mb-5">
              <Crown size={36} className="text-dark" />
            </div>
            <h1 className="text-2xl font-extrabold text-dark mb-2">{t('sub.title')}</h1>
            <p className="text-sm text-gray-500">{t('sub.desc')}</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-2xl mb-4">
              <AlertTriangle size={16} className="text-red-500" />
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <motion.button initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.1}}
              onClick={() => handlePurchase('trial')} disabled={!!loading}
              className="w-full py-4 rounded-2xl bg-dark text-white font-extrabold text-base active:scale-[0.97] transition-all disabled:opacity-50 relative">
              {loading === 'trial' ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto" /> : t('sub.trial')}
            </motion.button>

            <motion.button initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.2}}
              onClick={() => handlePurchase('yearly')} disabled={!!loading}
              className="w-full p-5 rounded-3xl border-2 border-brand bg-brand/5 transition-all active:scale-[0.97] relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-brand text-dark text-[10px] font-extrabold px-3 py-1 rounded-bl-2xl">{t('sub.popular')}</div>
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-lg font-extrabold text-dark">{t('sub.yearly')}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{t('sub.yearlyFree')}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-400 line-through notranslate">&euro;95,88</p>
                  <p className="text-2xl font-black text-dark notranslate">&euro;79,90</p>
                  <p className="text-[11px] text-gray-400">/ {t('sub.year')}</p>
                </div>
              </div>
              {loading === 'yearly' && <div className="absolute inset-0 bg-white/60 flex items-center justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand" /></div>}
            </motion.button>

            <motion.button initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.3}}
              onClick={() => handlePurchase('monthly')} disabled={!!loading}
              className="w-full p-5 rounded-3xl border border-gray-200 bg-white transition-all active:scale-[0.97] relative">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-lg font-extrabold text-dark">{t('sub.monthly')}</p>
                  <p className="text-sm text-gray-400 mt-0.5">{t('sub.monthlyDesc')}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-dark notranslate">&euro;7,99</p>
                  <p className="text-[11px] text-gray-400">/ {t('sub.month')}</p>
                </div>
              </div>
              {loading === 'monthly' && <div className="absolute inset-0 bg-white/60 flex items-center justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand" /></div>}
            </motion.button>
          </div>

          <div className="text-center mt-5 space-y-2">
            <p className="text-[11px] text-gray-400">{t('sub.cancelAnytime')}</p>
            <button onClick={handleRestore} disabled={restoring} className="flex items-center justify-center gap-1.5 mx-auto text-sm font-bold text-gray-400 hover:text-dark transition-colors">
              <RotateCw size={14} className={restoring ? 'animate-spin' : ''} /> {t('sub.restore')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
