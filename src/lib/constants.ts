import { Category, UserProfile } from '../types';

export const CATEGORY_NAMES: Record<string, string> = {
  'cat-food': 'Alimentação',
  'cat-transp': 'Transporte',
  'cat-home': 'Casa',
  'cat-shopping': 'Compras',
  'cat-health': 'Saúde',
  'cat-ent': 'Entretenimento',
  'cat-bills': 'Contas',
  'cat-other': 'Outros',
};

export function getCategoryDisplayName(category?: { id?: string; name?: string } | null): string {
  if (!category) return 'Outros';
  if (category.id && CATEGORY_NAMES[category.id]) {
    return CATEGORY_NAMES[category.id];
  }
  const englishMap: Record<string, string> = {
    'Food': 'Alimentação',
    'Transportation': 'Transporte',
    'Home': 'Casa',
    'Shopping': 'Compras',
    'Health': 'Saúde',
    'Entertainment': 'Entretenimento',
    'Bills': 'Contas',
    'Other': 'Outros',
  };
  if (category.name && englishMap[category.name]) {
    return englishMap[category.name];
  }
  return category.name || 'Outros';
}

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-food', name: 'Alimentação', icon: 'Utensils', color: 'emerald' },
  { id: 'cat-transp', name: 'Transporte', icon: 'Bus', color: 'blue' },
  { id: 'cat-home', name: 'Casa', icon: 'Home', color: 'amber' },
  { id: 'cat-shopping', name: 'Compras', icon: 'ShoppingBag', color: 'purple' },
  { id: 'cat-health', name: 'Saúde', icon: 'HeartPulse', color: 'rose' },
  { id: 'cat-ent', name: 'Entretenimento', icon: 'Film', color: 'pink' },
  { id: 'cat-bills', name: 'Contas', icon: 'Receipt', color: 'orange' },
  { id: 'cat-other', name: 'Outros', icon: 'FolderKanban', color: 'slate' },
];

export const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: 'usr-household-1',
    display_name: 'Bruno',
    role_title: 'Membro da Casa',
    avatar_color: 'bg-emerald-500 text-slate-950',
  },
  {
    id: 'usr-household-2',
    display_name: 'Fernanda',
    role_title: 'Membro da Casa',
    avatar_color: 'bg-indigo-500 text-white',
  },
];

export const QUICK_DESCRIPTIONS = [
  'Ônibus',
  'Mercado',
  'Café',
  'Farmácia',
  'Uber',
  'Conta de Luz',
  'Conta de Água',
  'Internet',
  'Aluguel',
  'Gasolina',
  'Padaria',
  'Restaurante',
];

export const SUPABASE_SQL_SCHEMA = `-- Shared Household Expense Tracker Schema
-- Copy and paste into your Supabase SQL Editor:

-- 1. Create Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'User',
  role_title TEXT DEFAULT 'Household Member',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT DEFAULT 'emerald',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Expenses table with safe DECIMAL numeric representation
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  expense_date DATE NOT NULL,
  expense_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for Household Sharing
-- Categories can be read by any authenticated user
CREATE POLICY "Allow auth users to read categories" ON public.categories
  FOR SELECT TO authenticated USING (true);

-- Profiles can be read and updated by authenticated users in the household
CREATE POLICY "Allow auth users to view profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow users to update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Expenses: Household members can read all shared expenses
CREATE POLICY "Allow auth users to view all household expenses" ON public.expenses
  FOR SELECT TO authenticated USING (true);

-- Expenses: Users can create expenses assigned to themselves
CREATE POLICY "Allow users to insert own expenses" ON public.expenses
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Expenses: Users can update only their own expenses
CREATE POLICY "Allow users to update own expenses" ON public.expenses
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Expenses: Users can delete only their own expenses
CREATE POLICY "Allow users to delete own expenses" ON public.expenses
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 6. Seed Categories
INSERT INTO public.categories (id, name, icon, color) VALUES
  ('cat-food', 'Food', 'Utensils', 'emerald'),
  ('cat-transp', 'Transportation', 'Bus', 'blue'),
  ('cat-home', 'Home', 'Home', 'amber'),
  ('cat-shopping', 'Shopping', 'ShoppingBag', 'purple'),
  ('cat-health', 'Health', 'HeartPulse', 'rose'),
  ('cat-ent', 'Entertainment', 'Film', 'pink'),
  ('cat-bills', 'Bills', 'Receipt', 'orange'),
  ('cat-other', 'Other', 'FolderKanban', 'slate')
ON CONFLICT (id) DO NOTHING;
`;
