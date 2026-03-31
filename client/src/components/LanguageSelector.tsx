import { useState } from 'react';
import { Globe } from 'lucide-react';
import { useI18n } from '../i18n';
import { AnimatePresence, motion } from 'framer-motion';

const LANGS: { code: string; flag: string; short: string }[] = [
  { code: 'nl', flag: '\u{1F1F3}\u{1F1F1}', short: 'NL' },
  { code: 'tr', flag: '\u{1F1F9}\u{1F1F7}', short: 'TR' },
  { code: 'en', flag: '\u{1F1EC}\u{1F1E7}', short: 'EN' },
  { code: 'fr', flag: '\u{1F1EB}\u{1F1F7}', short: 'FR' },
  { code: 'es', flag: '\u{1F1EA}\u{1F1F8}', short: 'ES' },
  { code: 'ar', flag: '\u{1F1F8}\u{1F1E6}', short: 'AR' },
  { code: 'bg', flag: '\u{1F1E7}\u{1F1EC}', short: 'BG' },
  { code: 'pl', flag: '\u{1F1F5}\u{1F1F1}', short: 'PL' },
];

export default function LanguageSelector({ dark }: { dark?: boolean }) {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const current = LANGS.find(l => l.code === lang) || LANGS[0];

  return (
    <div className="relative notranslate">
      <button onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl transition-all ${dark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
        <Globe size={16} className={dark ? 'text-white/60' : 'text-gray-400'} />
        <span className="text-sm">{current.flag}</span>
        <span className={`text-[9px] font-bold ${dark ? 'text-white/50' : 'text-gray-400'}`}>{current.short}</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div initial={{opacity:0,y:-5,scale:0.95}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-5,scale:0.95}}
              className="absolute right-0 top-full mt-1 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden" style={{minWidth:140}}>
              <div className="max-h-64 overflow-y-auto py-1">
                {LANGS.map(l => (
                  <button key={l.code} onClick={() => { setLang(l.code); setOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 transition-colors ${lang === l.code ? 'bg-brand/10' : 'hover:bg-gray-50'}`}>
                    <span className="text-lg">{l.flag}</span>
                    <span className={`text-xs font-bold ${lang === l.code ? 'text-dark' : 'text-gray-500'}`}>{l.short}</span>
                    {lang === l.code && <div className="ml-auto w-2 h-2 rounded-full bg-brand" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
