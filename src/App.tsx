import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Whiteboard } from './components/Whiteboard/Whiteboard';
import { Plotter } from './components/Plotter/Plotter';
import { GeometryBoard } from './components/Geometry/GeometryBoard';
import { StepSolver } from './components/Solver/StepSolver';
import { CheatSheet } from './components/CheatSheet/CheatSheet';
import type { AppTab } from './types';


export function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>('whiteboard');
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('math_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Cross-component state
  const [plotterFunctions, setPlotterFunctions] = useState<string[]>([]);

  // Apply dark class to document root
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('math_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('math_theme', 'light');
    }
  }, [isDark]);

  // PWA install prompt handler
  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPwa = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Switch to plotter with custom functions
  const handleOpenInPlotter = (fns: string[]) => {
    setPlotterFunctions(fns);
    setCurrentTab('plotter');
  };

  // Switch to geometry
  const handleOpenInGeometry = (_preset: string) => {
    setCurrentTab('geometry');
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        isDark={isDark}
        onToggleTheme={() => setIsDark((prev) => !prev)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        deferredPrompt={deferredPrompt}
        onInstallPwa={handleInstallPwa}
      />

      {/* Main Interactive Content */}
      <main className="flex-1 w-full h-[calc(100%-53px)] relative overflow-hidden">
        {currentTab === 'whiteboard' && <Whiteboard isDark={isDark} />}
        {currentTab === 'plotter' && (
          <Plotter isDark={isDark} initialFunctions={plotterFunctions} />
        )}
        {currentTab === 'geometry' && <GeometryBoard isDark={isDark} />}
        {currentTab === 'solver' && (
          <StepSolver onOpenInPlotter={handleOpenInPlotter} />
        )}
        {currentTab === 'cheatsheet' && (
          <CheatSheet
            onOpenInPlotter={handleOpenInPlotter}
            onOpenInGeometry={handleOpenInGeometry}
          />
        )}
      </main>
    </div>
  );
}

export default App;
