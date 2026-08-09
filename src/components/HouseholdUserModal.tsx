import React, { useState } from 'react';
import { X, Users, Edit2, LogOut, Shield } from 'lucide-react';
import { UserProfile } from '../types';
import { updateProfile } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';
import { getMemberProfileColor } from '../lib/profileColors';

interface HouseholdUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: UserProfile[];
  activeUser: UserProfile;
  onProfilesUpdated: () => void;
  onLogout: () => void;
}

export const HouseholdUserModal: React.FC<HouseholdUserModalProps> = ({
  isOpen,
  onClose,
  profiles,
  activeUser,
  onProfilesUpdated,
  onLogout,
}) => {
  const { colors } = useTheme();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(activeUser.display_name);
  const [editRole, setEditRole] = useState<string>(activeUser.role_title || '');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  if (!isOpen) return null;

  const activeUserProfileColor = getMemberProfileColor(activeUser.id, activeUser.display_name);

  const handleStartEdit = () => {
    setEditName(activeUser.display_name);
    setEditRole(activeUser.role_title || '');
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) return;
    try {
      setIsSaving(true);
      await updateProfile({
        id: activeUser.id,
        display_name: editName.trim(),
        role_title: editRole.trim() || 'Membro da Casa',
      });
      setIsEditing(false);
      onProfilesUpdated();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl ${colors.primaryBadgeBg} ${colors.primaryText} border ${colors.primaryBorder} flex items-center justify-center font-bold`}>
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 leading-tight">Perfil & Membros da Casa</h2>
              <p className="text-xs text-slate-400">Usuário conectado e informações da conta</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 text-xs text-slate-300">
          {/* Active Profile Card */}
          <div className={`p-4 rounded-2xl ${colors.primaryBadgeBg} border ${colors.primaryBorder} space-y-3`}>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${colors.primaryText} flex items-center gap-1`}>
                <Shield className="w-3.5 h-3.5" /> Conta Ativa
              </span>
              {!isEditing && (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center gap-1 transition-all"
                >
                  <Edit2 className="w-3 h-3" /> Editar Perfil
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2 pt-1">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Nome de exibição</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Seu nome..."
                    className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none ${colors.ringFocus}`}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Papel / Título</label>
                  <input
                    type="text"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    placeholder="Ex: Membro da Casa..."
                    className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none ${colors.ringFocus}`}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={isSaving}
                    className={`px-3 py-1.5 rounded-xl ${colors.primaryBg} text-slate-950 font-bold text-xs`}
                  >
                    {isSaving ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl ${activeUserProfileColor.bg} text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-lg`}>
                  {activeUser.display_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">{activeUser.display_name}</h3>
                  <p className="text-xs text-slate-400">{activeUser.role_title || 'Membro da Casa'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Household Members List */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Membros Compartilhados
            </h4>
            <div className="space-y-2">
              {profiles.map((p) => {
                const isActive = p.id === activeUser.id;
                const profileColor = getMemberProfileColor(p.id, p.display_name);

                return (
                  <div
                    key={p.id}
                    className={`p-3 rounded-xl border flex items-center justify-between ${
                      isActive
                        ? `bg-slate-900 ${colors.primaryBorder} text-slate-100`
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg ${profileColor.bg} text-white flex items-center justify-center font-bold text-xs shrink-0`}>
                        {p.display_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-slate-200 text-xs block">{p.display_name}</span>
                        <span className="text-[10px] text-slate-400">{p.role_title || 'Membro'}</span>
                      </div>
                    </div>
                    {isActive && (
                      <span className={`text-[10px] ${colors.primaryBadgeBg} ${colors.primaryText} px-2 py-0.5 rounded font-bold border ${colors.primaryBorder}`}>
                        Sua Conta
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Logout Action */}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="w-full py-3 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair da Conta</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
