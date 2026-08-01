import { useTranslation } from 'react-i18next';
import {
  formatCurrency,
  formatDate,
  formatExpenseCategory,
} from '../../utils/formatters';
import Loader from '../common/Loader';

export default function ExpenseList({ expenses, loading }) {
  const { t } = useTranslation();
  if (loading) return <Loader />;
  if (!expenses?.length)
    return (
      <p className="py-8 text-center text-sm text-slate-400">
        {t('pages.expenses.none')}
      </p>
    );
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="pb-3 font-semibold text-slate-600">
              {t('common.date')}
            </th>
            <th className="pb-3 font-semibold text-slate-600">
              {t('common.category')}
            </th>
            <th className="pb-3 font-semibold text-slate-600">
              {t('description')}
            </th>
            <th className="pb-3 text-right font-semibold text-slate-600">
              {t('common.amount')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {expenses.map((expense) => (
            <tr key={expense._id} className="hover:bg-slate-50">
              <td className="py-3 text-slate-500">
                {formatDate(expense.expense_date)}
              </td>
              <td className="py-3">
                <span className="badge-amber">
                  {formatExpenseCategory(expense.category)}
                </span>
              </td>
              <td className="py-3 text-slate-700">{expense.description}</td>
              <td className="py-3 text-right font-semibold">
                {formatCurrency(expense.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
