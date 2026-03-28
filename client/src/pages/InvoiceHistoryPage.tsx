import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Download, Search, Pencil } from 'lucide-react';
import { useI18n } from '../i18n';
import { invoiceService } from '../services/invoiceService';
import { Invoice } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import LanguageSelector from '../components/LanguageSelector';

export default function InvoiceHistoryPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showEdit, setShowEdit] = useState<Invoice | null>(null);

  useEffect(() => { invoiceService.getAll().then(setInvoices).finally(() => setLoading(false)); }, []);
  const filtered = invoices.filter(inv => inv.invoice_number.toLowerCase().includes(search.toLowerCase()) || (inv.client_name||'').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="h-full flex flex-col safe-top">
      <div className="px-6 pt-6 flex items-center gap-3 mb-4 flex-shrink-0">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors"><ArrowLeft size={22} /></button>
        <h1 className="text-lg font-extrabold text-dark flex-1">{t('history.mijnFacturen')}</h1>
        <LanguageSelector />
      </div>
      <div className="px-6 mb-4 flex-shrink-0">
        <div className="relative"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('history.zoeken')} className="input-send pl-11" /></div>
      </div>
      <div className="page-scroll px-6 pb-4">
        {loading ? <div className="py-10 text-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand mx-auto" /></div> :
          filtered.length === 0 ? <div className="py-14 text-center text-gray-300 font-medium">{t('history.geen')}</div> : (
            <div className="space-y-2">
              {filtered.map((inv, i) => (
                <motion.div key={inv.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.03}}
                  className="flex items-center justify-between py-3.5 px-4 rounded-2xl hover:bg-gray-50 transition-colors border border-gray-100">
                  <button onClick={() => setShowEdit(inv)} className="flex-1 text-left">
                    <p className="font-extrabold text-sm text-dark notranslate">{inv.invoice_number}</p>
                    <p className="text-xs text-gray-400">{inv.client_name} · {formatDate(inv.invoice_date)}</p>
                  </button>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm font-extrabold notranslate">{formatCurrency(inv.total)}</p>
                      <span className={`text-[10px] font-bold ${inv.status==='paid'?'text-success':inv.status==='sent'?'text-blue-500':'text-gray-400'}`}>
                        {inv.status==='paid'?t('history.betaald'):inv.status==='sent'?t('history.verstuurd'):t('history.concept')}
                      </span>
                    </div>
                    <button onClick={async()=>{try{await invoiceService.downloadPdf(inv.id)}catch{}}} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"><Download size={16} /></button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
      </div>

      <AnimatePresence>
        {showEdit && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-6">
            <motion.div initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} className="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl">
              <Pencil size={32} className="mx-auto mb-4 text-blue-500" />
              <p className="text-lg font-extrabold text-dark mb-2">{t('history.wijzigenVraag')}</p>
              <p className="text-sm text-gray-500 mb-1 notranslate">{showEdit.invoice_number}</p>
              <p className="text-base font-extrabold text-dark mb-6 notranslate">{formatCurrency(showEdit.total)}</p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setShowEdit(null)}
                  className="py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold text-base">{t('invoice.nee')}</button>
                <button onClick={() => { const id = showEdit.id; setShowEdit(null); navigate(`/invoices/edit/${id}`); }}
                  className="py-3 rounded-2xl bg-blue-500 text-white font-bold text-base">{t('invoice.ja')}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
