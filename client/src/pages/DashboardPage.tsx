import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Bell, FileText, RotateCcw, TrendingUp } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../i18n';
import { invoiceService } from '../services/invoiceService';
import { Invoice } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function DashboardPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const subType = (user as any)?.subscription_type || '';
  const subEnd = (user as any)?.subscription_end || '';
  const isTrialExpired = subType === 'trial' && subEnd && new Date(subEnd) < new Date();
  const hasSub = !!subType && !isTrialExpired;

  useEffect(() => {
    invoiceService.getAll().then(setInvoices).catch(() => {});
  }, []);

  const monthlyTotal = invoices.reduce((s, inv) => s + (inv.total || 0), 0);
  const recent = invoices.slice(0, 5);

  const go = (path: string) => {
    if (!hasSub) { navigate('/subscription'); return; }
    navigate(path);
  };

  const splitEuro = (val: number) => {
    const str = formatCurrency(val);
    const parts = str.split(',');
    return { whole: parts[0] || '\u20AC0', cents: ',' + (parts[1] || '00') };
  };
  const split = splitEuro(monthlyTotal);

  return (
    <div className="h-full flex flex-col safe-top" style={{ background: '#F4F5F7' }}>
      <div className="page-scroll">
        <div className="flex items-center justify-between px-[22px] pt-3 pb-2">
          <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center" style={{ border: '1px solid #EEF0F3' }}>
            <Search size={16} className="text-dark" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-[22px] h-[22px] rounded-full bg-brand flex items-center justify-center">
              <span className="font-display text-[11px] text-dark">n</span>
            </div>
            <span className="text-[15px] font-bold text-dark">numr</span>
          </div>
          <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center" style={{ border: '1px solid #EEF0F3' }}>
            <Bell size={16} className="text-dark" />
          </button>
        </div>

        <div className="text-center py-5 px-6">
          <p className="text-[13px] font-medium text-v3-mute mb-2">Omzet deze maand</p>
          <div className="flex items-baseline justify-center">
            <span className="font-display text-[48px] tracking-[-2px] text-dark leading-none">{split.whole}</span>
            <span className="font-display text-[26px] text-v3-dim">{split.cents}</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <span className="font-mono text-[11px] font-bold text-v3-green px-2 py-0.5 rounded-[6px]" style={{ background: 'rgba(66,194,129,0.12)' }}>+12,4%</span>
            <span className="text-[13px] font-medium text-v3-text2">vs vorige maand</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-[10px] px-[22px] mb-5">
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => go('/offerte/new')}
            className="bg-white rounded-v3 flex flex-col items-center gap-2 py-4 px-2" style={{ boxShadow: '0 2px 8px rgba(14,17,22,0.04)' }}>
            <div className="w-10 h-10 rounded-full bg-v3-purple flex items-center justify-center">
              <FileText size={17} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[13px] font-bold text-dark">Offerte</span>
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => go('/invoices/new')}
            className="rounded-v3 flex flex-col items-center gap-2 py-4 px-2" style={{ background: '#D4FF3A', boxShadow: '0 2px 8px rgba(14,17,22,0.04)' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(14,17,22,0.08)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0E1116" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </div>
            <span className="text-[13px] font-bold text-dark">Factuur</span>
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => go('/credit/new')}
            className="bg-white rounded-v3 flex flex-col items-center gap-2 py-4 px-2" style={{ boxShadow: '0 2px 8px rgba(14,17,22,0.04)' }}>
            <div className="w-10 h-10 rounded-full bg-v3-orange flex items-center justify-center">
              <RotateCcw size={17} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[13px] font-bold text-dark">Credit</span>
          </motion.button>
        </div>

        <div className="bg-white rounded-t-[28px] min-h-[350px] px-5 pb-32" style={{ boxShadow: '0 -2px 12px rgba(14,17,22,0.04)' }}>
          <div className="w-10 h-1 rounded-full mx-auto mt-4 mb-4" style={{ background: '#E2E5EA' }} />
          <div className="flex gap-5 justify-center mb-4">
            <span className="text-[14px] font-bold text-dark relative pb-1.5" style={{ borderBottom: '2px solid #0E1116' }}>Recent</span>
            <span className="text-[14px] font-bold text-v3-mute">Openstaand</span>
          </div>

          {recent.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-v3-dim">
              <p className="text-[13px] font-medium text-v3-mute mt-3">Nog geen documenten</p>
            </div>
          ) : (
            <div>
              {recent.map((inv) => {
                const initial = (inv.client_name || 'N')[0].toUpperCase();
                const isPaid = inv.status === 'paid';
                const isSent = inv.status === 'sent';
                const statusColor = isPaid ? '#42C281' : isSent ? '#7B5CFF' : '#8A8F99';
                const statusText = isPaid ? 'BETAALD' : isSent ? 'VERZONDEN' : 'CONCEPT';
                return (
                  <div key={inv.id} className="flex items-center gap-3 py-3.5" style={{ borderBottom: '1px solid #EEF0F3' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[13px] font-display flex-shrink-0" style={{ background: isPaid ? '#3B5998' : '#E94E77' }}>
                      {initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-bold text-dark truncate">{inv.client_name || 'Klant'}</p>
                      <p className="font-mono text-[11px] text-v3-mute">{inv.invoice_number} · {formatDate(inv.invoice_date)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[15px] font-bold text-dark">{formatCurrency(inv.total)}</p>
                      <p className="font-mono text-[10px] font-bold tracking-[0.06em]" style={{ color: statusColor }}>{statusText}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
