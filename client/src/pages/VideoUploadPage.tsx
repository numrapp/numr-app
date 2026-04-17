import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, X, AlertTriangle } from 'lucide-react';
import { useI18n } from '../i18n';
import { CATEGORIES } from '../data/mockVideos';
import StatusBar from '../components/layout/StatusBar';
import api from '../services/api';

const MAX_FILE_SIZE = 100 * 1024 * 1024;

export default function VideoUploadPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const alreadyGranted = !!localStorage.getItem('videoPermGranted');
  const [showPermission, setShowPermission] = useState(!alreadyGranted);
  const [granted, setGranted] = useState(alreadyGranted);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState('');

  const handleGrant = () => { localStorage.setItem('videoPermGranted', 'true'); setGranted(true); };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setError('');
      const selected = e.target.files?.[0];
      e.target.value = '';
      if (!selected) return;
      if (selected.size > MAX_FILE_SIZE) { setError(t('status.fileTooLarge')); return; }
      setFile(selected);
    } catch { setError(t('status.fileError')); }
  };

  const handleUpload = async () => {
    if (!file || !category) return;
    setUploading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('video', file);
      fd.append('category', category);
      fd.append('description', description);
      fd.append('location', location);
      await api.post('/status/videos', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUploaded(true);
      setTimeout(() => navigate('/status'), 2000);
    } catch { setError(t('status.fileError')); }
    finally { setUploading(false); }
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
              <button onClick={() => { setShowPermission(false); handleGrant(); }}
                className="w-full py-3 rounded-2xl bg-brand text-dark font-bold">{t('common.volgende')}</button>
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
          <div className="px-5 pt-5 flex items-center justify-between mb-4 flex-shrink-0">
            <span className="text-lg font-black text-brand notranslate">numr</span>
            <button onClick={() => navigate('/')} className="text-sm font-extrabold text-brand active:opacity-70">{t('nav.mainMenu')}</button>
          </div>
          <div className="page-scroll px-5 pb-6">
            <div className="space-y-4">
              <h1 className="text-lg font-extrabold text-dark">{t('status.upload')}</h1>
              {error && <div className="flex items-center gap-2 p-3 bg-red-50 rounded-2xl"><AlertTriangle size={16} className="text-red-500 flex-shrink-0" /><p className="text-sm text-red-600 font-medium">{error}</p></div>}
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
                <label className="label-send">Video (max 100MB)</label>
                {file ? (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                    <div className="w-16 h-16 bg-brand/20 rounded-xl flex items-center justify-center"><Upload size={20} className="text-brand" /></div>
                    <div className="flex-1 min-w-0"><p className="text-sm font-bold text-dark truncate">{file.name}</p><p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(1)} MB</p></div>
                    <button onClick={() => setFile(null)} className="p-1 flex-shrink-0"><X size={16} className="text-gray-400" /></button>
                  </div>
                ) : (
                  <label className="block w-full p-8 border-2 border-dashed border-gray-200 rounded-2xl text-center cursor-pointer hover:border-brand transition-colors">
                    <Upload size={28} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-sm font-bold text-gray-400">{t('status.selecteerVideo')}</p>
                    <input type="file" accept="video/mp4,video/quicktime" className="hidden" onChange={handleFileSelect} />
                  </label>
                )}
              </div>
              <div>
                <label className="label-send">{t('status.zoekLocatie')}</label>
                <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="input-send" placeholder="Amsterdam" />
              </div>
              <div>
                <label className="label-send">{t('status.beschrijving')}</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className="input-send resize-none" rows={2} placeholder={t('status.beschrijvingPh')} />
              </div>
              <button onClick={handleUpload} disabled={!category || !file || uploading}
                className="btn-brand w-full flex items-center justify-center gap-2 disabled:opacity-50">
                <Upload size={18} /> {uploading ? '...' : t('status.uploaden')}
              </button>
            </div>
          </div>
        </>
      )}
      <StatusBar />
    </div>
  );
}
