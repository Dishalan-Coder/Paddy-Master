import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Sprout } from 'lucide-react';
import Footer from '../components/common/Footer';
import LanguageToggle from '../components/common/LanguageToggle';

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f7f2]">
      <header className="flex justify-end px-5 py-5 lg:px-8">
        <LanguageToggle compact />
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-5 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-100">
          <Sprout className="h-10 w-10 text-emerald-700" />
        </div>
        <h1 className="mb-2 text-4xl font-bold">404</h1>
        <p className="mb-6 text-gray-500">{t('common.page_not_found')}</p>
        <Link to="/dashboard" className="btn-primary">
          {t('common.go_home')}
        </Link>
      </main>
      <Footer variant="app" className="mx-5 mb-6 lg:mx-8" />
    </div>
  );
}
