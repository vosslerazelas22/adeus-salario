import { createClient, SupabaseClient, Session, RealtimeChannel } from '@supabase/supabase-js';
import { INITIAL_CATEGORIES } from './constants';
import { Category, Expense, ExpenseFilter, ExpenseWithDetails, UserProfile } from '../types';
import { getPeriodBounds } from './formatters';

// Storage keys for custom configuration override
const STORAGE_SUPABASE_URL_KEY = 'casa_gastos_supabase_url';
const STORAGE_SUPABASE_ANON_KEY = 'casa_gastos_supabase_anon_key';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseCredentials(): { url: string; anonKey: string; isCustom: boolean } {
  const customUrl = localStorage.getItem(STORAGE_SUPABASE_URL_KEY);
  const customKey = localStorage.getItem(STORAGE_SUPABASE_ANON_KEY);

  if (customUrl && customKey) {
    return { url: customUrl, anonKey: customKey, isCustom: true };
  }

  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  return { url: envUrl, anonKey: envKey, isCustom: false };
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseCredentials();
  return Boolean(
    url &&
    anonKey &&
    url !== 'https://your-project.supabase.co' &&
    anonKey !== 'your-anon-key' &&
    url.startsWith('https://')
  );
}

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;

  const { url, anonKey } = getSupabaseCredentials();

  if (isSupabaseConfigured()) {
    try {
      supabaseClient = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
      return supabaseClient;
    } catch (err) {
      console.error('Erro ao inicializar o cliente Supabase:', err);
    }
  }

  return null;
}

export function saveCustomSupabaseConfig(url: string, anonKey: string): void {
  if (url) localStorage.setItem(STORAGE_SUPABASE_URL_KEY, url.trim());
  else localStorage.removeItem(STORAGE_SUPABASE_URL_KEY);

  if (anonKey) localStorage.setItem(STORAGE_SUPABASE_ANON_KEY, anonKey.trim());
  else localStorage.removeItem(STORAGE_SUPABASE_ANON_KEY);

  supabaseClient = null; // Reset cached client
}

// ==========================================
// SUPABASE AUTHENTICATION
// ==========================================

export async function signInWithPassword(email: string, pass: string) {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase não está configurado. Verifique as credenciais no .env.');
  }

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password: pass,
  });

  if (error) {
    console.error('Erro no login Supabase Auth:', error);
    throw error;
  }

  return data;
}

export async function signOut() {
  const client = getSupabaseClient();
  if (client) {
    const { error } = await client.auth.signOut();
    if (error) {
      console.error('Erro ao encerrar sessão Supabase:', error);
    }
  }
}

export async function getSession(): Promise<Session | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client.auth.getSession();
    if (error) {
      console.error('Erro ao recuperar sessão:', error);
      return null;
    }
    return data.session;
  } catch (err) {
    console.error('Exceção ao obter sessão:', err);
    return null;
  }
}

export function onAuthStateChange(callback: (event: string, session: Session | null) => void) {
  const client = getSupabaseClient();
  if (!client) return { unsubscribe: () => {} };

  const { data } = client.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });

  return data.subscription;
}

// ==========================================
// DATA SERVICE API (SUPABASE ONLY - NO SILENT FALLBACK)
// ==========================================

export async function fetchUserProfile(userId: string): Promise<UserProfile> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Cliente Supabase não disponível.');
  }

  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Erro ao carregar perfil do usuário no Supabase:', error);
    // If profile row isn't found yet or created by trigger, return fallback with userId
    return {
      id: userId,
      display_name: 'Usuário',
      role_title: 'Membro da Casa',
      avatar_color: 'bg-emerald-500 text-slate-950',
    };
  }

  return {
    id: data.id,
    display_name: data.display_name || 'Usuário',
    role_title: data.role_title || 'Membro da Casa',
    avatar_color: 'bg-emerald-500 text-slate-950',
    created_at: data.created_at,
  };
}

export async function fetchCategories(): Promise<Category[]> {
  const client = getSupabaseClient();
  if (!client) {
    return INITIAL_CATEGORIES;
  }

  const { data, error } = await client.from('categories').select('*').order('name');
  if (error) {
    console.error('Erro ao buscar categorias no Supabase:', error);
    return INITIAL_CATEGORIES;
  }

  if (!data || data.length === 0) {
    return INITIAL_CATEGORIES;
  }

  return data as Category[];
}

