import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, LogOut, Trash2, ChevronRight, Globe, Shield, HelpCircle, Download, Building2, Lock, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../i18n';
import { authService } from '../services/authService';
import { User } from '../types';
import LanguageSelector from '../components/LanguageSelector';
import api from '../services/api';

export default function SettingsPage() {
  const { t } = useI18n();
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<Partial<User>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showCompany, setShowCompany] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (user) setForm({ ...user }); }, [user]);
  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSave = async () => {
    setSaving(true); setMessage('');
    try { await authService.updateProfile(form); await refreshUser(); setMessage(t('settings.opgeslagen')); setTimeout(() => setMessage(''), 3000); }
    catch { setMessage('Error'); } finally { setSaving(false); }
  };

  const handleLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]; e.target.value = '';
      if (!file || file.size > 5 * 1024 * 1024) return;
      const fd = new FormData(); fd.append('logo', file);
      const res = await api.post('/upload-logo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(p => ({ ...p, logo_path: res.data.logo_path })); await refreshUser();
    } catch {}
  };

  const subType = (user as any)?.subscription_type || '';
  const subTitle = subType === 'yearly' ? 'numr Pro \u00b7 Jaarlijks' : subType === 'monthly' ? 'numr Pro \u00b7 Maandelijks' : subType === 'trial' ? 'numr Pro \u00b7 Proef' : 'numr \u00b7 Gratis';
  const subMeta = subType === 'yearly' ? '\u20ac79,99 per jaar' : subType === 'monthly' ? '\u20ac7,99 per maand' : subType === 'trial' ? '3 dagen gratis' : 'Upgrade voor alle functies';

  return (
    <div className="h-full flex flex-col safe-top" style={{ background: '#F4F5F7' }}>
      <div className="page-scroll">
        <div className="px-[22px] pt-3 pb-4 flex items-center justify-between">
          <h1 className="font-display text-[34px] tracking-[-1.2px]">Profiel</h1>
          <LanguageSelector />
        </div>

        {message && <div className="mx-[22px] mb-3 p-3 bg-v3-green/10 rounded-2xl text-v3-green text-sm font-bold">{message}</div>}

        {/* Hero card */}
        <div className="mx-[22px] mb-3.5 p-5 bg-white rounded-v3-xl relative overflow-hidden">
          <div className="absolute -top-[60px] -right-[60px] w-[200px] h-[200px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(212,255,58,0.2), transparent 70%)' }} />
          <div className="flex items-center gap-3.5 relative z-10 mb-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden"
                style={{ background: 'radial-gradient(circle at 30% 30%, #F0FF99, #D4FF3A 50%, #8AB800)', boxShadow: '0 6px 14px rgba(212,255,58,0.25)' }}>
                {form.logo_path ? <img src={form.logo_path} alt="" className="w-full h-full object-cover" /> :
                  <span className="font-display text-[24px] text-dark">{(form.company_name || 'N')[0]}</span>}
              </div>
              <button onClick={() => fileRef.current?.click()} className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-dark flex items-center justify-center shadow-md">
                <Camera size={12} className="text-white" />
              </button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/heic" onChange={handleLogo} className="hidden" />
            </div>
            <div>
              <p className="font-display text-[20px] tracking-[-0.5px]">{form.company_name || 'numr'}</p>
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] font-medium text-v3-mute">{form.company_city || user?.email}</span>
                {form.kvk_number && (
                  <span className="flex items-center gap-1 text-v3-green text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-[5px]" style={{ background: 'rgba(66,194,129,0.15)' }}>
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    KvK
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2.5 relative z-10">
            {[['0', 'Docs'], ['0', 'Klanten'], ['0', 'Videos']].map(([n, l], i) => (
              <div key={i} className="py-3 rounded-[14px] text-center" style={{ background: '#F4F5F7' }}>
                <p className="font-display text-[20px] tracking-[-0.8px]">{n}</p>
                <p className="font-mono text-[9px] font-semibold tracking-[0.09em] text-v3-mute uppercase">{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription pill */}
        <button onClick={() => navigate('/subscription')} className="mx-[22px] mb-3.5 flex items-center gap-3 p-4 bg-dark rounded-v3 relative overflow-hidden w-full text-left">
          <div className="absolute -top-[30px] -right-[20px] w-[120px] h-[120px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(212,255,58,0.3), transparent 70%)' }} />
          <div className="w-10 h-10 rounded-[12px] bg-brand flex items-center justify-center relative z-10 flex-shrink-0">
            <Star size={18} className="text-dark" />
          </div>
          <div className="flex-1 relative z-10">
            <p className="text-[14px] font-extrabold text-white">{subTitle}</p>
            <p className="font-mono text-[10px] text-white/60">{subMeta}</p>
          </div>
          <ChevronRight size={14} className="text-white/70 relative z-10" />
        </button>

        {/* Menu groups */}
        {menuGroup('BEDRIJF', [
          { icon: Building2, color: '#7A9900', bg: 'rgba(212,255,58,0.2)', title: 'Bedrijfsgegevens', desc: 'KvK, BTW-ID, adres', action: () => setShowCompany(true) },
          { icon: Globe, color: '#7B5CFF', bg: 'rgba(123,92,255,0.15)', title: 'Taal', desc: '160 talen beschikbaar', trailing: 'Nederlands', action: () => {} },
        ])}

        {menuGroup('GEGEVENS', [
          { icon: Download, color: '#4BA3FF', bg: 'rgba(75,163,255,0.15)', title: 'Export', desc: 'XAF \u00b7 UBL \u00b7 CSV', action: () => {} },
        ])}

        {menuGroup('ACCOUNT', [
          { icon: Shield, color: '#7B5CFF', bg: 'rgba(123,92,255,0.15)', title: 'Privacy', desc: 'Data, AVG, beveiliging', action: () => {} },
          { icon: HelpCircle, color: '#4BA3FF', bg: 'rgba(75,163,255,0.15)', title: 'Help & Contact', desc: 'FAQ, chat', action: () => {} },
          { icon: LogOut, color: '#FF5A5A', bg: 'rgba(255,90,90,0.12)', title: 'Uitloggen', desc: undefined, destructive: true, action: logout },
          { icon: Trash2, color: '#FF5A5A', bg: 'rgba(255,90,90,0.12)', title: t('settings.deleteAccount'), desc: undefined, destructive: true, action: () => setShowDelete(true) },
        ])}

        <div className="h-32" />
      </div>

      {/* Company editor sheet */}
      <AnimatePresence>
        {showCompany && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center" style={{ backdropFilter: 'blur(8px)' }}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }}
              className="bg-white rounded-t-v3-xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 safe-bottom">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-[22px]">Bedrijfsgegevens</h2>
                <button onClick={() => { handleSave(); setShowCompany(false); }} className="text-[14px] font-bold text-v3-purple">Opslaan</button>
              </div>
              <div className="space-y-3">
                <div><span className="label-v3">{t('settings.bedrijfsnaam')}</span><input value={form.company_name || ''} onChange={set('company_name')} className="input-v3" /></div>
                <div><span className="label-v3">{t('settings.adres')}</span><input value={form.company_address || ''} onChange={set('company_address')} className="input-v3" /></div>
                <div className="grid grid-cols-5 gap-2">
                  <div className="col-span-2"><span className="label-v3">Postcode</span><input value={form.company_postcode || ''} onChange={set('company_postcode')} className="input-v3" /></div>
                  <div className="col-span-3"><span className="label-v3">Plaats</span><input value={form.company_city || ''} onChange={set('company_city')} className="input-v3" /></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="label-v3">KVK</span><input value={form.kvk_number || ''} onChange={set('kvk_number')} className="input-v3" /></div>
                  <div><span className="label-v3">BTW</span><input value={form.btw_number || ''} onChange={set('btw_number')} className="input-v3" /></div>
                </div>
                <div><span className="label-v3">IBAN</span><input value={form.iban || ''} onChange={set('iban')} className="input-v3" /></div>
                <div><span className="label-v3">E-mail wachtwoord</span><input type="password" value={form.smtp_pass || ''} onChange={set('smtp_pass')} className="input-v3" /></div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete account popup */}
      <AnimatePresence>
        {showDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-6" style={{ backdropFilter: 'blur(8px)' }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-v3-lg p-6 w-full max-w-sm text-center shadow-2xl">
              <Trash2 size={32} className="mx-auto mb-4 text-v3-red" />
              <p className="text-lg font-extrabold text-dark mb-2">{t('settings.deleteTitle')}</p>
              <p className="text-sm text-v3-mute mb-6">{t('settings.deleteDesc')}</p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setShowDelete(false)} className="py-3 rounded-full bg-bg text-v3-text2 font-bold">{t('common.annuleren')}</button>
                <button onClick={async () => { setDeleting(true); try { await api.delete('/auth/account'); logout(); } catch {} finally { setDeleting(false); setShowDelete(false); } }}
                  disabled={deleting} className="py-3 rounded-full bg-v3-red text-white font-bold disabled:opacity-50">{deleting ? '...' : t('settings.deleteConfirm')}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function menuGroup(title: string, items: { icon: any; color: string; bg: string; title: string; desc?: string; trailing?: string; destructive?: boolean; action: () => void }[]) {
  return (
    <div className="mb-3">
      <p className="font-mono text-[10px] font-bold tracking-[0.15em] text-v3-mute uppercase px-[22px] mb-1.5 mt-2">{title}</p>
      <div className="mx-[22px] bg-white rounded-v3 overflow-hidden" style={{ border: '1px solid #EEF0F3' }}>
        {items.map((item, i) => (
          <button key={i} onClick={item.action} className="w-full flex items-center gap-3 px-4 py-3.5 text-left" style={i < items.length - 1 ? { borderBottom: '1px solid #EEF0F3' } : {}}>
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: item.bg }}>
              <item.icon size={14} style={{ color: item.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-[14px] font-semibold ${item.destructive ? 'text-v3-red' : 'text-dark'}`}>{item.title}</p>
              {item.desc && <p className="text-[11px] text-v3-mute mt-0.5">{item.desc}</p>}
            </div>
            {item.trailing && <span className="font-mono text-[11px] font-medium text-v3-mute mr-2">{item.trailing}</span>}
            {!item.destructive && <ChevronRight size={12} className="text-v3-dim flex-shrink-0" />}
          </button>
        ))}
      </div>
    </div>
  );
}
