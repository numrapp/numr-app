import { useState, useRef } from 'react';
import { Send, RotateCcw, ChevronRight, FileText } from 'lucide-react';
import { toPng } from 'html-to-image';

function Screen1Content() {
  return (
    <div style={{ padding: 20, paddingTop: 24, background: '#fff', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <span style={{ fontSize: 22, fontWeight: 900, color: '#DFFF00' }}>numr</span>
      </div>
      <p style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', textAlign: 'center', marginBottom: 28 }}>Hallo, MRE Finance</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ background: 'linear-gradient(135deg, #DBEAFE, #93C5FD)', borderRadius: 20, padding: '18px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={22} color="#1D4ED8" /></div>
          <div style={{ flex: 1 }}><p style={{ fontSize: 15, fontWeight: 800, color: '#1A1A1A' }}>Nieuwe Offerte</p><p style={{ fontSize: 11, color: 'rgba(29,78,216,0.6)' }}>Offerte aanmaken</p></div>
          <ChevronRight size={18} color="#93C5FD" />
        </div>
        <div style={{ background: 'linear-gradient(135deg, #DFFF00, #B8D900)', borderRadius: 20, padding: '18px 16px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 6px 24px rgba(223,255,0,0.3)' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Send size={22} color="#1A1A1A" /></div>
          <div style={{ flex: 1 }}><p style={{ fontSize: 15, fontWeight: 800, color: '#1A1A1A' }}>Nieuw Factuur</p><p style={{ fontSize: 11, color: 'rgba(26,26,26,0.6)' }}>Factuur aanmaken</p></div>
          <ChevronRight size={18} color="rgba(26,26,26,0.4)" />
        </div>
        <div style={{ background: 'linear-gradient(135deg, #FEE2E2, #FECACA)', borderRadius: 20, padding: '18px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><RotateCcw size={22} color="#EF4444" /></div>
          <div style={{ flex: 1 }}><p style={{ fontSize: 15, fontWeight: 800, color: '#1A1A1A' }}>Credit Factuur</p><p style={{ fontSize: 11, color: 'rgba(239,68,68,0.7)' }}>Creditfactuur opstellen</p></div>
          <ChevronRight size={18} color="#FCA5A5" />
        </div>
      </div>
    </div>
  );
}

const langs8 = [
  { flag: '\u{1F1F3}\u{1F1F1}', lang: 'Nederlands', text: 'Verstuur eenvoudig facturen in het Nederlands', color: '#FF6B00' },
  { flag: '\u{1F1F9}\u{1F1F7}', lang: 'T\u00FCrk\u00E7e', text: 'T\u00FCrk\u00E7e olarak kolayca fatura g\u00F6nderin', color: '#E30A17' },
  { flag: '\u{1F1EC}\u{1F1E7}', lang: 'English', text: 'Send invoices easily in English', color: '#003078' },
  { flag: '\u{1F1EB}\u{1F1F7}', lang: 'Fran\u00E7ais', text: 'Envoyez des factures facilement', color: '#0055A4' },
  { flag: '\u{1F1EA}\u{1F1F8}', lang: 'Espa\u00F1ol', text: 'Env\u00EDa facturas f\u00E1cilmente', color: '#AA151B' },
  { flag: '\u{1F1F8}\u{1F1E6}', lang: '\u0627\u0644\u0639\u0631\u0628\u064A\u0629', text: '\u0623\u0631\u0633\u0644 \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631 \u0628\u0633\u0647\u0648\u0644\u0629', color: '#006C35' },
  { flag: '\u{1F1E7}\u{1F1EC}', lang: '\u0411\u044A\u043B\u0433\u0430\u0440\u0441\u043A\u0438', text: '\u0418\u0437\u043F\u0440\u0430\u0449\u0430\u0439\u0442\u0435 \u0444\u0430\u043A\u0442\u0443\u0440\u0438 \u043B\u0435\u0441\u043D\u043E', color: '#00966E' },
  { flag: '\u{1F1F5}\u{1F1F1}', lang: 'Polski', text: 'Wysy\u0142aj faktury \u0142atwo po polsku', color: '#DC143C' },
];

function ScreenLangs({ size }: { size: 'phone' | 'ipad' }) {
  const isIpad = size === 'ipad';
  const w = isIpad ? 680 : 430;
  const h = isIpad ? 910 : 932;
  const fs = isIpad ? 1.4 : 1;
  return (
    <div style={{
      width: w, height: h, borderRadius: 20, overflow: 'hidden', flexShrink: 0,
      background: 'linear-gradient(180deg, #F8FAFC 0%, #E2E8F0 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', padding: `${isIpad ? 60 : 50}px ${isIpad ? 50 : 30}px 30px`,
    }}>
      <h2 style={{ fontSize: 28 * fs, fontWeight: 900, color: '#1A1A1A', textAlign: 'center', lineHeight: 1.2, marginBottom: 6 }}>
        De slimste manier om<br/>facturen te versturen
      </h2>
      <p style={{ fontSize: 13 * fs, color: '#64748B', fontWeight: 600, marginBottom: isIpad ? 40 : 24 }}>8 talen beschikbaar</p>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: isIpad ? 12 : 8 }}>
        {langs8.map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: `${isIpad ? 16 : 12}px 16px`, borderRadius: 20,
            background: '#FFFFFF', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.04)',
          }}>
            <div style={{ width: isIpad ? 48 : 40, height: isIpad ? 48 : 40, borderRadius: 12, background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isIpad ? 26 : 22, flexShrink: 0 }}>{item.flag}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: (isIpad ? 15 : 13) * 1, fontWeight: 800, color: '#1A1A1A' }}>{item.lang}</p>
              <p style={{ fontSize: (isIpad ? 11 : 9) * 1, fontWeight: 500, color: '#94A3B8', marginTop: 2 }}>{item.text}</p>
            </div>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: item.color, flexShrink: 0 }} />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 'auto', paddingTop: 16, textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: '#DFFF00', borderRadius: 14, padding: '12px 36px', boxShadow: '0 6px 24px rgba(223,255,0,0.25)', marginBottom: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 900, color: '#1A1A1A' }}>Kies uw taal en begin</span>
        </div>
        <p style={{ fontSize: 24, fontWeight: 900, color: '#1A1A1A', opacity: 0.15 }}>numr</p>
      </div>
    </div>
  );
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: 340, height: 700, borderRadius: 40, overflow: 'hidden', border: '6px solid #1A1A1A', background: '#fff', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
      <div style={{ width: '100%', height: 36, background: '#1A1A1A', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', paddingBottom: 4 }}>
        <div style={{ width: 100, height: 26, borderRadius: 20, background: '#1A1A1A' }} />
      </div>
      <div style={{ height: 'calc(100% - 36px)', overflow: 'hidden' }}>{children}</div>
    </div>
  );
}

