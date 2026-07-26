import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
export default function ProfitLossDisplay({ data }) {
  if (!data) return null;
  const isP = data.profit_loss >= 0;
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="card border-l-4 border-l-amber-500">
        <p className="text-sm text-slate-500">Spent</p>
        <p className="mt-1 text-xl font-bold text-amber-700">
          {formatCurrency(data.total_expenses)}
        </p>
      </div>
      <div className="card border-l-4 border-l-paddy-600">
        <p className="text-sm text-slate-500">Earned</p>
        <p className="mt-1 text-xl font-bold text-paddy-700">
          {formatCurrency(data.total_earnings)}
        </p>
      </div>
      <div
        className={`card border-l-4 ${isP ? 'border-l-green-500' : 'border-l-red-500'}`}
      >
        <p className="text-sm text-slate-500">Profit/Loss</p>
        <div className="mt-1 flex items-center gap-2">
          {isP ? (
            <TrendingUp className="h-5 w-5 text-green-600" />
          ) : (
            <TrendingDown className="h-5 w-5 text-red-500" />
          )}
          <p
            className={`text-xl font-bold ${isP ? 'text-green-700' : 'text-red-700'}`}
          >
            {formatCurrency(Math.abs(data.profit_loss))}
          </p>
        </div>
      </div>
    </div>
  );
}
