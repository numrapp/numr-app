import { useI18n } from '../i18n';

const LANGS: [string, string][] = [['nl','\u{1F1F3}\u{1F1F1}'],['tr','\u{1F1F9}\u{1F1F7}'],['en','\u{1F1EC}\u{1F1E7}'],['ar','\u{1F1F8}\u{1F1E6}'],['bg','\u{1F1E7}\u{1F1EC}'],['pl','\u{1F1F5}\u{1F1F1}']];

export default function LanguageSelector({ dark }: { dark?: boolean }) {
  const { lang, setLang } = useI18n();
  return (
    <div className="flex gap-1 notranslate">
      {LANGS.map(([code, flag]) => (
        <button key={code} onClick={() => setLang(code)}
          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all duration-200 ${
            lang === code ? 'ring-2 ring-brand scale-110 shadow-sm bg-brand/10' : dark ? 'hover:bg-white/10' : 'hover:bg-dark/5'
          }`}>
          {flag}
        </button>
      ))}
    </div>
  );
}
