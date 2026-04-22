import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Pencil, ArrowRightLeft, Clock, Check } from 'lucide-react';
import { useI18n } from '../i18n';
import { invoiceService } from '../services/invoiceService';
import { offerteService } from '../services/offerteService';
import { Invoice } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

type DocType = 'factuur' | 'offerte' | 'credit';
type FilterType = 'all' | 'open' | 'paid' | 'overdue';

export default function InvoiceHistoryPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [docType, setDocType] = useState<DocType>('factuur');
  const [filter, setFilter] = useState<FilterType>('all');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [offertes, setOffertes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [convertPopup, setConvertPopup] = useState<any>(null);
  const [convertLoading, setConvertLoading] = useState(false);

  useEffect(() => {
    Promise.all([invoiceService.getAll(), offerteService.getAll()])
      .then(([inv, off]) => { setInvoices(inv); setOffertes(off); })
      .finally(() => setLoading(false));
  }, []);

  const handleConvert = async (offerte: any) => {
    setConvertLoading(true);
    try {
      await offerteService.convertToInvoice(offerte.id);
      const [inv, off] = await Promise.all([invoiceService.getAll(), offerteService.getAll()]);
      setInvoices(inv); setOffertes(off); setConvertPopup(null);
    } catch {} finally { setConvertLoading(false); }
  };

  const filtered = docType === 'offerte' ? offertes :
    invoices.filter(inv => {
      if (filter === 'open') return ['sent', 'draft'].includes(inv.status);
      if (filter === 'paid') return inv.status === 'paid';
      if (filter === 'overdue') return inv.status === 'overdue';
      return true;
    });

  const total = (docType === 'offerte' ? offertes : invoices).reduce((s, d) => s + (d.total || 0), 0);
  const split = (() => { const str = formatCurrency(total); const p = str.split(','); return { whole: p[0] || '\u20AC0', cents: ',' + (p[1] || '00') }; })();

  const statusColor = (s: string) => s === 'paid' ? '#42C281' : s === 'sent' ? '#7B5CFF' : s === 'overdue' ? '#FF5A5A' : '#8A8F99';
  const statusText = (s: string) => s === 'paid' ? 'BETAALD' : s === 'sent' ? 'VERZONDEN' : s === 'overdue' ? 'TE LAAT' : s === 'converted' ? 'OMGEZET' : 'CONCEPT';

  return (
    <div className="h-full flex flex-col safe-top" style={{ background: '#F4F5F7' }}>
      <div className="page-scroll">
        <div className="px-[22px] pt-3 pb-2">
          <h1 className="font-display text-[34px] tracking-[-1.2px]">Jouw docs<span style={{ color: '#7A9900' }}>.</span></h1>
        </div>

        {/* Type segment */}
        <div className="px-[22px] mb-4">
          <div className="flex p-1 bg-white rounded-full" style={{ border: '1px solid #EEF0F3' }}>
            {(['offerte', 'factuur', 'credit'] as DocType[]).map(tp => (
              <button key={tp} onClick={() => setDocType(tp)}
                className={`flex-1 py-2.5 rounded-full text-[12px] font-bold transition-all ${docType === tp ? 'text-dark' : 'text-v3-mute'}`}
                style={docType === tp ? { background: '#D4FF3A' } : {}}>
                {tp === 'offerte' ? 'Offerte' : tp === 'factuur' ? 'Factuur' : 'Credit'}
              </button>
            ))}
          </div>
        </div>

        {/* Total card */}
        <div className="mx-[22px] mb-4 p-5 bg-white rounded-v3-lg">
          <p className="font-mono text-[10px] font-bold tracking-[0.15em] text-v3-mute mb-2">TOTAAL DEZE MAAND</p>
          <div className="flex items-baseline">
            <span className="font-display text-[40px] tracking-[-1.5px]">{split.whole}</span>
            <span className="font-display text-[22px] text-v3-dim">{split.cents}</span>
          </div>
          <div className="flex gap-4 mt-2">
            <span className="font-mono text-[11px] font-semibold text-v3-mute flex items-center gap-1"><Clock size={12} /> {filtered.length} docs</span>
            <span className="font-mono text-[11px] font-semibold text-v3-mute flex items-center gap-1"><Check size={12} /> {invoices.filter(i => i.status === 'sent').length} open</span>
          </div>
        </div>

        {/* Filter chips */}
        {docType === 'factuur' && (
          <div className="flex gap-2 px-[22px] mb-4 overflow-x-auto no-scrollbar">
            {([['all', 'Alle'], ['open', 'Open'], ['paid', 'Betaald'], ['overdue', 'Te laat']] as [FilterType, string][]).map(([key, label]) => (
              <button key={key} onClick={() => setFilter(key)}
                className={`font-mono text-[10px] font-semibold px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${filter === key ? 'bg-dark text-white' : 'bg-white text-v3-mute'}`}
                style={filter !== key ? { border: '1px solid #EEF0F3' } : {}}>
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Doc list */}
        <div className="px-[22px] pb-32">
          {loading ? (
            <div className="py-10 text-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand mx-auto" /></div>
          ) : filtered.length === 0 ? (
            <div className="py-14 text-center text-v3-dim font-medium text-[14px]">Nog geen documenten</div>
          ) : (
            <div className="space-y-2.5">
              {filtered.map((doc: any, i: number) => {
                const isOff = docType === 'offerte';
                const number = isOff ? doc.offerte_number : doc.invoice_number;
                const date = isOff ? doc.offerte_date : doc.invoice_date;
                const status = doc.status || 'sent';
                const sc = statusColor(status);

                return (
                  <motion.div key={doc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="p-4 bg-white rounded-v3 flex items-center gap-3.5" style={{ border: '1px solid #EEF0F3' }}>
                    <div className="w-1 h-[46px] rounded-full flex-shrink-0" style={{ background: sc }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[15px] font-bold text-dark truncate">{doc.client_name || 'Klant'}</span>
                        <span className="text-[15px] font-extrabold text-dark">{formatCurrency(doc.total)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-v3-mute">{number} &middot; {formatDate(date)}</span>
                        <span className="font-mono text-[9px] font-bold tracking-[0.08em] px-1.5 py-0.5 rounded-[6px]"
                          style={{ color: sc, background: sc + '1A' }}>{statusText(status)}</span>
                      </div>
                      {isOff && status !== 'converted' && (
                        <button onClick={() => setConvertPopup(doc)}
                          className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-bold text-dark"
                          style={{ background: '#D4FF3A1A' }}>
                          <ArrowRightLeft size={12} /> {t('offerte.convert')}
                        </button>
                      )}
                    </div>
                    {!isOff && (
                      <div className="flex flex-col gap-1.5 flex-shrink-0">
                        <button onClick={async () => { try { await invoiceService.downloadPdf(doc.id); } catch {} }}
                          className="w-8 h-8 bg-bg rounded-lg flex items-center justify-center"><Download size={14} className="text-v3-mute" /></button>
                        <button onClick={() => navigate(`/invoices/edit/${doc.id}`)}
                          className="w-8 h-8 bg-bg rounded-lg flex items-center justify-center"><Pencil size={14} className="text-v3-mute" /></button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Convert popup */}
      <AnimatePresence>
        {convertPopup && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-6" style={{ backdropFilter: 'blur(8px)' }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-v3-lg p-6 w-full max-w-sm text-center shadow-2xl">
              <ArrowRightLeft size={32} className="mx-auto mb-4" style={{ color: '#D4FF3A' }} />
              <p className="text-lg font-extrabold text-dark mb-2">{t('offerte.convertConfirm')}</p>
              <p className="text-sm text-v3-mute mb-1">{convertPopup.offerte_number}</p>
              <p className="text-base font-extrabold text-dark mb-6">{formatCurrency(convertPopup.total)}</p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setConvertPopup(null)} className="py-3 rounded-full bg-bg text-v3-text2 font-bold">{t('invoice.nee')}</button>
                <button onClick={() => handleConvert(convertPopup)} disabled={convertLoading}
                  className="py-3 rounded-full font-bold text-dark disabled:opacity-50" style={{ background: '#D4FF3A' }}>
                  {convertLoading ? '...' : t('invoice.ja')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
