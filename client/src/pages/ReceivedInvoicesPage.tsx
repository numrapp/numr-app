import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useI18n } from '../i18n';
import { mockReceivedInvoices } from '../data/mockReceivedInvoices';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function ReceivedInvoicesPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [invoices] = useState(mockReceivedInvoices);

  return (
    <div className="h-full flex flex-col safe-top">
      <div className="px-6 pt-6 flex items-center gap-3 mb-4 flex-shrink-0">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors"><ArrowLeft size={22} /></button>
        <h1 className="text-lg font-extrabold text-dark flex-1">{t('received.title')}</h1>
      </div>

      <div className="page-scroll px-6 pb-4">
        {invoices.length === 0 ? (
          <div className="py-14 text-center text-gray-300 font-medium">{t('received.geen')}</div>
        ) : (
          <div className="space-y-3">
            {invoices.map((inv, i) => (
              <motion.button key={inv.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
                onClick={() => navigate(`/received/${inv.id}`)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 active:scale-[0.98]"
                style={{
                  background: inv.status === 'paid' ? 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)' : 'linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 100%)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                  border: '1px solid',
                  borderColor: inv.status === 'paid' ? '#BBF7D0' : '#FDE68A',
                }}>
                <div className={`w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center ${inv.status === 'paid' ? 'bg-green-500' : 'bg-red-500'}`}>
                  <span className="text-white text-[10px] font-bold">{inv.sender.substring(0, 3).toUpperCase()}</span>
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-extrabold text-sm text-dark">{inv.sender}</p>
                  <p className="text-[11px] text-gray-500 font-medium">{inv.invoiceNumber} · {formatDate(inv.invoiceDate)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-base font-extrabold text-dark notranslate">{formatCurrency(inv.total)}</p>
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    {inv.status === 'paid' ? (
                      <><CheckCircle size={12} className="text-green-500" /><span className="text-[10px] font-bold text-green-600">{t('received.betaald')}</span></>
                    ) : (
                      <><AlertCircle size={12} className="text-amber-500" /><span className="text-[10px] font-bold text-amber-600">{t('received.nietBetaald')}</span></>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
