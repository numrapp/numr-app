import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Send, Globe } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useI18n } from '../i18n';
import { mockChats } from '../data/mockMessages';

const LANGS: { code: string; flag: string; short: string }[] = [
  { code: 'nl', flag: '\u{1F1F3}\u{1F1F1}', short: 'NL' },
  { code: 'tr', flag: '\u{1F1F9}\u{1F1F7}', short: 'TR' },
  { code: 'en', flag: '\u{1F1EC}\u{1F1E7}', short: 'EN' },
  { code: 'fr', flag: '\u{1F1EB}\u{1F1F7}', short: 'FR' },
  { code: 'es', flag: '\u{1F1EA}\u{1F1F8}', short: 'ES' },
  { code: 'ar', flag: '\u{1F1F8}\u{1F1E6}', short: 'AR' },
  { code: 'bg', flag: '\u{1F1E7}\u{1F1EC}', short: 'BG' },
  { code: 'pl', flag: '\u{1F1F5}\u{1F1F1}', short: 'PL' },
];

export default function StatusChatPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [newMsg, setNewMsg] = useState('');
  const [chatLang, setChatLang] = useState('nl');
  const [langOpen, setLangOpen] = useState(false);

  const isNew = id === 'new';
  const company = isNew ? searchParams.get('company') || '' : '';
  const chat = !isNew ? mockChats.find(c => c.id === Number(id)) : null;
  const displayName = chat?.company || company;
  const [messages, setMessages] = useState(chat?.messages || []);
  const currentLang = LANGS.find(l => l.code === chatLang) || LANGS[0];

  const handleSend = () => {
    if (!newMsg.trim()) return;
    const translations: Record<string, string> = {};
    translations[chatLang] = newMsg;
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
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/status/messages')} className="p-1.5 -ml-1 rounded-xl hover:bg-gray-100"><ArrowLeft size={20} /></button>
          <div className="flex items-center gap-2.5 flex-1">
            {chat && <div className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{background:chat.logoBg}}>{chat.logo}</div>}
            <p className="font-bold text-sm text-dark">{displayName}</p>
          </div>
          <div className="relative notranslate">
            <button onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl transition-all hover:bg-gray-100">
              <Globe size={16} className="text-gray-400" />
              <span className="text-sm">{currentLang.flag}</span>
              <span className="text-[9px] font-bold text-gray-400">{currentLang.short}</span>
            </button>
            <AnimatePresence>
              {langOpen && (
                <>
                  <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                  <motion.div initial={{opacity:0,y:-5,scale:0.95}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-5,scale:0.95}}
                    className="absolute right-0 top-full mt-1 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 p-2" style={{minWidth:180}}>
                    <div className="grid grid-cols-4 gap-1">
                      {LANGS.map(l => (
                        <button key={l.code} onClick={() => { setChatLang(l.code); setLangOpen(false); }}
                          className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl transition-colors ${chatLang === l.code ? 'bg-brand/15' : 'hover:bg-gray-50'}`}>
                          <span className="text-lg">{l.flag}</span>
                          <span className={`text-[9px] font-bold ${chatLang === l.code ? 'text-dark' : 'text-gray-400'}`}>{l.short}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
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

      <div className="flex-shrink-0 px-3 pt-2 pb-1 border-t border-gray-100">
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
