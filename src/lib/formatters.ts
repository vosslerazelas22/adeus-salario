import { AggregateSummary, Category, ExpenseWithDetails, PeriodBounds, PeriodType, UserProfile } from '../types';

/**
 * Formats monetary number into Brazilian Real (BRL) string.
 * Example: 10 -> "R$ 10,00", 1250.5 -> "R$ 1.250,50"
 */
export function formatBRL(amount: number): string {
  const safeAmount = isNaN(amount) ? 0 : amount;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeAmount);
}

/**
 * Safely parses input string into rounded number with max 2 decimals.
 */
export function parseBRLInput(value: string): number {
  if (!value) return 0;
  // Remove currency symbol and whitespace
  let cleanStr = value.replace(/R\$\s?/, '').trim();
  // Handle Brazilian formatting (1.250,50 -> 1250.50)
  if (cleanStr.includes(',')) {
    cleanStr = cleanStr.replace(/\./g, '').replace(',', '.');
  }
  const parsed = parseFloat(cleanStr);
  return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
}

/**
 * Format YYYY-MM-DD into a localized Brazilian Portuguese date (e.g., "12 de Agosto de 2026")
 */
export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  const dateObj = new Date(year, month - 1, day);
  
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (
    dateObj.getFullYear() === today.getFullYear() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getDate() === today.getDate()
  ) {
    return 'Hoje';
  } else if (
    dateObj.getFullYear() === yesterday.getFullYear() &&
    dateObj.getMonth() === yesterday.getMonth() &&
    dateObj.getDate() === yesterday.getDate()
  ) {
    return 'Ontem';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: dateObj.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  }).format(dateObj);
}

/**
 * Calculates start and end bounds for period filtering (Day, Week, Month, Quarter, Year).
 */
export function getPeriodBounds(periodType: PeriodType, targetDate: Date): PeriodBounds {
  const date = new Date(targetDate);
  let startDate = new Date(date);
  let endDate = new Date(date);
  let formattedLabel = '';

  switch (periodType) {
    case 'day': {
      startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
      endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
      
      const today = new Date();
      if (date.toDateString() === today.toDateString()) {
        formattedLabel = 'Hoje';
      } else {
        formattedLabel = new Intl.DateTimeFormat('pt-BR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(date);
      }
      break;
    }
    case 'week': {
      // Start on Monday in Brazil standard
      const dayOfWeek = date.getDay();
      const diffToMonday = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      startDate = new Date(date.getFullYear(), date.getMonth(), diffToMonday, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59);

      const startMonth = new Intl.DateTimeFormat('pt-BR', { month: 'short', day: 'numeric' }).format(startDate);
      const endMonth = new Intl.DateTimeFormat('pt-BR', { month: 'short', day: 'numeric' }).format(endDate);
      formattedLabel = `Semana: ${startMonth} - ${endMonth}`;
      break;
    }
    case 'month': {
      startDate = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0);
      endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
      
      const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);
      formattedLabel = monthName.charAt(0).toUpperCase() + monthName.slice(1);
      break;
    }
    case 'quarter': {
      const quarterIndex = Math.floor(date.getMonth() / 3);
      startDate = new Date(date.getFullYear(), quarterIndex * 3, 1, 0, 0, 0);
      endDate = new Date(date.getFullYear(), (quarterIndex + 1) * 3, 0, 23, 59, 59);
      
      formattedLabel = `${quarterIndex + 1}º Trimestre ${date.getFullYear()}`;
      break;
    }
    case 'year': {
      startDate = new Date(date.getFullYear(), 0, 1, 0, 0, 0);
      endDate = new Date(date.getFullYear(), 11, 31, 23, 59, 59);
      formattedLabel = `${date.getFullYear()}`;
      break;
    }
  }

  return { startDate, endDate, formattedLabel };
}

/**
 * Moves date forward or backward based on period step.
 */
export function navigatePeriod(periodType: PeriodType, currentDate: Date, direction: 'prev' | 'next'): Date {
  const newDate = new Date(currentDate);
  const multiplier = direction === 'next' ? 1 : -1;

  switch (periodType) {
    case 'day':
      newDate.setDate(newDate.getDate() + multiplier);
      break;
    case 'week':
      newDate.setDate(newDate.getDate() + multiplier * 7);
      break;
    case 'month':
      newDate.setMonth(newDate.getMonth() + multiplier);
      break;
    case 'quarter':
      newDate.setMonth(newDate.getMonth() + multiplier * 3);
      break;
    case 'year':
      newDate.setFullYear(newDate.getFullYear() + multiplier);
      break;
  }

  return newDate;
}

/**
 * Computes expense aggregations (Total, Category totals, User totals).
 */
export function calculateAggregates(
  expenses: ExpenseWithDetails[],
  categories: Category[],
  profiles: UserProfile[]
): AggregateSummary {
  const totalAmount = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const expenseCount = expenses.length;

  // Category map
  const catMap = new Map<string, { category: Category; total: number; count: number }>();
  categories.forEach((cat) => {
    catMap.set(cat.id, { category: cat, total: 0, count: 0 });
  });

  // User map
  const userMap = new Map<string, { user: UserProfile; total: number; count: number }>();
  profiles.forEach((p) => {
    userMap.set(p.id, { user: p, total: 0, count: 0 });
  });

  expenses.forEach((e) => {
    // Category aggregation
    const catEntry = catMap.get(e.category_id) || {
      category: e.category || { id: e.category_id, name: 'Outros', icon: 'FolderKanban', color: 'slate' },
      total: 0,
      count: 0,
    };
    catEntry.total += e.amount;
    catEntry.count += 1;
    catMap.set(e.category_id, catEntry);

    // User aggregation
    const userEntry = userMap.get(e.user_id) || {
      user: e.user || { id: e.user_id, display_name: 'Usuário', role_title: 'Membro' },
      total: 0,
      count: 0,
    };
    userEntry.total += e.amount;
    userEntry.count += 1;
    userMap.set(e.user_id, userEntry);
  });

  const byCategory = Array.from(catMap.values())
    .filter((c) => c.count > 0)
    .map((c) => ({
      ...c,
      percentage: totalAmount > 0 ? Math.round((c.total / totalAmount) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  const byUser = Array.from(userMap.values())
    .map((u) => ({
      ...u,
      percentage: totalAmount > 0 ? Math.round((u.total / totalAmount) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  return {
    totalAmount,
    expenseCount,
    byCategory,
    byUser,
  };
}
