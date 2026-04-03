import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../i18n';
import api from '../services/api';

export default function TermsAgreementPage() {
  const { t } = useI18n();
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      await api.post('/auth/accept-terms');
      await refreshUser();
      navigate('/subscription');
    } catch {} finally { setLoading(false); }
  };

  return (
    <div className="h-full flex flex-col safe-top bg-white">
      <div className="px-6 pt-6 flex items-center gap-3 mb-4 flex-shrink-0">
        <Shield size={22} className="text-brand" />
        <h1 className="text-lg font-extrabold text-dark">{t('terms.title')}</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-4">
        <div className="prose prose-sm max-w-none text-gray-700 text-[13px] leading-relaxed space-y-4">
          <h3 className="text-base font-extrabold text-dark">Gebruiksvoorwaarden numr</h3>
          <p className="text-[11px] text-gray-400">Laatst bijgewerkt: april 2026</p>

          <h4 className="font-bold text-dark text-sm">1. Definities</h4>
          <p>"numr" verwijst naar de mobiele applicatie en webapplicatie voor facturatie, ontwikkeld en beheerd door MRE Finance, gevestigd te Nederland. "Gebruiker" verwijst naar iedere natuurlijke of rechtspersoon die een account aanmaakt en gebruik maakt van numr.</p>

          <h4 className="font-bold text-dark text-sm">2. Dienstverlening</h4>
          <p>numr biedt een platform voor het aanmaken, beheren en verzenden van facturen en offertes. De dienst is bedoeld voor zakelijk gebruik door ondernemers en ZZP'ers in Nederland.</p>

          <h4 className="font-bold text-dark text-sm">3. Accountregistratie</h4>
          <p>De gebruiker garandeert dat alle verstrekte gegevens juist en volledig zijn. Het is niet toegestaan een account aan te maken met valse of misleidende informatie.</p>

          <h4 className="font-bold text-dark text-sm">4. Verplichtingen van de Gebruiker</h4>
          <p>De gebruiker is verantwoordelijk voor de juistheid van alle ingevoerde factuurgegevens. numr is niet aansprakelijk voor onjuiste facturatie door de gebruiker. De gebruiker dient zich te houden aan alle geldende fiscale en wettelijke verplichtingen.</p>

          <h4 className="font-bold text-dark text-sm">5. Privacy & Gegevensbescherming</h4>
          <p>numr verwerkt persoonsgegevens conform de Algemene Verordening Gegevensbescherming (AVG). Gegevens worden niet gedeeld met derden zonder uitdrukkelijke toestemming, tenzij wettelijk vereist.</p>

          <h4 className="font-bold text-dark text-sm">6. Intellectueel Eigendom</h4>
          <p>Alle rechten op de software, het ontwerp en de inhoud van numr berusten bij MRE Finance. Het is niet toegestaan de applicatie te kopieren, te wijzigen of te reverse-engineeren.</p>

          <h4 className="font-bold text-dark text-sm">7. Aansprakelijkheid</h4>
          <p>numr wordt aangeboden "as is". MRE Finance is niet aansprakelijk voor directe of indirecte schade voortvloeiend uit het gebruik van de applicatie, waaronder maar niet beperkt tot verlies van gegevens, gemiste inkomsten of onjuiste berekeningen.</p>

          <h4 className="font-bold text-dark text-sm">8. Abonnement & Betaling</h4>
          <p>Het gebruik van numr vereist een actief abonnement. Abonnementosten worden maandelijks of jaarlijks in rekening gebracht. Bij niet-betaling kan de toegang worden opgeschort.</p>

          <h4 className="font-bold text-dark text-sm">9. Beeindiging</h4>
          <p>De gebruiker kan het abonnement op elk moment opzeggen. MRE Finance behoudt het recht om accounts te beeindigen bij misbruik of schending van deze voorwaarden.</p>

          <h4 className="font-bold text-dark text-sm">10. Toepasselijk Recht</h4>
          <p>Op deze overeenkomst is Nederlands recht van toepassing. Geschillen worden voorgelegd aan de bevoegde rechter te Amsterdam.</p>
        </div>
      </div>

      <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 safe-bottom">
        <label className="flex items-start gap-3 mb-4 cursor-pointer" onClick={() => setAccepted(!accepted)}>
          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${accepted ? 'bg-brand border-brand' : 'border-gray-300'}`}>
            {accepted && <svg className="w-4 h-4 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
          </div>
          <span className="text-sm text-dark font-medium leading-tight">{t('terms.agree')}</span>
        </label>
        <button onClick={handleAccept} disabled={!accepted || loading}
          className="btn-brand w-full disabled:opacity-40">
          {loading ? '...' : t('terms.continue')}
        </button>
      </div>
    </div>
  );
}
