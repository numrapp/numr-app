import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { I18nProvider } from './i18n';
import App from './App';
import './locales/nl';
import './locales/tr';
import './locales/en';
import './locales/fr';
import './locales/es';
import './locales/ar';
import './locales/bg';
import './locales/pl';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </I18nProvider>
    </BrowserRouter>
  </StrictMode>
);
