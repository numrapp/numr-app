import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { useI18n } from '../i18n';
import { mockChats } from '../data/mockMessages';

const LANGS: [string, string][] = [['nl','\u{1F1F3}\u{1F1F1}'],['tr','\u{1F1F9}\u{1F1F7}'],['en','\u{1F1EC}\u{1F1E7}'],['ar','\u{1F1F8}\u{1F1E6}'],['bg','\u{1F1E7}\u{1F1EC}'],['pl','\u{1F1F5}\u{1F1F1}']];

export default function StatusChatPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [newMsg, setNewMsg] = useState('');
  const [chatLang, setChatLang] = useState('nl');

  const isNew = id === 'new';
  const company = isNew ? searchParams.get('company') || '' : '';
  const chat = !isNew ? mockChats.find(c => c.id === Number(id)) : null;
  const displayName = chat?.company || company;
  const [messages, setMessages] = useState(chat?.messages || []);

  const handleSend = () => {
    if (!newMsg.trim()) return;
    const translations: Record<string, string> = {};
    LANGS.forEach(([code]) => { translations[code] = code === 'nl' ? newMsg : newMsg; });
    translations['nl'] = newMsg;
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      fromMe: true,
      time: new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
      translations,
    }]);
    setNewMsg('');
  };

  return (
    <div className="h-full flex flex-col safe-top">
      <div className="px-4 pt-4 pb-2 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate('/status/messages')} className="p-1.5 -ml-1 rounded-xl hover:bg-gray-100"><ArrowLeft size={20} /></button>
          <div className="flex items-center gap-2.5 flex-1">
            {chat && <div className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{background:chat.logoBg}}>{chat.logo}</div>}
            <p className="font-bold text-sm text-dark">{displayName}</p>
          </div>
        </div>
        <div className="flex gap-1.5 ml-10">
          {LANGS.map(([code, flag]) => (
            <button key={code} onClick={() => setChatLang(code)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all ${chatLang === code ? 'ring-2 ring-brand scale-110 bg-brand/10' : 'hover:bg-gray-50'}`}>
              {flag}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl ${msg.fromMe ? 'bg-brand text-dark rounded-br-md' : 'bg-gray-100 text-dark rounded-bl-md'}`}>
              <p className="text-[13px] leading-relaxed">{msg.translations[chatLang] || msg.translations['nl']}</p>
              <p className={`text-[9px] mt-1 ${msg.fromMe ? 'text-dark/40' : 'text-gray-400'}`}>{msg.time}</p>
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <p className="text-center text-gray-300 text-sm py-10">{t('status.startGesprek')}</p>
        )}
      </div>

      <div className="flex-shrink-0 p-3 border-t border-gray-100 safe-bottom">
        <div className="flex items-center gap-2">
          <input type="text" value={newMsg} onChange={e => setNewMsg(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder={t('status.typBericht')}
            className="flex-1 px-4 py-3 bg-gray-50 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand/50" />
          <button onClick={handleSend} disabled={!newMsg.trim()}
            className="w-11 h-11 bg-brand rounded-xl flex items-center justify-center active:scale-90 transition-transform disabled:opacity-40">
            <Send size={18} className="text-dark" />
          </button>
        </div>
      </div>
    </div>
  );
}
