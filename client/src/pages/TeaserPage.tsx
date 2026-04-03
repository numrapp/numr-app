import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Globe, FileText, Shield } from 'lucide-react';

const slides = [
  { icon: Zap, color: '#DFFF00', title: 'Snel & Eenvoudig', desc: 'Maak professionele facturen in minder dan 30 seconden' },
  { icon: Globe, color: '#93C5FD', title: '8 Talen', desc: 'Factureer in het Nederlands, Turks, Engels en meer' },
  { icon: FileText, color: '#86EFAC', title: 'Offerte & Factuur', desc: 'Maak offertes en zet ze om naar facturen met een klik' },
  { icon: Shield, color: '#FDE68A', title: 'Veilig & Betrouwbaar', desc: 'Uw gegevens zijn veilig met SSL-encryptie' },
];

export default function TeaserPage() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    localStorage.setItem('teaserSeen', 'true');
    const interval = setInterval(() => {
      setCurrent(prev => {
        if (prev >= slides.length - 1) { setDone(true); return prev; }
        return prev + 1;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleClose = () => navigate('/login');

  return (
    <div className="h-full flex flex-col items-center justify-center bg-white safe-top relative">
      {done && (
        <button onClick={handleClose} className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center z-10">
          <X size={20} className="text-gray-600" />
        </button>
      )}

      <div className="flex-1 flex flex-col items-center justify-center px-8 w-full max-w-sm">
        <motion.div initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}} className="mb-10">
          <div className="w-24 h-24 rounded-3xl bg-brand flex items-center justify-center mx-auto shadow-xl shadow-brand/30">
            <span className="text-4xl font-black text-dark">n</span>
          </div>
          <h1 className="text-3xl font-black text-dark text-center mt-5 notranslate">numr</h1>
        </motion.div>

        <div className="w-full h-40 relative">
          <AnimatePresence mode="wait">
            <motion.div key={current} initial={{opacity:0,x:40}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-40}} transition={{duration:0.4}}
              className="absolute inset-0 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{background: slides[current].color + '30'}}>
                {(() => { const Icon = slides[current].icon; return <Icon size={30} style={{color: slides[current].color === '#DFFF00' ? '#1A1A1A' : slides[current].color}} />; })()}
              </div>
              <p className="text-lg font-extrabold text-dark mb-2">{slides[current].title}</p>
              <p className="text-sm text-gray-500">{slides[current].desc}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex gap-2 mt-8">
          {slides.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-6 bg-brand' : 'w-1.5 bg-gray-200'}`} />
          ))}
        </div>
      </div>

      <div className="px-6 pb-8 w-full max-w-sm safe-bottom">
        <button onClick={handleClose} className="w-full py-2 text-center text-sm font-bold text-gray-400">
          Overslaan
        </button>
      </div>
    </div>
  );
}
