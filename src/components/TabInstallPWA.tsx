import React, { useState, useEffect } from 'react';
import {
  requestNotificationPermission,
  getNotificationPermissionStatus,
  sendNativeNotification
} from '../utils/notifications';
import { pipAudio } from '../utils/audio';
import {
  Download,
  Bell,
  Smartphone,
  Monitor,
  CheckCircle,
  AlertCircle,
  Share,
  PlusSquare,
  ShieldCheck,
  Zap,
  Volume2
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const TabInstallPWA: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed PWA)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // Notification permission status
    setPermissionStatus(getNotificationPermissionStatus());

    // Listen for PWA install event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      pipAudio.playClick();
      alert('Для установки приложения используйте меню браузера: значок установки в адресной строке ПК или меню «Установить на телефон».');
      return;
    }

    pipAudio.playSuccess();
    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setInstallPrompt(null);
      }
    } catch (err) {
      console.warn('Install prompt error:', err);
    }
  };

  const handleRequestPush = async () => {
    pipAudio.playClick();
    const res = await requestNotificationPermission();
    setPermissionStatus(res.permission);
  };

  const handleSendTestPush = () => {
    pipAudio.playAlert();
    const sent = sendNativeNotification({
      title: '🚨 PIP-BOY 3000: ТЕСТОВОЕ ОПОВЕЩЕНИЕ',
      body: 'Связь с тактической шиной студента установлена! Изменения в ведомостях и научных базах будут приходить мгновенно.',
      icon: '/icon-192.svg'
    });
    setTestSent(true);
    setTimeout(() => setTestSent(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="border border-[var(--crt-phosphor-dim)] bg-black/40 p-4 rounded flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-sm font-bold uppercase tracking-wider text-[var(--crt-phosphor-bright)] flex items-center gap-2">
            <Download size={18} /> УСТАНОВКА НА РАБОЧИЙ СТОЛ & REAL-TIME PUSH
          </div>
          <div className="text-xs opacity-75 mt-1 max-w-xl">
            Установите Pip-Boy Student OS как автономное приложение на ПК (Windows/Mac) или телефон (Android/iOS) для фоновой работы, офлайн-режима и мгновенных системных push-оповещений.
          </div>
        </div>

        {isInstalled ? (
          <div className="flex items-center gap-2 bg-[var(--crt-phosphor)]/20 border border-[var(--crt-phosphor)] text-[var(--crt-phosphor-bright)] px-4 py-2 rounded text-xs font-bold">
            <CheckCircle size={16} /> ПРИЛОЖЕНИЕ УСТАНОВЛЕНО
          </div>
        ) : (
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--crt-phosphor)] text-black font-extrabold text-xs rounded cursor-pointer hover:bg-[var(--crt-phosphor-bright)] transition-colors box-glow-subtle uppercase tracking-wider"
          >
            <Download size={15} /> УСТАНОВИТЬ НА УСТРОЙСТВО
          </button>
        )}
      </div>

      {/* Push Notifications Setup Card */}
      <div className="border-2 border-[var(--crt-phosphor)] bg-black/50 p-4 rounded space-y-3 box-glow-subtle">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--crt-phosphor-dim)] pb-2">
          <div className="flex items-center gap-2">
            <Bell className="text-[var(--crt-phosphor-bright)] animate-bounce" size={18} />
            <div className="font-bold text-xs uppercase tracking-wider">
              КАНАЛ ОПОВЕЩЕНИЙ PIP-BOY (WEB PUSH API)
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="opacity-75">Статус разрешений:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase font-mono ${
                permissionStatus === 'granted'
                  ? 'bg-green-900/60 text-green-300 border border-green-500'
                  : permissionStatus === 'denied'
                  ? 'bg-red-900/60 text-red-300 border border-red-500'
                  : 'bg-amber-900/60 text-amber-300 border border-amber-500'
              }`}
            >
              {permissionStatus === 'granted'
                ? 'РАЗРЕШЕНО'
                : permissionStatus === 'denied'
                ? 'ЗАБЛОКИРОВАНО'
                : 'ОЖИДАЕТ РАЗРЕШЕНИЯ'}
            </span>
          </div>
        </div>

        <p className="text-xs opacity-85 leading-relaxed">
          Система использует нативные браузерные Web Notifications & Service Worker для отправки пушей в шторку смартфона или системный трей Windows / macOS даже когда вкладка не активна.
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          {permissionStatus !== 'granted' && (
            <button
              onClick={handleRequestPush}
              className="flex items-center gap-1.5 px-4 py-2 bg-[var(--crt-phosphor)] text-black font-bold text-xs rounded cursor-pointer hover:bg-[var(--crt-phosphor-bright)] transition-colors"
            >
              <ShieldCheck size={14} /> ЗАПРОСИТЬ РАЗРЕШЕНИЕ НА PUSH
            </button>
          )}

          <button
            onClick={handleSendTestPush}
            className="flex items-center gap-1.5 px-4 py-2 border border-[var(--crt-phosphor)] bg-black text-[var(--crt-phosphor)] hover:bg-[var(--crt-phosphor)]/20 font-bold text-xs rounded cursor-pointer transition-colors"
          >
            <Zap size={14} /> ТЕСТОВОЕ PUSH-ОПОВЕЩЕНИЕ
          </button>
        </div>

        {testSent && (
          <div className="text-xs text-[var(--crt-phosphor-bright)] bg-green-950/40 border border-green-500/60 p-2 rounded flex items-center gap-2 animate-fade-in">
            <CheckCircle size={14} /> Тестовое оповещение отправлено на операционную систему! Проверьте системные уведомления.
          </div>
        )}
      </div>

      {/* OS Specific Guides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PC Guide */}
        <div className="border border-[var(--crt-phosphor-dim)] bg-black/40 p-4 rounded space-y-3">
          <div className="font-bold text-xs uppercase tracking-wider text-[var(--crt-phosphor-bright)] flex items-center gap-2">
            <Monitor size={16} /> ИНСТРУКЦИЯ ДЛЯ ПК (WINDOWS / MAC / LINUX)
          </div>

          <div className="space-y-2 text-xs opacity-85 leading-relaxed">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 flex items-center justify-center border border-[var(--crt-phosphor)] rounded-sm text-[10px] shrink-0 font-bold">1</span>
              <div>
                В адресной строке <strong>Google Chrome</strong> или <strong>Microsoft Edge</strong> нажмите на иконку монитора со стрелкой <strong>«Установить приложение»</strong> (справа в строке).
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-5 h-5 flex items-center justify-center border border-[var(--crt-phosphor)] rounded-sm text-[10px] shrink-0 font-bold">2</span>
              <div>
                Или нажмите меню браузера (<strong>три точки ⋮</strong>) → <strong>«Сохранить и поделиться»</strong> → <strong>«Установить страницу как приложение»</strong>.
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-5 h-5 flex items-center justify-center border border-[var(--crt-phosphor)] rounded-sm text-[10px] shrink-0 font-bold">3</span>
              <div>
                Ярлык <strong>«Pip-Boy 3000»</strong> появится на рабочем столе и в меню «Пуск» / Dock с возможностью автозапуска.
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Guide */}
        <div className="border border-[var(--crt-phosphor-dim)] bg-black/40 p-4 rounded space-y-3">
          <div className="font-bold text-xs uppercase tracking-wider text-[var(--crt-phosphor-bright)] flex items-center gap-2">
            <Smartphone size={16} /> ИНСТРУКЦИЯ ДЛЯ ТЕЛЕФОНА (ANDROID / IOS)
          </div>

          <div className="space-y-2 text-xs opacity-85 leading-relaxed">
            <div className="border-b border-[var(--crt-phosphor-dim)]/40 pb-2">
              <strong className="text-[var(--crt-phosphor-bright)] block mb-1">Android (Chrome / Samsung Internet):</strong>
              <div>
                Нажмите меню браузера (<strong>три точки ⋮</strong>) → выберите <strong>«Установить приложение»</strong> или <strong>«Добавить на главный экран»</strong>.
              </div>
            </div>

            <div>
              <strong className="text-[var(--crt-phosphor-bright)] block mb-1">iPhone / iPad (iOS Safari):</strong>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  1. Нажмите кнопку <Share size={12} className="inline text-blue-400" /> <strong>«Поделиться»</strong> внизу Safari.
                </div>
                <div className="flex items-center gap-1.5">
                  2. Прокрутите вниз и нажмите <PlusSquare size={12} className="inline" /> <strong>«На экран «Домой»»</strong>.
                </div>
                <div>3. Нажмите «Добавить» — Pip-Boy откроется как отдельное приложение без рамок!</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
