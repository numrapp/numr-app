import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Trash2, Edit3 } from 'lucide-react';
import { useI18n } from '../i18n';
import { useAuth } from '../hooks/useAuth';
import StatusBar from '../components/layout/StatusBar';
import api from '../services/api';

export default function StatusProfilePage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bio, setBio] = useState('');
  const [editBio, setEditBio] = useState(false);
  const [profileImg, setProfileImg] = useState<string | null>(null);
  const [myVideos, setMyVideos] = useState<any[]>([]);

  useEffect(() => {
    api.get('/status/videos/me').then(res => setMyVideos(res.data)).catch(() => {});
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file || file.size > 10 * 1024 * 1024) return;
      if (profileImg) URL.revokeObjectURL(profileImg);
      setProfileImg(URL.createObjectURL(file));
    } catch {}
  };

  const handleDeleteVideo = async (id: number) => {
    try {
      await api.delete(`/status/videos/${id}`);
      setMyVideos(prev => prev.filter(v => v.id !== id));
    } catch {}
  };

  return (
    <div className="h-full flex flex-col safe-top">
      <div className="px-5 pt-5 flex items-center justify-between flex-shrink-0 mb-4">
        <span className="text-lg font-black text-brand notranslate">numr</span>
        <button onClick={() => navigate('/')} className="text-sm font-extrabold text-brand active:opacity-70">{t('nav.mainMenu')}</button>
      </div>

      <div className="page-scroll px-5 pb-4">
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
              {profileImg ? <img src={profileImg} alt="" className="w-full h-full object-cover" /> : <span className="text-3xl font-black text-gray-300">{user?.company_name?.charAt(0) || 'N'}</span>}
            </div>
            <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-brand flex items-center justify-center cursor-pointer shadow-md active:scale-90 transition-transform">
              <Camera size={14} className="text-dark" />
              <input type="file" accept="image/jpeg,image/png,image/heic" className="hidden" onChange={handlePhotoUpload} />
            </label>
          </div>
          <p className="text-lg font-extrabold text-dark">{user?.company_name || 'numr'}</p>
          <p className="text-xs text-gray-400">{user?.email}</p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('status.biografie')}</span>
            <button onClick={() => setEditBio(!editBio)} className="p-1 rounded-lg hover:bg-gray-100"><Edit3 size={14} className="text-gray-400" /></button>
          </div>
          {editBio ? <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="input-send resize-none text-sm" placeholder={t('status.biografiePh')} /> : <p className="text-sm text-gray-600">{bio || t('status.biografiePh')}</p>}
        </div>

        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t('status.mijnVideos')} ({myVideos.length})</p>
          {myVideos.length === 0 ? <p className="text-center text-gray-300 py-8 text-sm">{t('status.geen')}</p> : (
            <div className="grid grid-cols-3 gap-1.5">
              {myVideos.map((v: any) => (
                <div key={v.id} className="relative aspect-square rounded-xl overflow-hidden bg-gray-900">
                  {v.video_path && <video src={v.video_path} className="w-full h-full object-cover" muted />}
                  <button onClick={() => handleDeleteVideo(v.id)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/40 flex items-center justify-center">
                    <Trash2 size={10} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <StatusBar />
    </div>
  );
}
