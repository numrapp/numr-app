import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Phone, Play, Pause } from 'lucide-react';
import { useI18n } from '../i18n';
import api from '../services/api';
import { assetUrl } from '../utils/assetUrl';

interface StatusVideo {
  id: number;
  user_id: number;
  video_path: string;
  company_name?: string;
  category?: string;
  description?: string;
  location?: string;
  created_at?: string;
  phone?: string;
}

function initials(name: string | undefined): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map(p => p[0]?.toUpperCase() || '').join('') || '?';
}

function relativeTime(iso: string | undefined): string {
  if (!iso) return '';
  const d = new Date(iso.replace(' ', 'T') + 'Z');
  if (isNaN(d.getTime())) return '';
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 60) return `${Math.max(1, min)}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d`;
  const wk = Math.floor(day / 7);
  return `${wk}w`;
}

export default function VideoPlayerPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { id } = useParams();

  const [videos, setVideos] = useState<StatusVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Fetch the real feed on mount. The previous implementation read from a
  // static empty mockVideos array, so every tap landed on "Video niet gevonden".
  useEffect(() => {
    let cancelled = false;
    api.get('/status/videos')
      .then(res => {
        if (cancelled) return;
        const list: StatusVideo[] = Array.isArray(res.data) ? res.data : [];
        setVideos(list);
        const targetId = Number(id);
        const idx = list.findIndex(v => v.id === targetId);
        setCurrentIdx(idx >= 0 ? idx : 0);
      })
      .catch(err => { if (!cancelled) setError(err?.response?.data?.error || 'Kon videos niet laden'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const video = videos[currentIdx];

  // Auto-play when switching videos.
  useEffect(() => {
    if (!videoRef.current || !video) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [video?.id]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) { videoRef.current.play(); setPlaying(true); }
    else { videoRef.current.pause(); setPlaying(false); }
  };

  const handleTouchStart = (e: React.TouchEvent) => { touchStartY.current = e.touches[0].clientY; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartY.current;
    if (start == null) return;
    const diff = start - e.changedTouches[0].clientY;
    if (diff > 60 && currentIdx < videos.length - 1) setCurrentIdx(currentIdx + 1);
    else if (diff < -60 && currentIdx > 0) setCurrentIdx(currentIdx - 1);
    touchStartY.current = null;
  };

  if (loading) {
    return <div className="h-full flex items-center justify-center bg-black text-white/60 text-sm font-medium">…</div>;
  }
  if (error || !video) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-black text-white gap-4 px-6">
        <p className="text-white/70 text-sm font-medium text-center">{error || t('status.geen')}</p>
        <button onClick={() => navigate('/status')} className="px-5 py-2.5 rounded-xl bg-white/10 text-white text-sm font-bold">{t('common.terug')}</button>
      </div>
    );
  }

  const companyName = video.company_name || '';
  const letters = initials(companyName);
  const src = assetUrl(video.video_path);

  return (
    <div className="h-full relative bg-black overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}>

      {/* Full-bleed video */}
      <video
        ref={videoRef}
        src={src}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        autoPlay
        loop
        muted={false}
        onClick={togglePlay}
        onError={() => setError('Video kan niet worden afgespeeld')}
      />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 safe-top px-4 pt-4 flex items-center justify-between">
        <button onClick={() => navigate('/status')} className="p-2 rounded-xl bg-black/30 backdrop-blur-sm active:scale-95 transition">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <span className="text-white/70 text-xs font-medium">{currentIdx + 1}/{videos.length}</span>
      </div>

      {/* Pause indicator */}
      {!playing && (
        <button onClick={togglePlay} aria-label="play" className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <Play size={32} className="text-white ml-1" />
          </div>
        </button>
      )}

      {/* Right rail actions */}
      <div className="absolute right-4 bottom-40 flex flex-col gap-4 items-center z-10">
        <div className="w-11 h-11 rounded-full bg-brand text-dark text-xs font-extrabold flex items-center justify-center notranslate">{letters}</div>
        <button onClick={() => navigate(`/status/chat/new?company=${encodeURIComponent(companyName)}&videoUserId=${video.user_id}`)}
          className="w-11 h-11 rounded-full bg-white/15 backdrop-blur flex items-center justify-center active:scale-95">
          <MessageCircle size={20} className="text-white" />
        </button>
        {video.phone && (
          <a href={`tel:${video.phone}`} className="w-11 h-11 rounded-full bg-white/15 backdrop-blur flex items-center justify-center">
            <Phone size={18} className="text-white" />
          </a>
        )}
        <button onClick={togglePlay} className="w-11 h-11 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
          {playing ? <Pause size={18} className="text-white" /> : <Play size={18} className="text-white ml-0.5" />}
        </button>
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 pt-16 safe-bottom z-10">
        <p className="text-white font-extrabold text-base">{companyName}</p>
        {video.description && <p className="text-white/80 text-sm mt-1">{video.description}</p>}
        <div className="flex items-center gap-3 mt-1.5">
          {video.location && <span className="text-white/60 text-xs font-medium">{video.location}</span>}
          <span className="text-white/40 text-xs">{relativeTime(video.created_at)}</span>
        </div>
        <button onClick={() => navigate(`/status/chat/new?company=${encodeURIComponent(companyName)}&videoUserId=${video.user_id}`)}
          className="mt-3 w-full py-3 bg-brand rounded-xl text-dark font-extrabold text-sm text-center active:scale-95 transition-transform">
          {t('status.berichtSturen')}
        </button>
      </div>

      {/* Progress indicator */}
      {videos.length > 1 && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-10">
          {videos.map((_, i) => (
            <div key={i} className={`w-1 rounded-full transition-all ${i === currentIdx ? 'h-5 bg-brand' : 'h-2 bg-white/20'}`} />
          ))}
        </div>
      )}
    </div>
  );
}
