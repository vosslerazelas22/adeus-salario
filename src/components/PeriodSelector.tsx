import React from 'react';
import { ChevronLeft, ChevronRight, Calendar, X, Search } from 'lucide-react';
import { Category, PeriodType, UserProfile } from '../types';
import { getPeriodBounds, navigatePeriod } from '../lib/formatters';
import { getCategoryDisplayName } from '../lib/constants';
import { useTheme } from '../context/ThemeContext';

interface PeriodSelectorProps {
  periodType: PeriodType;
  setPeriodType: (p: PeriodType) => void;
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
  selectedCategory: string | null;
  setSelectedCategory: (catId: string | null) => void;
  selectedUser: string | null;
  setSelectedUser: (userId: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categories: Category[];
  profiles: UserProfile[];
}

const PERIOD_OPTIONS: { id: PeriodType; label: string }[] = [
  { id: 'day', label: 'Dia' },
  { id: 'week', label: 'Semana' },
  { id: 'month', label: 'Mês' },
  { id: 'quarter', label: 'Trimestre' },
  { id: 'year', label: 'Ano' },
];

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  periodType,
  setPeriodType,
  selectedDate,
  setSelectedDate,
  selectedCategory,
  setSelectedCategory,
  selectedUser,
  setSelectedUser,
  searchQuery,
  setSearchQuery,
  categories,
  profiles,
}) => {
  const { colors } = useTheme();
  const bounds = getPeriodBounds(periodType, selectedDate);
  const isToday = new Date().toDateString() === selectedDate.toDateString();

  const handleNavigate = (direction: 'prev' | 'next') => {
    const nextDate = navigatePeriod(periodType, selectedDate, direction);
    setSelectedDate(nextDate);
  };

  const handleResetToday = () => {
    setSelectedDate(new Date());
  };

  const hasActiveFilters = selectedCategory !== null || selectedUser !== null || searchQuery !== '';

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedUser(null);
    setSearchQuery('');
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 p-4 space-y-3">
      {/* Period Type Segmented Control */}
      <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar">
        {PERIOD_OPTIONS.map((opt) => {
          const isActive = periodType === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setPeriodType(opt.id)}
              className={`flex-1 min-w-[60px] py-1.5 px-2 text-xs font-semibold rounded-lg transition-all ${
                isActive
                  ? `bg-slate-800 ${colors.primaryText} shadow border border-slate-700/80`
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Date Navigation Control */}
      <div className="flex items-center justify-between bg-slate-850 rounded-xl p-2 bg-slate-800/60 border border-slate-700/50">
        <button
          onClick={() => handleNavigate('prev')}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all active:scale-95"
          aria-label="Período anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center">
          <span className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
            <Calendar className={`w-4 h-4 ${colors.primaryText}`} />
            {bounds.formattedLabel}
          </span>
          {!isToday && (
            <button
              onClick={handleResetToday}
              className={`text-[11px] ${colors.primaryText} hover:underline font-medium mt-0.5`}
            >
              Ir para hoje
            </button>
          )}
        </div>

        <button
          onClick={() => handleNavigate('next')}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all active:scale-95"
          aria-label="Próximo período"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Filter Chips & Search Bar */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar gasto (ex: Ônibus, Mercado)..."
              className={`w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none ${colors.ringFocus} transition-all`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Clear Filters Button if any active */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700/80 text-xs font-medium flex items-center gap-1 hover:bg-slate-750 transition-all shrink-0"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpar</span>
            </button>
          )}
        </div>

        {/* Dropdown Filters for Category & Member */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          {/* Category Filter Pills */}
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className={`bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-medium ${colors.ringFocus} outline-none cursor-pointer`}
          >
            <option value="">Todas as Categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {getCategoryDisplayName(c)}
              </option>
            ))}
          </select>

          {/* Household User Filter Dropdown */}
          <select
            value={selectedUser || ''}
            onChange={(e) => setSelectedUser(e.target.value || null)}
            className={`bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-medium ${colors.ringFocus} outline-none cursor-pointer`}
          >
            <option value="">Todos os Membros</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.display_name} ({p.role_title || 'Membro'})
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
