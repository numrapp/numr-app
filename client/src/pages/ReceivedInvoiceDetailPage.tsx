import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, CheckCircle } from 'lucide-react';
import { useI18n } from '../i18n';
import { mockReceivedInvoices, ReceivedInvoice } from '../data/mockReceivedInvoices';
import { formatCurrency, formatDate } from '../utils/formatters';

const BANKS = [
  { name: 'ING', color: '#FF6200', bg: '#FFF3E0' },
  { name: 'ABN AMRO', color: '#004C2D', bg: '#E8F5E9' },
  { name: 'Rabobank', color: '#003082', bg: '#E3F2FD' },
  { name: 'SNS', color: '#E4002B', bg: '#FCE4EC' },
  { name: 'ASN Bank', color: '#00A651', bg: '#E8F5E9' },
  { name: 'Bunq', color: '#00C853', bg: '#E0F7FA' },
  { name: 'Revolut', color: '#0075EB', bg: '#E3F2FD' },
];

function InvoicePdfView({ invoice }: { invoice: ReceivedInvoice }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm text-[11px]" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
      <div className="px-5 pt-5 pb-3 flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10" dangerouslySetInnerHTML={{ __html: invoice.senderLogoSvg }} />
          <div>
            <p className="font-bold text-dark text-sm">{invoice.sender}</p>
            <p className="text-[10px] text-gray-400">Factuur</p>
          </div>
        </div>
        <div className="text-right text-[10px] text-gray-500">
          <p>Nr: <span className="font-semibold text-dark">{invoice.invoiceNumber}</span></p>
          <p>Datum: {formatDate(invoice.invoiceDate)}</p>
          <p>Vervaldatum: {formatDate(invoice.dueDate)}</p>
        </div>
      </div>

      <div className="border-t border-gray-200 mx-5" />

      <div className="px-5 py-3">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Omschrijving</p>
        <p className="text-xs text-gray-700">{invoice.description}</p>
      </div>

      <div className="mx-5">
        <table className="w-full text-[10px]">
          <thead>
            <tr className="border-y border-gray-200">
              <th className="text-left py-1.5 font-semibold text-gray-500">Item</th>
              <th className="text-right py-1.5 font-semibold text-gray-500 w-12">Aantal</th>
              <th className="text-right py-1.5 font-semibold text-gray-500 w-16">Prijs</th>
              <th className="text-right py-1.5 font-semibold text-gray-500 w-10">BTW</th>
              <th className="text-right py-1.5 font-semibold text-gray-500 w-16">Bedrag</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => {
              const lineTotal = item.quantity * item.unitPrice * (1 + item.btwRate / 100);
              return (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-1.5">{item.description}</td>
                  <td className="py-1.5 text-right">{item.quantity}</td>
                  <td className="py-1.5 text-right notranslate">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-1.5 text-right">{item.btwRate}%</td>
                  <td className="py-1.5 text-right notranslate">{formatCurrency(lineTotal)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-3 flex justify-end">
        <div className="w-44 text-[10px] space-y-0.5">
          <div className="flex justify-between text-gray-500"><span>Subtotaal:</span><span className="text-gray-900 notranslate">{formatCurrency(invoice.subtotal)}</span></div>
          <div className="flex justify-between text-gray-500"><span>BTW:</span><span className="text-gray-900 notranslate">{formatCurrency(invoice.btwAmount)}</span></div>
          <div className="flex justify-between font-bold text-dark text-[11px] border-t border-gray-300 pt-1 mt-1">
            <span>Totaal:</span><span className="notranslate">{formatCurrency(invoice.total)}</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-b-xl px-5 py-1.5 text-[8px] text-gray-400 text-center border-t border-gray-100">
        {invoice.sender} | {invoice.invoiceNumber}
      </div>
    </div>
  );
}

export default function ReceivedInvoiceDetailPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { id } = useParams();
  const [invoice, setInvoice] = useState<ReceivedInvoice | undefined>(
    mockReceivedInvoices.find(inv => inv.id === Number(id))
  );
  const [showBankSelect, setShowBankSelect] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!invoice) return <div className="min-h-screen bg-white flex items-center justify-center text-gray-400">Factuur niet gevonden</div>;

  const handlePay = () => {
    setShowBankSelect(false);
    setShowSuccess(true);
    setInvoice({ ...invoice, status: 'paid' });
    setTimeout(() => setShowSuccess(false), 2500);
  };

  return (
    <div className="min-h-screen bg-white safe-top pb-8">
      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center">
            <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',stiffness:200,delay:0.2}}
              className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center mb-6 shadow-lg shadow-green-500/30">
              <CheckCircle size={48} className="text-white" />
            </motion.div>
            <motion.h1 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.6}}
              className="text-2xl font-extrabold text-dark">{t('received.betaaldSuccess')}</motion.h1>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-6 pt-6 flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/received')} className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors"><ArrowLeft size={22} /></button>
        <h1 className="text-lg font-bold text-dark flex-1">{invoice.sender}</h1>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${invoice.status === 'paid' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
          {invoice.status === 'paid' ? t('received.betaald') : t('received.nietBetaald')}
        </span>
      </div>

      <div className="px-4">
        <InvoicePdfView invoice={invoice} />
      </div>

      {invoice.status === 'unpaid' && (
        <div className="px-6 mt-6">
          <button onClick={() => setShowBankSelect(true)} className="btn-brand w-full">
            {t('received.betalen')} — {formatCurrency(invoice.total)}
          </button>
        </div>
      )}

      <AnimatePresence>
        {showBankSelect && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center">
            <motion.div initial={{y:'100%'}} animate={{y:0}} exit={{y:'100%'}} transition={{type:'spring',damping:25}}
              className="bg-white w-full max-w-lg rounded-t-3xl safe-bottom max-h-[80vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-dark">{t('received.selecteerBank')}</h2>
                <button onClick={() => setShowBankSelect(false)} className="p-2 rounded-xl hover:bg-gray-100"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-2">
                {BANKS.map(bank => (
                  <button key={bank.name} onClick={handlePay}
                    className="card-send w-full flex items-center gap-4 p-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs"
                      style={{ backgroundColor: bank.bg, color: bank.color }}>
                      {bank.name.charAt(0)}
                    </div>
                    <p className="font-bold text-dark">{bank.name}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
