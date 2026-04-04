import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, MessageCircle, User, MapPin, Search, Home } from 'lucide-react';
import { useI18n } from '../i18n';
import { mockVideos, CATEGORIES } from '../data/mockVideos';

export default function StatusPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('alle');
  const [search, setSearch] = useState('');

  let filtered = filter === 'alle' ? mockVideos : mockVideos.filter(v => v.category === filter);
  if (search.trim()) filtered = filtered.filter(v => v.location.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="h-full flex flex-col safe-top">
      <div className="px-5 pt-5 flex items-center justify-between flex-shrink-0 mb-2">
        <span className="text-lg font-black text-brand notranslate">numr</span>
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
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((v, i) => (
            <motion.button key={v.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
              onClick={() => navigate(`/status/video/${v.id}`)}
              className="rounded-2xl overflow-hidden text-left active:scale-[0.97] transition-transform" style={{boxShadow:'0 2px 12px rgba(0,0,0,0.08)'}}>
              <div className="h-44 flex items-center justify-center relative" style={{background:v.videoBg}}>
                <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[16px] border-l-white/80 ml-1" />
                </div>
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center text-[7px] font-bold" style={{background:v.logoBg,color:v.logoColor}}>{v.logo}</div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2.5 pt-8">
                  <p className="text-white text-[11px] font-bold leading-tight">{v.company}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin size={8} className="text-white/50" />
                    <span className="text-white/50 text-[8px]">{v.location}</span>
                    <span className="text-white/30 text-[8px] ml-1">{v.postedAt}</span>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
        {filtered.length === 0 && <p className="text-center text-gray-300 py-14 font-medium">{t('status.geen')}</p>}
      </div>

      <div className="flex-shrink-0 bg-white/95 backdrop-blur-lg border-t border-gray-200/60 safe-bottom">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          <button onClick={() => navigate('/status')} className="flex flex-col items-center gap-0.5 text-dark">
            <Home size={20} strokeWidth={2.5} />
            <span className="text-[9px] font-extrabold">Home</span>
          </button>
          <button onClick={() => navigate('/status/upload')} className="flex flex-col items-center gap-0.5 text-gray-400">
            <Plus size={20} strokeWidth={2} />
            <span className="text-[9px] font-medium">{t('status.upload')}</span>
          </button>
          <button onClick={() => navigate('/status/messages')} className="flex flex-col items-center gap-0.5 text-gray-400">
            <MessageCircle size={20} strokeWidth={1.8} />
            <span className="text-[9px] font-medium">{t('status.berichten')}</span>
          </button>
          <button onClick={() => navigate('/status/profile')} className="flex flex-col items-center gap-0.5 text-gray-400">
            <User size={20} strokeWidth={1.8} />
            <span className="text-[9px] font-medium">{t('status.profiel')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
