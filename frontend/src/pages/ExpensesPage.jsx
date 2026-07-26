import { useState } from 'react';
import ExpenseForm from '../components/expenses/ExpenseForm';
import ExpenseList from '../components/expenses/ExpenseList';
import ProfitLossDisplay from '../components/expenses/ProfitLossDisplay';
import ErrorAlert from '../components/common/ErrorAlert';
import useFetch from '../hooks/useFetch';
import cropService from '../services/cropService';
import expenseService from '../services/expenseService';
import { getApiErrorMessage } from '../utils/forms';

export default function ExpensesPage() {
  const [adding, setAdding] = useState(false);
  const [actionError, setActionError] = useState('');
  const {
    data: expenses,
    loading: expensesLoading,
    error: expensesError,
    refetch: refetchExpenses,
  } = useFetch(() => expenseService.getAll(), []);
  const { data: profitLoss, refetch: refetchProfitLoss } = useFetch(
    () => expenseService.getProfitLoss(),
    [],
  );
  const { data: crops } = useFetch(() => cropService.getAll(), []);

  const add = async (data) => {
    setAdding(true);
    setActionError('');
    try {
      await expenseService.add(data);
      await Promise.all([refetchExpenses(), refetchProfitLoss()]);
    } catch (requestError) {
      const message = getApiErrorMessage(
        requestError,
        'Could not add the expense.',
      );
      setActionError(message);
      throw new Error(message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <p className="page-kicker">Cost control</p>
        <h1 className="page-title">Expenses</h1>
        <p className="page-copy">
          Record crop and general farm costs, then compare spending against
          delivered-order earnings.
        </p>
      </div>
      <ErrorAlert
        message={expensesError || actionError}
        onDismiss={() => setActionError('')}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <ProfitLossDisplay data={profitLoss} />
          <div className="card">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-black">All expenses</h2>
              <span className="text-xs font-bold text-slate-400">
                {expenses?.length || 0} records
              </span>
            </div>
            <ExpenseList expenses={expenses} loading={expensesLoading} />
          </div>
        </div>
        <aside className="card h-fit">
          <h2 className="font-black">Add expense</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Use crop-specific expenses when you want recommendations and profit
            views to stay precise.
          </p>
          <div className="mt-5">
            <ExpenseForm
              cropOptions={crops}
              onSubmit={add}
              loading={adding}
              serverError={actionError}
              onDismissServerError={() => setActionError('')}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
