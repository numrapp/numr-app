import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useI18n } from '../i18n';
import { mockChats } from '../data/mockMessages';
import StatusBar from '../components/layout/StatusBar';

export default function StatusMessagesPage() {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col safe-top">
      <div className="px-5 pt-5 flex items-center justify-between mb-4 flex-shrink-0">
        <span className="text-lg font-black text-brand notranslate">numr</span>
        <button onClick={() => navigate('/')} className="text-sm font-extrabold text-brand active:opacity-70">{t('nav.mainMenu')}</button>
      </div>

      <div className="page-scroll px-5 pb-4">
        {mockChats.length === 0 ? (
          <p className="text-center text-gray-300 py-14 font-medium">{t('status.geenBerichten')}</p>
        ) : (
          <div className="space-y-2">
            {mockChats.map((chat, i) => (
              <motion.button key={chat.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}
                onClick={() => navigate(`/status/chat/${chat.id}`)}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{background:chat.logoBg}}>{chat.logo}</div>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-bold text-sm text-dark">{chat.company}</p>
                  <p className="text-xs text-gray-400 truncate">{chat.lastMessage}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-[10px] text-gray-400">{chat.lastTime}</span>
                  {chat.unread > 0 && <span className="w-5 h-5 bg-brand rounded-full text-[10px] font-bold text-dark flex items-center justify-center">{chat.unread}</span>}
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
