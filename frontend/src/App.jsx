import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';
import AppErrorBoundary from './components/common/AppErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const language = (i18n.resolvedLanguage || i18n.language || 'en').split(
      '-',
    )[0];
    document.documentElement.lang = language === 'ta' ? 'ta' : 'en';
  }, [i18n.language, i18n.resolvedLanguage]);

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppErrorBoundary>
          <AppRoutes />
        </AppErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}
