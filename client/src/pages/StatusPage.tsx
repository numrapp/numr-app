import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Search } from 'lucide-react';
import { useI18n } from '../i18n';
import { CATEGORIES } from '../data/mockVideos';
import StatusBar from '../components/layout/StatusBar';
import api from '../services/api';
import { assetUrl } from '../utils/assetUrl';

export default function StatusPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('alle');
  const [search, setSearch] = useState('');
  const [videos, setVideos] = useState<any[]>([]);
  const touchStart = useRef(0);

  useEffect(() => {
    const load = () => api.get('/status/videos').then(res => setVideos(res.data)).catch(() => {});
    load();
    // Re-fetch when the page becomes visible again (e.g. after an upload).
    const onVis = () => { if (document.visibilityState === 'visible') load(); };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', load);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('focus', load);
    };
  }, []);

  let filtered = filter === 'alle' ? videos : videos.filter((v: any) => v.category === filter);
  if (search.trim()) filtered = filtered.filter((v: any) => (v.location || '').toLowerCase().includes(search.toLowerCase()));

  const handleTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - touchStart.current;
    if (diff > 100) navigate('/');
  };

  return (
    <div className="h-full flex flex-col safe-top" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="px-5 pt-5 flex items-center justify-between flex-shrink-0 mb-2">
        <span className="text-lg font-black text-brand notranslate">numr</span>
        <button onClick={() => navigate('/')} className="text-sm font-extrabold text-brand active:opacity-70">{t('nav.mainMenu')}</button>
      </div>

      <div className="px-5 mb-2 flex gap-3 overflow-x-auto no-scrollbar flex-shrink-0">
        {CATEGORIES.map(c => (
          <button key={c.key} onClick={() => setFilter(c.key)}
            className={`px-4 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${filter === c.key ? 'bg-dark text-white shadow-md' : 'bg-gray-100 text-gray-500'}`}>
            {t(c.label)}
          </button>
        ))}
      </div>

      <div className="px-5 mb-3 flex-shrink-0">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t('status.zoekLocatie')} className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand/50 placeholder-gray-400" />
        </div>
      </div>

      <div className="page-scroll px-5 pb-4">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-300 py-14 font-medium">{t('status.geen')}</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((v: any, i: number) => (
              <motion.button key={v.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
                onClick={() => navigate(`/status/video/${v.id}`)}
                className="rounded-2xl overflow-hidden text-left active:scale-[0.97] transition-transform" style={{boxShadow:'0 2px 12px rgba(0,0,0,0.08)'}}>
                <div className="h-44 flex items-center justify-center relative" style={{background: v.video_path ? '#000' : 'linear-gradient(135deg, #374151, #1F2937)'}}>
                  {v.video_path && <video src={assetUrl(v.video_path)} className="absolute inset-0 w-full h-full object-cover" muted playsInline preload="metadata" />}
                  <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center z-10">
                    <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[16px] border-l-white/80 ml-1" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2.5 pt-8 z-10">
                    <p className="text-white text-[11px] font-bold leading-tight">{v.company_name || v.company || ''}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin size={8} className="text-white/50" />
                      <span className="text-white/50 text-[8px]">{v.location || ''}</span>
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <StatusBar />
    </div>
  );
}
