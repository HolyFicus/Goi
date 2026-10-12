import React, { useState } from 'react';
import { ThemeColor, PipBoySettings, StudentProfile, PipBoyNotification } from '../types/pipboy';
import { pipAudio } from '../utils/audio';
import {
  Volume2,
  VolumeX,
  Palette,
  Bell,
  Maximize2,
  Minimize2,
  Clock,
  Sparkles,
  HelpCircle,
  X,
  BookOpen,
  User,
  Activity,
  Layers,
  FlaskConical,
  FolderGit2,
  Download,
  List
} from 'lucide-react';

export type ActiveTab = 'MONITOR' | 'SCIENCE' | 'GITHUB' | 'WIDGET' | 'INSTALL' | 'PROFILE' | 'GUIDE';

interface PipBoyShellProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  settings: PipBoySettings;
  onUpdateSettings: (newSettings: Partial<PipBoySettings>) => void;
  profile: StudentProfile;
  linksCount: number;
  changedCount: number;
  notifications: PipBoyNotification[];
  onClearNotifications: () => void;
  onResetAllData: () => void;
  children: React.ReactNode;
  compactHudMode: boolean;
  onToggleCompactHud: () => void;
}

export const PipBoyShell: React.FC<PipBoyShellProps> = ({
  activeTab,
  onSelectTab,
  settings,
  onUpdateSettings,
  profile,
  linksCount,
  changedCount,
  notifications,
  onClearNotifications,
  onResetAllData,
  children,
  compactHudMode,
  onToggleCompactHud
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const cycleTheme = () => {
    pipAudio.playClick();
    const themes: ThemeColor[] = ['green', 'amber', 'cyan'];
    const nextIdx = (themes.indexOf(settings.colorTheme) + 1) % themes.length;
    onUpdateSettings({ colorTheme: themes[nextIdx] });
  };

  const toggleAudio = () => {
    pipAudio.playClick();
    pipAudio.isMuted = settings.audioEnabled;
    onUpdateSettings({ audioEnabled: !settings.audioEnabled });
  };

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'MONITOR', label: 'МОНИТОРИНГ', icon: <List size={13} /> },
    { id: 'SCIENCE', label: 'НАУКА (PUBMED)', icon: <FlaskConical size={13} /> },
    { id: 'GITHUB', label: 'GITHUB (КОД)', icon: <FolderGit2 size={13} /> },
    { id: 'WIDGET', label: 'ВИДЖЕТ', icon: <Layers size={13} /> },
    { id: 'INSTALL', label: 'УСТАНОВКА PWA', icon: <Download size={13} /> },
    { id: 'PROFILE', label: 'ПРОФИЛЬ СТУДЕНТА', icon: <User size={13} /> },
    { id: 'GUIDE', label: 'ИНСТРУКЦИЯ', icon: <BookOpen size={13} /> }
  ];

  if (compactHudMode) {
    return (
      <div
        data-theme={settings.colorTheme}
        className="fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] border-2 border-[var(--crt-phosphor)] bg-[#050e06]/95 rounded-xl p-3 box-glow shadow-2xl font-mono text-xs text-[var(--crt-phosphor)]"
      >
        <div className="flex items-center justify-between border-b border-[var(--crt-phosphor-dim)] pb-1.5 mb-2">
          <div className="flex items-center gap-1.5 font-bold text-[var(--crt-phosphor-bright)]">
            <span className="w-2 h-2 rounded-full bg-[var(--crt-phosphor)] animate-ping" />
            PIP-BOY HUD WIDGET
          </div>
          <button
            onClick={onToggleCompactHud}
            className="p-1 hover:text-[var(--crt-phosphor-bright)] cursor-pointer"
            title="Развернуть полный терминал"
          >
            <Maximize2 size={13} />
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-[11px] opacity-80">
            <span>РЕСУРСОВ: {linksCount}</span>
            <span>ОБНОВЛЕНИЙ: {changedCount}</span>
          </div>

          <div className="bg-black/80 border border-[var(--crt-phosphor-dim)]/50 p-2 rounded">
            {changedCount > 0 ? (
              <div className="text-amber-300 font-bold">
                ⚡ Обнаружено {changedCount} изменений на сайтах!
              </div>
            ) : (
              <div className="opacity-80">
                Все ресурсы проверены. Опрос активен.
              </div>
            )}
          </div>

          <button
            onClick={() => {
              pipAudio.playClick();
              onToggleCompactHud();
              onSelectTab('MONITOR');
            }}
            className="w-full py-1 text-center bg-[var(--crt-phosphor)] text-black font-bold rounded cursor-pointer"
          >
            ОТКРЫТЬ МОНИТОР
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      data-theme={settings.colorTheme}
      className={`min-h-screen bg-[#030804] text-[var(--crt-phosphor)] relative flex flex-col p-2 sm:p-4 md:p-6 transition-colors duration-300 ${
        settings.crtFlicker ? 'crt-flicker' : ''
      }`}
    >
      {/* Outer Industrial Hardware Casing */}
      <div className="max-w-6xl w-full mx-auto my-auto border-4 sm:border-8 border-[#1f2820] bg-[#071309] rounded-2xl sm:rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.9)] relative overflow-hidden flex flex-col">
        {/* Hardware Bezel Top Screws & Knobs */}
        <div className="bg-[#121c13] border-b-4 border-[#1c291e] px-4 py-2 sm:py-3 flex flex-wrap items-center justify-between gap-3 select-none">
          {/* Logo & Status Indicator */}
          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 rounded-full bg-[#354337] border border-[#162017] flex items-center justify-center shadow-inner">
              <div className="w-2 h-0.5 bg-[#162017]" />
            </div>

            <div className="flex flex-col">
              <span className="font-extrabold text-xs sm:text-sm tracking-[0.2em] text-[#86a88b] uppercase">
                PIP-BOY 3000
              </span>
              <span className="text-[10px] tracking-widest text-[#4d6952] font-bold uppercase">
                STUDENT EDITION · ТЕРМИНАЛ МОНИТОРИНГА
              </span>
            </div>

            {/* Live Status Pulse */}
            <div className="hidden sm:flex items-center gap-1.5 bg-[#09110a] border border-[#273a2a] px-2.5 py-0.5 rounded-full shadow-inner">
              <div className="w-2 h-2 rounded-full bg-[var(--crt-phosphor)] shadow-[0_0_8px_var(--crt-phosphor)] animate-pulse" />
              <span className="text-[9px] text-[var(--crt-phosphor-bright)] font-mono font-bold tracking-wider">
                СИСТЕМА АКТИВНА
              </span>
            </div>
          </div>

          {/* Controls: Theme, Sound, Alerts, Clear Data, HUD */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            {/* Theme Selector */}
            <button
              onClick={cycleTheme}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#1a291c] hover:bg-[#253a28] border border-[#304733] rounded text-[11px] text-[#9fc7a4] font-bold cursor-pointer transition-colors"
              title="Переключить цвет люминофора (Green / Amber / Cyan)"
            >
              <Palette size={13} />
              <span className="uppercase">{settings.colorTheme}</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleAudio}
              className={`p-1.5 border rounded cursor-pointer transition-colors ${
                settings.audioEnabled
                  ? 'border-[var(--crt-phosphor)] text-[var(--crt-phosphor)] bg-[var(--crt-phosphor)]/15'
                  : 'border-zinc-700 text-zinc-500'
              }`}
              title={settings.audioEnabled ? 'Звук включен' : 'Звук выключен'}
            >
              {settings.audioEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>

            {/* Notifications Button */}
            <button
              onClick={() => {
                pipAudio.playClick();
                setIsNotifOpen(!isNotifOpen);
              }}
              className="relative p-1.5 border border-[#304733] hover:border-[var(--crt-phosphor)] rounded cursor-pointer text-[#9fc7a4]"
              title="Журнал системных оповещений"
            >
              <Bell size={14} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-black font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Mini HUD toggle */}
            <button
              onClick={onToggleCompactHud}
              className="p-1.5 border border-[#304733] hover:border-[var(--crt-phosphor)] rounded cursor-pointer text-[#9fc7a4]"
              title="Свернуть в плавающий виджет"
            >
              <Minimize2 size={14} />
            </button>

            {/* Screw */}
            <div className="w-3.5 h-3.5 rounded-full bg-[#354337] border border-[#162017] flex items-center justify-center shadow-inner ml-1">
              <div className="w-2 h-0.5 bg-[#162017]" />
            </div>
          </div>
        </div>

        {/* CRT Screen Display Area with Scanlines & Vignette */}
        <div className="relative bg-[#050e06] p-3 sm:p-5 flex-1 flex flex-col overflow-hidden">
          {settings.scanlines && <div className="absolute inset-0 crt-overlay z-20 pointer-events-none" />}
          <div className="absolute inset-0 crt-vignette z-20 pointer-events-none" />

          {/* Top Tabs */}
          <div className="relative z-30 border-b-2 border-[var(--crt-phosphor-dim)] pb-2 mb-4">
            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar font-mono text-xs sm:text-sm">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      pipAudio.playTabSwitch();
                      onSelectTab(tab.id);
                    }}
                    className={`px-3 sm:px-4 py-1.5 rounded-t-sm uppercase font-extrabold tracking-wider transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[var(--crt-phosphor)] text-black phosphor-glow-strong shadow-lg translate-y-[2px]'
                        : 'border border-[var(--crt-phosphor-dim)]/50 text-[var(--crt-phosphor)]/70 hover:text-[var(--crt-phosphor)] hover:border-[var(--crt-phosphor)]'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content Display */}
          <div className="relative z-10 flex-1 overflow-y-auto pr-1">
            {children}
          </div>

          {/* Clean Academic Status Footer */}
          <div className="relative z-30 border-t-2 border-[var(--crt-phosphor-dim)] pt-2.5 mt-4 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="font-bold text-[var(--crt-phosphor-bright)]">
                РЕСУРСОВ В БАЗЕ: {linksCount}
              </span>
              {changedCount > 0 && (
                <span className="bg-amber-500 text-black px-1.5 py-0.2 rounded font-bold">
                  ИЗМЕНЕНИЙ: {changedCount}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px] opacity-80">
              <span>СТУДЕНТ: {profile.fullName || 'НЕ ЗАПОЛНЕНО'}</span>
              {profile.university && <span>({profile.university})</span>}
            </div>

            <div className="flex items-center gap-3 text-[11px] opacity-75">
              <span>АВТО-СИНХРОНИЗАЦИЯ: {settings.globalInterval}с</span>
              <button
                onClick={() => {
                  if (confirm('Вы уверены, что хотите очистить все сохраненные ссылки и данные?')) {
                    onResetAllData();
                  }
                }}
                className="underline hover:text-red-400 cursor-pointer text-[10px]"
                title="Полностью очистить сохраненные данные"
              >
                ОЧИСТИТЬ ДАННЫЕ
              </button>
            </div>
          </div>
        </div>

        {/* Hardware Bottom Screws */}
        <div className="bg-[#121c13] border-t-4 border-[#1c291e] px-4 py-2 flex items-center justify-between text-[10px] text-[#4d6952] font-mono select-none">
          <div className="flex gap-1.5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#202e22]" />
            ))}
          </div>
          <span>PIP-BOY STUDENT WORKSTATION · ВЕРСИЯ 2.0 (PROFESSIONAL)</span>
          <div className="flex gap-1.5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#202e22]" />
            ))}
          </div>
        </div>
      </div>

      {/* Notifications Drawer Modal */}
      {isNotifOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="border-2 border-[var(--crt-phosphor)] bg-[#050e06] p-4 rounded-xl max-w-md w-full box-glow text-[var(--crt-phosphor)] space-y-3 font-mono">
            <div className="flex items-center justify-between border-b border-[var(--crt-phosphor-dim)] pb-2 text-xs font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-[var(--crt-phosphor-bright)]">
                <Bell size={14} /> ЖУРНАЛ ОПОВЕЩЕНИЙ
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClearNotifications}
                  className="text-[10px] px-2 py-0.5 border border-zinc-700 hover:border-zinc-500 rounded cursor-pointer"
                >
                  ОЧИСТИТЬ
                </button>
                <button
                  onClick={() => setIsNotifOpen(false)}
                  className="text-xs px-2 py-0.5 border border-[var(--crt-phosphor-dim)] hover:border-[var(--crt-phosphor)] cursor-pointer"
                >
                  <X size={12} />
                </button>
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1 text-xs">
              {notifications.length === 0 ? (
                <div className="text-center py-6 opacity-60">
                  Нет новых оповещений. Все отслеживаемые сайты спокойны.
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded bg-black/70 border border-[var(--crt-phosphor-dim)]/50 space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] text-amber-300">
                      <span className="font-bold">{n.title}</span>
                      <span>{new Date(n.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-[11px] opacity-90">{n.message}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
