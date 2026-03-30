import { useState, useRef } from 'react';
import { Send, RotateCcw, Inbox, ChevronRight, CheckCircle, AlertCircle, Save, LogOut, Eye } from 'lucide-react';
import { toPng } from 'html-to-image';

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto" style={{ width: 340, height: 700 }}>
      <div style={{
        width: '100%', height: '100%', borderRadius: 40, overflow: 'hidden',
        border: '6px solid #1A1A1A', background: '#fff',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 0 2px rgba(255,255,255,0.1)',
      }}>
        <div style={{ width: '100%', height: 36, background: '#1A1A1A', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', paddingBottom: 4 }}>
          <div style={{ width: 100, height: 26, borderRadius: 20, background: '#1A1A1A' }} />
        </div>
        <div style={{ height: 'calc(100% - 36px)', overflow: 'hidden' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function Screen1Content() {
  return (
    <div style={{ padding: 20, paddingTop: 24, background: '#fff', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <span style={{ fontSize: 22, fontWeight: 900, color: '#DFFF00' }}>numr</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <span style={{ fontSize: 14 }}>{'\u{1F1F3}\u{1F1F1}'}</span>
          <span style={{ fontSize: 14 }}>{'\u{1F1F9}\u{1F1F7}'}</span>
          <span style={{ fontSize: 14 }}>{'\u{1F1EC}\u{1F1E7}'}</span>
        </div>
      </div>
      <p style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', textAlign: 'center', marginBottom: 28 }}>Hallo, numr Test BV</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ background: 'linear-gradient(135deg, #DFFF00, #B8D900)', borderRadius: 20, padding: '18px 16px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 6px 24px rgba(223,255,0,0.3)' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Send size={22} color="#1A1A1A" /></div>
          <div style={{ flex: 1 }}><p style={{ fontSize: 15, fontWeight: 800, color: '#1A1A1A' }}>Nieuw Factuur</p><p style={{ fontSize: 11, color: 'rgba(26,26,26,0.6)' }}>Factuur aanmaken</p></div>
          <ChevronRight size={18} color="rgba(26,26,26,0.4)" />
        </div>
        <div style={{ background: 'linear-gradient(135deg, #FEE2E2, #FECACA)', borderRadius: 20, padding: '18px 16px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 6px 24px rgba(239,68,68,0.1)' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><RotateCcw size={22} color="#EF4444" /></div>
          <div style={{ flex: 1 }}><p style={{ fontSize: 15, fontWeight: 800, color: '#1A1A1A' }}>Credit Factuur</p><p style={{ fontSize: 11, color: 'rgba(239,68,68,0.7)' }}>Creditfactuur opstellen</p></div>
          <ChevronRight size={18} color="#FCA5A5" />
        </div>
        <div style={{ background: 'linear-gradient(135deg, #DBEAFE, #BFDBFE)', borderRadius: 20, padding: '18px 16px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 6px 24px rgba(59,130,246,0.1)' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Inbox size={22} color="#3B82F6" /></div>
          <div style={{ flex: 1 }}><p style={{ fontSize: 15, fontWeight: 800, color: '#1A1A1A' }}>Ontvangen Factuur</p><p style={{ fontSize: 11, color: 'rgba(59,130,246,0.7)' }}>Ontvangen facturen bekijken</p></div>
          <ChevronRight size={18} color="#93C5FD" />
        </div>
      </div>
    </div>
  );
}

function Screen2Content() {
  const invoices = [
    { name: 'KPN', logo: 'KPN', bg: '#E8F5E9', color: '#00A94F', amount: '\u20AC 45,99', paid: false },
    { name: 'Vattenfall', logo: 'V', bg: '#FFF8E1', color: '#F5A623', amount: '\u20AC 128,50', paid: true },
    { name: 'Ziggo', logo: 'Z', bg: '#FCE4EC', color: '#E91E63', amount: '\u20AC 59,95', paid: false },
    { name: 'BAM Bouw', logo: 'BAM', bg: '#E3F2FD', color: '#003D6B', amount: '\u20AC 11.531,30', paid: false },
    { name: 'VGZ', logo: 'VGZ', bg: '#E8EAF6', color: '#3F51B5', amount: '\u20AC 134,20', paid: true },
  ];
  return (
    <div style={{ padding: 20, paddingTop: 24, background: '#fff', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <span style={{ fontSize: 16, fontWeight: 800, color: '#1A1A1A' }}>Ontvangen Facturen</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {invoices.map((inv, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 16,
            background: inv.paid ? 'linear-gradient(135deg, #F0FDF4, #DCFCE7)' : 'linear-gradient(135deg, #FFF7ED, #FEF3C7)',
            border: `1px solid ${inv.paid ? '#BBF7D0' : '#FDE68A'}`,
          }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: inv.bg, color: inv.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900 }}>{inv.logo}</div>
            <div style={{ flex: 1 }}><p style={{ fontSize: 12, fontWeight: 800, color: '#1A1A1A' }}>{inv.name}</p></div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: '#1A1A1A' }}>{inv.amount}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3 }}>
                {inv.paid ? <><CheckCircle size={10} color="#22C55E" /><span style={{ fontSize: 8, fontWeight: 700, color: '#16A34A' }}>Betaald</span></> : <><AlertCircle size={10} color="#F59E0B" /><span style={{ fontSize: 8, fontWeight: 700, color: '#D97706' }}>Niet betaald</span></>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Screen3Content() {
  return (
    <div style={{ padding: 20, paddingTop: 24, background: '#fff', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <span style={{ fontSize: 16, fontWeight: 800, color: '#1A1A1A' }}>Instellingen</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[['Bedrijfsnaam', 'numr Test BV'], ['Adres', 'Keizersgracht 100'], ['KVK', '12345678'], ['BTW', 'NL123456789B01'], ['IBAN', 'NL00INGB000123']].map(([l, v], i) => (
          <div key={i}>
            <p style={{ fontSize: 8, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>{l}</p>
            <div style={{ background: '#F9FAFB', borderRadius: 14, padding: '12px 14px', fontSize: 12, color: '#1A1A1A', fontWeight: 500 }}>{v}</div>
          </div>
        ))}
        <div style={{ paddingTop: 8, borderTop: '1px solid #F3F4F6', marginTop: 4 }}>
          <p style={{ fontSize: 8, fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>E-mail instellingen</p>
          <div style={{ marginBottom: 8 }}>
            <p style={{ fontSize: 8, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>E-mailadres</p>
            <div style={{ background: '#F3F4F6', borderRadius: 14, padding: '12px 14px', fontSize: 12, color: '#6B7280' }}>test@numr.nl</div>
          </div>
          <div style={{ position: 'relative' }}>
            <p style={{ fontSize: 8, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>E-mail wachtwoord</p>
            <div style={{ background: '#F9FAFB', borderRadius: 14, padding: '12px 14px', fontSize: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#1A1A1A', letterSpacing: 3 }}>{'*'.repeat(8)}</span>
              <Eye size={14} color="#9CA3AF" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppStoreScreenshots() {
  const [current, setCurrent] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const ref1 = useRef<HTMLDivElement>(null);
  const ref2 = useRef<HTMLDivElement>(null);
  const ref3 = useRef<HTMLDivElement>(null);
  const refs = [ref1, ref2, ref3];
  const screenshots = [
    { id: 'hero', label: 'Afis 1 - Hero' },
    { id: 'dashboard', label: 'Afis 2 - Dashboard' },
    { id: 'languages', label: 'Afis 3 - Diller' },
  ];

  const downloadCurrent = async () => {
    const node = refs[current].current;
    if (!node) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(node, { width: 1242, height: 2688, pixelRatio: 2.89 });
      const link = document.createElement('a');
      link.download = `numr-screenshot-${current + 1}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) { console.error(e); }
    setDownloading(false);
  };

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', overflow: 'auto', position: 'fixed', inset: 0, zIndex: 9999 }}>
      <div style={{ padding: '20px', textAlign: 'center', background: '#fff', borderBottom: '1px solid #eee' }}>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 10 }}>
          {screenshots.map((s, i) => (
            <button key={s.id} onClick={() => setCurrent(i)}
              style={{ padding: '8px 20px', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13,
                background: current === i ? '#1A1A1A' : '#eee', color: current === i ? '#fff' : '#666' }}>
              {s.label}
            </button>
          ))}
        </div>
        <button onClick={downloadCurrent} disabled={downloading}
          style={{ padding: '12px 40px', borderRadius: 14, border: 'none', cursor: 'pointer', fontWeight: 900, fontSize: 15,
            background: '#DFFF00', color: '#1A1A1A', marginTop: 8 }}>
          {downloading ? 'Indiriliyor...' : `PNG Indir (Afis ${current + 1})`}
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', padding: 30 }}>
        {/* AFIS 1: Hero / Logo */}
        {current === 0 && <div ref={ref1} style={{
          width: 430, height: 932, borderRadius: 20, overflow: 'hidden', flexShrink: 0,
          background: 'linear-gradient(160deg, #0A0A0A 0%, #1A1A1A 50%, #0D0D0D 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(223,255,0,0.12) 0%, transparent 60%)' }} />
          <div style={{ position: 'absolute', bottom: -50, right: -80, width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(223,255,0,0.08) 0%, transparent 60%)' }} />
          <div style={{ position: 'absolute', top: '40%', left: '60%', width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 60%)' }} />
          <div style={{ position: 'absolute', top: 60, right: 60, width: 6, height: 6, borderRadius: '50%', background: '#DFFF00', opacity: 0.4 }} />
          <div style={{ position: 'absolute', top: 180, left: 40, width: 4, height: 4, borderRadius: '50%', background: '#DFFF00', opacity: 0.25 }} />
          <div style={{ position: 'absolute', bottom: 200, right: 80, width: 5, height: 5, borderRadius: '50%', background: '#DFFF00', opacity: 0.3 }} />
          <div style={{ position: 'absolute', top: 300, left: 80, width: 3, height: 3, borderRadius: '50%', background: '#fff', opacity: 0.15 }} />
          <div style={{ position: 'absolute', bottom: 350, left: 50, width: 4, height: 4, borderRadius: '50%', background: '#fff', opacity: 0.1 }} />

          <div style={{ position: 'relative', marginBottom: 32 }}>
            <div style={{ position: 'absolute', inset: -20, borderRadius: 50, background: 'radial-gradient(circle, rgba(223,255,0,0.25) 0%, transparent 70%)' }} />
            <div style={{
              width: 150, height: 150, borderRadius: 40, background: 'linear-gradient(135deg, #DFFF00 0%, #C8E600 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
              boxShadow: '0 24px 80px rgba(223,255,0,0.45), 0 0 150px rgba(223,255,0,0.12), inset 0 2px 4px rgba(255,255,255,0.3)',
            }}>
              <span style={{ fontSize: 58, fontWeight: 900, color: '#1A1A1A', fontFamily: 'Inter, system-ui, sans-serif' }}>n</span>
            </div>
          </div>

          <h1 style={{ fontSize: 64, fontWeight: 900, color: '#FFFFFF', textAlign: 'center', lineHeight: 1, letterSpacing: -3, marginBottom: 12 }}>numr</h1>
          <div style={{ width: 40, height: 3, borderRadius: 2, background: '#DFFF00', marginBottom: 20 }} />
          <p style={{ fontSize: 17, fontWeight: 600, color: 'rgba(255,255,255,0.45)', textAlign: 'center', lineHeight: 1.6, maxWidth: 280, marginBottom: 44 }}>
            Verstuur facturen<br/>in uw eigen taal
          </p>

          <div style={{ display: 'flex', gap: 10, marginBottom: 0 }}>
            {[
              { emoji: '\u26A1', label: 'Snel', sub: '< 30 sec' },
              { emoji: '\uD83D\uDD12', label: 'Veilig', sub: 'SSL encrypted' },
              { emoji: '\uD83C\uDF0D', label: '6 talen', sub: 'NL TR EN ...' },
            ].map((item, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.04)', borderRadius: 18, padding: '14px 16px', width: 110,
                border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center',
              }}>
                <span style={{ fontSize: 26 }}>{item.emoji}</span>
                <p style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.7)', marginTop: 6 }}>{item.label}</p>
                <p style={{ fontSize: 8, fontWeight: 600, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>{item.sub}</p>
              </div>
            ))}
          </div>

          <div style={{ position: 'absolute', bottom: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{
              background: 'linear-gradient(135deg, #DFFF00 0%, #C8E600 100%)', borderRadius: 16, padding: '16px 56px',
              boxShadow: '0 10px 40px rgba(223,255,0,0.35)',
            }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: '#1A1A1A', letterSpacing: -0.3 }}>Download nu gratis</span>
            </div>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontWeight: 500 }}>Beschikbaar op iOS</span>
          </div>
        </div>}

        {/* AFIS 2: Dashboard + tum bayraklar */}
        {current === 1 && <div ref={ref2} style={{
          width: 430, height: 932, borderRadius: 20, overflow: 'hidden', flexShrink: 0,
          background: 'linear-gradient(180deg, #DFFF00 0%, #B8D900 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '50px 30px 30px',
        }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: '#1A1A1A', textAlign: 'center', lineHeight: 1.2, marginBottom: 8 }}>
            Facturen versturen<br/>in seconden
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(26,26,26,0.6)', fontWeight: 600, marginBottom: 16 }}>Snel, simpel en professioneel</p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {['\u{1F1F3}\u{1F1F1}','\u{1F1F9}\u{1F1F7}','\u{1F1EC}\u{1F1E7}','\u{1F1F8}\u{1F1E6}','\u{1F1E7}\u{1F1EC}','\u{1F1F5}\u{1F1F1}'].map((f, i) => (
              <div key={i} style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{f}</div>
            ))}
          </div>
          <PhoneFrame><Screen1Content /></PhoneFrame>
          <div style={{ marginTop: 'auto', paddingTop: 16 }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: '#1A1A1A', opacity: 0.3 }}>numr</span>
          </div>
        </div>}

        {/* AFIS 3: Coklu dil */}
        {current === 2 && <div ref={ref3} style={{
          width: 430, height: 932, borderRadius: 20, overflow: 'hidden', flexShrink: 0,
          background: 'linear-gradient(180deg, #F8FAFC 0%, #E2E8F0 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '50px 30px 30px',
          position: 'relative',
        }}>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: '#1A1A1A', textAlign: 'center', lineHeight: 1.2, marginBottom: 6 }}>
            De slimste manier om<br/>facturen te versturen
          </h2>
          <p style={{ fontSize: 13, color: '#64748B', fontWeight: 600, marginBottom: 30 }}>6 talen beschikbaar</p>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { flag: '\u{1F1F3}\u{1F1F1}', lang: 'Nederlands', text: 'Verstuur eenvoudig facturen in het Nederlands', color: '#FF6B00' },
              { flag: '\u{1F1F9}\u{1F1F7}', lang: 'T\u00FCrk\u00E7e', text: 'T\u00FCrk\u00E7e olarak kolayca fatura g\u00F6nderin', color: '#E30A17' },
              { flag: '\u{1F1EC}\u{1F1E7}', lang: 'English', text: 'Send invoices easily in English', color: '#003078' },
              { flag: '\u{1F1F8}\u{1F1E6}', lang: '\u0627\u0644\u0639\u0631\u0628\u064A\u0629', text: '\u0623\u0631\u0633\u0644 \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631 \u0628\u0633\u0647\u0648\u0644\u0629 \u0628\u0627\u0644\u0639\u0631\u0628\u064A\u0629', color: '#006C35' },
              { flag: '\u{1F1E7}\u{1F1EC}', lang: '\u0411\u044A\u043B\u0433\u0430\u0440\u0441\u043A\u0438', text: '\u0418\u0437\u043F\u0440\u0430\u0449\u0430\u0439\u0442\u0435 \u0444\u0430\u043A\u0442\u0443\u0440\u0438 \u043B\u0435\u0441\u043D\u043E \u043D\u0430 \u0431\u044A\u043B\u0433\u0430\u0440\u0441\u043A\u0438', color: '#00966E' },
              { flag: '\u{1F1F5}\u{1F1F1}', lang: 'Polski', text: 'Wysy\u0142aj faktury \u0142atwo po polsku', color: '#DC143C' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 20,
                background: '#FFFFFF', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                border: '1px solid rgba(0,0,0,0.04)',
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{item.flag}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A' }}>{item.lang}</p>
                  <p style={{ fontSize: 10, fontWeight: 500, color: '#94A3B8', marginTop: 2 }}>{item.text}</p>
                </div>
                <div style={{ width: 8, height: 8, borderRadius: 4, background: item.color, flexShrink: 0 }} />
              </div>
            ))}
          </div>

          <div style={{ marginTop: 'auto', paddingTop: 20, textAlign: 'center' }}>
            <div style={{ display: 'inline-block', background: '#DFFF00', borderRadius: 14, padding: '12px 36px', boxShadow: '0 6px 24px rgba(223,255,0,0.25)', marginBottom: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 900, color: '#1A1A1A' }}>Kies uw taal en begin</span>
            </div>
            <p style={{ fontSize: 24, fontWeight: 900, color: '#1A1A1A', opacity: 0.15 }}>numr</p>
          </div>
        </div>}
      </div>
    </div>
  );
}
