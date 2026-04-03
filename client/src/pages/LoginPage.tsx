import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ScanFace } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../i18n';
import LanguageSelector from '../components/LanguageSelector';
import FooterBanner from '../components/layout/FooterBanner';

export default function LoginPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const isNative = Capacitor.isNativePlatform();
  const [hasBiometric, setHasBiometric] = useState(false);

  useEffect(() => {
    if (isNative && localStorage.getItem('biometric_token')) {
      setHasBiometric(true);
    }
    if (!sessionStorage.getItem('teaserShown')) {
      sessionStorage.setItem('teaserShown', 'true');
      navigate('/teaser');
    }
  }, [isNative, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await login(email, password);
      if (isNative && !localStorage.getItem('biometric_token')) {
        localStorage.setItem('biometric_token', localStorage.getItem('token') || '');
      }
      navigate('/');
    }
    catch (err: any) { setError(err.response?.data?.error || t('login.failed')); }
    finally { setLoading(false); }
  };

  const handleBiometric = async () => {
    try {
      const token = localStorage.getItem('biometric_token');
      if (token) {
        localStorage.setItem('token', token);
        window.location.href = '/';
      }
    } catch {}
  };

  return (
    <div className="h-full flex flex-col" style={{ background: '#DFFF00' }}>
      <div className="px-6 pt-8 flex items-center justify-between flex-shrink-0 safe-top">
        <span className="text-5xl font-black text-white notranslate" style={{textShadow:'2px 2px 10px rgba(0,0,0,0.4), 0 0 20px rgba(0,0,0,0.15)'}}>numr</span>
        <LanguageSelector />
      </div>

      <div className="page-scroll">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
          className="flex flex-col justify-center px-6 pb-6 pt-10 max-w-md mx-auto w-full min-h-[70vh]">
          <h1 className="text-2xl font-extrabold text-dark mb-8">{t('login.welcome')}</h1>

          {error && <div className="mb-4 p-3 bg-white/80 border border-red-300 rounded-2xl text-red-600 text-sm font-medium">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-send text-dark/60">{t('login.email')}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-4 bg-white border border-dark/10 rounded-2xl text-dark text-base font-medium placeholder-dark/30 focus:outline-none focus:ring-2 focus:ring-dark/20 transition-all"
                placeholder="info@bedrijf.nl" required />
            </div>
            <div>
              <label className="label-send text-dark/60">{t('login.password')}</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-4 bg-white border border-dark/10 rounded-2xl text-dark text-base font-medium placeholder-dark/30 focus:outline-none focus:ring-2 focus:ring-dark/20 transition-all"
                placeholder="******" required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-4 bg-dark text-white font-extrabold text-base rounded-2xl transition-all active:scale-[0.97] disabled:opacity-50 shadow-lg min-h-[52px]">
              {loading ? t('login.signingIn') : t('login.signIn')}
            </button>
          </form>

          <Link to="/forgot-password" className="block text-center mt-4 text-sm font-bold text-dark/50 hover:text-dark transition-colors">
            {t('forgot.link')}
          </Link>

          {isNative && hasBiometric && (
            <button onClick={handleBiometric} className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/30 text-dark font-bold text-sm active:scale-[0.97] transition-all">
              <ScanFace size={22} /> {t('login.faceId')}
            </button>
          )}

          <p className="mt-6 text-center text-sm text-dark/50 font-medium">
            {t('login.noAccount')}{' '}
            <Link to="/register" className="font-extrabold text-dark">{t('login.register')}</Link>
          </p>
        </motion.div>
      </div>

      <FooterBanner />
    </div>
  );
}
