import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const slogans = [
  { flag: '\u{1F1F3}\u{1F1F1}', text: 'Verstuur eenvoudig facturen', lang: 'NL' },
  { flag: '\u{1F1F9}\u{1F1F7}', text: 'Kolayca fatura g\u00f6nderin', lang: 'TR' },
  { flag: '\u{1F1EC}\u{1F1E7}', text: 'Send invoices easily', lang: 'EN' },
  { flag: '\u{1F1EB}\u{1F1F7}', text: 'Envoyez des factures facilement', lang: 'FR' },
  { flag: '\u{1F1EA}\u{1F1F8}', text: 'Env\u00eda facturas f\u00e1cilmente', lang: 'ES' },
  { flag: '\u{1F1F8}\u{1F1E6}', text: '\u0623\u0631\u0633\u0644 \u0627\u0644\u0641\u0648\u0627\u062a\u064a\u0631 \u0628\u0633\u0647\u0648\u0644\u0629', lang: 'AR' },
  { flag: '\u{1F1E7}\u{1F1EC}', text: '\u0418\u0437\u043f\u0440\u0430\u0449\u0430\u0439\u0442\u0435 \u0444\u0430\u043a\u0442\u0443\u0440\u0438 \u043b\u0435\u0441\u043d\u043e', lang: 'BG' },
  { flag: '\u{1F1F5}\u{1F1F1}', text: 'Wysy\u0142aj faktury \u0142atwo', lang: 'PL' },
];

export default function TeaserPage() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => {
        if (prev >= slogans.length - 1) { setDone(true); return prev; }
        return prev + 1;
      });
    }, 1250);
    return () => clearInterval(interval);
  }, []);

  const handleClose = () => {
    sessionStorage.setItem('teaserShown', 'true');
    navigate('/login');
  };

  return (
    <div className="h-full flex flex-col items-center justify-center relative overflow-hidden" style={{ background: '#000' }}>
      <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 50% 40%, #DFFF00 0%, transparent 60%)' }} />

      {done && (
        <motion.button initial={{opacity:0}} animate={{opacity:1}} onClick={handleClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center z-10">
          <X size={20} className="text-white" />
        </motion.button>
      )}

      <div className="relative z-10 flex flex-col items-center">
        <motion.div initial={{scale:0.5,opacity:0}} animate={{scale:1,opacity:1}} transition={{duration:0.6}}
          className="w-28 h-28 rounded-3xl bg-brand flex items-center justify-center mb-8 shadow-2xl shadow-brand/40">
          <span className="text-5xl font-black text-dark notranslate">n</span>
        </motion.div>

        <motion.h1 initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.3}}
          className="text-4xl font-black text-white mb-12 notranslate">numr</motion.h1>

        <div className="h-24 flex flex-col items-center justify-center w-full px-8">
          <AnimatePresence mode="wait">
            <motion.div key={current} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}} transition={{duration:0.4}}
              className="flex flex-col items-center gap-3">
              <span className="text-4xl">{slogans[current].flag}</span>
              <p className="text-lg font-bold text-white text-center leading-snug">{slogans[current].text}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex gap-1.5 mt-10">
          {slogans.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === current ? 'w-5 bg-brand' : 'w-1.5 bg-white/30'}`} />
          ))}
        </div>
      </div>

      <div className="absolute bottom-10 w-full px-8 safe-bottom">
        <button onClick={handleClose} className="w-full py-3 text-center text-sm font-bold text-white/50 active:text-white transition-colors">
          Overslaan
        </button>
      </div>
    </div>
  );
}
