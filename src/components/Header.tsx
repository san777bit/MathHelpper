import React from 'react';
import {
  PenTool,
  LineChart,
  Compass,
  Lightbulb,
  BookOpen,
  Sun,
  Moon,
  Maximize,
  Minimize,
  Download
} from 'lucide-react';
import type { AppTab } from '../types';

interface HeaderProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  deferredPrompt: any;
  onInstallPwa: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  isDark,
  onToggleTheme,
  isFullscreen,
  onToggleFullscreen,
  deferredPrompt,
  onInstallPwa,
}) => {
  const tabs = [
    { id: 'whiteboard' as AppTab, label: 'Доска', icon: PenTool },
    { id: 'plotter' as AppTab, label: 'Графики', icon: LineChart },
    { id: 'geometry' as AppTab, label: 'Геометрия', icon: Compass },
    { id: 'solver' as AppTab, label: 'Решатель', icon: Lightbulb },
    { id: 'cheatsheet' as AppTab, label: 'Шпаргалка', icon: BookOpen },
  ];

  return (
    <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-between shrink-0 z-30 select-none shadow-sm">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
          <span className="font-extrabold text-sm tracking-tight">∑</span>
        </div>
        <div className="hidden sm:block">
          <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-none">
            MathHelpper
          </h1>
          <span className="text-[10px] text-slate-400 font-medium">
            Помощник учителя
          </span>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <nav className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Action Buttons: Fullscreen, Theme, PWA Install */}
      <div className="flex items-center gap-1.5">
        {deferredPrompt && (
          <button
            onClick={onInstallPwa}
            title="Установить как приложение"
            className="px-2.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold flex items-center gap-1 hover:bg-indigo-100 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Установить</span>
          </button>
        )}

        <button
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Выйти из полноэкранного режима' : 'На весь экран'}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>

        <button
          onClick={onToggleTheme}
          title={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>
      </div>
    </header>
  );
};
