import { AlertCircle, X } from 'lucide-react';
export default function ErrorAlert({ message, onDismiss }) {
  if(!message) return null;
  return <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg animate-fadeIn"><AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" /><p className="text-sm text-red-700 flex-1">{message}</p>{onDismiss && <button onClick={onDismiss} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>}</div>;
}
