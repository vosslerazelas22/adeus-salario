import React, { useState } from 'react';
import { LogIn, Lock, Mail, AlertCircle, Shield } from 'lucide-react';
import { signInWithPassword } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { colors } = useTheme();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Por favor, preencha seu e-mail e sua senha.');
      return;
    }

    try {
      setIsLoading(true);
      await signInWithPassword(email.trim(), password);
      onLoginSuccess();
    } catch (err: any) {
      console.error('Erro ao autenticar:', err);
      setErrorMessage('Não foi possível entrar. Verifique seu e-mail e sua senha.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
        {/* Header / Branding */}
        <div className="text-center space-y-3">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${colors.gradientHeader} flex items-center justify-center text-white shadow-xl ${colors.primaryShadow} text-3xl mx-auto border border-white/20`}>
            💸
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Adeus Salário</h1>
            <p className="text-xs text-slate-400 mt-1">
              Acesse sua conta para visualizar e registrar os gastos da casa.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              E-mail
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
              <input
                type="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu e-mail"
                autoComplete="email"
                required
                className={`w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none ${colors.ringFocus} transition-all`}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Senha
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                autoComplete="current-password"
                required
                className={`w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none ${colors.ringFocus} transition-all`}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 px-4 rounded-xl ${colors.primaryBg} active:scale-[0.99] text-slate-950 font-extrabold text-sm shadow-xl ${colors.primaryShadow} transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Entrando...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 stroke-[2.5]" />
                <span>Entrar</span>
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="pt-2 border-t border-slate-800/80 text-center space-y-1">
          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
            <Shield className={`w-3 h-3 ${colors.primaryText} inline`} />
            Acesso restrito aos membros da casa
          </p>
        </div>
      </div>
    </div>
  );
};
