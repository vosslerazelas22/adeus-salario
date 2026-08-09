export type PeriodType = 'day' | 'week' | 'month' | 'quarter' | 'year';

export interface UserProfile {
  id: string;
  display_name: string;
  role_title?: string; // e.g., "Me", "Wife", "Husband", "Partner"
  avatar_color?: string; // Tailwind color class
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon identifier
  color: string; // Tailwind color string
  created_at?: string;
}

export interface Expense {
  id: string;
  user_id: string;
  category_id: string;
  amount: number; // Stored safely as number (representing 2 decimal places)
  description: string;
  expense_date: string; // YYYY-MM-DD
  expense_time: string; // HH:MM
  created_at?: string;
  updated_at?: string;
}

export interface ExpenseWithDetails extends Expense {
  category?: Category;
  user?: UserProfile;
}

export interface ExpenseFilter {
  periodType: PeriodType;
  selectedDate: Date;
  categoryId?: string | null;
  userId?: string | null;
  searchQuery?: string;
}

export interface PeriodBounds {
  startDate: Date;
  endDate: Date;
  formattedLabel: string;
}

export interface AggregateSummary {
  totalAmount: number;
  expenseCount: number;
  byCategory: {
    category: Category;
    total: number;
    count: number;
    percentage: number;
  }[];
  byUser: {
    user: UserProfile;
    total: number;
    count: number;
    percentage: number;
  }[];
}
