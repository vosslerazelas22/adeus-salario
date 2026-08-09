import React from 'react';
import { Palette, Users, BarChart2, ListFilter, Smartphone, LogOut } from 'lucide-react';
import { UserProfile } from '../types';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  activeTab: 'timeline' | 'analytics';
  setActiveTab: (tab: 'timeline' | 'analytics') => void;
  activeUser: UserProfile;
  onOpenUserModal: () => void;
  onOpenPwaModal: () => void;
  deferredPrompt: any;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeUser,
  onOpenUserModal,
  onOpenPwaModal,
  deferredPrompt,
  onLogout,
}) => {
  const { theme, toggleTheme, colors } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100 px-4 py-3">
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-2">
        {/* Logo & App Brand */}
        <div className="flex items-center gap-2.5">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${colors.gradientHeader} flex items-center justify-center text-white shadow-lg ${colors.primaryShadow} font-bold text-xl`}>
            💸
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 leading-tight flex items-center gap-1.5">
              Adeus Salário
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${colors.primaryBadgeBg} ${colors.primaryText} font-medium border ${colors.primaryBorder}`}>
                R$ (BRL)
              </span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">Controle de Gastos da Casa</p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Theme Toggle Button (Blue <-> Rose) */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border ${colors.primaryBorder} text-xs font-medium transition-all cursor-pointer`}
            title={`Tema atual: ${theme === 'blue' ? 'Azul' : 'Rosa'}. Clique para alternar.`}
            aria-label="Alternar tema visual"
          >
            <Palette className={`w-3.5 h-3.5 ${colors.primaryText}`} />
            <div className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full transition-all ${theme === 'blue' ? 'bg-sky-400 scale-125 ring-2 ring-sky-400/40' : 'bg-slate-600'}`} />
              <span className={`w-2 h-2 rounded-full transition-all ${theme === 'rose' ? 'bg-pink-400 scale-125 ring-2 ring-pink-400/40' : 'bg-slate-600'}`} />
            </div>
          </button>

          {/* PWA Install Button */}
          {deferredPrompt && (
            <button
              onClick={onOpenPwaModal}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 text-xs font-medium transition-all"
            >
              <Smartphone className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Instalar PWA</span>
            </button>
          )}

          {/* User Profile Badge */}
          <button
            onClick={onOpenUserModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700/60 text-xs font-medium transition-all cursor-pointer"
            title="Perfil e Membros"
          >
            <div className={`w-6 h-6 rounded-lg ${activeUser.avatar_color || 'bg-slate-700 text-slate-100'} flex items-center justify-center font-bold text-[11px]`}>
              {activeUser.display_name.charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden xs:block">
              <span className="block font-semibold text-slate-200 text-xs leading-none">
                {activeUser.display_name}
              </span>
              <span className="text-[10px] text-slate-400 leading-none">
                {activeUser.role_title || 'Membro'}
              </span>
            </div>
            <Users className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </button>

          {/* Quick Logout Button */}
          <button
            onClick={onLogout}
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700/60 text-xs font-medium transition-all cursor-pointer"
            title="Sair da Conta"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="max-w-3xl mx-auto mt-3 flex rounded-xl bg-slate-950/60 p-1 border border-slate-800">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'timeline'
              ? `${colors.primaryBgSolid} text-white shadow-md`
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ListFilter className="w-4 h-4" />
          <span>Extrato de Gastos</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'analytics'
              ? `${colors.primaryBgSolid} text-white shadow-md`
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Resumo e Análises</span>
        </button>
      </div>
    </header>
  );
};
