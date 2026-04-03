import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, UserPlus, Users, MessageCircle, Mail, ChevronRight, Trash2, Plus, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../i18n';
import { clientService } from '../services/clientService';
import { Client, InvoiceItem } from '../types';
import { todayISO, addDays, formatCurrency } from '../utils/formatters';
import BtwChatbot from '../components/BtwChatbot';
import SuccessAnimation from '../components/SuccessAnimation';
import OffertePreview from '../components/invoice/OffertePreview';
import { offerteService } from '../services/offerteService';

const slide = { initial:{opacity:0}, animate:{opacity:1}, exit:{opacity:0}, transition:{duration:0.15} };
const DRAFT_KEY = 'offerteCreateDraft';

export default function OfferteCreatePage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const draft = (() => { try { const d = sessionStorage.getItem(DRAFT_KEY); return d ? JSON.parse(d) : null; } catch { return null; } })();
  const [step, setStep] = useState(draft?.step || 1);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showBtw, setShowBtw] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCancelled, setShowCancelled] = useState(false);
  const [clientError, setClientError] = useState('');

  const [clientId, setClientId] = useState<number | null>(draft?.clientId ?? null);
  const [newClient, setNewClient] = useState(draft?.newClient || { company_name:'',kvk_number:'',email:'',btw_number:'NL',address:'' });
  const [btwRate, setBtwRate] = useState<number | 'verlegd'>(draft?.btwRate ?? 21);
  const [parsedItems, setParsedItems] = useState<InvoiceItem[]>(draft?.parsedItems || []);
  const [items, setItems] = useState<InvoiceItem[]>(draft?.items || []);
  const [description, setDescription] = useState(draft?.description || '');

  useEffect(() => {
    clientService.getAll().then(list => {
      const unique = new Map<string, Client>();
      list.forEach(c => { const key = c.kvk_number || c.company_name; if (!unique.has(key)) unique.set(key, c); });
      setClients(Array.from(unique.values()));
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (showSuccess) { sessionStorage.removeItem(DRAFT_KEY); return; }
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ step, clientId, newClient, btwRate, parsedItems, items, description })); } catch {}
  }, [step, clientId, newClient, btwRate, parsedItems, items, description, showSuccess]);

  const stepRef = useRef(step);
  stepRef.current = step;

  const goBack = useCallback(() => {
    const s = stepRef.current;
    if (s===10) setStep(1); else if (s===42) setStep(3); else if (s===45) setStep(42); else if (s===6) setStep(45); else if (s>1) setStep(s-1); else navigate(-1);
  }, [navigate]);

  useEffect(() => {
    if (step > 1) window.history.pushState({ offerteStep: step }, '');
  }, [step]);

  useEffect(() => {
    const onPop = () => { if (stepRef.current > 1) goBack(); else navigate(-1); };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [goBack, navigate]);

  const selectedClient = clients.find(c => c.id === clientId);
  const rate = btwRate === 'verlegd' ? 0 : btwRate;

  const handleBtw = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase();
    if (!val.startsWith('NL')) val = 'NL' + val.replace(/^NL/i, '');
    setNewClient(p => ({ ...p, btw_number: val }));
  };

  const saveNewClient = async () => {
    if (!newClient.company_name.trim() || !newClient.email.trim()) {
      setClientError(t('register.alleVeldenVerplicht')); return;
    }
    if (newClient.kvk_number.trim() && !/^\d{8}$/.test(newClient.kvk_number.trim())) { setClientError(t('register.kvkOngeldig')); return; }
    if (newClient.btw_number.trim() && newClient.btw_number.trim() !== 'NL' && !/^NL\d{9}B\d{2}$/.test(newClient.btw_number.trim())) { setClientError(t('register.btwOngeldig')); return; }
    setSaving(true); setClientError('');
    try {
      const c = await clientService.create({ company_name:newClient.company_name, kvk_number:newClient.kvk_number, email:newClient.email, btw_number:newClient.btw_number, address:newClient.address });
      setClients(prev => [...prev, c]); setClientId(c.id); setStep(3);
    } catch (err: any) { setClientError(err.response?.data?.error || 'Fout bij opslaan'); }
    finally { setSaving(false); }
  };

  const totalFromItems = (list: InvoiceItem[]) => list.reduce((s, i) => s + i.quantity * i.unit_price * (1 + (btwRate === 'verlegd' ? 0 : i.btw_rate) / 100), 0);

  const handleSend = async (method: 'email' | 'whatsapp') => {
    setSaving(true);
    try {
      const finalItems = items.length > 0 ? items : parsedItems.filter(i => i.description.trim() && i.unit_price > 0);
      const desc = description || finalItems.map(i => i.description).join(', ');
      await offerteService.create({
        client_id: clientId!, offerte_date: todayISO(), valid_until: addDays(todayISO(), 30),
        description: desc, items: finalItems,
      });
      if (method === 'whatsapp') {
        const total = formatCurrency(totalFromItems(finalItems));
        const msg = `Beste ${selectedClient?.company_name || ''},\n\nHierbij ontvangt u onze offerte ter hoogte van ${total}.\n\nMet vriendelijke groet,\n${user?.company_name || ''}`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
      }
      setShowSuccess(true); setTimeout(() => navigate('/'), 2500);
    } catch {} finally { setSaving(false); }
  };

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" /></div>;

  return (
    <div className="min-h-screen bg-white safe-top">
      <AnimatePresence>{showSuccess && <SuccessAnimation message={t('offerte.verzonden')} />}</AnimatePresence>
      <BtwChatbot open={showBtw} onClose={() => setShowBtw(false)} onSelect={r => { setBtwRate(r); setShowBtw(false); setParsedItems([{description:'',quantity:0,unit_price:0,btw_rate: r === 'verlegd' ? 0 : r as number}]); setStep(42); }} />

      <div className="px-6 pt-6 flex items-center gap-3 mb-6">
        <button onClick={goBack} className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors"><ArrowLeft size={22} /></button>
        <h1 className="text-lg font-bold text-dark">{t('offerte.title')}</h1>
      </div>

      <div className="px-6">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" {...slide} className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 max-w-sm mx-auto w-full">
              <button onClick={() => setStep(2)}
                className="w-full flex items-center gap-5 p-5 rounded-3xl transition-all duration-200 active:scale-[0.97]"
                style={{ background: 'linear-gradient(135deg, #DFFF00 0%, #B8D900 100%)', boxShadow: '0 8px 32px rgba(223,255,0,0.3)' }}>
                <div className="w-16 h-16 rounded-2xl bg-white/30 backdrop-blur-sm flex items-center justify-center"><UserPlus size={28} className="text-dark" strokeWidth={2.2} /></div>
                <div className="flex-1 text-left"><p className="text-lg font-extrabold text-dark">{t('invoice.nieuweKlant')}</p></div>
                <ChevronRight size={22} className="text-dark/40" />
              </button>
              <button onClick={() => setStep(10)}
                className="w-full flex items-center gap-5 p-5 rounded-3xl transition-all duration-200 active:scale-[0.97]"
                style={{ background: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)', boxShadow: '0 8px 32px rgba(59,130,246,0.12)' }}>
                <div className="w-16 h-16 rounded-2xl bg-white/50 backdrop-blur-sm flex items-center justify-center"><Users size={28} className="text-blue-500" strokeWidth={2.2} /></div>
                <div className="flex-1 text-left"><p className="text-lg font-extrabold text-dark">{t('invoice.bestaandeKlant')}</p></div>
                <ChevronRight size={22} className="text-blue-300" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" {...slide} className="space-y-4">
              {clientError && <div className="p-3 bg-red-50 rounded-2xl text-red-600 text-sm font-medium">{clientError}</div>}
              <div><label className="label-send notranslate">KVK Nummer</label><input type="text" value={newClient.kvk_number} onChange={e => setNewClient(p=>({...p,kvk_number:e.target.value}))} className="input-send" maxLength={8} placeholder="12345678" /></div>
              <div><label className="label-send">{t('register.bedrijfsnaam')} *</label><input type="text" value={newClient.company_name} onChange={e => setNewClient(p=>({...p,company_name:e.target.value}))} className="input-send" /></div>
              <div><label className="label-send">{t('register.adres')}</label><input type="text" value={newClient.address} onChange={e => setNewClient(p=>({...p,address:e.target.value}))} className="input-send" placeholder="Straatnaam 1, 1234 AB Plaats" /></div>
              <div><label className="label-send">{t('register.email')} *</label><input type="email" value={newClient.email} onChange={e => setNewClient(p=>({...p,email:e.target.value}))} className="input-send" /></div>
              <div><label className="label-send notranslate">BTW Nummer</label><input type="text" value={newClient.btw_number} onChange={handleBtw} className="input-send notranslate" placeholder="NL000000000B00" /></div>
              <button onClick={saveNewClient} disabled={saving} className="btn-brand w-full">{saving ? t('invoice.opslaan') : t('invoice.klantOpslaan')}</button>
            </motion.div>
          )}

          {step === 10 && (
            <motion.div key="s10" {...slide} className="space-y-2">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">{t('invoice.selecteer')}</p>
              {clients.map(c => (
                <button key={c.id} onClick={() => { setClientId(c.id); setStep(3); }}
                  className={`card-send w-full text-left p-4 ${clientId===c.id?'border-brand border-2':''}`}>
                  <p className="font-bold text-dark">{c.company_name}</p>
                  {c.email && <p className="text-sm text-gray-400">{c.email}</p>}
                </button>
              ))}
              {clients.length === 0 && <p className="text-center text-gray-300 py-10">Geen klanten</p>}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" {...slide} className="flex flex-col items-center justify-center min-h-[55vh] space-y-4">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t('invoice.btwSelectie')}</p>
              <div className="w-full max-w-xs space-y-3">
                <button onClick={() => { setBtwRate(21); setParsedItems([{description:'',quantity:0,unit_price:0,btw_rate:21}]); setStep(42); }} className={`w-full py-5 rounded-3xl text-xl font-extrabold transition-all ${btwRate===21?'bg-brand text-dark shadow-lg shadow-brand/30':'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>21%</button>
                <button onClick={() => { setBtwRate(9); setParsedItems([{description:'',quantity:0,unit_price:0,btw_rate:9}]); setStep(42); }} className={`w-full py-5 rounded-3xl text-xl font-extrabold transition-all ${btwRate===9?'bg-brand text-dark shadow-lg shadow-brand/30':'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>9%</button>
                <button onClick={() => { setBtwRate('verlegd'); setParsedItems([{description:'',quantity:0,unit_price:0,btw_rate:0}]); setStep(42); }} className={`w-full py-5 rounded-3xl text-xl font-extrabold transition-all ${btwRate==='verlegd'?'bg-brand text-dark shadow-lg shadow-brand/30':'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>{t('invoice.verlegd')}</button>
              </div>
              <button onClick={() => setShowBtw(true)} className="flex items-center gap-2 py-3 text-sm font-bold text-gray-400 hover:text-dark transition-colors"><MessageCircle size={18} /> {t('invoice.btwHulp')}</button>
            </motion.div>
          )}

          {step === 42 && (
            <motion.div key="s42" {...slide} className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t('invoice.ayrintili')}</p>
                <button onClick={() => {
                  const last = parsedItems[parsedItems.length - 1];
                  setParsedItems(p => [...p, { description: '', quantity: last?.quantity || 0, unit_price: last?.unit_price || 0, btw_rate: rate }]);
                }} className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand text-dark text-xs font-bold active:scale-95 transition-all">
                  <Plus size={14} /> {t('invoice.regelToevoegen')}
                </button>
              </div>

              <div className="space-y-2">
                {parsedItems.map((item, i) => (
                  <div key={i} className="bg-white border-2 border-black/80 rounded-xl overflow-hidden">
                    <div className="flex items-center gap-2 px-3 pt-3 pb-1">
                      <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">{i + 1}</span>
                      <input type="text" value={item.description} onChange={e => { const n=[...parsedItems]; n[i]={...n[i],description:e.target.value}; setParsedItems(n); }}
                        className="flex-1 text-sm font-medium bg-transparent border-none outline-none placeholder-gray-300" placeholder={t('invoice.adresOfWeek')} />
                      {parsedItems.length > 1 && <button onClick={() => setParsedItems(p => p.filter((_,idx) => idx!==i))} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>}
                    </div>
                    <div className="grid grid-cols-[2fr_2fr_1.5fr] gap-0 border-t border-black/20">
                      <div className="p-3.5 border-r border-black/20">
                        <span className="text-[8px] font-bold text-gray-400 uppercase block mb-1">{t('invoice.aantalLabel')}</span>
                        <input type="text" inputMode="decimal" value={item.quantity === 0 ? '' : item.quantity}
                          onChange={e => { const v = e.target.value.replace(',','.'); const n=[...parsedItems]; n[i]={...n[i],quantity: v === '' || v === '.' ? 0 : (v.endsWith('.') ? v as any : parseFloat(v)||0)}; setParsedItems(n); }}
                          onFocus={e => e.target.select()}
                          className="w-full text-base font-bold bg-transparent border-none outline-none placeholder-gray-300" placeholder="0" />
                      </div>
                      <div className="p-3.5 border-r border-black/20">
                        <span className="text-[8px] font-bold text-gray-400 uppercase block mb-1">{t('invoice.bedrag')}</span>
                        <div className="flex items-center gap-0.5">
                          <span className="text-sm font-bold text-gray-300 notranslate">&euro;</span>
                          <input type="text" inputMode="decimal" value={item.unit_price === 0 ? '' : item.unit_price}
                            onChange={e => { const v = e.target.value.replace(',','.'); const n=[...parsedItems]; n[i]={...n[i],unit_price: v === '' || v === '.' ? 0 : (v.endsWith('.') ? v as any : parseFloat(v)||0)}; setParsedItems(n); }}
                            onFocus={e => e.target.select()}
                            className="w-full text-base font-bold bg-transparent border-none outline-none placeholder-gray-300 notranslate" placeholder="0,00" />
                        </div>
                      </div>
                      <div className="p-3.5">
                        <span className="text-[8px] font-bold text-gray-400 uppercase block mb-1">Totaal</span>
                        <p className="text-base font-extrabold text-dark notranslate">{formatCurrency((parseFloat(String(item.quantity)) || 0) * (parseFloat(String(item.unit_price)) || 0) * (1 + rate / 100))}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {parsedItems.some(i => i.unit_price > 0) && (
                <div className="p-4 rounded-2xl" style={{background:'linear-gradient(135deg, #DBEAFE, #93C5FD)'}}>
                  <div className="flex justify-between text-sm text-dark/60 mb-1"><span>Subtotaal</span><span className="notranslate">{formatCurrency(parsedItems.reduce((s,i) => s + (i.quantity||0)*(i.unit_price||0), 0))}</span></div>
                  <div className="flex justify-between text-sm text-dark/60 mb-1"><span>BTW ({btwRate === 'verlegd' ? 'verlegd' : btwRate + '%'})</span><span className="notranslate">{formatCurrency(parsedItems.reduce((s,i) => s + (i.quantity||0)*(i.unit_price||0)*(rate/100), 0))}</span></div>
                  <div className="flex justify-between text-lg font-extrabold text-dark border-t border-dark/10 pt-2 mt-1"><span>Totaal</span><span className="notranslate">{formatCurrency(totalFromItems(parsedItems))}</span></div>
                </div>
              )}

              <button onClick={() => { setItems(parsedItems.filter(i => i.description.trim() && i.unit_price > 0)); setDescription(parsedItems.filter(i=>i.description.trim()).map(i => i.description).join(', ')); setStep(45); }} disabled={!parsedItems.some(i => i.description.trim() && i.unit_price > 0)} className="btn-brand w-full">{t('common.volgende')}</button>
            </motion.div>
          )}

          {step === 45 && (() => {
            const previewItems = items.length > 0 ? items : parsedItems.filter(i => i.description.trim() && i.unit_price > 0);
            const subtotal = previewItems.reduce((s, i) => s + (i.quantity || 0) * (i.unit_price || 0), 0);
            const btwAmount = previewItems.reduce((s, i) => s + (i.quantity || 0) * (i.unit_price || 0) * (rate / 100), 0);
            return (
              <motion.div key="s45" {...slide} className="space-y-4">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t('offerte.onizleme')}</p>
                <OffertePreview
                  supplierName={user?.company_name || ''} supplierAddress={user?.company_address || ''} supplierPostcode={user?.company_postcode || ''} supplierCity={user?.company_city || ''}
                  supplierKvk={user?.kvk_number || ''} supplierBtw={user?.btw_number || ''} supplierIban={user?.iban || ''} supplierPhone={user?.phone || ''}
                  supplierLogo={user?.logo_path ? (user.logo_path.startsWith('http') ? user.logo_path : user.logo_path) : undefined}
                  customerName={selectedClient?.company_name || ''} customerAddress={selectedClient?.address || ''} customerPostcode={selectedClient?.postcode || ''} customerCity={selectedClient?.city || ''} customerCountry={selectedClient?.country || ''}
                  offerteNumber={`OFF${String(1).padStart(3, '0')}`}
                  offerteDate={todayISO()} validUntil={addDays(todayISO(), 30)}
                  description={description || previewItems.map(i => i.description).join(', ')}
                  items={previewItems} subtotal={subtotal} btwAmount={btwAmount} total={subtotal + btwAmount}
                />
                <div className="grid grid-cols-2 gap-3 sticky bottom-0 bg-white pt-3 pb-2">
                  <button onClick={() => setStep(42)} className="py-4 rounded-2xl border-2 border-black text-dark font-extrabold text-base active:scale-[0.97] transition-all">{t('invoice.bewerken')}</button>
                  <button onClick={() => setStep(6)} className="py-4 rounded-2xl bg-brand text-dark font-extrabold text-base shadow-lg shadow-brand/30 active:scale-[0.97] transition-all">{t('invoice.verzenden')}</button>
                </div>
              </motion.div>
            );
          })()}

          {step === 6 && (
            <motion.div key="s6" {...slide} className="space-y-4">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">{t('invoice.verzenden')}</p>
              <button onClick={() => handleSend('whatsapp')} disabled={saving} className="card-send w-full flex items-center gap-4 p-5">
                <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-green-600" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.67-1.228A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.153 0-4.16-.655-5.828-1.777l-.244-.163-3.298.868.882-3.222-.178-.267A9.935 9.935 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
                </div>
                <p className="font-bold text-dark flex-1 text-left">{t('invoice.whatsapp')}</p>
                <ChevronRight size={20} className="text-gray-300" />
              </button>
              <button onClick={() => setShowConfirm(true)} disabled={saving} className="card-send w-full flex items-center gap-4 p-5">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center"><Mail size={22} className="text-blue-600" /></div>
                <p className="font-bold text-dark flex-1 text-left">{t('invoice.emailVerzend')}</p>
                <ChevronRight size={20} className="text-gray-300" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showConfirm && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-6">
          <motion.div initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} className="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl">
            <Mail size={32} className="mx-auto mb-4 text-blue-500" />
            <p className="text-lg font-bold text-dark mb-6">{t('offerte.confirmVersturen')}</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => { setShowConfirm(false); setShowCancelled(true); setTimeout(() => setShowCancelled(false), 2500); }}
                className="py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold text-base">{t('btw.nee')}</button>
              <button onClick={() => { setShowConfirm(false); handleSend('email'); }}
                className="py-3 rounded-2xl bg-green-500 text-white font-bold text-base">{t('btw.ja')}</button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {showCancelled && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-6">
          <motion.div initial={{scale:0.9}} animate={{scale:1}} className="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"><X size={32} className="text-red-500" /></div>
            <p className="text-lg font-bold text-dark">{t('offerte.nietVerstuurd')}</p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