const screens = [
  { id: 'hero', label: 'Hero' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'langs-phone', label: '8 Talen (iPhone)' },
  { id: 'langs-ipad', label: '8 Talen (iPad)' },
];

export default function AppStoreScreenshots() {
  const [current, setCurrent] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const refs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];

  const downloadCurrent = async () => {
    const node = refs[current].current;
    if (!node) return;
    setDownloading(true);
    try {
      const isIpad = current === 3;
      const w = isIpad ? 2048 : 1290;
      const h = isIpad ? 2732 : 2796;
      const dataUrl = await toPng(node, { width: w, height: h, pixelRatio: w / node.offsetWidth });
      const link = document.createElement('a');
      link.download = `numr-${isIpad ? 'ipad' : 'iphone'}-${current + 1}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) { console.error(e); }
    setDownloading(false);
  };

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', overflow: 'auto', position: 'fixed', inset: 0, zIndex: 9999 }}>
      <div style={{ padding: '20px', textAlign: 'center', background: '#fff', borderBottom: '1px solid #eee' }}>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
          {screens.map((s, i) => (
            <button key={s.id} onClick={() => setCurrent(i)}
              style={{ padding: '8px 16px', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12,
                background: current === i ? '#1A1A1A' : '#eee', color: current === i ? '#fff' : '#666' }}>
              {s.label}
            </button>
          ))}
        </div>
        <button onClick={downloadCurrent} disabled={downloading}
          style={{ padding: '12px 40px', borderRadius: 14, border: 'none', cursor: 'pointer', fontWeight: 900, fontSize: 15,
            background: '#DFFF00', color: '#1A1A1A', marginTop: 8 }}>
          {downloading ? 'Indiriliyor...' : `PNG Indir`}
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', padding: 30 }}>
        {current === 0 && <div ref={refs[0]} style={{
          width: 430, height: 932, borderRadius: 20, overflow: 'hidden',
          background: 'linear-gradient(160deg, #0A0A0A 0%, #1A1A1A 50%, #0D0D0D 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(223,255,0,0.12) 0%, transparent 60%)' }} />
          <div style={{ position: 'absolute', bottom: -50, right: -80, width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(223,255,0,0.08) 0%, transparent 60%)' }} />
          <div style={{ position: 'relative', marginBottom: 32 }}>
            <div style={{ width: 150, height: 150, borderRadius: 40, background: 'linear-gradient(135deg, #DFFF00 0%, #C8E600 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 24px 80px rgba(223,255,0,0.45)' }}>
              <span style={{ fontSize: 58, fontWeight: 900, color: '#1A1A1A' }}>n</span>
            </div>
          </div>
          <h1 style={{ fontSize: 64, fontWeight: 900, color: '#FFFFFF', letterSpacing: -3, marginBottom: 12 }}>numr</h1>
          <div style={{ width: 40, height: 3, borderRadius: 2, background: '#DFFF00', marginBottom: 20 }} />
          <p style={{ fontSize: 17, fontWeight: 600, color: 'rgba(255,255,255,0.45)', textAlign: 'center', lineHeight: 1.6, maxWidth: 280, marginBottom: 44 }}>
            Verstuur facturen<br/>in uw eigen taal
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            {[{ e: '\u26A1', l: 'Snel', s: '< 30 sec' }, { e: '\uD83D\uDD12', l: 'Veilig', s: 'SSL' }, { e: '\uD83C\uDF0D', l: '8 talen', s: 'NL TR EN ...' }].map((item, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 18, padding: '14px 16px', width: 110, border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                <span style={{ fontSize: 26 }}>{item.e}</span>
                <p style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.7)', marginTop: 6 }}>{item.l}</p>
                <p style={{ fontSize: 8, fontWeight: 600, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>{item.s}</p>
              </div>
            ))}
          </div>
          <div style={{ position: 'absolute', bottom: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ background: 'linear-gradient(135deg, #DFFF00 0%, #C8E600 100%)', borderRadius: 16, padding: '16px 56px', boxShadow: '0 10px 40px rgba(223,255,0,0.35)' }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: '#1A1A1A' }}>Download nu gratis</span>
            </div>
          </div>
        </div>}

        {current === 1 && <div ref={refs[1]} style={{
          width: 430, height: 932, borderRadius: 20, overflow: 'hidden',
          background: 'linear-gradient(180deg, #DFFF00 0%, #B8D900 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '50px 30px 30px',
        }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: '#1A1A1A', textAlign: 'center', lineHeight: 1.2, marginBottom: 8 }}>
            Facturen versturen<br/>in seconden
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(26,26,26,0.6)', fontWeight: 600, marginBottom: 16 }}>Snel, simpel en professioneel</p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {['\u{1F1F3}\u{1F1F1}','\u{1F1F9}\u{1F1F7}','\u{1F1EC}\u{1F1E7}','\u{1F1EB}\u{1F1F7}','\u{1F1EA}\u{1F1F8}','\u{1F1F8}\u{1F1E6}','\u{1F1E7}\u{1F1EC}','\u{1F1F5}\u{1F1F1}'].map((f, i) => (
              <div key={i} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{f}</div>
            ))}
          </div>
          <PhoneFrame><Screen1Content /></PhoneFrame>
          <div style={{ marginTop: 'auto', paddingTop: 16 }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: '#1A1A1A', opacity: 0.3 }}>numr</span>
          </div>
        </div>}

        {current === 2 && <div ref={refs[2]}><ScreenLangs size="phone" /></div>}
        {current === 3 && <div ref={refs[3]}><ScreenLangs size="ipad" /></div>}
      </div>
    </div>
  );
}
