import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, LogOut, Eye, EyeOff, Camera } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../i18n';
import { authService } from '../services/authService';
import { User } from '../types';
import LanguageSelector from '../components/LanguageSelector';
import FooterBanner from '../components/layout/FooterBanner';
import api from '../services/api';

export default function SettingsPage() {
  const { t } = useI18n();
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<Partial<User>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showPass, setShowPass] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (user) setForm({...user}); }, [user]);
  const set = (f:string) => (e:React.ChangeEvent<HTMLInputElement>) => setForm(p=>({...p,[f]:e.target.value}));

  const handleSave = async () => { setSaving(true);setMessage('');try{await authService.updateProfile(form);await refreshUser();setMessage(t('settings.opgeslagen'));setTimeout(()=>setMessage(''),3000);}catch{setMessage('Error');}finally{setSaving(false);} };

  const handleLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('logo', file);
    try {
      const res = await api.post('/upload-logo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(p => ({ ...p, logo_path: res.data.logo_path }));
      await refreshUser();
    } catch {}
  };

  return (
    <div className="h-full flex flex-col safe-top">
      <div className="px-6 pt-6 flex items-center gap-3 mb-4 flex-shrink-0">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors"><ArrowLeft size={22} /></button>
        <h1 className="text-lg font-extrabold text-dark flex-1">{t('settings.title')}</h1>
        <LanguageSelector />
      </div>
      <div className="page-scroll">
        <div className="px-6 space-y-4 max-w-md mx-auto pb-6">
          {message && <div className="p-3 bg-success/10 rounded-2xl text-success text-sm font-bold">{message}</div>}

          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
                {form.logo_path ? (
                  <img src={form.logo_path} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-black text-gray-300">{(form.company_name || 'N')[0]}</span>
                )}
              </div>
              <button onClick={() => fileRef.current?.click()} className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-brand flex items-center justify-center shadow-md">
                <Camera size={14} className="text-dark" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleLogo} className="hidden" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-dark">{t('settings.logoUpload')}</p>
              <p className="text-xs text-gray-400">{t('settings.logoDesc')}</p>
            </div>
          </div>

          <div><label className="label-send">{t('settings.bedrijfsnaam')}</label><input type="text" value={form.company_name||''} onChange={set('company_name')} className="input-send" /></div>
          <div><label className="label-send">{t('settings.adres')}</label><input type="text" value={form.company_address||''} onChange={set('company_address')} className="input-send" /></div>
          <div className="grid grid-cols-5 gap-3">
            <div className="col-span-2"><label className="label-send">{t('register.postcode')}</label><input type="text" value={form.company_postcode||''} onChange={set('company_postcode')} className="input-send" /></div>
            <div className="col-span-3"><label className="label-send">{t('register.plaats')}</label><input type="text" value={form.company_city||''} onChange={set('company_city')} className="input-send" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label-send notranslate">KVK</label><input type="text" value={form.kvk_number||''} onChange={set('kvk_number')} className="input-send" /></div>
            <div><label className="label-send notranslate">BTW</label><input type="text" value={form.btw_number||''} onChange={set('btw_number')} className="input-send" /></div>
          </div>
          <div><label className="label-send notranslate">IBAN</label><input type="text" value={form.iban||''} onChange={set('iban')} className="input-send notranslate" /></div>

          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">{t('settings.emailInstellingen')}</p>
            <div className="space-y-3">
              <div><label className="label-send">{t('settings.emailAdres')}</label><input type="email" value={user?.email||''} readOnly className="input-send bg-gray-100 text-gray-500 cursor-not-allowed" /></div>
              <div className="relative">
                <label className="label-send">{t('settings.emailWachtwoord')}</label>
                <input type={showPass ? 'text' : 'password'} value={form.smtp_pass||''} onChange={set('smtp_pass')} className="input-send pr-12" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-[34px] p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                  {showPass ? <EyeOff size={18} className="text-gray-400" /> : <Eye size={18} className="text-gray-400" />}
                </button>
              </div>
            </div>
          </div>

          <button onClick={handleSave} disabled={saving} className="btn-brand w-full flex items-center justify-center gap-2"><Save size={18} /> {saving?'...':t('settings.opslaan')}</button>
          <button onClick={logout} className="w-full py-3 text-center text-red-500 font-extrabold text-sm mt-2"><LogOut size={16} className="inline mr-2" />{t('settings.uitloggen')}</button>
        </div>
        <FooterBanner />
      </div>
    </div>
  );
}
