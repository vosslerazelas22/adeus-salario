import React from 'react';
import { BarChart3, PieChart, Users, TrendingUp, DollarSign } from 'lucide-react';
import { AggregateSummary, ExpenseWithDetails, PeriodBounds } from '../types';
import { formatBRL } from '../lib/formatters';
import { getCategoryDisplayName } from '../lib/constants';
import { CategoryIcon } from './CategoryIcon';
import { useTheme } from '../context/ThemeContext';
import { getMemberProfileColor } from '../lib/profileColors';

interface AnalyticsViewProps {
  summary: AggregateSummary;
  expenses: ExpenseWithDetails[];
  bounds: PeriodBounds;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  summary,
  expenses,
  bounds,
}) => {
  const { totalAmount, expenseCount, byCategory, byUser } = summary;
  const { colors } = useTheme();

  // Compute monthly totals
  const monthlyTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    if (!e.expense_date) return;
    const monthKey = e.expense_date.substring(0, 7); // YYYY-MM
    monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + e.amount;
  });

  const sortedMonthKeys = Object.keys(monthlyTotals).sort().slice(-6);
  const maxMonthly = Math.max(...Object.values(monthlyTotals), 1);

  return (
    <div className="p-4 space-y-6 max-w-3xl mx-auto pb-24">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <DollarSign className={`w-3.5 h-3.5 ${colors.primaryText}`} />
            Total no Período
          </span>
          <div className="text-2xl font-extrabold text-white tracking-tight">
            {formatBRL(totalAmount)}
          </div>
          <span className="text-[11px] text-slate-500 block">{bounds.formattedLabel}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
            Média por Lançamento
          </span>
          <div className="text-2xl font-extrabold text-white tracking-tight">
            {formatBRL(expenseCount > 0 ? totalAmount / expenseCount : 0)}
          </div>
          <span className="text-[11px] text-slate-500 block">{expenseCount} registros</span>
        </div>
      </div>

      {/* Household User Split - Uses fixed profile colors */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Users className={`w-4 h-4 ${colors.primaryText}`} />
          <span>Gastos por Integrante da Casa</span>
        </h3>

        {byUser.length === 0 ? (
          <p className="text-xs text-slate-500 italic">Sem registros no período.</p>
        ) : (
          <div className="space-y-3">
            {byUser.map((u) => {
              const profileColor = getMemberProfileColor(u.user.id, u.user.display_name);
              return (
                <div key={u.user.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-200 flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${profileColor.bg}`} />
                      {u.user.display_name} ({u.user.role_title || 'Membro'})
                    </span>
                    <div className="text-right">
                      <span className="text-slate-100 font-bold mr-2">{formatBRL(u.total)}</span>
                      <span className="text-slate-400 text-[11px]">({u.percentage}%)</span>
                    </div>
                  </div>

                  <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div
                      style={{ width: `${u.percentage}%` }}
                      className={`h-full ${profileColor.bg} rounded-full transition-all duration-500`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Category Breakdown - Uses theme accent colors */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <PieChart className={`w-4 h-4 ${colors.primaryText}`} />
          <span>Gastos por Categoria</span>
        </h3>

        {byCategory.length === 0 ? (
          <p className="text-xs text-slate-500 italic">Sem registros para categorizar.</p>
        ) : (
          <div className="space-y-3">
            {byCategory.map((c) => (
              <div key={c.category.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center ${colors.primaryText} border border-slate-700/60`}>
                      <CategoryIcon name={c.category.icon} className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-200 block leading-tight">{getCategoryDisplayName(c.category)}</span>
                      <span className="text-[10px] text-slate-500">{c.count} lançamentos</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-slate-100 block leading-tight">{formatBRL(c.total)}</span>
                    <span className={`text-[11px] ${colors.primaryText} font-medium`}>{c.percentage}%</span>
                  </div>
                </div>

                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    style={{ width: `${c.percentage}%` }}
                    className={`h-full ${colors.primaryBgSolid} rounded-full transition-all duration-500`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Monthly Evolution Bar Chart */}
      {sortedMonthKeys.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <BarChart3 className={`w-4 h-4 ${colors.primaryText}`} />
            <span>Evolução Mensal de Gastos</span>
          </h3>

          <div className="flex items-end justify-between gap-2 h-36 pt-6 px-2">
            {sortedMonthKeys.map((mKey) => {
              const val = monthlyTotals[mKey] || 0;
              const heightPct = Math.max(Math.round((val / maxMonthly) * 100), 10);
              const [y, m] = mKey.split('-');
              const dateObj = new Date(Number(y), Number(m) - 1, 1);
              const monthLabel = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(dateObj);

              return (
                <div key={mKey} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] text-slate-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatBRL(val)}
                  </span>
                  <div className="w-full bg-slate-950 rounded-t-lg flex items-end h-full p-1 border border-slate-800">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full bg-gradient-to-t ${colors.gradientHeader} rounded-md transition-all duration-500`}
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">
                    {monthLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
