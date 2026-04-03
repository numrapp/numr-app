import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Download, Pencil, ArrowRightLeft } from 'lucide-react';
import { useI18n } from '../i18n';
import { invoiceService } from '../services/invoiceService';
import { offerteService } from '../services/offerteService';
import { Invoice } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import LanguageSelector from '../components/LanguageSelector';

export default function InvoiceHistoryPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'invoices' | 'offertes'>('invoices');
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
      setInvoices(inv); setOffertes(off);
      setConvertPopup(null);
    } catch {} finally { setConvertLoading(false); }
  };

  return (
    <div className="h-full flex flex-col safe-top">
      <div className="px-6 pt-6 flex items-center gap-3 mb-3 flex-shrink-0">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors"><ArrowLeft size={22} /></button>
        <h1 className="text-lg font-extrabold text-dark flex-1">{t('history.title')}</h1>
        <LanguageSelector />
      </div>

      <div className="px-6 mb-3 flex-shrink-0">
        <div className="flex bg-gray-100 rounded-2xl p-1">
          <button onClick={() => setTab('invoices')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'invoices' ? 'bg-white text-dark shadow-sm' : 'text-gray-400'}`}>
            {t('history.faturalarim')}
          </button>
          <button onClick={() => setTab('offertes')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'offertes' ? 'bg-white text-dark shadow-sm' : 'text-gray-400'}`}>
            {t('history.offertelerim')}
          </button>
        </div>
      </div>

      <div className="page-scroll px-6 pb-4">
        {loading ? <div className="py-10 text-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand mx-auto" /></div> : (
          <>
            {tab === 'invoices' && (
              invoices.length === 0 ? <div className="py-14 text-center text-gray-300 font-medium">{t('history.geen')}</div> : (
                <div className="space-y-2">
                  {invoices.map((inv, i) => (
                    <motion.div key={inv.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.03}}
                      className="flex items-center justify-between py-3.5 px-4 rounded-2xl hover:bg-gray-50 transition-colors border border-gray-100">
                      <div className="flex-1">
                        <p className="font-extrabold text-sm text-dark notranslate">{inv.invoice_number}</p>
                        <p className="text-xs text-gray-400">{inv.client_name} · {formatDate(inv.invoice_date)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right mr-1">
                          <p className="text-sm font-extrabold notranslate">{formatCurrency(inv.total)}</p>
                          <span className={`text-[10px] font-bold ${inv.status==='paid'?'text-success':inv.status==='sent'?'text-blue-500':'text-gray-400'}`}>
                            {inv.status==='paid'?t('history.betaald'):inv.status==='sent'?t('history.verstuurd'):t('history.concept')}
                          </span>
                        </div>
                        <button onClick={async () => { try { await invoiceService.downloadPdf(inv.id); } catch (e) { console.error(e); } }} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400" title={t('common.downloaden')}>
                          <Download size={16} />
                        </button>
                        <button onClick={() => navigate(`/invoices/edit/${inv.id}`)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400" title={t('invoice.bewerken')}>
                          <Pencil size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )
            )}

            {tab === 'offertes' && (
              offertes.length === 0 ? <div className="py-14 text-center text-gray-300 font-medium">{t('history.geen')}</div> : (
                <div className="space-y-2">
                  {offertes.map((off, i) => (
                    <motion.div key={off.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.03}}
                      className="py-3.5 px-4 rounded-2xl hover:bg-gray-50 transition-colors border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-extrabold text-sm text-dark notranslate">{off.offerte_number}</p>
                          <p className="text-xs text-gray-400">{off.client_name} · {formatDate(off.offerte_date)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-extrabold notranslate">{formatCurrency(off.total)}</p>
                          <span className={`text-[10px] font-bold ${off.status==='converted'?'text-success':'text-blue-500'}`}>
                            {off.status === 'converted' ? t('offerte.converted') : t('offerte.open')}
                          </span>
                        </div>
                      </div>
                      {off.status !== 'converted' && (
                        <button onClick={() => setConvertPopup(off)}
                          className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand/10 text-dark text-xs font-bold hover:bg-brand/20 transition-colors">
                          <ArrowRightLeft size={14} /> {t('offerte.convert')}
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {convertPopup && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-6">
            <motion.div initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} className="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl">
              <ArrowRightLeft size={32} className="mx-auto mb-4 text-brand" />
              <p className="text-lg font-extrabold text-dark mb-2">{t('offerte.convertConfirm')}</p>
              <p className="text-sm text-gray-500 mb-1 notranslate">{convertPopup.offerte_number}</p>
              <p className="text-base font-extrabold text-dark mb-6 notranslate">{formatCurrency(convertPopup.total)}</p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setConvertPopup(null)} className="py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold text-base">{t('invoice.nee')}</button>
                <button onClick={() => handleConvert(convertPopup)} disabled={convertLoading}
                  className="py-3 rounded-2xl bg-brand text-dark font-bold text-base disabled:opacity-50">{convertLoading ? '...' : t('invoice.ja')}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
