import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useI18n } from '../i18n';

export default function TermsPage() {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col safe-top">
      <div className="px-6 pt-6 flex items-center gap-3 mb-4 flex-shrink-0">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-gray-100"><ArrowLeft size={22} /></button>
        <h1 className="text-lg font-extrabold text-dark">{t('legal.terms')}</h1>
      </div>
      <div className="page-scroll px-6 pb-10">
        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed space-y-4">
          <h2 className="text-base font-extrabold text-dark">Algemene Voorwaarden - numr</h2>
          <p className="text-xs text-gray-400">Laatst bijgewerkt: maart 2026</p>

          <h3 className="text-sm font-bold text-dark mt-6">1. Definities</h3>
          <p className="text-sm">numr: de applicatie voor het aanmaken, versturen en beheren van facturen. Gebruiker: iedere natuurlijke of rechtspersoon die gebruik maakt van de app.</p>

          <h3 className="text-sm font-bold text-dark mt-6">2. Toepasselijkheid</h3>
          <p className="text-sm">Deze voorwaarden zijn van toepassing op elk gebruik van de numr app. Door het aanmaken van een account gaat u akkoord met deze voorwaarden.</p>

          <h3 className="text-sm font-bold text-dark mt-6">3. Gebruik van de dienst</h3>
          <p className="text-sm">U bent verantwoordelijk voor de juistheid van de gegevens die u invoert. De gegenereerde facturen zijn informatief; u bent zelf verantwoordelijk voor de fiscale juistheid.</p>

          <h3 className="text-sm font-bold text-dark mt-6">4. Account</h3>
          <p className="text-sm">U bent verantwoordelijk voor het geheimhouden van uw inloggegevens. Bij vermoeden van ongeautoriseerd gebruik dient u ons direct te informeren.</p>

          <h3 className="text-sm font-bold text-dark mt-6">5. Aansprakelijkheid</h3>
          <p className="text-sm">numr is niet aansprakelijk voor schade die voortvloeit uit het gebruik van de app, waaronder maar niet beperkt tot onjuiste factuurberekeningen of het niet aankomen van e-mails.</p>

          <h3 className="text-sm font-bold text-dark mt-6">6. Intellectueel eigendom</h3>
          <p className="text-sm">Alle rechten van intellectueel eigendom op de app en de inhoud daarvan berusten bij numr.</p>

          <h3 className="text-sm font-bold text-dark mt-6">7. Beeindiging</h3>
          <p className="text-sm">U kunt uw account op elk moment verwijderen. Wij behouden het recht om accounts te blokkeren bij misbruik.</p>

          <h3 className="text-sm font-bold text-dark mt-6">8. Toepasselijk recht</h3>
          <p className="text-sm">Op deze voorwaarden is Nederlands recht van toepassing. Geschillen worden voorgelegd aan de bevoegde rechter te Amsterdam.</p>
        </div>
      </div>
    </div>
  );
}
