import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail } from 'lucide-react';
import { useI18n } from '../i18n';
import api from '../services/api';

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true); setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      setError('Er is een fout opgetreden. Neem contact op via info@mrefinance.nl');
    } finally { setLoading(false); }
  };

  return (
    <div className="h-full flex flex-col safe-top" style={{ background: '#DFFF00' }}>
      <div className="px-6 pt-6 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => navigate('/login')} className="p-2 -ml-2 rounded-xl hover:bg-black/5 transition-colors"><ArrowLeft size={22} /></button>
        <span className="text-base font-black text-dark notranslate">numr</span>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 pb-10 max-w-md mx-auto w-full">
        {sent ? (
          <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} className="text-center">
            <div className="w-20 h-20 rounded-full bg-white/30 flex items-center justify-center mx-auto mb-6">
              <Mail size={36} className="text-dark" />
            </div>
            <h2 className="text-xl font-extrabold text-dark mb-3">{t('forgot.sent')}</h2>
            <p className="text-sm text-dark/60 mb-8">{t('forgot.sentDesc')}</p>
            <Link to="/login" className="btn-brand inline-block px-8">{t('forgot.backToLogin')}</Link>
          </motion.div>
        ) : (
          <motion.div initial={{opacity:0}} animate={{opacity:1}}>
            <h1 className="text-2xl font-extrabold text-dark mb-2">{t('forgot.title')}</h1>
            <p className="text-sm text-dark/60 mb-8">{t('forgot.desc')}</p>
            {error && <div className="mb-4 p-3 bg-white/80 border border-red-300 rounded-2xl text-red-600 text-sm font-medium">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-send text-dark/60">{t('login.email')}</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-4 bg-white border border-dark/10 rounded-2xl text-dark text-base font-medium placeholder-dark/30 focus:outline-none focus:ring-2 focus:ring-dark/20"
                  placeholder="info@bedrijf.nl" required />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-4 bg-dark text-white font-extrabold text-base rounded-2xl transition-all active:scale-[0.97] disabled:opacity-50">
                {loading ? '...' : t('forgot.send')}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-dark/50 font-medium">
              <Link to="/login" className="font-extrabold text-dark">{t('forgot.backToLogin')}</Link>
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
