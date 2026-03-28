import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useI18n } from '../i18n';

export default function PrivacyPage() {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col safe-top">
      <div className="px-6 pt-6 flex items-center gap-3 mb-4 flex-shrink-0">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-gray-100"><ArrowLeft size={22} /></button>
        <h1 className="text-lg font-extrabold text-dark">{t('legal.privacy')}</h1>
      </div>
      <div className="page-scroll px-6 pb-10">
        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed space-y-4">
          <h2 className="text-base font-extrabold text-dark">Privacybeleid - numr</h2>
          <p className="text-xs text-gray-400">Laatst bijgewerkt: maart 2026</p>

          <h3 className="text-sm font-bold text-dark mt-6">1. Welke gegevens verzamelen wij?</h3>
          <p className="text-sm">Wij verzamelen de volgende persoonsgegevens: naam, e-mailadres, bedrijfsnaam, KVK-nummer, BTW-nummer, IBAN, telefoonnummer en adresgegevens. Deze gegevens worden verstrekt bij het aanmaken van een account.</p>

          <h3 className="text-sm font-bold text-dark mt-6">2. Waarom verzamelen wij deze gegevens?</h3>
          <p className="text-sm">Wij gebruiken uw gegevens voor: het aanmaken en beheren van uw account, het genereren van facturen, het versturen van facturen per e-mail, en het verbeteren van onze dienstverlening.</p>

          <h3 className="text-sm font-bold text-dark mt-6">3. Hoe lang bewaren wij uw gegevens?</h3>
          <p className="text-sm">Wij bewaren uw persoonsgegevens niet langer dan strikt noodzakelijk is. Factuurgegevens worden 7 jaar bewaard conform de fiscale bewaarplicht.</p>

          <h3 className="text-sm font-bold text-dark mt-6">4. Delen met derden</h3>
          <p className="text-sm">Wij verkopen uw gegevens niet aan derden. Wij delen gegevens alleen wanneer dit noodzakelijk is voor de dienstverlening (bijv. e-mailverzending via uw SMTP-server).</p>

          <h3 className="text-sm font-bold text-dark mt-6">5. Uw rechten</h3>
          <p className="text-sm">U heeft het recht om uw persoonsgegevens in te zien, te corrigeren of te verwijderen. U kunt hiervoor contact opnemen via de app.</p>

          <h3 className="text-sm font-bold text-dark mt-6">6. Beveiliging</h3>
          <p className="text-sm">Wij nemen passende technische en organisatorische maatregelen om uw persoonsgegevens te beschermen tegen ongeoorloofde toegang, verlies of diefstal.</p>

          <h3 className="text-sm font-bold text-dark mt-6">7. Cookies</h3>
          <p className="text-sm">Wij gebruiken alleen functionele cookies die noodzakelijk zijn voor het functioneren van de app. Wij gebruiken geen tracking cookies.</p>

          <h3 className="text-sm font-bold text-dark mt-6">8. Contact</h3>
          <p className="text-sm">Voor vragen over dit privacybeleid kunt u contact opnemen via de app of per e-mail.</p>
        </div>
      </div>
    </div>
  );
}
