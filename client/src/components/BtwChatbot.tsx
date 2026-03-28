import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HardHat, Briefcase, Building2, Globe, User, ArrowLeft, Home, Car, Heart, Sparkles } from 'lucide-react';
import { useI18n } from '../i18n';

type MyType = null | 'bouw' | 'garage' | 'zorg' | 'schoonmaak' | 'taxi' | 'financieel' | 'overig';
type Target = null | 'bouw' | 'particulier' | 'ander' | 'buitenland';
type Step = 'myType' | 'target' | 'woningVraag' | 'result';

interface Props { open: boolean; onClose: () => void; onSelect?: (rate: number | 'verlegd') => void; }

export default function BtwChatbot({ open, onClose, onSelect }: Props) {
  const { t } = useI18n();
  const [step, setStep] = useState<Step>('myType');
  const [myType, setMyType] = useState<MyType>(null);
  const [resultRate, setResultRate] = useState<number | 'verlegd' | null>(null);
  const [resultMsg, setResultMsg] = useState('');

  const reset = () => { setStep('myType'); setMyType(null); setResultRate(null); setResultMsg(''); };
  const close = () => { onClose(); reset(); };
  const selectMyType = (tp: MyType) => { setMyType(tp); setStep('target'); };

  const selectTarget = (tg: Target) => {
    if (tg === 'buitenland') {
      if (myType === 'zorg') { setResultRate(0); setResultMsg(t('btw.resultVrijgesteld')); }
      else if (myType === 'taxi') { setResultRate(0); setResultMsg(t('btw.resultVrijgesteld')); }
      else { setResultRate('verlegd'); setResultMsg(t('btw.resultVerlegd')); }
      setStep('result'); return;
    }
    if (myType === 'bouw' && tg === 'bouw') { setResultRate('verlegd'); setResultMsg(t('btw.resultVerlegd')); setStep('result'); return; }
    if (myType === 'bouw' && tg === 'particulier') { setStep('woningVraag'); return; }
    if (myType === 'schoonmaak' && tg === 'bouw') { setResultRate('verlegd'); setResultMsg(t('btw.resultVerlegd')); setStep('result'); return; }
    if (myType === 'zorg') { setResultRate(0); setResultMsg(t('btw.resultVrijgesteld')); setStep('result'); return; }
    if (myType === 'taxi') { setResultRate(9); setResultMsg(t('btw.result9Taxi')); setStep('result'); return; }
    setResultRate(21); setResultMsg(t('btw.result21')); setStep('result');
  };

  const woningAnswer = (ouder: boolean) => {
    if (ouder) { setResultRate(9); setResultMsg(t('btw.result9')); } else { setResultRate(21); setResultMsg(t('btw.result21')); }
    setStep('result');
  };

  const handleSelect = () => { if (onSelect && resultRate !== null) { onSelect(resultRate); close(); } };
  if (!open) return null;

  const types: { key: MyType; label: string; icon: any; color: string }[] = [
    { key: 'bouw', label: t('btw.bouwbedrijf'), icon: HardHat, color: 'bg-orange-50 text-orange-600' },
    { key: 'garage', label: t('btw.garage'), icon: Car, color: 'bg-blue-50 text-blue-600' },
    { key: 'zorg', label: t('btw.zorg'), icon: Heart, color: 'bg-red-50 text-red-500' },
    { key: 'schoonmaak', label: t('btw.schoonmaak'), icon: Sparkles, color: 'bg-cyan-50 text-cyan-600' },
    { key: 'taxi', label: t('btw.taxi'), icon: Car, color: 'bg-green-50 text-green-600' },
    { key: 'financieel', label: t('btw.financieel'), icon: Briefcase, color: 'bg-indigo-50 text-indigo-600' },
    { key: 'overig', label: t('btw.overigBedrijf'), icon: Building2, color: 'bg-gray-100 text-gray-600' },
  ];

  return (
    <AnimatePresence>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center">
        <motion.div initial={{y:'100%'}} animate={{y:0}} exit={{y:'100%'}} transition={{type:'spring',damping:25}}
          className="bg-white w-full max-w-lg rounded-t-3xl safe-bottom max-h-[85vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              {step !== 'myType' && <button onClick={() => { if (step==='target') setStep('myType'); else if (step==='woningVraag') setStep('target'); else if (step==='result') reset(); }} className="p-1 rounded-lg hover:bg-gray-100"><ArrowLeft size={18} /></button>}
              <h2 className="text-lg font-bold">{t('btw.title')}</h2>
            </div>
            <button onClick={close} className="p-2 rounded-xl hover:bg-gray-100"><X size={20} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              {step === 'myType' && (
                <motion.div key="mt" initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-30}} className="space-y-2">
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">{t('btw.uwBedrijf')}</p>
                  {types.map(tp => (
                    <button key={tp.key} onClick={() => selectMyType(tp.key)} className="card-send w-full flex items-center gap-3 p-3.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tp.color}`}><tp.icon size={18} /></div>
                      <p className="font-bold text-dark text-sm">{tp.label}</p>
                    </button>
                  ))}
                </motion.div>
              )}

              {step === 'target' && (
                <motion.div key="tg" initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-30}} className="space-y-3">
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">{t('btw.aanWie')}</p>
                  {myType === 'bouw' && <button onClick={() => selectTarget('bouw')} className="card-send w-full flex items-center gap-4 p-4"><div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center"><HardHat size={20} className="text-orange-600" /></div><p className="font-bold text-dark">{t('btw.aanBouw')}</p></button>}
                  <button onClick={() => selectTarget('particulier')} className="card-send w-full flex items-center gap-4 p-4"><div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center"><User size={20} className="text-purple-600" /></div><p className="font-bold text-dark">{t('btw.aanParticulier')}</p></button>
                  <button onClick={() => selectTarget('ander')} className="card-send w-full flex items-center gap-4 p-4"><div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><Building2 size={20} className="text-blue-600" /></div><p className="font-bold text-dark">{t('btw.aanAnder')}</p></button>
                  <button onClick={() => selectTarget('buitenland')} className="card-send w-full flex items-center gap-4 p-4"><div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center"><Globe size={20} className="text-green-600" /></div><p className="font-bold text-dark">{t('btw.aanBuitenland')}</p></button>
                </motion.div>
              )}

              {step === 'woningVraag' && (
                <motion.div key="wv" initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-30}} className="space-y-4">
                  <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100"><Home size={28} className="text-amber-600 mx-auto mb-3" /><p className="text-center text-lg font-bold text-dark">{t('btw.woningOuder')}</p></div>
                  <div className="grid grid-cols-2 gap-3"><button onClick={() => woningAnswer(true)} className="btn-brand py-4 text-lg font-bold">{t('btw.ja')}</button><button onClick={() => woningAnswer(false)} className="btn-outline py-4 text-lg font-bold">{t('btw.nee')}</button></div>
                </motion.div>
              )}

              {step === 'result' && (
                <motion.div key="res" initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} className="space-y-4">
                  <div className="p-6 bg-gray-50 rounded-2xl text-center">
                    <p className="text-5xl font-black text-dark mb-3">{resultRate === 'verlegd' ? 'Verlegd' : resultRate === 0 ? 'Vrijgesteld' : `${resultRate}%`}</p>
                    <p className="text-sm text-gray-600 font-medium leading-relaxed">{resultMsg}</p>
                  </div>
                  {onSelect && resultRate !== null && <button onClick={handleSelect} className="btn-brand w-full">{t('btw.gebruikTarief')} &rarr;</button>}
                  <button onClick={reset} className="w-full text-center text-sm text-gray-400 font-medium py-2">{t('btw.opnieuw')}</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
