import { motion } from 'framer-motion';
import { Check, FileText, MessageCircle } from 'lucide-react';

interface Props {
  message: string;
  docNumber?: string;
  docTotal?: string;
  customerName?: string;
  onWhatsApp?: () => void;
  onEmail?: () => void;
  onPdf?: () => void;
  onDone?: () => void;
}

export default function SuccessAnimation({ message, docNumber, docTotal, customerName, onWhatsApp, onEmail, onPdf, onDone }: Props) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex flex-col" style={{ background: '#F4F5F7' }}>
      {/* Top chip - S VERZONDEN! */}
      <div className="flex items-center justify-center gap-2.5 pt-14 pb-2">
        <div className="w-7 h-7 rounded-lg bg-dark flex items-center justify-center">
          <span className="font-display text-[14px] text-white">S</span>
        </div>
        <span className="font-mono text-[11px] font-bold tracking-[0.25em] text-dark">VERZONDEN!</span>
        <span className="text-[14px]">🎉</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* 3D lime orb with checkmark */}
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
          className="w-[200px] h-[200px] rounded-full flex items-center justify-center mb-8"
          style={{ background: 'radial-gradient(circle at 32% 32%, #F0FF9E, #D4FF3A 45%, #A8D000)', boxShadow: '0 30px 60px rgba(212,255,58,0.35)' }}>
          <Check size={85} className="text-dark" strokeWidth={3} />
        </motion.div>

        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="text-center mb-4">
          <h1 className="font-display text-[34px] tracking-[-1.2px] text-dark">{message.split(' ')[0] || 'Factuur'}</h1>
          <h1 className="font-display text-[34px] tracking-[-1.2px]" style={{ color: '#7A9900' }}>{message.split(' ').slice(1).join(' ') || 'verstuurd!'}</h1>
        </motion.div>

        {customerName && (
          <p className="text-[14px] font-medium text-v3-text2 text-center px-10 mb-4">
            {customerName} heeft hem per e-mail ontvangen.
          </p>
        )}

        {/* Doc chip */}
        {docNumber && (
          <div className="flex items-center gap-2.5 px-5 py-3 bg-white rounded-full mb-6" style={{ border: '1px solid #EEF0F3' }}>
            <div className="w-2 h-2 rounded-full bg-v3-green" />
            <span className="font-mono text-[13px] font-semibold text-dark">{docNumber}{docTotal ? ` \u00b7 ${docTotal}` : ''}</span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="px-[22px] pb-8 space-y-2.5">
        {onWhatsApp && (
          <button onClick={onWhatsApp} className="w-full h-14 rounded-full flex items-center justify-center gap-2.5 text-white font-bold text-[15px]"
            style={{ background: '#25D366', boxShadow: '0 10px 24px rgba(37,211,102,0.4)' }}>
            <MessageCircle size={18} /> Sturen via WhatsApp
          </button>
        )}
        {onEmail && (
          <button onClick={onEmail} className="btn-lime w-full">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            Sturen via E-mail
          </button>
        )}
        <div className="flex gap-2.5">
          {onPdf && (
            <button onClick={onPdf} className="flex-1 h-14 rounded-full flex items-center justify-center gap-2 bg-white text-dark font-semibold text-[15px]"
              style={{ border: '1px solid #EEF0F3' }}>
              <FileText size={16} /> PDF
            </button>
          )}
          {onDone && (
            <button onClick={onDone} className="flex-1 h-14 rounded-full flex items-center justify-center gap-2 bg-dark text-white font-bold text-[15px]">
              Klaar <Check size={16} />
            </button>
          )}
          {!onPdf && !onDone && (
            <div className="w-full h-14 rounded-full flex items-center justify-center gap-2 bg-dark text-white font-bold text-[15px]">
              <Check size={16} /> {message}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