export async function fetchProfiles(): Promise<UserProfile[]> {
  const client = getSupabaseClient();
  if (!client) {
    return [];
  }

  const { data, error } = await client.from('profiles').select('*');
  if (error) {
    console.error('Erro ao carregar perfis no Supabase:', error);
    return [];
  }

  return (data || []).map((p) => ({
    id: p.id,
    display_name: p.display_name || 'Usuário',
    role_title: p.role_title || 'Membro da Casa',
    avatar_color: p.display_name?.toLowerCase().includes('bruno')
      ? 'bg-emerald-500 text-slate-950'
      : 'bg-indigo-500 text-white',
    created_at: p.created_at,
  }));
}

export async function updateProfile(profile: Partial<UserProfile> & { id: string }): Promise<UserProfile> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Cliente Supabase não disponível.');
  }

  const { data, error } = await client
    .from('profiles')
    .upsert({
      id: profile.id,
      display_name: profile.display_name,
      role_title: profile.role_title,
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar perfil no Supabase:', error);
    throw new Error('Não foi possível atualizar o perfil: ' + error.message);
  }

  return {
    id: data.id,
    display_name: data.display_name,
    role_title: data.role_title,
  };
}

export async function fetchExpenses(filter?: ExpenseFilter): Promise<ExpenseWithDetails[]> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Conexão com o Supabase não estabelecida.');
  }

  const [categories, profiles] = await Promise.all([fetchCategories(), fetchProfiles()]);
  const catMap = new Map(categories.map((c) => [c.id, c]));
  const profMap = new Map(profiles.map((p) => [p.id, p]));

  let query = client
    .from('expenses')
    .select('*')
    .order('expense_date', { ascending: false })
    .order('expense_time', { ascending: false });

  if (filter) {
    const bounds = getPeriodBounds(filter.periodType, filter.selectedDate);
    const startStr = bounds.startDate.toISOString().split('T')[0];
    const endStr = bounds.endDate.toISOString().split('T')[0];

    query = query.gte('expense_date', startStr).lte('expense_date', endStr);

    if (filter.categoryId) {
      query = query.eq('category_id', filter.categoryId);
    }
    if (filter.userId) {
      query = query.eq('user_id', filter.userId);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error('Erro ao buscar gastos no Supabase:', error);
    throw new Error('Erro ao carregar lista de gastos: ' + error.message);
  }

  let rawExpenses = (data || []) as Expense[];

  if (filter?.searchQuery) {
    const queryLower = filter.searchQuery.toLowerCase();
    rawExpenses = rawExpenses.filter((e) => e.description.toLowerCase().includes(queryLower));
  }

  return rawExpenses.map((e) => ({
    ...e,
    category: catMap.get(e.category_id) || {
      id: e.category_id,
      name: 'Outros',
      icon: 'FolderKanban',
      color: 'slate',
    },
    user: profMap.get(e.user_id) || {
      id: e.user_id,
      display_name: 'Membro da Casa',
      role_title: 'Membro',
      avatar_color: 'bg-emerald-500 text-slate-950',
    },
  }));
}

export async function addExpense(
  expenseData: Omit<Expense, 'id' | 'created_at' | 'updated_at'>
): Promise<Expense> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Conexão com Supabase indisponível.');
  }

  const { data, error } = await client
    .from('expenses')
    .insert({
      user_id: expenseData.user_id,
      category_id: expenseData.category_id,
      amount: expenseData.amount,
      description: expenseData.description,
      expense_date: expenseData.expense_date,
      expense_time: expenseData.expense_time,
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao adicionar gasto no Supabase:', error);
    throw new Error('Falha ao salvar gasto: ' + error.message);
  }

  return data as Expense;
}

export async function updateExpense(
  id: string,
  updates: Partial<Omit<Expense, 'id' | 'user_id'>>
): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Conexão com Supabase indisponível.');
  }

  const { error } = await client
    .from('expenses')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('Erro ao atualizar gasto no Supabase:', error);
    throw new Error('Falha ao atualizar gasto: ' + error.message);
  }

  return true;
}

export async function deleteExpense(id: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Conexão com Supabase indisponível.');
  }

  const { error } = await client.from('expenses').delete().eq('id', id);

  if (error) {
    console.error('Erro ao remover gasto no Supabase:', error);
    throw new Error('Falha ao remover gasto: ' + error.message);
  }

  return true;
}

// ==========================================
// SUPABASE REALTIME SUBSCRIPTIONS
// ==========================================

export function subscribeToExpensesChanges(onChange: () => void): RealtimeChannel | null {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const channel = client
      .channel('public-expenses-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'expenses',
        },
        (payload) => {
          console.log('Evento Supabase Realtime recebido em public.expenses:', payload.eventType);
          onChange();
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.warn('Status do canal Realtime em public.expenses:', status, err);
        }
      });

    return channel;
  } catch (err) {
    console.error('Erro ao registrar subscription Realtime:', err);
    return null;
  }
}
