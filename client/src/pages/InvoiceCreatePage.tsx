import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, UserPlus, Users, MessageCircle, Mail, ChevronRight, ClipboardList, Trash2, Plus, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../i18n';
import { clientService } from '../services/clientService';
import { invoiceService } from '../services/invoiceService';
import { sendPdfByMail, sharePdfViaWhatsApp } from '../services/pdfDownload';
import { Client, InvoiceItem } from '../types';
import { todayISO, addDays, formatCurrency } from '../utils/formatters';
import BtwChatbot from '../components/BtwChatbot';
import SuccessAnimation from '../components/SuccessAnimation';
import InvoicePreview from '../components/invoice/InvoicePreview';

const slide = { initial:{opacity:0}, animate:{opacity:1}, exit:{opacity:0}, transition:{duration:0.15} };
const DRAFT_KEY = 'invoiceCreateDraft';

function parseWorkText(text: string): InvoiceItem[] {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const items: InvoiceItem[] = [];
  for (const line of lines) {
    const m1 = line.match(/(\d+[.,]?\d*)\s*(uur|uren|u|hours?|saat|st|stuks?)\s*[x×*]\s*[€]?\s*(\d+[.,]?\d*)/i);
    const m2 = line.match(/(\d+[.,]?\d*)\s*(uur|uren|u|hours?|saat|st|stuks?)\s+[€]?\s*(\d+[.,]?\d*)/i);
    const m3 = line.match(/[€]\s*(\d+[.,]?\d*)/);
    const m4 = line.match(/(?:prijs|bedrag|totaal|price|fiyat)[:\s]+[€]?\s*(\d+[.,]?\d*)/i);
    const m5 = line.match(/[\s\-–]\s*(\d+[.,]?\d{2})\s*$/);
    const match = m1 || m2;
    if (match) {
      const qty = parseFloat(match[1].replace(',', '.'));
      const price = parseFloat(match[3].replace(',', '.'));
      const desc = line.replace(match[0], '').replace(/^[\s\-–—:,]+/, '').replace(/[\s\-–—:,]+$/, '').trim() || `Regel ${items.length + 1}`;
      items.push({ description: desc, quantity: qty, unit_price: price, btw_rate: 21 });
    } else if (m4) {
      const price = parseFloat(m4[1].replace(',', '.'));
      const desc = line.replace(m4[0], '').replace(/^[\s\-–—:,]+/, '').trim() || `Regel ${items.length + 1}`;
      items.push({ description: desc, quantity: 1, unit_price: price, btw_rate: 21 });
    } else if (m3) {
      const price = parseFloat(m3[1].replace(',', '.'));
      const desc = line.replace(m3[0], '').replace(/^[\s\-–—:,]+/, '').trim() || `Regel ${items.length + 1}`;
      items.push({ description: desc, quantity: 1, unit_price: price, btw_rate: 21 });
    } else if (m5) {
      const price = parseFloat(m5[1].replace(',', '.'));
      const desc = line.replace(m5[0], '').trim() || `Regel ${items.length + 1}`;
      items.push({ description: desc, quantity: 1, unit_price: price, btw_rate: 21 });
    } else if (line.length > 3) {
      items.push({ description: line, quantity: 1, unit_price: 0, btw_rate: 21 });
    }
  }
  return items;
}

