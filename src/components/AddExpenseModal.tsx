import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import { Category, UserProfile } from '../types';
import { QUICK_DESCRIPTIONS, getCategoryDisplayName } from '../lib/constants';
import { parseBRLInput } from '../lib/formatters';
import { CategoryIcon } from './CategoryIcon';
import { useTheme } from '../context/ThemeContext';
import { getMemberProfileColor } from '../lib/profileColors';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  activeUser: UserProfile;
  onSave: (expenseData: {
    amount: number;
    description: string;
    category_id: string;
    expense_date: string;
    expense_time: string;
    user_id: string;
  }) => Promise<void>;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  categories,
  activeUser,
  onSave,
}) => {
  const { colors } = useTheme();
  const [amountStr, setAmountStr] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [expenseDate, setExpenseDate] = useState<string>('');
  const [expenseTime, setExpenseTime] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const userProfileColor = getMemberProfileColor(activeUser.id, activeUser.display_name);

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      setAmountStr('');
      setDescription('');
      setCategoryId(categories[0]?.id || 'cat-food');
      setExpenseDate(now.toISOString().split('T')[0]);
      setExpenseTime(now.toTimeString().slice(0, 5));
      setErrorMessage('');
      setIsSubmitting(false);
    }
  }, [isOpen, categories]);

  if (!isOpen) return null;

  const handleQuickAddAmount = (addValue: number) => {
    const current = parseBRLInput(amountStr);
    const updated = Math.round((current + addValue) * 100) / 100;
    setAmountStr(updated.toFixed(2).replace('.', ','));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const numericAmount = parseBRLInput(amountStr);

    if (numericAmount <= 0) {
      setErrorMessage('Por favor, informe um valor maior que R$ 0,00.');
      return;
    }

    if (!description.trim()) {
      setErrorMessage('Por favor, informe uma descrição para o gasto.');
      return;
    }

    if (!categoryId) {
      setErrorMessage('Por favor, selecione uma categoria.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        amount: numericAmount,
        description: description.trim(),
        category_id: categoryId,
        expense_date: expenseDate,
        expense_time: expenseTime,
        user_id: activeUser.id,
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Erro ao salvar o gasto. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl ${colors.primaryBadgeBg} border ${colors.primaryBorder} ${colors.primaryText} flex items-center justify-center font-bold`}>
              💰
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 leading-tight">Novo Gasto</h2>
              <p className="text-xs text-slate-400">
                Registrado por <span className={`${colors.primaryText} font-medium`}>{activeUser.display_name}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Amount Input */}
          <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Valor (R$)
            </label>
            <div className="relative flex items-center">
              <span className={`absolute left-3 text-2xl font-extrabold ${colors.primaryText}`}>R$</span>
              <input
                type="text"
                inputMode="decimal"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="0,00"
                autoFocus
                className="w-full bg-transparent pl-12 pr-3 py-1 text-3xl font-extrabold text-slate-100 placeholder-slate-700 focus:outline-none"
              />
            </div>

            {/* Quick Increment Buttons */}
            <div className="flex items-center gap-1.5 pt-2 overflow-x-auto no-scrollbar">
              {[10, 20, 50, 100, 200].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAddAmount(val)}
                  className={`px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 ${colors.primaryText} text-xs font-bold border border-slate-700/60 transition-all shrink-0 active:scale-95`}
                >
                  +R$ {val}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmountStr('')}
                className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-medium transition-all shrink-0 ml-auto"
              >
                Limpar
              </button>
            </div>
          </div>

          {/* Description Input & Quick Chips */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Descrição
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Mercado, Uber, Conta de Luz..."
              className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none ${colors.ringFocus} transition-all`}
            />

            {/* Quick Suggestions */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
              {QUICK_DESCRIPTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setDescription(item)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700/50 transition-all shrink-0"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Category Visual Grid Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Categoria
            </label>
            <div className="grid grid-cols-4 gap-2">
              {categories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all ${
                      isSelected
                        ? `${colors.primaryBadgeBg} ${colors.primaryBorder} ${colors.primaryText} shadow-md ${colors.primaryShadow}`
                        : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <CategoryIcon name={cat.icon} className="w-5 h-5 mb-1" />
                    <span className="text-[11px] font-semibold truncate max-w-full">
                      {getCategoryDisplayName(cat)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date and Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Data
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none ${colors.ringFocus}`}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Hora
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={expenseTime}
                  onChange={(e) => setExpenseTime(e.target.value)}
                  className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none ${colors.ringFocus}`}
                />
              </div>
            </div>
          </div>

          {/* User Confirmation Indicator with Fixed Profile Color */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Associado ao membro:</span>
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${userProfileColor.bg}`} />
              {activeUser.display_name} ({activeUser.role_title || 'Usuário'})
            </span>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3.5 px-4 rounded-xl ${colors.primaryBg} active:scale-[0.99] text-slate-950 font-extrabold text-sm shadow-xl ${colors.primaryShadow} transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Check className="w-5 h-5 stroke-[2.5]" />
                <span>Salvar Gasto (R$)</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
