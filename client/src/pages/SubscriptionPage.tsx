import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, AlertTriangle, Check, RotateCw } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../i18n';
import { purchaseMonthly, purchaseYearly, restorePurchases, initStore } from '../services/storeService';
import api from '../services/api';

export default function SubscriptionPage() {
  const { t } = useI18n();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState('');
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly'>('yearly');
  const [animate, setAnimate] = useState(false);
  const isNative = Capacitor.isNativePlatform();
  const subType = (user as any)?.subscription_type || '';
  const alreadyTrialed = subType === 'trial';
  const isHardGate = alreadyTrialed;

  useEffect(() => { if (isNative) initStore(); setAnimate(true); }, [isNative]);

  const handlePurchase = async (type: 'monthly' | 'yearly' | 'trial') => {
    setLoading(type); setError('');
    try {
      if (type === 'trial') { await api.post('/auth/subscribe', { type: 'trial' }); await refreshUser(); navigate('/'); return; }
      if (isNative) { const ok = type === 'yearly' ? await purchaseYearly() : await purchaseMonthly(); if (!ok) { setError(t('sub.purchaseError')); return; } }
      await api.post('/auth/subscribe', { type }); await refreshUser(); navigate('/');
    } catch { setError(t('sub.purchaseError')); } finally { setLoading(''); }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try { if (isNative) await restorePurchases(); await refreshUser(); navigate('/'); } catch {} finally { setRestoring(false); }
  };

  const features = [
    'Onbeperkt offertes, facturen, credit',
    'BTW 21% \u00b7 9% \u00b7 0% auto-berekend',
    'PDF export + e-facturatie',
    'Feed \u00b7 vakvideo\u2019s + DM',
    '160 talen \u00b7 iCloud sync',
  ];

  return (
    <div className="h-full flex flex-col safe-top" style={{ background: '#F4F5F7' }}>
      <div className="px-5 pt-3 flex justify-end">
        <button onClick={() => navigate(-1)} className="w-9 h-9 bg-white rounded-full flex items-center justify-center" style={{ border: '1px solid #EEF0F3' }}>
          <X size={14} className="text-v3-mute" />
        </button>
      </div>

      <div className="page-scroll px-6 pb-8">
        <div className="max-w-sm mx-auto">
          {/* Hero orbs */}
          <div className="flex justify-center mb-4">
            <div className="relative w-[150px] h-[150px]">
              <motion.div animate={{ y: animate ? [-3, 3, -3] : 0 }} transition={{ duration: 2, repeat: Infinity }}>
                <div className="w-[150px] h-[150px] rounded-full flex items-center justify-center"
                  style={{ background: 'radial-gradient(circle at 30% 30%, #F0FF99, #D4FF3A 45%, #8AB800)', boxShadow: '0 20px 50px rgba(212,255,58,0.4)' }}>
                  <span className="font-display text-[100px] text-black/20 leading-none">n</span>
                </div>
              </motion.div>
              <div className="absolute -top-3 -right-4 w-10 h-10 rounded-full"
                style={{ background: 'radial-gradient(circle at 30% 30%, #A58DFF, #7B5CFF)', boxShadow: '0 6px 16px rgba(123,92,255,0.4)' }} />
            </div>
          </div>

          {/* Badge */}
          {!isHardGate ? (
            <div className="flex justify-center mb-4">
              <span className="font-mono text-[11px] font-bold tracking-[0.2em] text-dark px-3.5 py-1.5 rounded-full" style={{ background: '#D4FF3A' }}>
                &#10022; 3 DAGEN GRATIS
              </span>
            </div>
          ) : (
            <div className="flex justify-center mb-4">
              <span className="font-mono text-[11px] font-bold tracking-[0.2em] text-white px-3.5 py-1.5 rounded-full bg-v3-red">
                ABONNEMENT VEREIST
              </span>
            </div>
          )}

          <h1 className="font-display text-[34px] text-center tracking-[-1.5px] leading-[0.95] mb-2">
            Alles in {'\u00e9\u00e9n'}<br/><span style={{ color: '#7A9900' }}>app.</span>
          </h1>
          <p className="text-[14px] font-medium text-v3-text2 text-center mb-6 px-4">
            {isHardGate ? 'Je proefperiode is voorbij. Abonneer om door te gaan.' : 'Onbeperkte facturen, BTW, feed en 160 talen.'}
          </p>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-white border border-red-200 rounded-2xl mb-4">
              <AlertTriangle size={16} className="text-v3-red flex-shrink-0" />
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Plan cards */}
          <div className="space-y-2.5 mb-4">
            <button onClick={() => setSelectedPlan('yearly')}
              className="w-full text-left p-[18px] bg-white rounded-v3 transition-all" style={{ border: selectedPlan === 'yearly' ? '2px solid #D4FF3A' : '2px solid #EEF0F3' }}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-extrabold text-dark">Jaarlijks</span>
                  <span className="font-mono text-[9px] font-bold tracking-[0.12em] text-dark px-1.5 py-0.5 rounded-[6px]" style={{ background: '#D4FF3A' }}>-17%</span>
                </div>
                <div className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center ${selectedPlan === 'yearly' ? 'border-brand bg-brand' : 'border-v3-border-strong'}`}>
                  {selectedPlan === 'yearly' && <Check size={10} className="text-dark" strokeWidth={3} />}
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-[28px] tracking-[-1px]">&euro;79,99</span>
                <span className="font-mono text-[11px] text-v3-mute">/jaar</span>
              </div>
              <p className="text-[11px] font-medium text-v3-mute mt-1">&asymp; &euro;6,67 per maand</p>
            </button>

            <button onClick={() => setSelectedPlan('monthly')}
              className="w-full text-left p-[18px] bg-white rounded-v3 transition-all" style={{ border: selectedPlan === 'monthly' ? '2px solid #D4FF3A' : '2px solid #EEF0F3' }}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[15px] font-extrabold text-dark">Maandelijks</span>
                <div className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center ${selectedPlan === 'monthly' ? 'border-brand bg-brand' : 'border-v3-border-strong'}`}>
                  {selectedPlan === 'monthly' && <Check size={10} className="text-dark" strokeWidth={3} />}
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-[28px] tracking-[-1px]">&euro;7,99</span>
                <span className="font-mono text-[11px] text-v3-mute">/maand</span>
              </div>
              <p className="text-[11px] font-medium text-v3-mute mt-1">Flexibel opzegbaar</p>
            </button>
          </div>

          {/* Features */}
          <div className="bg-white rounded-[16px] overflow-hidden mb-6" style={{ border: '1px solid #EEF0F3' }}>
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-2.5 px-4 py-3" style={{ borderBottom: i < features.length - 1 ? '1px solid #EEF0F3' : 'none' }}>
                <div className="w-[18px] h-[18px] rounded-full bg-brand flex items-center justify-center flex-shrink-0">
                  <Check size={10} className="text-dark" strokeWidth={3} />
                </div>
                <span className="text-[13px] font-medium text-dark">{f}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          {!alreadyTrialed && (
            <button onClick={() => handlePurchase('trial')} disabled={!!loading}
              className="btn-lime w-full mb-3">
              {loading === 'trial' ? '...' : 'Start 3 dagen gratis'}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          )}

          <button onClick={() => handlePurchase(selectedPlan)} disabled={!!loading}
            className={alreadyTrialed ? 'btn-lime w-full mb-3' : 'btn-primary w-full mb-3'}>
            {loading === selectedPlan ? '...' : (alreadyTrialed ? 'Abonneer nu' : `${selectedPlan === 'yearly' ? 'Jaarlijks' : 'Maandelijks'} abonneren`)}
          </button>

          <div className="flex items-center justify-center gap-3 text-[11px]">
            <button onClick={handleRestore} disabled={restoring} className="font-mono font-semibold text-v3-text2 flex items-center gap-1">
              <RotateCw size={12} className={restoring ? 'animate-spin' : ''} /> Herstel aankoop
            </button>
            <span className="text-v3-mute">&middot;</span>
            <span className="font-mono text-v3-mute">Voorwaarden &amp; Privacy</span>
          </div>
        </div>
      </div>
    </div>
  );
}
