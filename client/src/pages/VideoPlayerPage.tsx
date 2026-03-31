import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Phone } from 'lucide-react';
import { useI18n } from '../i18n';
import { mockVideos } from '../data/mockVideos';

export default function VideoPlayerPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { id } = useParams();
  const allVideos = mockVideos;
  const startIdx = allVideos.findIndex(v => v.id === Number(id));
  const [currentIdx, setCurrentIdx] = useState(startIdx >= 0 ? startIdx : 0);
  const video = allVideos[currentIdx];

  if (!video) return <div className="h-full flex items-center justify-center text-gray-400">Video niet gevonden</div>;

  const handleScroll = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    const startY = (e.target as any)._startY;
    if (!startY) return;
    const diff = startY - touch.clientY;
    if (diff > 50 && currentIdx < allVideos.length - 1) setCurrentIdx(currentIdx + 1);
    if (diff < -50 && currentIdx > 0) setCurrentIdx(currentIdx - 1);
  };

  return (
    <div className="h-full flex flex-col" style={{background:video.videoBg}}
      onTouchStart={e => { (e.target as any)._startY = e.touches[0].clientY; }}
      onTouchEnd={handleScroll}>

      <div className="absolute top-0 left-0 right-0 z-10 safe-top px-4 pt-4 flex items-center justify-between">
        <button onClick={() => navigate('/status')} className="p-2 rounded-xl bg-black/20 backdrop-blur-sm"><ArrowLeft size={20} className="text-white" /></button>
        <span className="text-white/50 text-xs font-medium">{currentIdx + 1}/{allVideos.length}</span>
      </div>

      <div className="flex-1 flex items-center justify-center relative">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl font-black" style={{background:video.logoBg,color:video.logoColor}}>{video.logo}</div>
          <p className="text-white text-lg font-extrabold">{video.company}</p>
          <p className="text-white/50 text-sm mt-1">{video.description}</p>
          <p className="text-white/40 text-xs mt-2">{video.postedAt}</p>
        </div>

        <div className="absolute right-4 bottom-32 flex flex-col gap-4 items-center">
          <div className="w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold" style={{background:video.logoBg,color:video.logoColor}}>{video.logo}</div>
          <button onClick={() => navigate(`/status/chat/new?company=${video.company}&phone=${video.phone}`)} className="w-11 h-11 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
            <MessageCircle size={20} className="text-white" />
          </button>
          <a href={`tel:${video.phone}`} className="w-11 h-11 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
            <Phone size={18} className="text-white" />
          </a>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-5 pt-16 safe-bottom">
        <p className="text-white font-extrabold text-base">{video.company}</p>
        <p className="text-white/70 text-sm mt-1">{video.description}</p>
        <p className="text-brand text-sm font-bold mt-1">{video.phone}</p>
        <button onClick={() => navigate(`/status/chat/new?company=${video.company}&phone=${video.phone}`)}
          className="mt-3 w-full py-3 bg-brand rounded-xl text-dark font-extrabold text-sm text-center active:scale-95 transition-transform">
          {t('status.berichtSturen')}
        </button>
      </div>

      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1">
        {allVideos.map((_, i) => (
          <div key={i} className={`w-1 rounded-full transition-all ${i === currentIdx ? 'h-5 bg-brand' : 'h-2 bg-white/20'}`} />
        ))}
      </div>
    </div>
  );
}
