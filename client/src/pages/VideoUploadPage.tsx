import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, X } from 'lucide-react';
import { useI18n } from '../i18n';
import { CATEGORIES } from '../data/mockVideos';
import StatusBar from '../components/layout/StatusBar';

export default function VideoUploadPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const alreadyGranted = !!localStorage.getItem('videoPermGranted');
  const [showPermission, setShowPermission] = useState(!alreadyGranted);
  const [showContactPermission, setShowContactPermission] = useState(false);
  const [granted, setGranted] = useState(alreadyGranted);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploaded, setUploaded] = useState(false);

  const handleGrant = () => {
    localStorage.setItem('videoPermGranted', 'true');
    setGranted(true);
  };

  const handleUpload = () => {
    setUploaded(true);
    setTimeout(() => navigate('/status'), 2000);
  };

  return (
    <div className="h-full flex flex-col safe-top">
      <AnimatePresence>
        {showPermission && !granted && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-6">
            <motion.div initial={{scale:0.9}} animate={{scale:1}} className="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl">
              <Camera size={40} className="mx-auto mb-4 text-brand" />
              <p className="text-lg font-extrabold text-dark mb-2">{t('status.toegangGalerij')}</p>
              <p className="text-sm text-gray-500 mb-6">{t('status.toegangBeschrijving')}</p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => { setShowPermission(false); navigate('/status'); }}
                  className="py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold">{t('status.weigeren')}</button>
                <button onClick={() => { setShowPermission(false); setShowContactPermission(true); }}
                  className="py-3 rounded-2xl bg-brand text-dark font-bold">{t('status.toestaan')}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showContactPermission && !granted && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-6">
            <motion.div initial={{scale:0.9}} animate={{scale:1}} className="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl">
              <svg className="mx-auto mb-4 w-10 h-10 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <p className="text-lg font-extrabold text-dark mb-2">{t('status.toegangContacten')}</p>
              <p className="text-sm text-gray-500 mb-6">{t('status.toegangContactenBeschrijving')}</p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => { setShowContactPermission(false); handleGrant(); }}
                  className="py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold">{t('status.weigeren')}</button>
                <button onClick={() => { setShowContactPermission(false); handleGrant(); }}
                  className="py-3 rounded-2xl bg-brand text-dark font-bold">{t('status.toestaan')}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {uploaded ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',stiffness:200}}
            className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </motion.div>
          <p className="text-xl font-extrabold text-dark">{t('status.geupload')}</p>
        </div>
      ) : (
        <>
          <div className="px-5 pt-5 flex items-center gap-3 mb-4 flex-shrink-0">
            <span className="text-lg font-black text-brand notranslate">numr</span>
            <h1 className="text-lg font-extrabold text-dark flex-1">{t('status.upload')}</h1>
          </div>

          <div className="page-scroll px-5 pb-6">
            <div className="space-y-4">
              <div>
                <label className="label-send">{t('status.categorie')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.filter(c => c.key !== 'alle').map(c => (
                    <button key={c.key} onClick={() => setCategory(c.key)}
                      className={`py-3 rounded-xl text-xs font-bold transition-all ${category === c.key ? 'bg-dark text-white' : 'bg-gray-50 text-gray-500'}`}>
                      {t(c.label)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label-send">Video</label>
                {file ? (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                    <div className="w-16 h-16 bg-brand/20 rounded-xl flex items-center justify-center"><Upload size={20} className="text-brand" /></div>
                    <div className="flex-1"><p className="text-sm font-bold text-dark truncate">{file.name}</p><p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(1)} MB</p></div>
                    <button onClick={() => setFile(null)} className="p-1"><X size={16} className="text-gray-400" /></button>
                  </div>
                ) : (
                  <label className="block w-full p-8 border-2 border-dashed border-gray-200 rounded-2xl text-center cursor-pointer hover:border-brand transition-colors">
                    <Upload size={28} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-sm font-bold text-gray-400">{t('status.selecteerVideo')}</p>
                    <input type="file" accept="video/*" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
                  </label>
                )}
              </div>

              <div>
                <label className="label-send">{t('status.beschrijving')}</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className="input-send resize-none" rows={3}
                  placeholder={t('status.beschrijvingPh')} />
              </div>

              <button onClick={handleUpload} disabled={!category || !file}
                className="btn-brand w-full flex items-center justify-center gap-2">
                <Upload size={18} /> {t('status.uploaden')}
              </button>
            </div>
          </div>
        </>
      )}

      <StatusBar />
    </div>
  );
}
