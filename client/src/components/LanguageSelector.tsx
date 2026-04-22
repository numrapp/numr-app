import { useNavigate } from 'react-router-dom';
import { Globe } from 'lucide-react';

export default function LanguageSelector() {
  const navigate = useNavigate();

  return (
    <button onClick={() => navigate('/settings')}
      className="w-10 h-10 bg-white rounded-full flex items-center justify-center" style={{ border: '1px solid #EEF0F3' }}>
      <Globe size={16} className="text-v3-mute" />
    </button>
  );
}
