import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, CheckCircle } from 'lucide-react';
import { useI18n } from '../i18n';
import api from '../services/api';

export default function ResetPasswordPage() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError('Wachtwoord moet minimaal 6 tekens zijn'); return; }
    if (password !== confirm) { setError('Wachtwoorden komen niet overeen'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/auth/reset-password', { token, password });
      setDone(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Er is een fout opgetreden');
    } finally { setLoading(false); }
  };

  if (!token) return (
    <div className="h-full flex flex-col items-center justify-center px-6 bg-white safe-top">
      <p className="text-lg font-bold text-dark mb-4">Ongeldige link</p>
      <Link to="/login" className="btn-brand px-8">Terug naar inloggen</Link>
    </div>
  );

  return (
    <div className="h-full flex flex-col safe-top" style={{ background: '#DFFF00' }}>
      <div className="px-6 pt-8 flex-shrink-0 safe-top">
        <span className="text-3xl font-black text-white notranslate" style={{textShadow:'2px 2px 10px rgba(0,0,0,0.3)'}}>numr</span>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 pb-10 max-w-md mx-auto w-full">
        {done ? (
          <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} className="text-center">
            <CheckCircle size={48} className="text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-extrabold text-dark mb-3">Wachtwoord gewijzigd!</h2>
            <p className="text-sm text-dark/60 mb-6">U kunt nu inloggen met uw nieuwe wachtwoord.</p>
            <Link to="/login" className="btn-brand inline-block px-8">Inloggen</Link>
          </motion.div>
        ) : (
          <motion.div initial={{opacity:0}} animate={{opacity:1}}>
            <Lock size={32} className="text-dark mb-4" />
            <h1 className="text-2xl font-extrabold text-dark mb-2">Nieuw wachtwoord</h1>
            <p className="text-sm text-dark/60 mb-6">Voer uw nieuwe wachtwoord in.</p>
            {error && <div className="mb-4 p-3 bg-white/80 border border-red-300 rounded-2xl text-red-600 text-sm font-medium">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-send text-dark/60">Nieuw wachtwoord</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-4 bg-white border border-dark/10 rounded-2xl text-dark text-base font-medium placeholder-dark/30 focus:outline-none focus:ring-2 focus:ring-dark/20"
                  placeholder="Minimaal 6 tekens" required />
              </div>
              <div>
                <label className="label-send text-dark/60">Bevestig wachtwoord</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                  className="w-full px-4 py-4 bg-white border border-dark/10 rounded-2xl text-dark text-base font-medium placeholder-dark/30 focus:outline-none focus:ring-2 focus:ring-dark/20"
                  placeholder="Herhaal wachtwoord" required />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-4 bg-dark text-white font-extrabold text-base rounded-2xl transition-all active:scale-[0.97] disabled:opacity-50">
                {loading ? '...' : 'Wachtwoord opslaan'}
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
