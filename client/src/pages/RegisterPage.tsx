import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../i18n';
import LanguageSelector from '../components/LanguageSelector';
import SuccessAnimation from '../components/SuccessAnimation';

export default function RegisterPage() {
  const { t } = useI18n();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const formStartTime = useRef(Date.now());
  const [honeypot, setHoneypot] = useState('');
  const [form, setForm] = useState({
    email: '', password: '', company_name: '', company_address: '',
    company_postcode: '', company_city: '', kvk_number: '', btw_number: 'NL', iban: '',
  });
  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleBtw = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase();
    if (!val.startsWith('NL')) val = 'NL' + val.replace(/^NL/i, '');
    setForm(p => ({ ...p, btw_number: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return;
    if (Date.now() - formStartTime.current < 2000) { setError(t('register.tooFast')); return; }
    if (!form.email.trim() || !form.password.trim() || !form.company_name.trim()) {
      setError(t('register.vulAlleVelden')); return;
    }
    if (form.password.length < 6) { setError(t('register.wachtwoordMin')); return; }
    if (form.kvk_number.trim() && !/^\d{8}$/.test(form.kvk_number.trim())) { setError(t('register.kvkOngeldig')); return; }
    if (form.btw_number.trim() && form.btw_number.trim() !== 'NL' && !/^NL\d{9}B\d{2}$/.test(form.btw_number.trim())) { setError(t('register.btwOngeldig')); return; }
    setError(''); setLoading(true);
    try {
      await register({
        email: form.email, password: form.password, company_name: form.company_name,
        company_address: form.company_address, company_postcode: form.company_postcode,
        company_city: form.company_city, kvk_number: form.kvk_number,
        btw_number: form.btw_number, iban: form.iban, phone: '',
      });
      setSuccess(true);
      setTimeout(() => navigate('/'), 2500);
    } catch (err: any) {
      setError(err.response?.data?.error || t('login.failed'));
    } finally { setLoading(false); }
  };

  return (
    <>
      <AnimatePresence>{success && <SuccessAnimation message={t('register.gelukt')} />}</AnimatePresence>
      <div className="h-full flex flex-col safe-top">
        <div className="px-6 pt-6 flex items-center gap-3 flex-shrink-0">
          <Link to="/login" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors"><ArrowLeft size={22} /></Link>
          <span className="text-base font-black text-brand notranslate">numr</span>
        </div>

        <div className="page-scroll">
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.3}}
            className="px-6 pb-10 max-w-md mx-auto w-full">
            <h1 className="text-2xl font-extrabold text-dark mb-2 mt-4">{t('register.title')}</h1>
            <div className="mb-5"><LanguageSelector /></div>

            {error && <div className="mb-4 p-3 bg-red-50 rounded-2xl text-red-600 text-sm font-bold">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="text" value={honeypot} onChange={e => setHoneypot(e.target.value)} className="absolute opacity-0 h-0 w-0 pointer-events-none" tabIndex={-1} autoComplete="off" />
              <div><label className="label-send">{t('register.bedrijfsnaam')} *</label><input type="text" value={form.company_name} onChange={set('company_name')} className="input-send" placeholder={t('register.bedrijfsnaamPh')} /></div>
              <div><label className="label-send">{t('register.adres')}</label><input type="text" value={form.company_address} onChange={set('company_address')} className="input-send" placeholder={t('register.adresPh')} /></div>
              <div className="grid grid-cols-5 gap-3">
                <div className="col-span-2"><label className="label-send">{t('register.postcode')}</label><input type="text" value={form.company_postcode} onChange={set('company_postcode')} className="input-send" placeholder="1234 AB" maxLength={7} /></div>
                <div className="col-span-3"><label className="label-send">{t('register.plaats')}</label><input type="text" value={form.company_city} onChange={set('company_city')} className="input-send" placeholder="Amsterdam" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label-send notranslate">KVK</label><input type="text" value={form.kvk_number} onChange={set('kvk_number')} className="input-send" placeholder="12345678" maxLength={8} /></div>
                <div><label className="label-send notranslate">BTW</label><input type="text" value={form.btw_number} onChange={handleBtw} className="input-send notranslate" placeholder="NL000000000B00" /></div>
              </div>
              <div><label className="label-send">{t('register.email')} *</label><input type="email" value={form.email} onChange={set('email')} className="input-send" placeholder="info@bedrijf.nl" /></div>
              <div><label className="label-send notranslate">IBAN</label><input type="text" value={form.iban} onChange={set('iban')} className="input-send notranslate" placeholder="NL00 BANK 0000 0000 00" /></div>
              <div><label className="label-send">{t('register.password')} *</label><input type="password" value={form.password} onChange={set('password')} className="input-send" placeholder={t('register.passwordPh')} /></div>
              <button type="submit" disabled={loading} className="btn-brand w-full mt-2">{loading ? t('register.creating') : t('register.create')}</button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-400 font-medium">
              {t('register.hasAccount')}{' '}<Link to="/login" className="font-extrabold text-dark">{t('register.signIn')}</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}
