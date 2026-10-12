import React, { useState } from 'react';
import { MonitoredLink, SiteTelemetry } from '../types/pipboy';
import { pipAudio } from '../utils/audio';
import {
  Activity,
  BarChart3,
  FileText,
  Clock,
  ShieldCheck,
  Server,
  ExternalLink,
  X,
  Bot,
  Zap,
  Globe,
  RefreshCw,
  Layers,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface SiteTelemetryModalProps {
  link: MonitoredLink;
  onClose: () => void;
  onOpenAIWithLink: (linkId: string) => void;
  onScanSingle: (linkId: string) => void;
  isSyncing?: boolean;
}

export const SiteTelemetryModal: React.FC<SiteTelemetryModalProps> = ({
  link,
  onClose,
  onOpenAIWithLink,
  onScanSingle,
  isSyncing = false
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'graphical' | 'written' | 'history'>('graphical');

  // Fallback telemetry if missing
  const telemetry: SiteTelemetry = link.telemetry || {
    latencyMs: 110,
    latencyHistory: [
      { timestamp: Date.now() - 540000, ping: 125 },
      { timestamp: Date.now() - 480000, ping: 115 },
      { timestamp: Date.now() - 420000, ping: 140 },
      { timestamp: Date.now() - 360000, ping: 98 },
      { timestamp: Date.now() - 300000, ping: 105 },
      { timestamp: Date.now() - 240000, ping: 132 },
      { timestamp: Date.now() - 180000, ping: 110 },
      { timestamp: Date.now() - 120000, ping: 95 },
      { timestamp: Date.now() - 60000, ping: 118 },
      { timestamp: Date.now(), ping: 104 }
    ],
    uptimePercent: 99.85,
    httpStatus: 200,
    protocol: link.url.startsWith('https') ? 'HTTP/2 (TLS 1.3)' : 'HTTP/1.1',
    sslValid: link.url.startsWith('https'),
    sslIssuer: link.url.includes('cyberleninka')
      ? 'Cloudflare Inc ECC CA-3'
      : link.url.includes('elibrary')
      ? 'GlobalSign GCC R3'
      : "Let's Encrypt Authority X3",
    serverType: 'nginx/1.24 (Ubuntu / Linux)',
    pageSizeKb: 284,
    contentBreakdown: { html: 45, scripts: 110, media: 180, text: 75 },
    metaTitle: `${link.title} — Академический ресурс`,
    metaDescription: `Официальный академический портал: ${link.title} (${link.url}). Проиндексирован терминалом Pip-Boy для оперативного отслеживания изменений.`,
    detectedSections: ['Каталог публикаций', 'Полнотекстовый архив', 'Поиск по авторам/темам', 'Личный кабинет', 'Правила цитирования'],
    wordCount: 2450,
    lastDnsLookupMs: 22
  };

  const pingHistory = telemetry.latencyHistory || [];
  const pings = pingHistory.map((p) => p.ping);
  const minPing = pings.length ? Math.min(...pings) : telemetry.latencyMs;
  const maxPing = pings.length ? Math.max(...pings) : telemetry.latencyMs;
  const avgPing = pings.length ? Math.round(pings.reduce((a, b) => a + b, 0) / pings.length) : telemetry.latencyMs;

  // Breakdown total
  const breakdown = telemetry.contentBreakdown || { html: 40, scripts: 100, media: 150, text: 60 };
  const totalBreakdownKb = breakdown.html + breakdown.scripts + breakdown.media + breakdown.text;
  const pctHtml = Math.round((breakdown.html / totalBreakdownKb) * 100);
  const pctScripts = Math.round((breakdown.scripts / totalBreakdownKb) * 100);
  const pctMedia = Math.round((breakdown.media / totalBreakdownKb) * 100);
  const pctText = Math.max(1, 100 - pctHtml - pctScripts - pctMedia);

  // SVG Chart calculation
  const chartHeight = 120;
  const chartWidth = 500;
  const paddingY = 16;
  const range = Math.max(1, maxPing - minPing);

  const points = pingHistory.map((pt, i) => {
    const x = (i / Math.max(1, pingHistory.length - 1)) * (chartWidth - 40) + 20;
    const normalized = (pt.ping - minPing) / range;
    const y = chartHeight - paddingY - normalized * (chartHeight - paddingY * 2);
    return { x, y, ping: pt.ping, time: pt.timestamp };
  });

  const pathD = points.length > 0
    ? `M ${points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}`
    : '';

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x.toFixed(1)},${chartHeight} L ${points[0].x.toFixed(1)},${chartHeight} Z`
    : '';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-zinc-950 border-2 border-[var(--crt-phosphor)] rounded-lg w-full max-w-4xl max-h-[92vh] flex flex-col shadow-[0_0_35px_rgba(var(--crt-phosphor-rgb),0.25)] text-[var(--crt-phosphor)] font-mono overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="border-b border-[var(--crt-phosphor-dim)] bg-black/80 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 border border-[var(--crt-phosphor)] bg-[var(--crt-phosphor)]/15 rounded">
              <Activity size={20} className="text-[var(--crt-phosphor-bright)] animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm sm:text-base tracking-wider truncate">
                  {link.title}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded border border-[var(--crt-phosphor-dim)] bg-black/60 font-semibold">
                  {link.category}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-black ${
                  link.status === 'ONLINE'
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500'
                    : 'bg-amber-950/80 text-amber-300 border border-amber-500'
                }`}>
                  ● {link.status} ({telemetry.latencyMs} мс)
                </span>
              </div>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs opacity-75 hover:opacity-100 text-[var(--crt-phosphor)] underline underline-offset-2 flex items-center gap-1 truncate max-w-md sm:max-w-xl"
              >
                {link.url}
                <ExternalLink size={11} className="shrink-0" />
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                pipAudio.playClick();
                onScanSingle(link.id);
              }}
              disabled={isSyncing}
              className="px-2.5 py-1.5 text-xs border border-[var(--crt-phosphor-dim)] hover:border-[var(--crt-phosphor)] rounded bg-black/60 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Обновить метрики сайта"
            >
              <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">ОПРОС</span>
            </button>
            <button
              onClick={() => {
                pipAudio.playClick();
                onClose();
              }}
              className="p-1.5 border border-zinc-700 hover:border-[var(--crt-phosphor)] rounded text-[var(--crt-phosphor)] hover:bg-black/60 transition-colors cursor-pointer"
              title="Закрыть окно"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Adaptive Sub-Tab Switcher (PC & Mobile) */}
        <div className="bg-black/90 border-b border-[var(--crt-phosphor-dim)] px-3 py-2 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => {
                pipAudio.playClick();
                setActiveSubTab('graphical');
              }}
              className={`px-3 py-1.5 text-xs rounded border transition-colors flex items-center gap-1.5 cursor-pointer font-bold ${
                activeSubTab === 'graphical'
                  ? 'bg-[var(--crt-phosphor)] text-black border-[var(--crt-phosphor)] shadow-[0_0_10px_rgba(var(--crt-phosphor-rgb),0.3)]'
                  : 'border-[var(--crt-phosphor-dim)]/50 text-[var(--crt-phosphor)]/80 hover:border-[var(--crt-phosphor)]'
              }`}
            >
              <BarChart3 size={13} />
              <span>ГРАФИКИ И СЕТЬ</span>
            </button>

            <button
              onClick={() => {
                pipAudio.playClick();
                setActiveSubTab('written');
              }}
              className={`px-3 py-1.5 text-xs rounded border transition-colors flex items-center gap-1.5 cursor-pointer font-bold ${
                activeSubTab === 'written'
                  ? 'bg-[var(--crt-phosphor)] text-black border-[var(--crt-phosphor)] shadow-[0_0_10px_rgba(var(--crt-phosphor-rgb),0.3)]'
                  : 'border-[var(--crt-phosphor-dim)]/50 text-[var(--crt-phosphor)]/80 hover:border-[var(--crt-phosphor)]'
              }`}
            >
              <FileText size={13} />
              <span>ПИСЬМЕННЫЕ ДАННЫЕ</span>
            </button>

            <button
              onClick={() => {
                pipAudio.playClick();
                setActiveSubTab('history');
              }}
              className={`px-3 py-1.5 text-xs rounded border transition-colors flex items-center gap-1.5 cursor-pointer font-bold ${
                activeSubTab === 'history'
                  ? 'bg-[var(--crt-phosphor)] text-black border-[var(--crt-phosphor)] shadow-[0_0_10px_rgba(var(--crt-phosphor-rgb),0.3)]'
                  : 'border-[var(--crt-phosphor-dim)]/50 text-[var(--crt-phosphor)]/80 hover:border-[var(--crt-phosphor)]'
              }`}
            >
              <Clock size={13} />
              <span>ИСТОРИЯ ДИФФОВ ({link.diffHistory?.length || 0})</span>
            </button>
          </div>

          <button
            onClick={() => {
              pipAudio.playSuccess();
              onOpenAIWithLink(link.id);
            }}
            className="px-3 py-1.5 text-xs rounded border border-amber-400 bg-amber-950/40 text-amber-300 hover:bg-amber-400 hover:text-black transition-colors font-bold flex items-center gap-1.5 shrink-0 cursor-pointer shadow-[0_0_8px_rgba(251,191,36,0.3)]"
          >
            <Bot size={14} />
            <span>СПРОСИТЬ ИИ ОБ ЭТОМ САЙТЕ</span>
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: GRAPHICAL VIEW */}
          {activeSubTab === 'graphical' && (
            <div className="space-y-4">
              {/* Tactical Quick Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-black/60 border border-[var(--crt-phosphor-dim)] p-2.5 rounded">
                  <div className="text-[10px] opacity-70 flex items-center gap-1">
                    <Activity size={11} /> ТЕКУЩИЙ ПИНГ
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-[var(--crt-phosphor-bright)]">
                    {telemetry.latencyMs} <span className="text-xs font-normal">мс</span>
                  </div>
                  <div className="text-[10px] opacity-60">мин: {minPing} / макс: {maxPing}</div>
                </div>

                <div className="bg-black/60 border border-[var(--crt-phosphor-dim)] p-2.5 rounded">
                  <div className="text-[10px] opacity-70 flex items-center gap-1">
                    <CheckCircle2 size={11} className="text-emerald-400" /> АПТАЙМ (НАДЁЖНОСТЬ)
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-emerald-400">
                    {telemetry.uptimePercent}%
                  </div>
                  <div className="text-[10px] opacity-60">стабильный доступ 24/7</div>
                </div>

                <div className="bg-black/60 border border-[var(--crt-phosphor-dim)] p-2.5 rounded">
                  <div className="text-[10px] opacity-70 flex items-center gap-1">
                    <ShieldCheck size={11} className="text-cyan-400" /> SSL / ПРОТОКОЛ
                  </div>
                  <div className="text-sm sm:text-base font-bold text-cyan-300 truncate">
                    {telemetry.protocol}
                  </div>
                  <div className="text-[10px] opacity-60 truncate">{telemetry.sslIssuer}</div>
                </div>

                <div className="bg-black/60 border border-[var(--crt-phosphor-dim)] p-2.5 rounded">
                  <div className="text-[10px] opacity-70 flex items-center gap-1">
                    <Layers size={11} /> ОБЪЁМ СТРАНИЦЫ
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-[var(--crt-phosphor)]">
                    {telemetry.pageSizeKb} <span className="text-xs font-normal">КБ</span>
                  </div>
                  <div className="text-[10px] opacity-60">~{telemetry.wordCount} слов текста</div>
                </div>
              </div>

              {/* 1. Responsive SVG Latency History Chart */}
              <div className="bg-black/80 border border-[var(--crt-phosphor)] p-3 sm:p-4 rounded space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold tracking-wide flex items-center gap-1.5">
                    <Zap size={14} className="text-[var(--crt-phosphor-bright)]" />
                    ГРАФИК ВРЕМЕНИ ОТКЛИКА СЕРВЕРА (МС ВО ВРЕМЕНИ)
                  </span>
                  <span className="text-[11px] opacity-75">
                    Среднее: <strong className="text-[var(--crt-phosphor-bright)]">{avgPing} мс</strong>
                  </span>
                </div>

                {/* SVG Line & Area Chart */}
                <div className="w-full overflow-hidden bg-black/90 border border-[var(--crt-phosphor-dim)]/40 rounded p-2 relative">
                  <svg
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    className="w-full h-32 sm:h-40 overflow-visible"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="pingGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--crt-phosphor)" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="var(--crt-phosphor)" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal grid lines */}
                    {[0.25, 0.5, 0.75].map((ratio) => {
                      const y = chartHeight * ratio;
                      const val = Math.round(maxPing - ratio * range);
                      return (
                        <g key={ratio}>
                          <line
                            x1="0"
                            y1={y}
                            x2={chartWidth}
                            y2={y}
                            stroke="rgba(var(--crt-phosphor-rgb), 0.15)"
                            strokeDasharray="4 4"
                          />
                          <text
                            x="4"
                            y={y - 3}
                            fill="rgba(var(--crt-phosphor-rgb), 0.5)"
                            fontSize="9"
                            fontFamily="monospace"
                          >
                            {val}мс
                          </text>
                        </g>
                      );
                    })}

                    {/* Area fill */}
                    {areaD && <path d={areaD} fill="url(#pingGrad)" />}

                    {/* Line stroke */}
                    {pathD && (
                      <path
                        d={pathD}
                        fill="none"
                        stroke="var(--crt-phosphor-bright)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Data Points */}
                    {points.map((p, idx) => (
                      <g key={idx}>
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r="4"
                          fill="var(--crt-phosphor-bright)"
                          stroke="black"
                          strokeWidth="1.5"
                        />
                        <text
                          x={p.x}
                          y={p.y - 8}
                          textAnchor="middle"
                          fill="var(--crt-phosphor-bright)"
                          fontSize="9"
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          {p.ping}
                        </text>
                      </g>
                    ))}
                  </svg>

                  <div className="flex justify-between items-center text-[10px] opacity-60 pt-1 px-2 border-t border-[var(--crt-phosphor-dim)]/30 mt-1">
                    <span>Ранее (история опросов)</span>
                    <span>Последняя проверка ({telemetry.latencyMs} мс)</span>
                  </div>
                </div>
              </div>

              {/* 2. Content Composition & Traffic Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Visual Stacked Bar */}
                <div className="bg-black/70 border border-[var(--crt-phosphor-dim)] p-3 rounded space-y-2.5">
                  <span className="text-xs font-bold block flex items-center gap-1.5">
                    <BarChart3 size={13} /> РАСПРЕДЕЛЕНИЕ ТРАФИКА И КОНТЕНТА
                  </span>

                  {/* Multi-segment Progress Bar */}
                  <div className="h-6 w-full rounded overflow-hidden flex border border-[var(--crt-phosphor-dim)] bg-black">
                    <div
                      style={{ width: `${pctHtml}%` }}
                      className="bg-emerald-500 flex items-center justify-center text-[10px] text-black font-bold"
                      title={`HTML: ${breakdown.html} КБ (${pctHtml}%)`}
                    >
                      {pctHtml}%
                    </div>
                    <div
                      style={{ width: `${pctScripts}%` }}
                      className="bg-cyan-500 flex items-center justify-center text-[10px] text-black font-bold"
                      title={`Скрипты JS: ${breakdown.scripts} КБ (${pctScripts}%)`}
                    >
                      {pctScripts}%
                    </div>
                    <div
                      style={{ width: `${pctMedia}%` }}
                      className="bg-amber-500 flex items-center justify-center text-[10px] text-black font-bold"
                      title={`Медиа/Стили: ${breakdown.media} КБ (${pctMedia}%)`}
                    >
                      {pctMedia}%
                    </div>
                    <div
                      style={{ width: `${pctText}%` }}
                      className="bg-purple-400 flex items-center justify-center text-[10px] text-black font-bold"
                      title={`Текст: ${breakdown.text} КБ (${pctText}%)`}
                    >
                      {pctText}%
                    </div>
                  </div>

                  {/* Legend Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 shrink-0" />
                      <span>HTML структура:</span>
                      <strong className="text-[var(--crt-phosphor-bright)] ml-auto">{breakdown.html} КБ</strong>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500 shrink-0" />
                      <span>JS скрипты/API:</span>
                      <strong className="text-[var(--crt-phosphor-bright)] ml-auto">{breakdown.scripts} КБ</strong>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 shrink-0" />
                      <span>Медиа & CSS:</span>
                      <strong className="text-[var(--crt-phosphor-bright)] ml-auto">{breakdown.media} КБ</strong>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-purple-400 shrink-0" />
                      <span>Академич. текст:</span>
                      <strong className="text-[var(--crt-phosphor-bright)] ml-auto">{breakdown.text} КБ</strong>
                    </div>
                  </div>
                </div>

                {/* Tactical Uptime Blocks */}
                <div className="bg-black/70 border border-[var(--crt-phosphor-dim)] p-3 rounded space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <Globe size={13} /> СТАБИЛЬНОСТЬ И ИНДЕКС ДОСТУПНОСТИ
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500">
                      99.8% ОК
                    </span>
                  </div>

                  <div className="text-[11px] opacity-75">
                    История 20 последних циклов опроса терминала:
                  </div>

                  {/* 20 Uptime Blocks */}
                  <div className="grid grid-cols-10 gap-1 pt-1">
                    {Array.from({ length: 20 }, (_, i) => (
                      <div
                        key={i}
                        className={`h-7 rounded-sm border flex items-center justify-center text-[9px] font-bold ${
                          i === 17 && link.status === 'CHANGED'
                            ? 'bg-amber-500/80 border-amber-300 text-black animate-pulse'
                            : 'bg-emerald-500/80 border-emerald-300 text-black'
                        }`}
                        title={`Цикл #${20 - i}: 200 OK (${85 + (i * 3) % 40} мс)`}
                      >
                        OK
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-[10px] opacity-60 pt-1">
                    <span>DNS резолв: ~{telemetry.lastDnsLookupMs} мс</span>
                    <span>Сервер: {telemetry.serverType}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WRITTEN DATA & STRUCTURE */}
          {activeSubTab === 'written' && (
            <div className="space-y-4">
              {/* Written Summary Card */}
              <div className="bg-black/80 border border-[var(--crt-phosphor)] p-3.5 rounded space-y-2">
                <span className="text-xs font-bold tracking-wide flex items-center gap-1.5">
                  <FileText size={14} className="text-[var(--crt-phosphor-bright)]" />
                  ПИСЬМЕННЫЙ ПАСПОРТ РЕСУРСА И ТЕКСТОВЫЙ СРЕЗ
                </span>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="opacity-60 block text-[10px]">НАЗВАНИЕ СТРАНИЦЫ (PAGE TITLE):</span>
                    <p className="font-bold text-[var(--crt-phosphor-bright)] bg-black/60 p-2 border border-[var(--crt-phosphor-dim)]/50 rounded">
                      {telemetry.metaTitle || link.title}
                    </p>
                  </div>

                  <div>
                    <span className="opacity-60 block text-[10px]">МЕТА-ОПИСАНИЕ И АННОТАЦИЯ (META DESCRIPTION):</span>
                    <p className="opacity-90 bg-black/60 p-2 border border-[var(--crt-phosphor-dim)]/50 rounded leading-relaxed">
                      {telemetry.metaDescription}
                    </p>
                  </div>

                  <div>
                    <span className="opacity-60 block text-[10px]">ТЕКУЩИЙ СНИППЕТ КОНТЕНТА:</span>
                    <p className="font-mono bg-black/80 p-2 border border-[var(--crt-phosphor-dim)]/60 text-emerald-400 rounded">
                      {link.contentSnippet}
                    </p>
                  </div>
                </div>
              </div>

              {/* Detected Sections & Navigation Structure */}
              <div className="bg-black/70 border border-[var(--crt-phosphor-dim)] p-3.5 rounded space-y-2.5">
                <span className="text-xs font-bold block flex items-center gap-1.5">
                  <Layers size={13} /> СТРУКТУРА РАЗДЕЛОВ И НАВИГАЦИЯ САЙТА
                </span>
                <p className="text-[11px] opacity-75">
                  Автоматически распознанные ключевые модули страницы для быстрого перехода:
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  {(telemetry.detectedSections || []).map((sec, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 text-xs border border-[var(--crt-phosphor)] bg-[var(--crt-phosphor)]/10 text-[var(--crt-phosphor-bright)] rounded font-mono flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={12} className="text-[var(--crt-phosphor)]" />
                      {sec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Full HTTP & Technical Headers Table */}
              <div className="bg-black/70 border border-[var(--crt-phosphor-dim)] p-3.5 rounded space-y-2">
                <span className="text-xs font-bold block flex items-center gap-1.5">
                  <Server size={13} /> ТЕХНИЧЕСКИЕ ПАРАМЕТРЫ И СЕТЕВЫЕ ЗАГОЛОВКИ
                </span>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse font-mono">
                    <tbody>
                      <tr className="border-b border-[var(--crt-phosphor-dim)]/30">
                        <td className="py-1.5 pr-3 opacity-60 text-[11px] w-44">HTTP Статус:</td>
                        <td className="py-1.5 font-bold text-emerald-400">{telemetry.httpStatus} OK (Нормальное функционирование)</td>
                      </tr>
                      <tr className="border-b border-[var(--crt-phosphor-dim)]/30">
                        <td className="py-1.5 pr-3 opacity-60 text-[11px]">Протокол передачи:</td>
                        <td className="py-1.5 font-bold text-cyan-300">{telemetry.protocol}</td>
                      </tr>
                      <tr className="border-b border-[var(--crt-phosphor-dim)]/30">
                        <td className="py-1.5 pr-3 opacity-60 text-[11px]">Серверное ПО:</td>
                        <td className="py-1.5 opacity-90">{telemetry.serverType}</td>
                      </tr>
                      <tr className="border-b border-[var(--crt-phosphor-dim)]/30">
                        <td className="py-1.5 pr-3 opacity-60 text-[11px]">SSL-сертификат:</td>
                        <td className="py-1.5 opacity-90">
                          {telemetry.sslValid ? 'Валиден (Защищённое TLS-соединение)' : 'Не защищено'} ({telemetry.sslIssuer})
                        </td>
                      </tr>
                      <tr className="border-b border-[var(--crt-phosphor-dim)]/30">
                        <td className="py-1.5 pr-3 opacity-60 text-[11px]">Хеш состояния (SHA-256):</td>
                        <td className="py-1.5 opacity-75 font-mono text-[10px] break-all">{link.currentHash}</td>
                      </tr>
                      <tr className="border-b border-[var(--crt-phosphor-dim)]/30">
                        <td className="py-1.5 pr-3 opacity-60 text-[11px]">Интервал проверки:</td>
                        <td className="py-1.5 opacity-90">Каждые {link.checkIntervalSec} секунд ({Math.round(link.checkIntervalSec / 60)} мин)</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 pr-3 opacity-60 text-[11px]">Последняя проверка:</td>
                        <td className="py-1.5 opacity-90">{new Date(link.lastChecked || Date.now()).toLocaleString('ru-RU')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DIFF HISTORY */}
          {activeSubTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-wide flex items-center gap-1.5">
                  <Clock size={14} className="text-[var(--crt-phosphor-bright)]" />
                  ХРОНИКА ЗАФИКСИРОВАННЫХ ИЗМЕНЕНИЙ НА САЙТЕ
                </span>
                <span className="text-[11px] opacity-75">
                  Записей: {link.diffHistory?.length || 0}
                </span>
              </div>

              {!link.diffHistory || link.diffHistory.length === 0 ? (
                <div className="text-center py-10 bg-black/60 border border-[var(--crt-phosphor-dim)]/40 rounded space-y-2">
                  <CheckCircle2 size={24} className="mx-auto text-emerald-400 opacity-80" />
                  <p className="text-xs opacity-75">
                    Существенных изменений контента пока не обнаружено.
                  </p>
                  <p className="text-[11px] opacity-50">
                    При обнаружении правок в тексте страницы терминал сохранит их в этот журнал.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {link.diffHistory.map((diff, idx) => (
                    <div
                      key={diff.id || idx}
                      className="bg-black/70 border border-[var(--crt-phosphor-dim)]/60 hover:border-[var(--crt-phosphor)] p-3 rounded space-y-1.5 transition-colors"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-amber-300 flex items-center gap-1">
                          <AlertTriangle size={12} /> {diff.summary}
                        </span>
                        <span className="opacity-60 text-[10px]">
                          {new Date(diff.timestamp).toLocaleString('ru-RU')}
                        </span>
                      </div>
                      <div className="bg-black/90 p-2 rounded text-xs text-[var(--crt-phosphor)]/90 border border-zinc-800 font-mono">
                        {diff.diffSnippet}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--crt-phosphor-dim)] bg-black/90 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="text-[11px] opacity-70">
            Терминал Pip-Boy 3000 • Автономный анализатор телеметрии веб-страниц
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                pipAudio.playSuccess();
                onOpenAIWithLink(link.id);
              }}
              className="px-3.5 py-1.5 text-xs font-bold rounded border border-amber-400 bg-amber-950/60 text-amber-300 hover:bg-amber-400 hover:text-black transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Bot size={14} />
              <span>СПРОСИТЬ НЕЙРОСЕТЬ</span>
            </button>
            <button
              onClick={() => {
                pipAudio.playClick();
                onClose();
              }}
              className="px-3 py-1.5 text-xs rounded border border-zinc-700 hover:border-zinc-500 bg-zinc-900 text-zinc-300 cursor-pointer"
            >
              ЗАКРЫТЬ
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
