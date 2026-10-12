import React from 'react';
import { ScreenType } from '../types';
import { ArrowLeft, Info, Download, ShieldCheck, Heart } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HeaderProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  onOpenAbout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  onOpenAbout,
}) => {
  const { isInstallable, isIOS, install } = usePWAInstall();

  const getScreenTitle = () => {
    switch (currentScreen) {
      case 'water':
        return '💧 Lembrete de Água';
      case 'exercise':
        return '🏃 Lembrete de Exercício';
      case 'sleep':
        return '😴 Hábito de Sono';
      case 'medication':
        return '💊 Lembrete de Remédio';
      default:
        return 'Hábitos Simples';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {currentScreen === 'home' ? (
          <div className="flex items-center gap-2.5">
            <img
              src="/icon.svg"
              alt="Logotipo Hábitos Simples"
              className="w-10 h-10 rounded-xl shadow-sm ring-2 ring-sky-100 object-contain bg-white"
            />
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight tracking-tight">
                Hábitos Simples
              </h1>
              <p className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                100% Offline • Sem cadastro
              </p>
            </div>
          </div>
        ) : (
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 py-1.5 px-3 -ml-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 active:scale-95 transition cursor-pointer"
            aria-label="Voltar para o início"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700 stroke-[2.5]" />
            <span className="font-bold text-sm text-slate-800">Início</span>
          </button>
        )}

        {currentScreen !== 'home' && (
          <div className="text-sm font-bold text-slate-800 truncate px-2 text-center flex-1">
            {getScreenTitle()}
          </div>
        )}

        <div className="flex items-center gap-1.5">
          {/* Install button if installable */}
          {isInstallable && (
            <button
              onClick={install}
              className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white text-xs font-bold py-1.5 px-2.5 rounded-lg shadow-xs transition"
              title="Instalar no celular"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar</span>
            </button>
          )}

          {isIOS && (
            <button
              onClick={onOpenAbout}
              className="hidden sm:flex items-center gap-1 text-slate-600 hover:text-slate-800 text-xs font-semibold py-1 px-2 rounded-lg bg-slate-100"
            >
              <Download className="w-3 h-3" />
              Instalar
            </button>
          )}

          {/* About / Settings button */}
          <button
            onClick={onOpenAbout}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition cursor-pointer"
            aria-label="Sobre o aplicativo e ajuda"
            title="Sobre o aplicativo"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
