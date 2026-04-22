import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Send, Share2, Play } from 'lucide-react';
import api from '../services/api';

export default function StatusPage() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [activeTab, setActiveTab] = useState('foryou');

  useEffect(() => {
    api.get('/status/videos').then(res => setVideos(res.data)).catch(() => {});
  }, []);

  const current = videos[currentIdx];

  const handleScroll = (e: React.WheelEvent | React.TouchEvent) => {
    // Placeholder for snap scroll
  };

  return (
    <div className="h-full flex flex-col bg-black relative">
      {/* Top tabs */}
      <div className="absolute top-0 left-0 right-0 z-20 pt-14 flex justify-center gap-6 safe-top">
        {['Volgend', 'Voor jou', 'Live'].map(tab => {
          const isActive = (tab === 'Voor jou' && activeTab === 'foryou') || (tab === 'Volgend' && activeTab === 'following') || (tab === 'Live' && activeTab === 'live');
          return (
            <button key={tab} onClick={() => setActiveTab(tab === 'Volgend' ? 'following' : tab === 'Live' ? 'live' : 'foryou')}
              className="flex flex-col items-center gap-1">
              <span className={`text-[15px] font-bold ${isActive ? 'text-white' : 'text-white/55'}`}>{tab}</span>
              {isActive && <div className="w-6 h-[3px] rounded-full bg-brand" />}
            </button>
          );
        })}
      </div>

      {/* Video area */}
      <div className="flex-1 relative">
        {videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/40">
            <Play size={48} className="mb-4" />
            <p className="text-[15px] font-bold">Nog geen video's</p>
            <p className="text-[13px] mt-1">Upload de eerste!</p>
          </div>
        ) : current ? (
          <>
            {/* Video background */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90">
              {current.video_path && (
                <video src={current.video_path} className="w-full h-full object-cover" autoPlay loop muted playsInline />
              )}
            </div>

            {/* Bottom info */}
            <div className="absolute bottom-0 left-0 right-0 z-10 pb-32 px-5">
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  {/* Creator */}
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center border-2 border-white"
                      style={{ background: 'linear-gradient(135deg, #D4FF3A, #B5E024)' }}>
                      <span className="font-display text-[14px] text-dark">{(current.company_name || 'N')[0]}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[15px] font-extrabold text-white">@{(current.company_name || 'user').toLowerCase().replace(/\s/g, '.')}</span>
                        <div className="w-3.5 h-3.5 rounded-full bg-brand flex items-center justify-center">
                          <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                      </div>
                      <span className="font-mono text-[10px] text-white/70">{current.category || 'Ondernemer'} &middot; {current.location || 'Nederland'}</span>
                    </div>
                    <button className="ml-2 px-3.5 py-1.5 rounded-full bg-brand text-[12px] font-bold text-dark">Volgen</button>
                  </div>

                  <p className="text-[14px] font-medium text-white leading-snug mb-2 line-clamp-3">{current.description || 'Video'}</p>
                  <div className="flex gap-1.5">
                    {['#ondernemen', '#numr'].map(tag => (
                      <span key={tag} className="font-mono text-[11px] font-semibold text-brand">{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Right rail */}
                <div className="flex flex-col items-center gap-5 pb-2">
                  <RailBtn icon={Heart} count="0" />
                  <RailBtn icon={MessageCircle} count="0" />
                  <RailBtn icon={Send} count="DM" />
                  <RailBtn icon={Share2} count="0" />
                </div>
              </div>
            </div>
          </>
        ) : null}

        {/* Swipe indicators */}
        {videos.length > 1 && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-10">
            {videos.map((_, i) => (
              <div key={i} className={`w-1 rounded-full transition-all ${i === currentIdx ? 'h-4 bg-white' : 'h-1.5 bg-white/30'}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RailBtn({ icon: Icon, count, active }: { icon: any; count: string; active?: boolean }) {
  return (
    <button className="flex flex-col items-center gap-1">
      <div className={`w-[46px] h-[46px] rounded-full flex items-center justify-center ${active ? 'bg-brand' : 'bg-white/12'}`} style={{ border: '1px solid rgba(255,255,255,0.15)' }}>
        <Icon size={20} className={active ? 'text-dark' : 'text-white'} />
      </div>
      <span className="font-mono text-[10px] font-semibold text-white">{count}</span>
    </button>
  );
}
