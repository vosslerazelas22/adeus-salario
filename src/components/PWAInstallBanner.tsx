import React from 'react';
import { X, Smartphone, Download, Share, PlusSquare, Check } from 'lucide-react';

interface PWAInstallBannerProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstall: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstall,
}) => {
  if (!isOpen) return null;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center font-bold">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 leading-tight">Instalar Aplicativo (PWA)</h2>
              <p className="text-xs text-slate-400">Instale na tela inicial do seu celular</p>
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
        <div className="p-5 space-y-4 text-xs text-slate-300">
          <p className="text-slate-300 leading-relaxed">
            Instale o <strong>Adeus Salário</strong> como um aplicativo nativo no seu iPhone ou Android sem precisar de loja de aplicativos.
          </p>

          {deferredPrompt ? (
            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
              <p className="font-semibold text-slate-200">Dispositivo compatível com instalação direta em 1 toque:</p>
              <button
                onClick={onInstall}
                className="w-full py-3 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-5 h-5" />
                <span>Instalar Agora no Celular</span>
              </button>
            </div>
          ) : isIOS ? (
            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <h3 className="font-bold text-teal-400 text-xs uppercase tracking-wider">Como instalar no iPhone / iOS Safari:</h3>
              <ol className="space-y-2 list-decimal list-inside text-slate-300">
                <li className="leading-snug">
                  Toque no botão <strong>Compartilhar</strong> <Share className="w-3.5 h-3.5 inline text-teal-400 mx-1" /> no menu inferior do Safari.
                </li>
                <li className="leading-snug">
                  Role a lista e selecione <strong>Adicionar à Tela de Início</strong> <PlusSquare className="w-3.5 h-3.5 inline text-teal-400 mx-1" />.
                </li>
                <li className="leading-snug">
                  Toque em <strong>Adicionar</strong> no canto superior direito.
                </li>
              </ol>
            </div>
          ) : (
            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <h3 className="font-bold text-teal-400 text-xs uppercase tracking-wider">Como instalar no Android / Chrome:</h3>
              <ol className="space-y-2 list-decimal list-inside text-slate-300">
                <li className="leading-snug">Toque no menu de 3 pontos no canto superior direito do navegador.</li>
                <li className="leading-snug">Selecione <strong>Instalar Aplicativo</strong> ou <strong>Adicionar à tela inicial</strong>.</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
