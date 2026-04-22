import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Send, Share2, Play, Home, Inbox, Upload, User, RotateCw } from 'lucide-react';
import api from '../services/api';

export default function StatusPage() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    api.get('/status/videos').then(res => setVideos(res.data)).catch(() => {});
  }, []);

  const current = videos[currentIdx];

  return (
    <div className="h-full flex flex-col bg-black relative overflow-hidden">
      {/* Top tabs - Volgend / Voor jou / Live */}
      <div className="absolute top-0 left-0 right-0 z-20 pt-14 flex justify-center gap-6 safe-top">
        {['Volgend', 'Voor jou', 'Live'].map((tab, i) => (
          <button key={tab} className="flex flex-col items-center gap-1">
            <span className={`text-[15px] font-bold ${i === 1 ? 'text-white' : 'text-white/55'}`}>{tab}</span>
            {i === 1 && <div className="w-6 h-[3px] rounded-full bg-brand" />}
          </button>
        ))}
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
            <div className="absolute inset-0">
              {current.video_path && (
                <video src={current.video_path} className="w-full h-full object-cover" autoPlay loop muted playsInline />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90" />
            </div>

            {/* Bottom info */}
            <div className="absolute bottom-0 left-0 right-0 z-10 pb-28 px-5">
              <div className="flex items-end gap-4">
                <div className="flex-1">
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
                      <span className="font-mono text-[10px] text-white/70">{current.category || 'Ondernemer'} · {current.location || 'Nederland'}</span>
                    </div>
                    <button className="ml-2 px-3.5 py-1.5 rounded-full bg-brand text-[12px] font-bold text-dark">Volgen</button>
                  </div>
                  <p className="text-[14px] font-medium text-white leading-snug mb-2 line-clamp-3">{current.description || 'Video'}</p>
                  <div className="flex gap-1.5">
                    <span className="font-mono text-[11px] font-semibold text-brand">#ondernemen</span>
                    <span className="font-mono text-[11px] font-semibold text-brand">#numr</span>
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
      </div>

      {/* TikTok-style bottom bar: HOME / INBOX / UPLOAD / PROFILE / RESET */}
      <div className="absolute bottom-0 left-0 right-0 z-30" style={{ background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.9))', paddingBottom: 'max(20px, env(safe-area-inset-bottom, 20px))' }}>
        <div className="flex items-center justify-around px-4 pt-3">
          <FeedBtn icon={Home} label="Home" onClick={() => navigate('/')} />
          <FeedBtn icon={Inbox} label="Inbox" badge={3} onClick={() => navigate('/status/messages')} />
          <button onClick={() => navigate('/status/upload')} className="relative -mt-3">
            <div className="w-[54px] h-[42px] rounded-[14px] flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #D4FF3A, #B5E024)', boxShadow: '0 10px 24px rgba(212,255,58,0.4)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0E1116" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </div>
          </button>
          <FeedBtn icon={User} label="Profiel" onClick={() => navigate('/settings')} />
          <FeedBtn icon={RotateCw} label="Reset" onClick={() => setCurrentIdx(0)} />
        </div>
      </div>
    </div>
  );
}

function RailBtn({ icon: Icon, count, active }: { icon: any; count: string; active?: boolean }) {
  return (
    <button className="flex flex-col items-center gap-1">
      <div className={`w-[46px] h-[46px] rounded-full flex items-center justify-center ${active ? 'bg-brand' : ''}`}
        style={!active ? { background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)' } : {}}>
        <Icon size={20} className={active ? 'text-dark' : 'text-white'} />
      </div>
      <span className="font-mono text-[10px] font-semibold text-white">{count}</span>
    </button>
  );
}

function FeedBtn({ icon: Icon, label, badge, onClick }: { icon: any; label: string; badge?: number; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-0.5">
      <div className="relative w-9 h-9 flex items-center justify-center">
        <Icon size={22} className="text-white" />
        {badge && badge > 0 && (
          <span className="absolute -top-0.5 -right-1 font-mono text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full bg-v3-red">{badge}</span>
        )}
      </div>
      <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.06em] text-white/75">{label}</span>
    </button>
  );
}
