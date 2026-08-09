import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Session } from '@supabase/supabase-js';
import { Navbar } from './components/Navbar';
import { PeriodSelector } from './components/PeriodSelector';
import { ExpenseSummaryCard } from './components/ExpenseSummaryCard';
import { ExpenseList } from './components/ExpenseList';
import { AnalyticsView } from './components/AnalyticsView';
import { AddExpenseModal } from './components/AddExpenseModal';
import { EditExpenseModal } from './components/EditExpenseModal';
import { HouseholdUserModal } from './components/HouseholdUserModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { LoginScreen } from './components/LoginScreen';
import { Category, ExpenseWithDetails, PeriodType, UserProfile } from './types';
import {
  addExpense as apiAddExpense,
  deleteExpense as apiDeleteExpense,
  fetchCategories,
  fetchExpenses,
  fetchProfiles,
  fetchUserProfile,
  getSession,
  getSupabaseClient,
  onAuthStateChange,
  signOut,
  subscribeToExpensesChanges,
  updateExpense as apiUpdateExpense,
} from './lib/supabase';
import { calculateAggregates, getPeriodBounds } from './lib/formatters';
import { getCategoryDisplayName } from './lib/constants';
import { useTheme, getDefaultThemeForUser } from './context/ThemeContext';
import { CheckCircle2, Plus, AlertCircle } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState<boolean>(true);
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);

  const { colors, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<'timeline' | 'analytics'>('timeline');
  const [periodType, setPeriodType] = useState<PeriodType>('month');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [categories, setCategories] = useState<Category[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [expenses, setExpenses] = useState<ExpenseWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [selectedExpenseToEdit, setSelectedExpenseToEdit] = useState<ExpenseWithDetails | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState<boolean>(false);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState<boolean>(false);

  // PWA Prompt
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const initialThemeSetRef = useRef<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Automatically initialize user default theme on session availability (only once per user ID)
  useEffect(() => {
    const currentUserId = session?.user?.id;
    if (currentUserId) {
      if (initialThemeSetRef.current !== currentUserId) {
        initialThemeSetRef.current = currentUserId;
        const userTheme = getDefaultThemeForUser(currentUserId);
        setTheme(userTheme);
      }
    } else {
      initialThemeSetRef.current = null;
    }
  }, [session?.user?.id, setTheme]);

  // PWA listener
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // Load User Profile and App Metadata
  const loadUserDataAndMetadata = useCallback(async (userId: string) => {
    try {
      const [userProf, cats, profs] = await Promise.all([
        fetchUserProfile(userId),
        fetchCategories(),
        fetchProfiles(),
      ]);
      const mappedCategories = cats.map((c) => ({
        ...c,
        name: getCategoryDisplayName(c),
      }));
      setActiveUser(userProf);
      setCategories(mappedCategories);
      setProfiles(profs);
    } catch (err: any) {
      console.error('Erro ao carregar dados do usuário:', err);
    }
  }, []);

  // Load Expenses based on Period / Filters
  const loadExpensesData = useCallback(async () => {
    if (!session) return;
    setIsLoading(true);
    setFetchError(null);
    try {
      const filter = {
        periodType,
        selectedDate,
        categoryId: selectedCategory,
        userId: selectedUser,
        searchQuery,
      };
      const data = await fetchExpenses(filter);
      setExpenses(data);
    } catch (err: any) {
      console.error('Erro ao buscar gastos:', err);
      setFetchError(err.message || 'Não foi possível carregar os gastos.');
    } finally {
      setIsLoading(false);
    }
  }, [session, periodType, selectedDate, selectedCategory, selectedUser, searchQuery]);

  // Auth Initialization & Auth State Observer
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const currentSession = await getSession();
        if (isMounted) {
          setSession(currentSession);
          if (currentSession?.user?.id) {
            await loadUserDataAndMetadata(currentSession.user.id);
          }
        }
      } catch (err) {
        console.error('Erro ao verificar autenticação inicial:', err);
      } finally {
        if (isMounted) {
          setIsCheckingSession(false);
        }
      }
    }

    initAuth();

    const subscription = onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (newSession?.user?.id) {
          await loadUserDataAndMetadata(newSession.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        setActiveUser(null);
        setExpenses([]);
        showToast('Você saiu da sua conta.');
      }
      setIsCheckingSession(false);
    });

    return () => {
      isMounted = false;
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, [loadUserDataAndMetadata]);

  // Load expenses when session or filters change
  useEffect(() => {
    if (session && activeUser) {
      loadExpensesData();
    }
  }, [session, activeUser, loadExpensesData]);

  // Keep a ref to the latest loadExpensesData function so subscription is created only once
  const loadExpensesRef = useRef(loadExpensesData);
  useEffect(() => {
    loadExpensesRef.current = loadExpensesData;
  }, [loadExpensesData]);

  // Supabase Realtime Subscription for public.expenses changes
  useEffect(() => {
    const isAuthenticated = Boolean(session?.user?.id);
    if (!isAuthenticated) return;

    const channel = subscribeToExpensesChanges(() => {
      if (loadExpensesRef.current) {
        loadExpensesRef.current();
      }
    });

    return () => {
      if (channel) {
        const client = getSupabaseClient();
        if (client) {
          client.removeChannel(channel);
        }
      }
    };
  }, [Boolean(session?.user?.id)]);

  const handleLogout = async () => {
    try {
      await signOut();
      setSession(null);
      setActiveUser(null);
      setExpenses([]);
      showToast('Você saiu da sua conta.');
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
    }
  };

  const handleSaveExpense = async (data: {
    amount: number;
    description: string;
    category_id: string;
    expense_date: string;
    expense_time: string;
    user_id: string;
  }) => {
    if (!session?.user?.id) {
      throw new Error('Usuário não autenticado.');
    }

    // Explicitly enforce that user_id is the authenticated session ID
    await apiAddExpense({
      ...data,
      user_id: session.user.id,
    });
    await loadExpensesData();
    showToast('Gasto salvo com sucesso!');
  };

  const handleUpdateExpense = async (id: string, updates: Partial<ExpenseWithDetails>) => {
    await apiUpdateExpense(id, updates);
    await loadExpensesData();
    showToast('Gasto atualizado com sucesso!');
  };

  const handleDeleteExpense = async (id: string) => {
    await apiDeleteExpense(id);
    await loadExpensesData();
    showToast('Gasto removido.');
  };

  const handlePwaInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          showToast('Aplicativo instalado com sucesso!');
        }
        setDeferredPrompt(null);
        setIsPwaModalOpen(false);
      });
    }
  };

  // 1. Initial Session Checking Loading State
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <div className={`w-12 h-12 border-4 ${colors.primaryBorder} border-t-transparent rounded-full animate-spin mb-4`} />
        <p className="text-sm text-slate-300 font-medium">Verificando sessão no Supabase...</p>
      </div>
    );
  }

  // 2. Unauthenticated Screen (Login)
  if (!session || !activeUser) {
    return (
      <LoginScreen
        onLoginSuccess={async () => {
          setIsCheckingSession(true);
          const currentSession = await getSession();
          setSession(currentSession);
          if (currentSession?.user?.id) {
            await loadUserDataAndMetadata(currentSession.user.id);
          }
          setIsCheckingSession(false);
        }}
      />
    );
  }

  // 3. Main Authenticated Application
  const bounds = getPeriodBounds(periodType, selectedDate);
  const summary = calculateAggregates(expenses, categories, profiles);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeUser={activeUser}
        onOpenUserModal={() => setIsUserModalOpen(true)}
        onOpenPwaModal={() => setIsPwaModalOpen(true)}
        deferredPrompt={deferredPrompt}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto bg-slate-900 border-x border-slate-800/80 shadow-2xl flex flex-col min-h-[85vh]">
        {/* Period Selector & Filter Controls */}
        <PeriodSelector
          periodType={periodType}
          setPeriodType={setPeriodType}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categories={categories}
          profiles={profiles}
        />

        {/* Global Error Alert Banner if fetch fails */}
        {fetchError && (
          <div className="m-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{fetchError}</span>
            </div>
            <button
              onClick={loadExpensesData}
              className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-bold transition-all"
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {/* Tab 1: Timeline View */}
        {activeTab === 'timeline' && (
          <div className="flex-1 flex flex-col">
            <ExpenseSummaryCard
              summary={summary}
              bounds={bounds}
              onOpenAddModal={() => setIsAddModalOpen(true)}
            />

            <ExpenseList
              expenses={expenses}
              activeUser={activeUser}
              onSelectExpense={(exp) => setSelectedExpenseToEdit(exp)}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Tab 2: Analytics & Summary View */}
        {activeTab === 'analytics' && (
          <AnalyticsView
            summary={summary}
            expenses={expenses}
            bounds={bounds}
          />
        )}
      </main>

      {/* Floating Action Button for Mobile Add Expense */}
      {activeTab === 'timeline' && (
        <button
          onClick={() => setIsAddModalOpen(true)}
          className={`fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full ${colors.primaryBg} active:scale-90 text-slate-950 font-bold shadow-2xl ${colors.primaryShadow} border-2 border-white/30 flex items-center justify-center transition-all cursor-pointer`}
          aria-label="Adicionar gasto"
        >
          <Plus className="w-8 h-8 stroke-[3]" />
        </button>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 ${colors.primaryBg} text-slate-950 px-4 py-2.5 rounded-2xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200`}>
          <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        categories={categories}
        activeUser={activeUser}
        onSave={handleSaveExpense}
      />

      <EditExpenseModal
        isOpen={Boolean(selectedExpenseToEdit)}
        onClose={() => setSelectedExpenseToEdit(null)}
        expense={selectedExpenseToEdit}
        categories={categories}
        activeUser={activeUser}
        onUpdate={handleUpdateExpense}
        onDelete={handleDeleteExpense}
      />

      <HouseholdUserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        profiles={profiles}
        activeUser={activeUser}
        onProfilesUpdated={() => loadUserDataAndMetadata(session.user.id)}
        onLogout={handleLogout}
      />

      <PWAInstallBanner
        isOpen={isPwaModalOpen}
        onClose={() => setIsPwaModalOpen(false)}
        deferredPrompt={deferredPrompt}
        onInstall={handlePwaInstall}
      />
    </div>
  );
}
