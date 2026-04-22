import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../i18n';

export default function LoginPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [animate, setAnimate] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionStorage.getItem('teaserShown')) {
      sessionStorage.setItem('teaserShown', 'true');
      navigate('/teaser');
    }
    setAnimate(true);
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await login(email, password); navigate('/'); }
    catch (err: any) { setError(err.response?.data?.error || t('login.failed')); }
    finally { setLoading(false); }
  };

  return (
    <div className="h-full flex flex-col" style={{ background: '#F4F5F7' }}>
      <div className="page-scroll">
        <div className="flex flex-col items-center justify-center min-h-[100dvh] px-7 pb-10">
          <div className="relative w-[260px] h-[260px] mb-8">
            <motion.div animate={{ y: animate ? [-5, 5, -5] : 0 }} transition={{ duration: 2.5, repeat: Infinity }}
              className="absolute left-0 top-[40px]">
              <div className="w-[180px] h-[180px] rounded-full flex items-center justify-center"
                style={{ background: 'radial-gradient(circle at 30% 30%, #F0FF99, #D4FF3A 45%, #8AB800)', boxShadow: '0 24px 60px rgba(212,255,58,0.4)' }}>
                <span className="font-display text-[120px] text-black/20 leading-none">n</span>
              </div>
            </motion.div>
            <motion.div animate={{ y: animate ? [0, -15, 0] : 0 }} transition={{ duration: 3, repeat: Infinity, delay: 0.3 }}
              className="absolute right-0 top-0">
              <div className="w-[110px] h-[110px] rounded-full"
                style={{ background: 'radial-gradient(circle at 30% 30%, #A58DFF, #7B5CFF 45%, #3D24B5)', boxShadow: '0 16px 40px rgba(123,92,255,0.35)' }} />
            </motion.div>
            <motion.div animate={{ y: animate ? [0, 10, 0] : 0 }} transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
              className="absolute right-[30px] bottom-0">
              <div className="w-[70px] h-[70px] rounded-full"
                style={{ background: 'radial-gradient(circle at 30% 30%, white, #E0E2E5)', boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }} />
            </motion.div>
          </div>

          <div className="flex items-baseline mb-4">
            <span className="font-display text-[72px] tracking-[-3px] text-dark leading-none">numr</span>
            <span className="font-display text-[72px] tracking-[-3px] leading-none" style={{ color: '#7A9900' }}>.</span>
          </div>

          <div className="px-4 py-2 rounded-full mb-8" style={{ background: '#D4FF3A' }}>
            <span className="text-[14px] font-bold text-dark">Hallo!</span>
          </div>

          {error && <div className="w-full max-w-sm mb-4 p-3 bg-white border border-red-200 rounded-2xl text-red-600 text-sm font-medium">{error}</div>}

          <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-3">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-v3" placeholder="E-mailadres" required />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-v3" placeholder="Wachtwoord" required />
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? '...' : t('login.signIn')}</button>
          </form>

          <Link to="/forgot-password" className="mt-3 text-[13px] font-bold text-v3-mute">{t('forgot.link')}</Link>

          <p className="mt-6 text-center text-sm text-v3-mute">
            {t('login.noAccount')}{' '}<Link to="/register" className="font-extrabold text-dark">{t('login.register')}</Link>
          </p>

          <p className="mt-4 text-center text-[10px] text-v3-dim px-10 font-mono">Door door te gaan ga je akkoord met onze voorwaarden.</p>
        </div>
      </div>
    </div>
  );
}
