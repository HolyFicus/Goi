import React, { useState, useEffect } from 'react';
import { MonitoredLink } from '../types/pipboy';
import { pipAudio } from '../utils/audio';
import {
  Smartphone,
  Monitor,
  RefreshCw,
  Bell,
  Sparkles,
  ExternalLink,
  Layers,
  Copy,
  Check,
  Zap,
  Minimize2,
  Maximize2
} from 'lucide-react';

interface TabWidgetProps {
  links: MonitoredLink[];
  onScanAll: () => void;
  isScanning: boolean;
  onEnterCompactHud: () => void;
}

export const TabWidget: React.FC<TabWidgetProps> = ({
  links,
  onScanAll,
  isScanning,
  onEnterCompactHud
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [widgetSize, setWidgetSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const changedLinks = links.filter((l) => l.status === 'CHANGED');
  const latestDiff = links.flatMap((l) => l.diffHistory).sort((a, b) => b.timestamp - a.timestamp)[0];
  const totalMonitored = links.length;

  const handleCopyShortcut = () => {
    pipAudio.playSuccess();
    const url = window.location.origin + '/?view=widget';
    navigator.clipboard.writeText(url).catch(() => {});
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="border border-[var(--crt-phosphor-dim)] bg-black/40 p-3 rounded flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-bold uppercase tracking-wider text-[var(--crt-phosphor-bright)] flex items-center gap-2">
            <Layers size={16} /> ВИДЖЕТ ГЛАВНОГО ЭКРАНА (HOME SCREEN WIDGET)
          </div>
          <div className="text-xs opacity-75 mt-0.5">
            Оперативный мониторинг обновлений прямо с рабочего стола телефона и ПК без входа в терминал
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              pipAudio.playClick();
              onEnterCompactHud();
            }}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[var(--crt-phosphor)] text-black font-bold rounded cursor-pointer hover:bg-[var(--crt-phosphor-bright)] transition-colors"
          >
            <Minimize2 size={13} /> РЕЖИМ ПЛАВАЮЩЕГО HUD
          </button>
          <button
            onClick={handleCopyShortcut}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-[var(--crt-phosphor)] bg-black text-[var(--crt-phosphor)] rounded cursor-pointer hover:bg-[var(--crt-phosphor)]/20 transition-colors"
          >
            {copiedLink ? <Check size={13} /> : <Copy size={13} />}
            {copiedLink ? 'ССЫЛКА СКОПИРОВАНА' : 'ССЫЛКА НА ВИДЖЕТ'}
          </button>
        </div>
      </div>

      {/* Widget Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Device Switcher */}
        <div className="flex items-center gap-1 border border-[var(--crt-phosphor-dim)] rounded p-0.5 bg-black">
          <button
            onClick={() => {
              pipAudio.playClick();
              setPreviewDevice('mobile');
            }}
            className={`flex items-center gap-1 px-3 py-1 rounded cursor-pointer font-bold ${
              previewDevice === 'mobile' ? 'bg-[var(--crt-phosphor)] text-black' : 'text-zinc-400'
            }`}
          >
            <Smartphone size={13} /> ТЕЛЕФОН (WIDGET)
          </button>
          <button
            onClick={() => {
              pipAudio.playClick();
              setPreviewDevice('desktop');
            }}
            className={`flex items-center gap-1 px-3 py-1 rounded cursor-pointer font-bold ${
              previewDevice === 'desktop' ? 'bg-[var(--crt-phosphor)] text-black' : 'text-zinc-400'
            }`}
          >
            <Monitor size={13} /> ПК РАБОЧИЙ СТОЛ
          </button>
        </div>

        {/* Size switcher */}
        <div className="flex items-center gap-1 text-[11px]">
          <span className="opacity-60">Размер:</span>
          {(['small', 'medium', 'large'] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                pipAudio.playClick();
                setWidgetSize(s);
              }}
              className={`px-2 py-0.5 border rounded cursor-pointer uppercase ${
                widgetSize === s
                  ? 'border-[var(--crt-phosphor)] bg-[var(--crt-phosphor)]/20 text-[var(--crt-phosphor-bright)] font-bold'
                  : 'border-zinc-800 text-zinc-500'
              }`}
            >
              {s === 'small' ? '2×2' : s === 'medium' ? '4×2' : '4×4'}
            </button>
          ))}
        </div>
      </div>

      {/* Realistic Screen Mockup */}
      <div className="flex justify-center p-4 bg-black/60 border border-[var(--crt-phosphor-dim)]/60 rounded-xl relative overflow-hidden">
        {previewDevice === 'mobile' ? (
          /* Phone Frame Mockup */
          <div className="w-[320px] sm:w-[350px] bg-[#0c140e] border-4 border-zinc-700 rounded-[38px] p-3 shadow-2xl relative">
            {/* Phone Speaker Notch */}
            <div className="w-24 h-4 bg-zinc-800 rounded-full mx-auto mb-2 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-zinc-950 mr-2" />
              <div className="w-8 h-1 bg-zinc-700 rounded-full" />
            </div>

            {/* Status bar */}
            <div className="flex justify-between items-center text-[10px] text-zinc-400 px-3 pb-2 font-mono">
              <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <div className="flex items-center gap-1">
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>

            {/* The Actual Pip-Boy Widget on the Phone Screen */}
            <div
              className={`border-2 border-[var(--crt-phosphor)] bg-[#050e06] p-3 rounded-2xl box-glow-subtle transition-all duration-300 relative overflow-hidden ${
                widgetSize === 'small'
                  ? 'h-[140px] flex flex-col justify-between'
                  : widgetSize === 'medium'
                  ? 'h-[170px] flex flex-col justify-between'
                  : 'h-[280px] flex flex-col justify-between'
              }`}
            >
              {/* Background CRT Scanlines hint */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 pointer-events-none" />

              {/* Widget Header */}
              <div className="flex items-center justify-between text-xs relative z-10 border-b border-[var(--crt-phosphor-dim)]/40 pb-1.5">
                <div className="flex items-center gap-1.5 font-bold tracking-wider text-[var(--crt-phosphor-bright)]">
                  <div className="w-2 h-2 rounded-full bg-[var(--crt-phosphor)] animate-ping" />
                  PIP-BOY HUD
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono opacity-80">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <button
                    onClick={() => {
                      pipAudio.playGeiger(3);
                      onScanAll();
                    }}
                    disabled={isScanning}
                    className="p-1 text-[var(--crt-phosphor)] hover:text-white cursor-pointer"
                    title="Обновить данные"
                  >
                    <RefreshCw size={12} className={isScanning ? 'animate-spin' : ''} />
                  </button>
                </div>
              </div>

              {/* Widget Middle Content */}
              <div className="relative z-10 my-auto py-1">
                {changedLinks.length > 0 ? (
                  <div className="bg-amber-950/40 border border-amber-500/80 rounded p-2 text-xs">
                    <div className="flex items-center justify-between text-[10px] text-amber-300 font-bold mb-0.5">
                      <span className="flex items-center gap-1">
                        <Bell size={10} className="animate-bounce" /> НОВЫЙ ДИФФ: {changedLinks.length} ИЗМ.
                      </span>
                      <span>СЕЙЧАС</span>
                    </div>
                    <div className="text-[11px] font-semibold text-amber-200 line-clamp-2">
                      {latestDiff ? latestDiff.summary : `${changedLinks[0].title}: Обнаружены правки контента`}
                    </div>
                  </div>
                ) : (
                  <div className="bg-black/60 border border-[var(--crt-phosphor-dim)]/40 rounded p-2 text-xs">
                    <div className="flex items-center justify-between text-[10px] opacity-70 mb-0.5">
                      <span>СТАТУС МОНИТОРИНГА:</span>
                      <span className="text-[var(--crt-phosphor-bright)] font-bold">АКТИВЕН</span>
                    </div>
                    <div className="text-[11px] font-mono text-[var(--crt-phosphor)] opacity-90 line-clamp-2">
                      {latestDiff
                        ? `Посл: ${latestDiff.summary}`
                        : `Все ${totalMonitored} порталов синхронизированы без задержек`}
                    </div>
                  </div>
                )}

                {/* If Large size: show extra cards */}
                {widgetSize === 'large' && (
                  <div className="mt-2 space-y-1">
                    <div className="text-[10px] opacity-70 uppercase font-bold">Последние ссылки:</div>
                    {links.slice(0, 3).map((l) => (
                      <div
                        key={l.id}
                        className="text-[10px] bg-black/40 border border-[var(--crt-phosphor-dim)]/30 p-1 rounded flex justify-between items-center"
                      >
                        <span className="truncate pr-1">{l.title}</span>
                        <span className="font-mono shrink-0 opacity-70">{l.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Widget Footer */}
              <div className="relative z-10 flex items-center justify-between text-[10px] pt-1.5 border-t border-[var(--crt-phosphor-dim)]/40 font-mono">
                <span className="opacity-75">РЕСУРСОВ: {totalMonitored}</span>
                <span className="text-[var(--crt-phosphor-bright)] font-bold">PIP-BOY STUDENT</span>
              </div>
            </div>

            {/* Dummy App Icons below widget */}
            <div className="grid grid-cols-4 gap-3 mt-4 px-2">
              {[
                { name: 'Календарь', color: 'bg-red-900/60' },
                { name: 'Заметки', color: 'bg-amber-900/60' },
                { name: 'Камера', color: 'bg-blue-900/60' },
                { name: 'Pip-Boy', color: 'bg-emerald-950 border border-green-500' }
              ].map((app) => (
                <div key={app.name} className="flex flex-col items-center gap-1">
                  <div className={`w-12 h-12 rounded-2xl ${app.color} flex items-center justify-center text-xs font-bold`}>
                    {app.name === 'Pip-Boy' ? 'PB' : ''}
                  </div>
                  <span className="text-[9px] text-zinc-400">{app.name}</span>
                </div>
              ))}
            </div>

            {/* Home indicator bar */}
            <div className="w-28 h-1 bg-zinc-600 rounded-full mx-auto mt-6" />
          </div>
        ) : (
          /* Desktop Screen Mockup */
          <div className="w-full max-w-xl bg-zinc-950 border-2 border-zinc-700 rounded-lg p-3 shadow-2xl space-y-3 font-mono">
            {/* Desktop window bar */}
            <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-2 text-[11px] font-sans">Рабочий стол студента (Desktop Widget View)</span>
              </div>
              <span className="text-[11px]">{currentTime.toLocaleTimeString()}</span>
            </div>

            {/* Desktop Desktop Canvas with Widget Pinned */}
            <div className="h-64 bg-[#08120b] border border-zinc-800 rounded p-4 relative flex items-start justify-end">
              {/* Background Wallpaper hint */}
              <div className="absolute inset-0 flex items-center justify-center text-zinc-800/40 text-4xl font-black select-none pointer-events-none">
                DESKTOP
              </div>

              {/* Pinned Desktop Widget Card */}
              <div className="w-72 border-2 border-[var(--crt-phosphor)] bg-[#050e06]/95 p-3 rounded-lg box-glow relative z-10 space-y-2">
                <div className="flex items-center justify-between text-xs border-b border-[var(--crt-phosphor-dim)] pb-1">
                  <span className="font-bold text-[var(--crt-phosphor-bright)] flex items-center gap-1">
                    <Zap size={12} /> PIP-BOY DESKTOP WIDGET
                  </span>
                  <button
                    onClick={() => {
                      pipAudio.playGeiger(2);
                      onScanAll();
                    }}
                    className="p-1 hover:text-white cursor-pointer"
                  >
                    <RefreshCw size={11} className={isScanning ? 'animate-spin' : ''} />
                  </button>
                </div>

                <div className="text-[11px]">
                  {changedLinks.length > 0 ? (
                    <div className="text-amber-300 font-bold bg-amber-950/40 p-1.5 rounded border border-amber-500/60">
                      ⚡ {changedLinks.length} новых изменений контента!
                    </div>
                  ) : (
                    <div className="opacity-80">
                      Все ресурсы актуальны. Опрос в фоне активен.
                    </div>
                  )}
                </div>

                <div className="text-[10px] opacity-60 flex justify-between items-center pt-1 border-t border-[var(--crt-phosphor-dim)]/40">
                  <span>Отслеживается: {totalMonitored} ссылок</span>
                  <span className="text-[var(--crt-phosphor-bright)]">Auto-sync: ON</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Guide to add Widget */}
      <div className="border border-[var(--crt-phosphor-dim)] p-4 rounded bg-black/40 space-y-2 text-xs">
        <div className="font-bold uppercase tracking-wider text-[var(--crt-phosphor-bright)] flex items-center gap-1.5">
          <Sparkles size={14} /> КАК ЗАКРЕПИТЬ ВИДЖЕТ НА ГЛАВНОМ ЭКРАНЕ:
        </div>
        <ul className="list-disc list-inside space-y-1 opacity-85 leading-relaxed">
          <li>
            <strong>На Android / Chrome:</strong> Установите приложение через вкладку «УСТАНОВКА PWA», зажмите иконку приложения на главном экране и выберите «Виджеты» или используйте быстрый ярлык «Виджет обновлений».
          </li>
          <li>
            <strong>На iPhone / iPad (iOS Safari):</strong> Откройте страницу виджета, нажмите кнопку «Поделиться» [↑] и выберите «На экран «Домой»». Ярлык откроет компактную версию виджета без лишних панелей браузера.
          </li>
          <li>
            <strong>На ПК (Windows / Mac / Linux):</strong> Нажмите кнопку «РЕЖИМ ПЛАВАЮЩЕГО HUD» выше. Приложение свернется в компактное полупрозрачное окно-виджет, которое можно закрепить в углу экрана во время учебы или написания диплома!
          </li>
        </ul>
      </div>
    </div>
  );
};