export default function InvoiceCreatePage({ docType = 'invoice' }: { docType?: string }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isCredit = docType === 'credit';
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
  const [clientInvoices, setClientInvoices] = useState<any[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showCreditConfirm, setShowCreditConfirm] = useState(false);

  const [clientId, setClientId] = useState<number | null>(draft?.clientId ?? null);
  type NewClient = { company_name: string; kvk_number: string; email: string; btw_number: string; address: string; postcode: string; city: string };
  const [newClient, setNewClient] = useState<NewClient>(draft?.newClient || { company_name:'',kvk_number:'',email:'',btw_number:'NL',address:'',postcode:'',city:'' });
  const [btwRate, setBtwRate] = useState<number | 'verlegd'>(draft?.btwRate ?? 21);
  const [btwMode, setBtwMode] = useState<'incl' | 'excl'>(draft?.btwMode || 'excl');
  const [amount, setAmount] = useState(draft?.amount || '');
  const [rawText, setRawText] = useState('');
  const [parsedItems, setParsedItems] = useState<InvoiceItem[]>(draft?.parsedItems || []);
  const [items, setItems] = useState<InvoiceItem[]>(draft?.items || []);
  const [wantDesc, setWantDesc] = useState<boolean | null>(draft?.wantDesc ?? null);
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
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ step, clientId, newClient, btwRate, amount, parsedItems, items, wantDesc, description })); } catch {}
  }, [step, clientId, newClient, btwRate, amount, parsedItems, items, wantDesc, description, showSuccess]);

  const stepRef = useRef(step);
  stepRef.current = step;

  const goBack = useCallback(() => {
    const s = stepRef.current;
    if (s===10) setStep(1); else if (s===11) setStep(10); else if (s===41||s===42) setStep(4); else if (s===43) setStep(42); else if (s===44) setStep(41); else if (s===45) setStep(42); else if (s===51) setStep(5); else if (s>1) setStep(s-1); else navigate(-1);
  }, [navigate]);

  useEffect(() => {
    if (step > 1) window.history.pushState({ invoiceStep: step }, '');
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

  const handleParse = () => {
    const parsed = parseWorkText(rawText);
    parsed.forEach(p => { p.btw_rate = rate; });
    setParsedItems(parsed);
  };

  const totalFromItems = (list: InvoiceItem[]) => list.reduce((s, i) => s + i.quantity * i.unit_price * (1 + (btwRate === 'verlegd' ? 0 : i.btw_rate) / 100), 0);

  const handleSend = async (method: 'email' | 'whatsapp') => {
    setSaving(true);
    try {
      const finalItems = items.length > 0 ? items : [{ description: description || 'Voor u verrichte werkzaamheden', quantity: 1, unit_price: parseFloat(amount.replace(',','.')) || 0, btw_rate: rate }];
      const desc = description || 'Voor u verrichte werkzaamheden';
      const invoice = await invoiceService.create({
        client_id: clientId!, invoice_date: todayISO(), delivery_date: todayISO(),
        due_date: addDays(todayISO(), user?.default_payment_days || 30),
        payment_terms_days: user?.default_payment_days || 30, description: desc, items: finalItems,
      });
      const total = formatCurrency(finalItems.reduce((s, i) => s + i.quantity * i.unit_price * (1 + rate/100), 0));
      const fileName = `${invoice.invoice_number}.pdf`;
      const pdfPath = `/invoices/${invoice.id}/pdf`;
      const greeting = `Beste ${selectedClient?.company_name || ''}`;
      const signature = `Met vriendelijke groet,\n${user?.company_name || user?.email || ''}`;

      if (method === 'email') {
        const subject = `Factuur ${invoice.invoice_number}`;
        const body = `${greeting},\n\nIn de bijlage vindt u factuur ${invoice.invoice_number} ter hoogte van ${total}.\n\nGelieve dit bedrag binnen ${user?.default_payment_days || 30} dagen te voldoen.\n\nAlvast bedankt!\n\n${signature}`;
        try {
          await sendPdfByMail({
            path: pdfPath,
            fileName,
            to: selectedClient?.email,
            subject,
            body,
          });
          setShowSuccess(true); setTimeout(() => navigate('/'), 2500);
        } catch (err: any) {
          console.error('mail share error', err);
          alert('Er ging iets mis bij het openen van de mail app. Probeer het opnieuw.');
          setSaving(false); return;
        }
      }
      if (method === 'whatsapp') {
        const text = `${greeting},\n\nHierbij ontvangt u factuur ${invoice.invoice_number} ter hoogte van ${total}.\n\n${signature}`;
        try {
          await sharePdfViaWhatsApp({
            path: pdfPath,
            fileName,
            phone: (selectedClient as any)?.phone,
            text,
          });
          setShowSuccess(true); setTimeout(() => navigate('/'), 2500);
        } catch (err: any) {
          console.error('whatsapp share error', err);
          alert('Er ging iets mis bij het openen van WhatsApp. Probeer het opnieuw.');
          setSaving(false); return;
        }
      }
    } catch (err) {
      console.error('Send error:', err);
      alert('Er is een fout opgetreden. Probeer het opnieuw.');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: '#F4F5F7' }}><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand" /></div>;

  const totalSteps = 4;
  const currentStep = step <= 2 ? (step === 1 ? 1 : 2) : step <= 4 ? 3 : 4;

  return (
    <div className="min-h-screen safe-top" style={{ background: '#F4F5F7' }}>
      <AnimatePresence>{showSuccess && <SuccessAnimation message={t('invoice.factuurVerzonden')} />}</AnimatePresence>
      <BtwChatbot open={showBtw} onClose={() => setShowBtw(false)} onSelect={r => { setBtwRate(r); setShowBtw(false); setStep(4); }} />

      {/* v3 Nav */}
      <div className="px-[22px] pt-4 pb-3 flex items-center">
        <button onClick={goBack} className="w-10 h-10 bg-white rounded-full flex items-center justify-center" style={{ border: '1px solid #EEF0F3' }}>
          <ArrowLeft size={14} className="text-dark" />
        </button>
        <span className="flex-1 text-center text-[15px] font-bold text-dark">{isCredit ? t('credit.title') : t('invoice.title')}</span>
        <div className="w-10" />
      </div>

      {/* Step indicator */}
      <div className="flex gap-1.5 px-[22px] mb-1">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className={`flex-1 h-[3px] rounded-full ${currentStep > i ? 'bg-dark' : 'bg-v3-border-strong'}`} />
        ))}
      </div>
      <p className="font-mono text-[10px] font-semibold tracking-[0.15em] text-v3-mute px-[22px] mb-4">
        Stap <span className="text-dark font-bold">{currentStep}</span> van {totalSteps}
      </p>

      <div className="px-[22px] pb-32">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" {...slide} className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 max-w-sm mx-auto w-full">
              {!isCredit && (
                <button onClick={() => setStep(2)}
                  className="w-full flex items-center gap-5 p-5 rounded-3xl transition-all duration-200 active:scale-[0.97]"
                  style={{ background: 'linear-gradient(135deg, #DFFF00 0%, #B8D900 100%)', boxShadow: '0 8px 32px rgba(223,255,0,0.3)' }}>
                  <div className="w-16 h-16 rounded-2xl bg-white/30 backdrop-blur-sm flex items-center justify-center"><UserPlus size={28} className="text-dark" strokeWidth={2.2} /></div>
                  <div className="flex-1 text-left"><p className="text-lg font-extrabold text-dark">{t('invoice.nieuweKlant')}</p></div>
                  <ChevronRight size={22} className="text-dark/40" />
                </button>
              )}
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
            <motion.div key="s2" {...slide} className="space-y-3">
              {clientError && <div className="p-3 bg-red-50 rounded-2xl text-red-600 text-sm font-medium">{clientError}</div>}
              <div><label className="label-send notranslate">KVK Nummer</label><input type="text" value={newClient.kvk_number} onChange={e => setNewClient(p=>({...p,kvk_number:e.target.value}))} className="input-send py-2.5" maxLength={8} placeholder="12345678" /></div>
              <div><label className="label-send">{t('register.bedrijfsnaam')} *</label><input type="text" value={newClient.company_name} onChange={e => setNewClient(p=>({...p,company_name:e.target.value}))} className="input-send py-2.5" /></div>
              <div><label className="label-send">{t('register.adres')}</label><input type="text" value={newClient.address} onChange={e => setNewClient(p=>({...p,address:e.target.value}))} className="input-send py-2.5" placeholder={t('register.adresPh')} /></div>
              <div className="grid grid-cols-5 gap-3">
                <div className="col-span-2"><label className="label-send">{t('register.postcode')}</label><input type="text" value={(newClient as any).postcode||''} onChange={e => setNewClient(p=>({...p,postcode:e.target.value} as any))} className="input-send py-2.5" placeholder="1234 AB" maxLength={7} /></div>
                <div className="col-span-3"><label className="label-send">{t('register.plaats')}</label><input type="text" value={(newClient as any).city||''} onChange={e => setNewClient(p=>({...p,city:e.target.value} as any))} className="input-send py-2.5" placeholder="Amsterdam" /></div>
              </div>
              <div><label className="label-send">{t('register.email')} *</label><input type="email" value={newClient.email} onChange={e => setNewClient(p=>({...p,email:e.target.value}))} className="input-send py-2.5" /></div>
              <div><label className="label-send notranslate">BTW Nummer</label><input type="text" value={newClient.btw_number} onChange={handleBtw} className="input-send py-2.5 notranslate" placeholder="NL000000000B00" /></div>
              <button onClick={saveNewClient} disabled={saving} className="btn-brand w-full mt-4 mb-8">{saving ? t('invoice.opslaan') : t('invoice.klantOpslaan')}</button>
            </motion.div>
          )}

          {step === 10 && (
            <motion.div key="s10" {...slide} className="space-y-2">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">{t('invoice.selecteer')}</p>
              {clients.map(c => (
                <button key={c.id} onClick={async () => {
                  setClientId(c.id);
                  if (isCredit) {
                    try {
                      const invs = await invoiceService.getAll();
                      setClientInvoices(invs.filter((inv: any) => inv.client_id === c.id));
                    } catch { setClientInvoices([]); }
                    setStep(11);
                  } else { setStep(3); }
                }} className={`card-send w-full text-left p-4 ${clientId===c.id?'border-brand border-2':''}`}>
                  <p className="font-bold text-dark">{c.company_name}</p>
                  {c.email && <p className="text-sm text-gray-400">{c.email}</p>}
                </button>
              ))}
              {clients.length === 0 && <p className="text-center text-gray-300 py-10">Geen klanten</p>}
            </motion.div>
          )}

          {step === 11 && isCredit && (
            <motion.div key="s11" {...slide} className="space-y-2">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">{t('credit.selecteerFactuur')}</p>
              {clientInvoices.length === 0 ? (
                <p className="text-center text-gray-300 py-10">{t('history.geen')}</p>
              ) : clientInvoices.map((inv: any) => (
                <button key={inv.id} onClick={() => { setSelectedInvoice(inv); setShowCreditConfirm(true); }}
                  className="card-send w-full text-left p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-dark notranslate">{inv.invoice_number}</p>
                      <p className="text-xs text-gray-400">{inv.invoice_date}</p>
                    </div>
                    <p className="text-base font-extrabold text-dark notranslate">{formatCurrency(inv.total)}</p>
                  </div>
                </button>
              ))}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" {...slide} className="flex flex-col items-center justify-center min-h-[55vh] space-y-4">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t('invoice.btwSelectie')}</p>
              <div className="w-full max-w-xs space-y-3">
                <button onClick={() => { setBtwRate(21); setStep(4); }} className={`w-full py-5 rounded-3xl text-xl font-extrabold transition-all ${btwRate===21?'bg-brand text-dark shadow-lg shadow-brand/30':'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>21%</button>
                <button onClick={() => { setBtwRate(9); setStep(4); }} className={`w-full py-5 rounded-3xl text-xl font-extrabold transition-all ${btwRate===9?'bg-brand text-dark shadow-lg shadow-brand/30':'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>9%</button>
                <button onClick={() => { setBtwRate('verlegd'); setStep(4); }} className={`w-full py-5 rounded-3xl text-xl font-extrabold transition-all ${btwRate==='verlegd'?'bg-brand text-dark shadow-lg shadow-brand/30':'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>{t('invoice.verlegd')}</button>
              </div>
              <button onClick={() => setShowBtw(true)} className="flex items-center gap-2 py-3 text-sm font-bold text-gray-400 hover:text-dark transition-colors"><MessageCircle size={18} /> {t('invoice.btwHulp')}</button>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" {...slide} className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 max-w-sm mx-auto w-full">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t('invoice.hoeFactureren')}</p>
              <div className="flex bg-gray-100 rounded-2xl p-1 w-full max-w-xs">
                <button onClick={() => setBtwMode('excl')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${btwMode === 'excl' ? 'bg-white text-dark shadow-sm' : 'text-gray-400'}`}>Excl. BTW</button>
                <button onClick={() => setBtwMode('incl')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${btwMode === 'incl' ? 'bg-white text-dark shadow-sm' : 'text-gray-400'}`}>Incl. BTW</button>
              </div>
              <button onClick={() => setStep(41)} className="card-send w-full flex items-center gap-4 p-5">
                <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center"><span className="text-2xl font-black text-dark notranslate">€</span></div>
                <div className="flex-1 text-left"><p className="font-bold text-dark">{t('invoice.direct')}</p><p className="text-sm text-gray-400">{t('invoice.directSub')}</p></div>
                <ChevronRight size={20} className="text-gray-300" />
              </button>
              <button onClick={() => { setParsedItems([{description:'',quantity:0,unit_price:0,btw_rate:rate}]); setStep(42); }} className="card-send w-full flex items-center gap-4 p-5">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center"><ClipboardList size={22} className="text-blue-600" /></div>
                <div className="flex-1 text-left"><p className="font-bold text-dark">{t('invoice.ayrintili')}</p><p className="text-sm text-gray-400">{t('invoice.ayrintiliSub')}</p></div>
                <ChevronRight size={20} className="text-gray-300" />
              </button>
            </motion.div>
          )}

          {step === 41 && (
            <motion.div key="s41" {...slide} className="space-y-6">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t('invoice.bedrag')}</p>
              <div className="text-center py-8">
                <span className="text-5xl font-black text-dark notranslate">€</span>
                <input type="text" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9.,]/g,''))} onFocus={e => e.target.select()} placeholder="0,00" className="text-5xl font-black text-dark bg-transparent border-none outline-none w-48 text-center notranslate" />
              </div>
              <p className="text-center text-sm text-gray-400 font-medium">{btwMode === 'incl' ? 'Inclusief BTW' : 'Exclusief BTW'}</p>
              <button onClick={() => { setItems([]); setStep(44); }} disabled={!amount || parseFloat(amount.replace(',','.'))=== 0} className="btn-brand w-full">{t('common.volgende')}</button>
            </motion.div>
          )}

          {step === 44 && (() => {
            const amt = parseFloat(amount.replace(',','.')) || 0;
            const sub = btwMode === 'incl' ? amt / (1 + rate/100) : amt;
            const btw = sub * (rate/100);
            const tot = sub + btw;
            const payDays = user?.default_payment_days || 30;
            const previewItems = [{ description: description || 'Voor u verrichte werkzaamheden', quantity: 1, unit_price: sub, btw_rate: rate }];
            return (
              <motion.div key="s44" {...slide} className="space-y-4">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t('invoice.onizleme')}</p>
                <InvoicePreview
                  supplierName={user?.company_name || ''} supplierAddress={user?.company_address || ''} supplierPostcode={user?.company_postcode || ''} supplierCity={user?.company_city || ''}
                  supplierKvk={user?.kvk_number || ''} supplierBtw={user?.btw_number || ''} supplierIban={user?.iban || ''} supplierPhone={user?.phone || ''}
                  supplierLogo={user?.logo_path || undefined}
                  customerName={selectedClient?.company_name || ''} customerAddress={selectedClient?.address || ''} customerPostcode={selectedClient?.postcode || ''} customerCity={selectedClient?.city || ''} customerCountry={selectedClient?.country || ''}
                  invoiceNumber={`${user?.invoice_prefix || 'FAC'}${String(user?.next_invoice_number || 1).padStart(3, '0')}`}
                  invoiceDate={todayISO()} dueDate={addDays(todayISO(), payDays)} deliveryDate={todayISO()}
                  paymentDays={payDays} description={description || 'Voor u verrichte werkzaamheden'}
                  items={previewItems} subtotal={sub} btwAmount={btw} total={tot}
                />
                <div className="grid grid-cols-2 gap-3 sticky bottom-0 bg-white pt-3 pb-2">
                  <button onClick={() => setStep(41)} className="py-4 rounded-2xl border-2 border-black text-dark font-extrabold text-base active:scale-[0.97] transition-all">{t('invoice.bewerken')}</button>
                  <button onClick={() => setStep(5)} className="py-4 rounded-2xl bg-brand text-dark font-extrabold text-base shadow-lg shadow-brand/30 active:scale-[0.97] transition-all">{t('invoice.verzenden')}</button>
                </div>
              </motion.div>
            );
          })()}

          {step === 42 && (
            <motion.div key="s42" {...slide} className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t('invoice.ayrintili')}</p>
                <button onClick={() => {
                  const last = parsedItems[parsedItems.length - 1];
                  let newDesc = '';
                  if (last && last.description) {
                    const dateMatch = last.description.match(/(\d{2})-(\d{2})-(\d{4})/);
                    if (dateMatch) {
                      const d = new Date(parseInt(dateMatch[3]), parseInt(dateMatch[2]) - 1, parseInt(dateMatch[1]) + 1);
                      const dd = String(d.getDate()).padStart(2, '0');
                      const mm = String(d.getMonth() + 1).padStart(2, '0');
                      const rest = last.description.replace(/\d{2}-\d{2}-\d{4}/, '').trim();
                      newDesc = `${dd}-${mm}-${d.getFullYear()} ${rest}`;
                    }
                  }
                  setParsedItems(p => [...p, { description: newDesc, quantity: last?.quantity || 0, unit_price: last?.unit_price || 0, btw_rate: rate }]);
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
                        className="flex-1 text-sm font-medium bg-transparent border-none outline-none placeholder-gray-300" placeholder="bijv. 02-03-2026 Amsterdam" />
                      {parsedItems.length > 1 && <button onClick={() => setParsedItems(p => p.filter((_,idx) => idx!==i))} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>}
                    </div>
                    <div className="grid grid-cols-[2fr_2fr_1.5fr] gap-0 border-t border-black/20">
                      <div className="p-3.5 border-r border-black/20">
                        <span className="text-[8px] font-bold text-gray-400 uppercase block mb-1">{t('invoice.aantalLabel')}</span>
                        <div className="flex items-center gap-1">
                          <input type="text" inputMode="decimal" value={item.quantity === 0 ? '' : item.quantity}
                            onChange={e => { const v = e.target.value.replace(',','.'); const n=[...parsedItems]; n[i]={...n[i],quantity: v === '' || v === '.' ? 0 : (v.endsWith('.') ? v as any : parseFloat(v)||0)}; setParsedItems(n); }}
                            onFocus={e => e.target.select()}
                            className="w-full text-base font-bold bg-transparent border-none outline-none placeholder-gray-300" placeholder="0" />
                        </div>
                      </div>
                      <div className="p-3.5 border-r border-black/20">
                        <span className="text-[8px] font-bold text-gray-400 uppercase block mb-1">{t('invoice.bedrag')}</span>
                        <div className="flex items-center gap-0.5">
                          <span className="text-sm font-bold text-gray-300 notranslate">€</span>
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
                <div className="p-4 rounded-2xl" style={{background:'linear-gradient(135deg, #DFFF00, #B8D900)'}}>
                  <div className="flex justify-between text-sm text-dark/60 mb-1"><span>Subtotaal</span><span className="notranslate">{formatCurrency(parsedItems.reduce((s,i) => s + (i.quantity||0)*(i.unit_price||0), 0))}</span></div>
                  <div className="flex justify-between text-sm text-dark/60 mb-1"><span>BTW ({btwRate === 'verlegd' ? 'verlegd' : btwRate + '%'})</span><span className="notranslate">{formatCurrency(parsedItems.reduce((s,i) => s + (i.quantity||0)*(i.unit_price||0)*(rate/100), 0))}</span></div>
                  <div className="flex justify-between text-lg font-extrabold text-dark border-t border-dark/10 pt-2 mt-1"><span>Totaal</span><span className="notranslate">{formatCurrency(totalFromItems(parsedItems))}</span></div>
                </div>
              )}

              <button onClick={() => { setItems(parsedItems.filter(i => i.description.trim() && i.unit_price > 0)); setDescription(parsedItems.filter(i=>i.description.trim()).map(i => i.description).join(', ')); setStep(45); }} disabled={!parsedItems.some(i => i.description.trim() && i.unit_price > 0)} className="btn-brand w-full">{t('invoice.verzenden')}</button>
            </motion.div>
          )}

          {step === 45 && (() => {
            const previewItems = items.length > 0 ? items : parsedItems.filter(i => i.description.trim() && i.unit_price > 0);
            const subtotal = previewItems.reduce((s, i) => s + (i.quantity || 0) * (i.unit_price || 0), 0);
            const btwAmount = previewItems.reduce((s, i) => s + (i.quantity || 0) * (i.unit_price || 0) * (rate / 100), 0);
            const payDays = user?.default_payment_days || 30;
            return (
              <motion.div key="s45" {...slide} className="space-y-4">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t('invoice.onizleme')}</p>
                <InvoicePreview
                  supplierName={user?.company_name || ''} supplierAddress={user?.company_address || ''} supplierPostcode={user?.company_postcode || ''} supplierCity={user?.company_city || ''}
                  supplierKvk={user?.kvk_number || ''} supplierBtw={user?.btw_number || ''} supplierIban={user?.iban || ''} supplierPhone={user?.phone || ''}
                  customerName={selectedClient?.company_name || ''} customerAddress={selectedClient?.address || ''} customerPostcode={selectedClient?.postcode || ''} customerCity={selectedClient?.city || ''} customerCountry={selectedClient?.country || ''}
                  invoiceNumber={`${user?.invoice_prefix || 'FAC'}${String(user?.next_invoice_number || 1).padStart(3, '0')}`}
                  invoiceDate={todayISO()} dueDate={addDays(todayISO(), payDays)} deliveryDate={todayISO()}
                  paymentDays={payDays} description={description || previewItems.map(i => i.description).join(', ')}
                  items={previewItems} subtotal={subtotal} btwAmount={btwAmount} total={subtotal + btwAmount}
                />
                <div className="grid grid-cols-2 gap-3 sticky bottom-0 bg-white pt-3 pb-2">
                  <button onClick={() => setStep(42)} className="py-4 rounded-2xl border-2 border-black text-dark font-extrabold text-base active:scale-[0.97] transition-all">{t('invoice.bewerken')}</button>
                  <button onClick={() => setStep(6)} className="py-4 rounded-2xl bg-brand text-dark font-extrabold text-base shadow-lg shadow-brand/30 active:scale-[0.97] transition-all">{t('invoice.verzenden')}</button>
                </div>
              </motion.div>
            );
          })()}

          {step === 43 && (
            <motion.div key="s43" {...slide} className="space-y-4">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t('invoice.controleer')}</p>
              {parsedItems.length === 0 ? (
                <div className="text-center py-8 text-gray-400"><p>Geen regels herkend.</p><button onClick={() => setStep(42)} className="btn-outline mt-4">{t('common.terug')}</button></div>
              ) : (
                <>
                  <div className="space-y-2">
                    {parsedItems.map((item, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-2xl space-y-2">
                        <div className="flex items-start gap-2">
                          <input type="text" value={item.description} onChange={e => { const n=[...parsedItems]; n[i]={...n[i],description:e.target.value}; setParsedItems(n); }} className="input-send flex-1 text-sm" />
                          <button onClick={() => setParsedItems(p => p.filter((_,idx) => idx!==i))} className="p-2 rounded-xl hover:bg-red-50 text-gray-400"><Trash2 size={16} /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-1"><span className="text-xs font-medium text-gray-400">{t('invoice.aantalLabel')}:</span><input type="text" inputMode="decimal" value={item.quantity||''} onChange={e => { const n=[...parsedItems]; n[i]={...n[i],quantity:parseFloat(e.target.value)||0}; setParsedItems(n); }} className="input-send flex-1 text-sm py-2" /></div>
                          <div className="flex items-center gap-1"><span className="text-sm font-bold text-gray-400 notranslate">€</span><input type="text" inputMode="decimal" value={item.unit_price||''} onChange={e => { const n=[...parsedItems]; n[i]={...n[i],unit_price:parseFloat(e.target.value.replace(',','.'))||0}; setParsedItems(n); }} className="input-send flex-1 text-sm py-2" /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setParsedItems(p => [...p, {description:'',quantity:1,unit_price:0,btw_rate:rate}])} className="w-full text-center text-sm font-bold text-brand-dark py-2"><Plus size={16} className="inline" /> {t('invoice.regelToevoegen')}</button>
                  <div className="p-3 bg-gray-50 rounded-2xl text-right notranslate">
                    <span className="text-lg font-black text-dark">Totaal: {formatCurrency(totalFromItems(parsedItems))}</span>
                  </div>
                  <button onClick={() => { setItems(parsedItems.filter(i => i.description.trim())); setDescription(parsedItems.map(i => i.description).join(', ')); setStep(6); }} className="btn-brand w-full">{t('invoice.verzenden')}</button>
                </>
              )}
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="s5" {...slide} className="space-y-6">
              <p className="text-lg font-bold text-dark text-center py-4">{t('invoice.beschrijvingVraag')}</p>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => { setWantDesc(true); setStep(51); }} className="btn-outline py-5 text-lg font-bold">{t('invoice.ja')}</button>
                <button onClick={() => { setWantDesc(false); setDescription('Voor u verrichte werkzaamheden'); setStep(6); }} className="btn-brand py-5 text-lg">{t('invoice.nee')}</button>
              </div>
            </motion.div>
          )}

          {step === 51 && (
            <motion.div key="s51" {...slide} className="space-y-4">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t('invoice.beschrijving')}</p>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="input-send resize-none" placeholder="Omschrijving van werkzaamheden..." />
              <button onClick={() => setStep(6)} disabled={!description.trim()} className="btn-brand w-full">{t('common.volgende')}</button>
            </motion.div>
          )}

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
            <p className="text-lg font-bold text-dark mb-6">{t('invoice.confirmVersturen')}</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => { setShowConfirm(false); setShowCancelled(true); setTimeout(() => setShowCancelled(false), 2500); }}
                className="py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold text-base hover:bg-gray-200 transition-colors">{t('btw.nee')}</button>
              <button onClick={() => { setShowConfirm(false); handleSend('email'); }}
                className="py-3 rounded-2xl bg-green-500 text-white font-bold text-base hover:bg-green-600 transition-colors">{t('btw.ja')}</button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {showCancelled && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-6">
          <motion.div initial={{scale:0.9}} animate={{scale:1}} className="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"><X size={32} className="text-red-500" /></div>
            <p className="text-lg font-bold text-dark">{t('invoice.nietVerstuurd')}</p>
          </motion.div>
        </motion.div>
      )}

      {showCreditConfirm && selectedInvoice && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-6">
          <motion.div initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} className="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"><X size={32} className="text-red-500" /></div>
            <p className="text-lg font-extrabold text-dark mb-2">{t('credit.iptalBevestiging')}</p>
            <p className="text-sm text-gray-500 mb-1 notranslate">{selectedInvoice.invoice_number}</p>
            <p className="text-lg font-extrabold text-dark mb-6 notranslate">{formatCurrency(selectedInvoice.total)}</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowCreditConfirm(false)}
                className="py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold text-base">{t('invoice.nee')}</button>
              <button onClick={async () => {
                setShowCreditConfirm(false); setSaving(true);
                try {
                  const creditItems = [{ description: `Credit: ${selectedInvoice.invoice_number}`, quantity: 1, unit_price: -Math.abs(selectedInvoice.subtotal || selectedInvoice.total), btw_rate: 0 }];
                  await invoiceService.create({
                    client_id: selectedInvoice.client_id, invoice_date: todayISO(), delivery_date: todayISO(),
                    due_date: todayISO(), payment_terms_days: 0,
                    description: `Credit factuur voor ${selectedInvoice.invoice_number}`, items: creditItems,
                  });
                  setShowSuccess(true); setTimeout(() => navigate('/'), 2500);
                } catch {} finally { setSaving(false); }
              }} className="py-3 rounded-2xl bg-red-500 text-white font-bold text-base">{t('invoice.ja')}</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
