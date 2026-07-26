import { useTranslation } from 'react-i18next';
export default function Loader({ fullScreen=false, text }) {
  const { t } = useTranslation(); const l = text || t('loading');
  if(fullScreen) return <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm"><div className="w-10 h-10 border-4 border-paddy-200 border-t-paddy-700 rounded-full animate-spin" /><p className="mt-4 text-sm text-gray-500">{l}</p></div>;
  return <div className="flex flex-col items-center justify-center py-16"><div className="w-8 h-8 border-4 border-paddy-200 border-t-paddy-700 rounded-full animate-spin" /><p className="mt-3 text-sm text-gray-400">{l}</p></div>;
}
