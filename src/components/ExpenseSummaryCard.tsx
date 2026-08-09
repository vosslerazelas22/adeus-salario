import React from 'react';
import { Plus, Users, Receipt } from 'lucide-react';
import { AggregateSummary, PeriodBounds } from '../types';
import { formatBRL } from '../lib/formatters';
import { useTheme } from '../context/ThemeContext';
import { getMemberProfileColor } from '../lib/profileColors';

interface ExpenseSummaryCardProps {
  summary: AggregateSummary;
  bounds: PeriodBounds;
  onOpenAddModal: () => void;
}

export const ExpenseSummaryCard: React.FC<ExpenseSummaryCardProps> = ({
  summary,
  bounds,
  onOpenAddModal,
}) => {
  const { totalAmount, expenseCount, byUser } = summary;
  const { colors } = useTheme();

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 p-4 sm:p-5 border-b border-slate-800 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className={`text-xs font-semibold ${colors.primaryText} uppercase tracking-wider block`}>
            {bounds.formattedLabel}
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
            {formatBRL(totalAmount)}
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
            <Receipt className="w-3.5 h-3.5 text-slate-500" />
            <span>{expenseCount} {expenseCount === 1 ? 'gasto registrado' : 'gastos registrados'}</span>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={onOpenAddModal}
          className={`${colors.primaryBg} active:scale-95 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-lg ${colors.primaryShadow} flex items-center gap-2 text-sm transition-all shrink-0 cursor-pointer`}
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Novo Gasto</span>
        </button>
      </div>

      {/* Household User Split Bar */}
      {byUser.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1 text-slate-300">
              <Users className={`w-3.5 h-3.5 ${colors.primaryText}`} />
              Divisão da Casa
            </span>
            <span>Total: {formatBRL(totalAmount)}</span>
          </div>

          {/* Dual Multi-color Progress bar using fixed profile colors */}
          <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden flex p-0.5 border border-slate-800">
            {byUser.map((u) => {
              const profileColor = getMemberProfileColor(u.user.id, u.user.display_name);
              return (
                <div
                  key={u.user.id}
                  style={{ width: `${u.percentage}%` }}
                  className={`h-full ${profileColor.bg} rounded-full transition-all duration-500`}
                  title={`${u.user.display_name}: ${formatBRL(u.total)} (${u.percentage}%)`}
                />
              );
            })}
          </div>

          {/* User Breakdown Cards using fixed profile colors */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {byUser.map((u) => {
              const profileColor = getMemberProfileColor(u.user.id, u.user.display_name);
              return (
                <div
                  key={u.user.id}
                  className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/80 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${profileColor.bg}`} />
                    <div>
                      <span className="block text-xs font-semibold text-slate-200 leading-none">
                        {u.user.display_name}
                      </span>
                      <span className="text-[10px] text-slate-400">{u.count} itens ({u.percentage}%)</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-100">
                    {formatBRL(u.total)}
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
