import React from 'react';
import { Clock, Plus } from 'lucide-react';
import { ExpenseWithDetails, UserProfile } from '../types';
import { formatBRL, formatDateDisplay } from '../lib/formatters';
import { getCategoryDisplayName } from '../lib/constants';
import { CategoryIcon } from './CategoryIcon';
import { useTheme } from '../context/ThemeContext';

interface ExpenseListProps {
  expenses: ExpenseWithDetails[];
  activeUser: UserProfile;
  onSelectExpense: (expense: ExpenseWithDetails) => void;
  onOpenAddModal: () => void;
  isLoading?: boolean;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  activeUser,
  onSelectExpense,
  onOpenAddModal,
  isLoading = false,
}) => {
  const { colors } = useTheme();

  if (isLoading) {
    return (
      <div className="p-8 text-center space-y-3">
        <div className={`w-8 h-8 border-2 ${colors.primaryBorder} border-t-transparent rounded-full animate-spin mx-auto`} />
        <p className="text-xs text-slate-400">Carregando gastos da casa...</p>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="p-10 text-center space-y-4 my-6">
        <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mx-auto text-3xl">
          💸
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-slate-200">Nenhum gasto neste período</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Não foram encontrados lançamentos para os filtros selecionados.
          </p>
        </div>
        <button
          onClick={onOpenAddModal}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${colors.primaryBg} font-bold text-xs transition-all shadow-md ${colors.primaryShadow}`}
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Registrar Primeiro Gasto</span>
        </button>
      </div>
    );
  }

  // Group expenses by date (YYYY-MM-DD)
  const grouped = expenses.reduce((acc, expense) => {
    const key = expense.expense_date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(expense);
    return acc;
  }, {} as Record<string, ExpenseWithDetails[]>);

  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="p-4 space-y-6 pb-24">
      {dates.map((dateStr) => {
        const dayExpenses = grouped[dateStr];
        const dayTotal = dayExpenses.reduce((sum, e) => sum + e.amount, 0);

        return (
          <div key={dateStr} className="space-y-2">
            {/* Date Section Header */}
            <div className="flex items-center justify-between py-1 px-1 border-b border-slate-800/60">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${colors.accentDot}`}></span>
                {formatDateDisplay(dateStr)}
              </span>
              <span className={`text-xs font-bold ${colors.primaryText} ${colors.primaryBadgeBg} px-2 py-0.5 rounded-md border ${colors.primaryBorder}`}>
                {formatBRL(dayTotal)}
              </span>
            </div>

            {/* Expense Cards List */}
            <div className="space-y-2">
              {dayExpenses.map((exp) => {
                const isOwner = exp.user_id === activeUser.id;

                return (
                  <div
                    key={exp.id}
                    onClick={() => onSelectExpense(exp)}
                    className="group bg-slate-900 hover:bg-slate-850 active:bg-slate-800/80 border border-slate-800/90 rounded-2xl p-3.5 flex items-center justify-between gap-3 transition-all cursor-pointer shadow-sm hover:border-slate-700/80"
                  >
                    {/* Left: Icon & Description */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700/60 ${colors.primaryText} group-hover:scale-105 transition-transform`}
                      >
                        <CategoryIcon name={exp.category?.icon} className={`w-5 h-5 ${colors.primaryText}`} />
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-slate-100 truncate leading-tight">
                          {exp.description}
                        </h4>

                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 flex-wrap">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-800 text-[11px] font-medium text-slate-300 border border-slate-700/50">
                            {getCategoryDisplayName(exp.category)}
                          </span>

                          <span className="flex items-center gap-1 text-[11px] text-slate-400">
                            <span className="font-medium text-slate-300">
                              {exp.user?.display_name || 'Membro'}
                            </span>
                            <span>•</span>
                            <Clock className="w-3 h-3 text-slate-500 inline" />
                            <span>{exp.expense_time || '12:00'}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount & Owner Indicator */}
                    <div className="text-right shrink-0">
                      <div className="text-base font-extrabold text-slate-100 tracking-tight">
                        {formatBRL(exp.amount)}
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {isOwner ? 'Criado por você' : `Por ${exp.user?.display_name}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
