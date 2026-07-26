import { Loader2 } from 'lucide-react'; import clsx from 'clsx';
const v = { primary:'btn-primary', secondary:'btn-secondary', danger:'bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-5 rounded-lg', ghost:'text-gray-600 hover:bg-gray-100 font-medium py-2 px-4 rounded-lg' };
export default function Button({ children, variant='primary', size='md', loading=false, disabled=false, className='', icon: Icon, ...props }) {
  return <button className={clsx(v[variant], size==='sm'?'py-1.5 px-3 text-sm':'', 'inline-flex items-center justify-center gap-2', className)} disabled={disabled||loading} {...props}>{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : Icon ? <Icon className="w-4 h-4" /> : null}{children}</button>;
}
