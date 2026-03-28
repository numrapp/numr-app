import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import InvoiceCreatePage from './pages/InvoiceCreatePage';
import InvoiceHistoryPage from './pages/InvoiceHistoryPage';
import SettingsPage from './pages/SettingsPage';
import ReceivedInvoicesPage from './pages/ReceivedInvoicesPage';
import ReceivedInvoiceDetailPage from './pages/ReceivedInvoiceDetailPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import AppStoreScreenshots from './pages/AppStoreScreenshots';
import InvoiceEditPage from './pages/InvoiceEditPage';
import CookieBanner from './components/CookieBanner';

function P({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-full flex items-center justify-center bg-white"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden flex flex-col">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/" element={<P><DashboardPage /></P>} />
          <Route path="/invoices/new" element={<P><InvoiceCreatePage docType="invoice" /></P>} />
          <Route path="/credit/new" element={<P><InvoiceCreatePage docType="credit" /></P>} />
          <Route path="/invoices" element={<P><InvoiceHistoryPage /></P>} />
          <Route path="/invoices/edit/:id" element={<P><InvoiceEditPage /></P>} />
          <Route path="/settings" element={<P><SettingsPage /></P>} />
          <Route path="/received" element={<P><ReceivedInvoicesPage /></P>} />
          <Route path="/received/:id" element={<P><ReceivedInvoiceDetailPage /></P>} />
          <Route path="/screenshots" element={<AppStoreScreenshots />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <CookieBanner />
    </div>
  );
}
