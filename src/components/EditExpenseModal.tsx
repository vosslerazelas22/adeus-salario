import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, ShieldAlert, AlertCircle } from 'lucide-react';
import { Category, ExpenseWithDetails, UserProfile } from '../types';
import { formatBRL, parseBRLInput } from '../lib/formatters';
import { CategoryIcon } from './CategoryIcon';
import { getCategoryDisplayName } from '../lib/constants';
import { useTheme } from '../context/ThemeContext';

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: ExpenseWithDetails | null;
  categories: Category[];
  activeUser: UserProfile;
  onUpdate: (id: string, updates: Partial<ExpenseWithDetails>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
  isOpen,
  onClose,
  expense,
  categories,
  activeUser,
  onUpdate,
  onDelete,
}) => {
  const { colors } = useTheme();
  const [amountStr, setAmountStr] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [expenseDate, setExpenseDate] = useState<string>('');
  const [expenseTime, setExpenseTime] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (isOpen && expense) {
      setAmountStr(expense.amount.toFixed(2).replace('.', ','));
      setDescription(expense.description);
      setCategoryId(expense.category_id);
      setExpenseDate(expense.expense_date);
      setExpenseTime(expense.expense_time || '12:00');
      setShowConfirmDelete(false);
      setErrorMessage('');
      setIsSubmitting(false);
    }
  }, [isOpen, expense]);

  if (!isOpen || !expense) return null;

  const isOwner = expense.user_id === activeUser.id;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isOwner) {
      setErrorMessage('Você só pode editar ou excluir os lançamentos criados por você.');
      return;
    }

    const numericAmount = parseBRLInput(amountStr);
    if (numericAmount <= 0) {
      setErrorMessage('Por favor, informe um valor válido.');
      return;
    }

    if (!description.trim()) {
      setErrorMessage('Por favor, informe uma descrição.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onUpdate(expense.id, {
        amount: numericAmount,
        description: description.trim(),
        category_id: categoryId,
        expense_date: expenseDate,
        expense_time: expenseTime,
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao atualizar o gasto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isOwner) {
      setErrorMessage('Você só pode excluir lançamentos criados por você.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onDelete(expense.id);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao excluir o gasto.');
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
            <div className={`w-8 h-8 rounded-xl bg-slate-800 ${colors.primaryText} border border-slate-700/60 flex items-center justify-center font-bold`}>
              ✏️
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 leading-tight">Editar / Detalhes</h2>
              <p className="text-xs text-slate-400">
                Criado por <span className="text-slate-200 font-medium">{expense.user?.display_name || 'Membro'}</span>
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

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!isOwner && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                Este gasto foi registrado por <strong>{expense.user?.display_name}</strong>. Apenas o autor pode editá-lo ou excluí-lo.
              </span>
            </div>
          )}

          {showConfirmDelete ? (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-3 text-center">
              <h3 className="text-sm font-bold text-rose-300">Tem certeza que deseja excluir?</h3>
              <p className="text-xs text-slate-300">
                Esta ação removerá o gasto de <strong>{formatBRL(expense.amount)}</strong> ({expense.description}) do banco de dados da casa.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all"
                >
                  Confirmar Exclusão
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-4">
              {/* Amount */}
              <div className="space-y-1 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Valor (R$)
                </label>
                <div className="relative flex items-center">
                  <span className={`absolute left-3 text-2xl font-extrabold ${colors.primaryText}`}>R$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={amountStr}
                    disabled={!isOwner}
                    onChange={(e) => setAmountStr(e.target.value)}
                    className="w-full bg-transparent pl-12 pr-3 py-1 text-3xl font-extrabold text-slate-100 focus:outline-none disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Descrição
                </label>
                <input
                  type="text"
                  value={description}
                  disabled={!isOwner}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none ${colors.ringFocus} disabled:opacity-60`}
                />
              </div>

              {/* Category Grid */}
              <div className="space-y-1">
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
                        disabled={!isOwner}
                        onClick={() => setCategoryId(cat.id)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                          isSelected
                            ? `${colors.primaryBadgeBg} ${colors.primaryBorder} ${colors.primaryText}`
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        } disabled:opacity-50`}
                      >
                        <CategoryIcon name={cat.icon} className="w-4 h-4 mb-1" />
                        <span className="text-[10px] font-semibold truncate max-w-full">
                          {getCategoryDisplayName(cat)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Data
                  </label>
                  <input
                    type="date"
                    value={expenseDate}
                    disabled={!isOwner}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none ${colors.ringFocus} disabled:opacity-60`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Hora
                  </label>
                  <input
                    type="time"
                    value={expenseTime}
                    disabled={!isOwner}
                    onChange={(e) => setExpenseTime(e.target.value)}
                    className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none ${colors.ringFocus} disabled:opacity-60`}
                  />
                </div>
              </div>

              {/* Actions Footer */}
              {isOwner && (
                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmDelete(true)}
                    className="p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all"
                    title="Excluir lançamento"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 py-3 px-4 rounded-xl ${colors.primaryBg} active:scale-[0.99] text-slate-950 font-extrabold text-sm shadow-lg ${colors.primaryShadow} transition-all flex items-center justify-center gap-2`}
                  >
                    <Check className="w-5 h-5 stroke-[2.5]" />
                    <span>Salvar Alterações</span>
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
