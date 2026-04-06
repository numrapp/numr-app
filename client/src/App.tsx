import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import TermsAgreementPage from './pages/TermsAgreementPage';
import SubscriptionPage from './pages/SubscriptionPage';
import DashboardPage from './pages/DashboardPage';
import InvoiceCreatePage from './pages/InvoiceCreatePage';
import OfferteCreatePage from './pages/OfferteCreatePage';
import InvoiceHistoryPage from './pages/InvoiceHistoryPage';
import SettingsPage from './pages/SettingsPage';
import ReceivedInvoicesPage from './pages/ReceivedInvoicesPage';
import ReceivedInvoiceDetailPage from './pages/ReceivedInvoiceDetailPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import AppStoreScreenshots from './pages/AppStoreScreenshots';
import InvoiceEditPage from './pages/InvoiceEditPage';
import TeaserPage from './pages/TeaserPage';
import StatusPage from './pages/StatusPage';
import VideoPlayerPage from './pages/VideoPlayerPage';
import VideoUploadPage from './pages/VideoUploadPage';
import StatusMessagesPage from './pages/StatusMessagesPage';
import StatusChatPage from './pages/StatusChatPage';
import StatusProfilePage from './pages/StatusProfilePage';
import BottomBar from './components/layout/BottomBar';

function P({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-full flex items-center justify-center bg-white"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!(user as any).terms_accepted) return <Navigate to="/terms-agreement" replace />;
  return <>{children}</>;
}

function AuthOnly({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-full flex items-center justify-center bg-white"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function LoginGuard({ children }: { children: React.ReactNode }) {
  if (!sessionStorage.getItem('teaserShown')) {
    return <Navigate to="/teaser" replace />;
  }
  return <>{children}</>;
}

const NO_BAR = ['/login', '/register', '/privacy', '/terms', '/screenshots', '/forgot-password', '/terms-agreement', '/subscription', '/teaser'];
const FULL_SCREEN = ['/status/video'];

export default function App() {
  const location = useLocation();
  const showBar = !NO_BAR.includes(location.pathname) && !FULL_SCREEN.some(p => location.pathname.startsWith(p));
  const isStatusInternal = location.pathname.startsWith('/status/');

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden flex flex-col">
        <Routes>
          <Route path="/login" element={<LoginGuard><LoginPage /></LoginGuard>} />
          <Route path="/teaser" element={<TeaserPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/terms-agreement" element={<AuthOnly><TermsAgreementPage /></AuthOnly>} />
          <Route path="/subscription" element={<AuthOnly><SubscriptionPage /></AuthOnly>} />
          <Route path="/" element={<P><DashboardPage /></P>} />
          <Route path="/invoices/new" element={<P><InvoiceCreatePage docType="invoice" /></P>} />
          <Route path="/offerte/new" element={<P><OfferteCreatePage /></P>} />
          <Route path="/credit/new" element={<P><InvoiceCreatePage docType="credit" /></P>} />
          <Route path="/invoices" element={<P><InvoiceHistoryPage /></P>} />
          <Route path="/invoices/edit/:id" element={<P><InvoiceEditPage /></P>} />
          <Route path="/settings" element={<P><SettingsPage /></P>} />
          <Route path="/received" element={<P><ReceivedInvoicesPage /></P>} />
          <Route path="/received/:id" element={<P><ReceivedInvoiceDetailPage /></P>} />
          <Route path="/status" element={<P><StatusPage /></P>} />
          <Route path="/status/video/:id" element={<P><VideoPlayerPage /></P>} />
          <Route path="/status/upload" element={<P><VideoUploadPage /></P>} />
          <Route path="/status/messages" element={<P><StatusMessagesPage /></P>} />
          <Route path="/status/chat/:id" element={<P><StatusChatPage /></P>} />
          <Route path="/status/profile" element={<P><StatusProfilePage /></P>} />
          <Route path="/screenshots" element={<AppStoreScreenshots />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {showBar && !isStatusInternal && <BottomBar />}
    </div>
  );
}
