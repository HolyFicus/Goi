import React, { useState, useMemo } from 'react';
import { MonitoredLink, CustomCategory } from '../types/pipboy';
import { pipAudio } from '../utils/audio';
import { SiteTelemetryModal } from './SiteTelemetryModal';
import { SiteAIConsultantModal } from './SiteAIConsultantModal';
import {
  Globe,
  RefreshCw,
  Plus,
  ExternalLink,
  Bell,
  BellOff,
  History,
  Trash2,
  Clock,
  Radio,
  FileCode,
  Zap,
  Search,
  Tag,
  FolderPlus,
  FolderEdit,
  X,
  Edit2,
  Check,
  Hash,
  BarChart3,
  Bot,
  Activity,
  FileText,
  Sparkles,
  LayoutGrid,
  List,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface TabMonitorProps {
  links: MonitoredLink[];
  categories: CustomCategory[];
  isScanningAll: boolean;
  onScanAll: () => void;
  onScanSingle: (id: string) => void;
  onSimulateChange: (id: string) => void;
  onAddLink: (newLink: Omit<MonitoredLink, 'id' | 'lastChecked' | 'lastUpdated' | 'status' | 'currentHash' | 'diffHistory'>) => void;
  onDeleteLink: (id: string) => void;
  onToggleNotification: (id: string) => void;
  onUpdateLinkTags: (id: string, tags: string[]) => void;
  onUpdateLinkCategory: (id: string, category: string) => void;
  onUpdateLinkInterval?: (id: string, intervalSec: number) => void;
  onAddCategory: (category: CustomCategory) => void;
  onRenameCategory: (id: string, newName: string) => void;
  onDeleteCategory: (id: string) => void;
}

export const TabMonitor: React.FC<TabMonitorProps> = ({
  links,
  categories,
  isScanningAll,
  onScanAll,
  onScanSingle,
  onSimulateChange,
  onAddLink,
  onDeleteLink,
  onToggleNotification,
  onUpdateLinkTags,
  onUpdateLinkCategory,
  onUpdateLinkInterval,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [expandedDiffId, setExpandedDiffId] = useState<string | null>(null);
  const [editingTagsLinkId, setEditingTagsLinkId] = useState<string | null>(null);
  const [tagsInputVal, setTagsInputVal] = useState('');

  // Graphical Telemetry & AI Consultant States
  const [inspectingLinkId, setInspectingLinkId] = useState<string | null>(null);
  const [isAIConsultantOpen, setIsAIConsultantOpen] = useState(false);
  const [aiConsultantInitialLinkId, setAiConsultantInitialLinkId] = useState<string | null>(null);
  const [monitorViewMode, setMonitorViewMode] = useState<'cards' | 'infographics'>('cards');

  // Form states for new link
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState(categories[0]?.id || 'GENERAL');
  const [newTagsStr, setNewTagsStr] = useState('');
  const [newInterval, setNewInterval] = useState(60);
  const [isCustomInterval, setIsCustomInterval] = useState(false);
  const [customIntervalVal, setCustomIntervalVal] = useState(45);
  const [newNotify, setNewNotify] = useState(true);

  // Quick inline new category inside Add Link modal
  const [isAddingInlineCat, setIsAddingInlineCat] = useState(false);
  const [inlineCatName, setInlineCatName] = useState('');

  // Form state for category management
  const [newCatName, setNewCatName] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState('');

  // Compute all unique tags from links
  const allUniqueTags = useMemo(() => {
    const set = new Set<string>();
    links.forEach((l) => (l.tags || []).forEach((t) => set.add(t.toLowerCase().trim())));
    return Array.from(set).filter(Boolean);
  }, [links]);

  // Fast filtering by Category + Search Query + Selected Tag
  const filteredLinks = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return links.filter((link) => {
      // 1. Category filter
      if (selectedCategory !== 'ALL' && link.category !== selectedCategory) {
        return false;
      }

      // 2. Tag filter chip
      if (selectedTag) {
        const hasTag = (link.tags || []).some((t) => t.toLowerCase().trim() === selectedTag.toLowerCase().trim());
        if (!hasTag) return false;
      }

      // 3. Search query matching: title, url, tags, content snippet, category
      if (q) {
        const matchesTitle = link.title.toLowerCase().includes(q);
        const matchesUrl = link.url.toLowerCase().includes(q);
        const matchesSnippet = (link.contentSnippet || '').toLowerCase().includes(q);
        const matchesCategory = link.category.toLowerCase().includes(q);
        const matchesTags = (link.tags || []).some((t) => t.toLowerCase().includes(q));

        if (!matchesTitle && !matchesUrl && !matchesSnippet && !matchesCategory && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  }, [links, selectedCategory, selectedTag, searchQuery]);

  const handleCreateInlineCategory = () => {
    const trimmed = inlineCatName.trim();
    if (!trimmed) return;
    pipAudio.playSuccess();
    const newId = 'CAT_' + Date.now();
    onAddCategory({
      id: newId,
      name: trimmed.toUpperCase(),
      isDefault: false
    });
    setNewCategory(newId);
    setInlineCatName('');
    setIsAddingInlineCat(false);
  };

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    const cleanUrl = newUrl.trim().startsWith('http') ? newUrl.trim() : `https://${newUrl.trim()}`;

    const parsedTags = newTagsStr
      .split(/[,\s]+/)
      .map((t) => t.replace(/^#/, '').trim())
      .filter(Boolean);

    const effectiveInterval = isCustomInterval
      ? Math.max(10, Math.min(86400, Number(customIntervalVal) || 60))
      : Number(newInterval) || 60;

    onAddLink({
      title: newTitle.trim(),
      url: cleanUrl,
      category: newCategory,
      tags: parsedTags.length > 0 ? parsedTags : ['учёба'],
      checkIntervalSec: effectiveInterval,
      contentSnippet: 'Ссылка подключена к системе мониторинга Pip-Boy',
      autoRefresh: true,
      notificationEnabled: newNotify
    });

    setNewTitle('');
    setNewUrl('');
    setNewTagsStr('');
    setIsAddModalOpen(false);
  };

  const handleSaveInlineTags = (linkId: string) => {
    pipAudio.playClick();
    const updated = tagsInputVal
      .split(/[,\s]+/)
      .map((t) => t.replace(/^#/, '').trim())
      .filter(Boolean);
    onUpdateLinkTags(linkId, updated);
    setEditingTagsLinkId(null);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCatName.trim();
    if (!name) return;
    pipAudio.playSuccess();
    const id = 'CAT_' + Date.now();
    onAddCategory({
      id,
      name: name.toUpperCase(),
      isDefault: false
    });
    setNewCatName('');
  };

  const handleSaveRenameCategory = (id: string) => {
    if (!editingCatName.trim()) return;
    pipAudio.playClick();
    onRenameCategory(id, editingCatName.trim().toUpperCase());
    setEditingCatId(null);
  };

  const formatTimeAgo = (ts: number) => {
    if (!ts) return 'Никогда';
    const sec = Math.floor((Date.now() - ts) / 1000);
    if (sec < 5) return 'Только что';
    if (sec < 60) return `${sec} сек. назад`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min} мин. назад`;
    const hours = Math.floor(min / 60);
    return `${hours} ч. назад`;
  };

  return (
    <div className="space-y-4">
      {/* Search & Tag Bar */}
      <div className="border border-[var(--crt-phosphor-dim)] bg-black/50 p-3 rounded space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Fast Search input */}
          <div className="relative flex-1 min-w-[220px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по названию, URL или #тегу (например: расписание, crispr, лабы)..."
              className="w-full bg-black/90 border border-[var(--crt-phosphor)] px-3 py-1.5 text-xs text-[var(--crt-phosphor)] outline-none rounded pl-8 font-mono placeholder:text-[var(--crt-phosphor-dim)]/70"
            />
            <Search size={14} className="absolute left-2.5 top-2 opacity-60 text-[var(--crt-phosphor)]" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-[var(--crt-phosphor)] hover:opacity-100 opacity-60 cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* AI Consultant Button */}
            <button
              onClick={() => {
                pipAudio.playSuccess();
                setAiConsultantInitialLinkId(null);
                setIsAIConsultantOpen(true);
              }}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-amber-400 bg-amber-950/50 text-amber-300 hover:bg-amber-400 hover:text-black transition-colors rounded cursor-pointer font-bold shadow-[0_0_10px_rgba(251,191,36,0.25)]"
              title="Задать любой вопрос встроенной нейросети по прикреплённым сайтам"
            >
              <Bot size={14} className="text-amber-400" />
              <span>ИИ-АНАЛИТИК САЙТОВ</span>
            </button>

            {/* View Mode Toggle: Cards vs Infographics */}
            <div className="flex items-center border border-[var(--crt-phosphor-dim)] rounded overflow-hidden">
              <button
                onClick={() => {
                  pipAudio.playClick();
                  setMonitorViewMode('cards');
                }}
                className={`px-2 py-1.5 text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                  monitorViewMode === 'cards'
                    ? 'bg-[var(--crt-phosphor)] text-black font-bold'
                    : 'bg-black/60 text-[var(--crt-phosphor)]/70 hover:text-[var(--crt-phosphor)]'
                }`}
                title="Отображение карточками"
              >
                <List size={13} />
                <span className="hidden sm:inline">КАРТОЧКИ</span>
              </button>
              <button
                onClick={() => {
                  pipAudio.playClick();
                  setMonitorViewMode('infographics');
                }}
                className={`px-2 py-1.5 text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                  monitorViewMode === 'infographics'
                    ? 'bg-[var(--crt-phosphor)] text-black font-bold'
                    : 'bg-black/60 text-[var(--crt-phosphor)]/70 hover:text-[var(--crt-phosphor)]'
                }`}
                title="Адаптивная графика и сводка по сайтам"
              >
                <LayoutGrid size={13} />
                <span className="hidden sm:inline">ГРАФИКА</span>
              </button>
            </div>

            <button
              onClick={() => {
                pipAudio.playClick();
                setIsCategoryModalOpen(true);
              }}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 border border-[var(--crt-phosphor-dim)] hover:border-[var(--crt-phosphor)] bg-black/60 rounded cursor-pointer transition-colors"
              title="Настройка пользовательских категорий"
            >
              <FolderEdit size={13} /> КАТЕГОРИИ
            </button>

            <button
              onClick={() => {
                pipAudio.playClick();
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-1 text-xs px-3 py-1.5 border border-[var(--crt-phosphor)] bg-[var(--crt-phosphor)]/15 hover:bg-[var(--crt-phosphor)] hover:text-black transition-colors rounded cursor-pointer font-bold"
            >
              <Plus size={14} /> НОВАЯ ССЫЛКА
            </button>

            <button
              onClick={() => {
                pipAudio.playGeiger(5);
                onScanAll();
              }}
              disabled={isScanningAll}
              className="flex items-center gap-1 text-xs px-3 py-1.5 border border-[var(--crt-phosphor)] bg-[var(--crt-phosphor)] text-black hover:bg-[var(--crt-phosphor-bright)] transition-colors rounded cursor-pointer font-bold disabled:opacity-50"
            >
              <RefreshCw size={13} className={isScanningAll ? 'animate-spin' : ''} />
              {isScanningAll ? 'СКАНИРУЮ...' : 'ОПРОСИТЬ ВСЁ'}
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="opacity-60 text-[10px] shrink-0 uppercase tracking-wider mr-1">Папки:</span>
          <button
            onClick={() => {
              pipAudio.playClick();
              setSelectedCategory('ALL');
            }}
            className={`px-2 py-0.5 rounded cursor-pointer uppercase shrink-0 transition-colors ${
              selectedCategory === 'ALL'
                ? 'bg-[var(--crt-phosphor)] text-black font-bold'
                : 'border border-[var(--crt-phosphor-dim)]/50 text-[var(--crt-phosphor)]/80 hover:border-[var(--crt-phosphor)]'
            }`}
          >
            ВСЕ ({links.length})
          </button>
          {categories.map((cat) => {
            const count = links.filter((l) => l.category === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  pipAudio.playClick();
                  setSelectedCategory(cat.id);
                }}
                className={`px-2 py-0.5 rounded cursor-pointer uppercase shrink-0 transition-colors flex items-center gap-1 ${
                  isSelected
                    ? 'bg-[var(--crt-phosphor)] text-black font-bold'
                    : 'border border-[var(--crt-phosphor-dim)]/50 text-[var(--crt-phosphor)]/80 hover:border-[var(--crt-phosphor)]'
                }`}
              >
                <span>{cat.name}</span>
                <span className="opacity-60 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Tag Filter Chips */}
        {allUniqueTags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px] border-t border-[var(--crt-phosphor-dim)]/30">
            <span className="opacity-60 text-[10px] flex items-center gap-1 uppercase mr-0.5">
              <Tag size={11} /> Теги:
            </span>
            {selectedTag && (
              <button
                onClick={() => {
                  pipAudio.playClick();
                  setSelectedTag(null);
                }}
                className="bg-amber-400 text-black px-1.5 py-0.2 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer"
              >
                #{selectedTag} <X size={10} />
              </button>
            )}
            {allUniqueTags.map((tag) => {
              const isTagActive = selectedTag?.toLowerCase() === tag.toLowerCase();
              return (
                <button
                  key={tag}
                  onClick={() => {
                    pipAudio.playClick();
                    setSelectedTag(isTagActive ? null : tag);
                  }}
                  className={`px-1.5 py-0.2 rounded text-[10px] cursor-pointer transition-colors font-mono ${
                    isTagActive
                      ? 'bg-[var(--crt-phosphor)] text-black font-bold'
                      : 'border border-[var(--crt-phosphor-dim)]/40 hover:border-[var(--crt-phosphor)] text-[var(--crt-phosphor)]/80'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Filter / Search summary */}
      {(searchQuery || selectedTag || selectedCategory !== 'ALL') && (
        <div className="flex items-center justify-between text-[11px] text-[var(--crt-phosphor-bright)] px-1">
          <div>
            Найдено записей: <strong>{filteredLinks.length}</strong> из {links.length}
            {searchQuery && ` по запросу "${searchQuery}"`}
            {selectedTag && ` с тегом #${selectedTag}`}
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedTag(null);
              setSelectedCategory('ALL');
            }}
            className="underline opacity-70 hover:opacity-100 cursor-pointer"
          >
            Сбросить фильтры
          </button>
        </div>
      )}

      {/* View Mode: Infographics vs Cards */}
      {monitorViewMode === 'infographics' ? (
        <div className="space-y-4">
          {/* Global Summary Ribbon */}
          {links.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-black/60 border border-[var(--crt-phosphor-dim)] p-3 rounded">
              <div className="bg-black/40 border border-[var(--crt-phosphor-dim)]/40 p-2 rounded">
                <div className="text-[10px] opacity-70 flex items-center gap-1">
                  <Globe size={11} /> ВСЕГО РЕСУРСОВ
                </div>
                <div className="text-base sm:text-lg font-bold text-[var(--crt-phosphor-bright)]">
                  {links.length} <span className="text-xs font-normal">сайтов</span>
                </div>
              </div>
              <div className="bg-black/40 border border-[var(--crt-phosphor-dim)]/40 p-2 rounded">
                <div className="text-[10px] opacity-70 flex items-center gap-1">
                  <Activity size={11} /> СРЕДНИЙ ПИНГ
                </div>
                <div className="text-base sm:text-lg font-bold text-[var(--crt-phosphor-bright)]">
                  {Math.round(
                    links.reduce((acc, l) => acc + (l.telemetry?.latencyMs || 100), 0) / Math.max(1, links.length)
                  )} <span className="text-xs font-normal">мс</span>
                </div>
              </div>
              <div className="bg-black/40 border border-[var(--crt-phosphor-dim)]/40 p-2 rounded">
                <div className="text-[10px] opacity-70 flex items-center gap-1">
                  <ShieldCheck size={11} className="text-emerald-400" /> СРЕДНИЙ АПТАЙМ
                </div>
                <div className="text-base sm:text-lg font-bold text-emerald-400">
                  99.8%
                </div>
              </div>
              <div className="bg-black/40 border border-[var(--crt-phosphor-dim)]/40 p-2 rounded">
                <div className="text-[10px] opacity-70 flex items-center gap-1">
                  <Zap size={11} className="text-amber-400" /> ИЗМЕНЕНИЙ (DIFF)
                </div>
                <div className="text-base sm:text-lg font-bold text-amber-300">
                  {links.filter((l) => l.status === 'CHANGED').length} <span className="text-xs font-normal">обновлено</span>
                </div>
              </div>
            </div>
          )}

          {/* Infographics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredLinks.length === 0 ? (
              <div className="col-span-full border border-dashed border-[var(--crt-phosphor-dim)] p-8 text-center rounded-lg bg-black/40 space-y-3">
                <Radio className="mx-auto opacity-50" size={36} />
                <div className="font-bold text-sm text-[var(--crt-phosphor-bright)]">
                  {links.length === 0 ? 'Список ресурсов чист' : 'По запросу ничего не найдено'}
                </div>
                <div className="text-xs opacity-75 max-w-md mx-auto leading-relaxed">
                  Добавьте ссылки в систему или сбросьте фильтры для отображения сводной инфографики.
                </div>
              </div>
            ) : (
              filteredLinks.map((link) => {
                const telemetry = link.telemetry || {
                  latencyMs: 95,
                  latencyHistory: [
                    { timestamp: Date.now() - 300000, ping: 110 },
                    { timestamp: Date.now() - 200000, ping: 98 },
                    { timestamp: Date.now() - 100000, ping: 105 },
                    { timestamp: Date.now(), ping: 92 }
                  ],
                  uptimePercent: 99.8,
                  protocol: link.url.startsWith('https') ? 'HTTP/2 (TLS 1.3)' : 'HTTP/1.1',
                  pageSizeKb: 240,
                  contentBreakdown: { html: 40, scripts: 100, media: 140, text: 60 },
                  detectedSections: ['Каталог', 'Поиск', 'Личный кабинет']
                };

                const pingHistory = telemetry.latencyHistory || [];
                const pings = pingHistory.map((p) => p.ping);
                const minPing = pings.length ? Math.min(...pings) : telemetry.latencyMs;
                const maxPing = pings.length ? Math.max(...pings) : telemetry.latencyMs;
                const range = Math.max(1, maxPing - minPing);

                const chartWidth = 260;
                const chartHeight = 44;
                const pts = pingHistory.map((pt, i) => {
                  const x = (i / Math.max(1, pingHistory.length - 1)) * (chartWidth - 20) + 10;
                  const normalized = (pt.ping - minPing) / range;
                  const y = chartHeight - 6 - normalized * (chartHeight - 12);
                  return `${x.toFixed(1)},${y.toFixed(1)}`;
                });
                const sparklinePath = pts.length > 0 ? `M ${pts.join(' L ')}` : '';

                const breakdown = telemetry.contentBreakdown || { html: 40, scripts: 100, media: 140, text: 60 };
                const totalKb = breakdown.html + breakdown.scripts + breakdown.media + breakdown.text;
                const pctHtml = Math.round((breakdown.html / totalKb) * 100);
                const pctScripts = Math.round((breakdown.scripts / totalKb) * 100);
                const pctMedia = Math.round((breakdown.media / totalKb) * 100);
                const pctText = Math.max(1, 100 - pctHtml - pctScripts - pctMedia);

                return (
                  <div
                    key={link.id}
                    className={`border rounded-lg p-3.5 bg-black/60 space-y-3 transition-all ${
                      link.status === 'CHANGED'
                        ? 'border-amber-400 bg-amber-950/20 box-glow-subtle'
                        : 'border-[var(--crt-phosphor-dim)] hover:border-[var(--crt-phosphor)]'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-sm text-[var(--crt-phosphor-bright)] truncate">
                            {link.title}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded border border-[var(--crt-phosphor-dim)] bg-black/60 font-mono">
                            {link.category}
                          </span>
                        </div>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs opacity-75 hover:opacity-100 text-[var(--crt-phosphor)] underline truncate block max-w-xs"
                        >
                          {link.url}
                        </a>
                      </div>

                      <span className={`text-[10px] px-2 py-0.5 rounded font-black shrink-0 ${
                        link.status === 'ONLINE'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500'
                          : 'bg-amber-950 text-amber-300 border border-amber-500 animate-pulse'
                      }`}>
                        ● {link.status}
                      </span>
                    </div>

                    {/* Latency Sparkline */}
                    <div className="bg-black/80 border border-[var(--crt-phosphor-dim)]/40 p-2 rounded space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="opacity-70 flex items-center gap-1">
                          <Activity size={11} /> Задержка отклика:
                        </span>
                        <span className="font-bold text-[var(--crt-phosphor-bright)]">
                          {telemetry.latencyMs} мс (разброс: {minPing}–{maxPing} мс)
                        </span>
                      </div>
                      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-10 overflow-visible">
                        {sparklinePath && (
                          <path
                            d={sparklinePath}
                            fill="none"
                            stroke="var(--crt-phosphor-bright)"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        )}
                      </svg>
                    </div>

                    {/* Content composition bar */}
                    <div className="space-y-1 text-[11px]">
                      <div className="flex items-center justify-between opacity-75 text-[10px]">
                        <span>Состав контента (~{telemetry.pageSizeKb} КБ):</span>
                        <span>{telemetry.protocol}</span>
                      </div>
                      <div className="h-3 w-full rounded overflow-hidden flex border border-zinc-800 bg-black">
                        <div style={{ width: `${pctHtml}%` }} className="bg-emerald-500" title={`HTML: ${pctHtml}%`} />
                        <div style={{ width: `${pctScripts}%` }} className="bg-cyan-500" title={`Скрипты: ${pctScripts}%`} />
                        <div style={{ width: `${pctMedia}%` }} className="bg-amber-500" title={`Медиа: ${pctMedia}%`} />
                        <div style={{ width: `${pctText}%` }} className="bg-purple-400" title={`Текст: ${pctText}%`} />
                      </div>
                      <div className="flex justify-between text-[9px] opacity-60">
                        <span>HTML {pctHtml}%</span>
                        <span>JS {pctScripts}%</span>
                        <span>Медиа {pctMedia}%</span>
                        <span>Текст {pctText}%</span>
                      </div>
                    </div>

                    {/* Snippet preview */}
                    <div className="text-xs bg-black/80 border border-zinc-800 p-2 rounded text-[var(--crt-phosphor)]/90 font-mono truncate">
                      {link.contentSnippet}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-[var(--crt-phosphor-dim)]/30">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            pipAudio.playClick();
                            setInspectingLinkId(link.id);
                          }}
                          className="px-2.5 py-1 text-xs border border-[var(--crt-phosphor)] bg-[var(--crt-phosphor)]/15 hover:bg-[var(--crt-phosphor)] hover:text-black font-bold rounded cursor-pointer transition-colors flex items-center gap-1"
                        >
                          <BarChart3 size={11} /> ДАННЫЕ & ГРАФИКА
                        </button>
                        <button
                          onClick={() => {
                            pipAudio.playSuccess();
                            setAiConsultantInitialLinkId(link.id);
                            setIsAIConsultantOpen(true);
                          }}
                          className="px-2.5 py-1 text-xs border border-amber-400 bg-amber-950/40 text-amber-300 hover:bg-amber-400 hover:text-black font-bold rounded cursor-pointer transition-colors flex items-center gap-1 shadow-[0_0_6px_rgba(251,191,36,0.2)]"
                        >
                          <Bot size={11} /> СПРОСИТЬ ИИ
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          pipAudio.playClick();
                          onScanSingle(link.id);
                        }}
                        disabled={link.status === 'SYNCING'}
                        className="p-1 border border-zinc-700 hover:border-[var(--crt-phosphor)] rounded cursor-pointer"
                        title="Опросить"
                      >
                        <RefreshCw size={12} className={link.status === 'SYNCING' ? 'animate-spin' : ''} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Monitored Links Cards */
        <div className="grid grid-cols-1 gap-3">
        {filteredLinks.length === 0 ? (
          <div className="border border-dashed border-[var(--crt-phosphor-dim)] p-8 text-center rounded-lg bg-black/40 space-y-3">
            <Radio className="mx-auto opacity-50" size={36} />
            <div className="font-bold text-sm text-[var(--crt-phosphor-bright)]">
              {links.length === 0 ? 'Список ресурсов чист' : 'По запросу ничего не найдено'}
            </div>
            <div className="text-xs opacity-75 max-w-md mx-auto leading-relaxed">
              {links.length === 0
                ? 'Вы можете самостоятельно добавить любые нужные сайты: личный кабинет вуза, расписание, Moodle, систему тестирования или научные статьи.'
                : 'Попробуйте сбросить фильтры поиска или изменить выбранный тег.'}
            </div>
            <div className="pt-2">
              <button
                onClick={() => {
                  pipAudio.playClick();
                  setIsAddModalOpen(true);
                }}
                className="px-5 py-2.5 bg-[var(--crt-phosphor)] text-black font-extrabold text-xs rounded cursor-pointer hover:bg-[var(--crt-phosphor-bright)] transition-colors uppercase tracking-wider inline-flex items-center gap-1.5"
              >
                <Plus size={15} /> ДОБАВИТЬ ССЫЛКУ
              </button>
            </div>
          </div>
        ) : (
          filteredLinks.map((link) => {
            const isChanged = link.status === 'CHANGED';
            const isSyncing = link.status === 'SYNCING';
            const hasDiffs = link.diffHistory.length > 0;
            const isExpanded = expandedDiffId === link.id;
            const categoryObj = categories.find((c) => c.id === link.category);
            const categoryLabel = categoryObj ? categoryObj.name : link.category;

            return (
              <div
                key={link.id}
                className={`border rounded p-3 bg-black/40 transition-all ${
                  isChanged
                    ? 'border-amber-400 bg-amber-950/20 box-glow-subtle'
                    : 'border-[var(--crt-phosphor-dim)] hover:border-[var(--crt-phosphor)]'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  {/* Left info */}
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-[var(--crt-phosphor-bright)] flex items-center gap-1.5">
                        <Globe size={14} className="opacity-70" />
                        {link.title}
                      </span>

                      {/* Category selector badge */}
                      <select
                        value={link.category}
                        onChange={(e) => {
                          pipAudio.playClick();
                          onUpdateLinkCategory(link.id, e.target.value);
                        }}
                        className="text-[10px] px-1 py-0.5 border border-[var(--crt-phosphor-dim)] rounded bg-black text-[var(--crt-phosphor)] uppercase outline-none cursor-pointer"
                        title="Изменить категорию"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>

                      {link.isScientific && (
                        <span className="text-[10px] px-1.5 py-0.2 bg-[var(--crt-phosphor)]/20 text-[var(--crt-phosphor-bright)] border border-[var(--crt-phosphor)] rounded font-mono">
                          НАУЧНАЯ БАЗА: {link.scientificMeta?.source?.toUpperCase() || 'ГУМАНИТАРНАЯ'}
                        </span>
                      )}

                      {isChanged && (
                        <span className="text-[10px] px-1.5 py-0.2 bg-amber-500 text-black font-black rounded animate-pulse">
                          DIFF: ОБНОВЛЕНО
                        </span>
                      )}
                    </div>

                    {/* URL */}
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs opacity-75 hover:opacity-100 flex items-center gap-1 text-[var(--crt-phosphor)] underline underline-offset-2 break-all"
                    >
                      {link.url}
                      <ExternalLink size={11} className="inline shrink-0" />
                    </a>

                    {/* Tags List & Edit */}
                    <div className="flex items-center gap-1 flex-wrap pt-0.5">
                      {editingTagsLinkId === link.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={tagsInputVal}
                            onChange={(e) => setTagsInputVal(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveInlineTags(link.id)}
                            placeholder="тег1, тег2, тег3..."
                            className="bg-black border border-[var(--crt-phosphor)] text-[10px] px-1.5 py-0.5 rounded text-[var(--crt-phosphor)] outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveInlineTags(link.id)}
                            className="p-1 text-black bg-[var(--crt-phosphor)] rounded cursor-pointer"
                            title="Сохранить"
                          >
                            <Check size={10} />
                          </button>
                          <button
                            onClick={() => setEditingTagsLinkId(null)}
                            className="p-1 border border-zinc-600 rounded cursor-pointer"
                            title="Отмена"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ) : (
                        <>
                          {(link.tags || []).map((t) => (
                            <span
                              key={t}
                              onClick={() => {
                                pipAudio.playClick();
                                setSelectedTag(t);
                              }}
                              className="text-[10px] px-1.5 py-0.2 border border-[var(--crt-phosphor-dim)]/40 hover:border-[var(--crt-phosphor)] text-[var(--crt-phosphor)]/80 rounded font-mono cursor-pointer"
                              title="Фильтровать по этому тегу"
                            >
                              #{t}
                            </span>
                          ))}
                          <button
                            onClick={() => {
                              pipAudio.playClick();
                              setEditingTagsLinkId(link.id);
                              setTagsInputVal((link.tags || []).join(', '));
                            }}
                            className="text-[10px] text-[var(--crt-phosphor-dim)] hover:text-[var(--crt-phosphor)] flex items-center gap-0.5 cursor-pointer ml-1"
                            title="Редактировать теги"
                          >
                            <Edit2 size={10} /> теги
                          </button>
                        </>
                      )}
                    </div>

                    {/* Content Snippet */}
                    <div className="text-xs bg-black/60 border border-[var(--crt-phosphor-dim)]/40 p-1.5 rounded text-[var(--crt-phosphor)]/90 font-mono">
                      {link.contentSnippet}
                    </div>

                    {/* Timestamps & Editable Interval */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] opacity-80 pt-0.5">
                      <div className="flex items-center gap-1.5 bg-black/50 border border-[var(--crt-phosphor-dim)]/50 px-1.5 py-0.5 rounded">
                        <Clock size={11} className="text-[var(--crt-phosphor)] shrink-0" />
                        <span className="text-[10px] opacity-75">Опрос:</span>
                        <select
                          value={link.checkIntervalSec}
                          onChange={(e) => {
                            pipAudio.playClick();
                            const val = Number(e.target.value);
                            if (onUpdateLinkInterval) {
                              onUpdateLinkInterval(link.id, val);
                            }
                          }}
                          className="bg-black text-[10px] text-[var(--crt-phosphor-bright)] font-mono outline-none cursor-pointer border-none"
                          title="Изменить интервал опроса для этой ссылки"
                        >
                          <option value={15}>15 сек</option>
                          <option value={30}>30 сек</option>
                          <option value={45}>45 сек</option>
                          <option value={60}>1 мин</option>
                          <option value={120}>2 мин</option>
                          <option value={180}>3 мин</option>
                          <option value={300}>5 мин</option>
                          <option value={600}>10 мин</option>
                          <option value={1800}>30 мин</option>
                          <option value={3600}>1 час</option>
                          {![15, 30, 45, 60, 120, 180, 300, 600, 1800, 3600].includes(link.checkIntervalSec) && (
                            <option value={link.checkIntervalSec}>{link.checkIntervalSec} сек (свой)</option>
                          )}
                        </select>
                      </div>
                      <span>Проверено: {formatTimeAgo(link.lastChecked)}</span>
                      <span>Обновление: {formatTimeAgo(link.lastUpdated)}</span>
                    </div>
                  </div>

                  {/* Right actions */}
                  <div className="flex flex-wrap items-center gap-1.5 self-center">
                    {/* Notification toggle */}
                    <button
                      onClick={() => {
                        pipAudio.playClick();
                        onToggleNotification(link.id);
                      }}
                      title={link.notificationEnabled ? 'Уведомления включены' : 'Уведомления выключены'}
                      className={`p-1.5 border rounded cursor-pointer transition-colors ${
                        link.notificationEnabled
                          ? 'border-[var(--crt-phosphor)] text-[var(--crt-phosphor)] bg-[var(--crt-phosphor)]/15'
                          : 'border-zinc-700 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {link.notificationEnabled ? <Bell size={14} /> : <BellOff size={14} />}
                    </button>

                    {/* Single Scan */}
                    <button
                      onClick={() => {
                        pipAudio.playClick();
                        onScanSingle(link.id);
                      }}
                      disabled={isSyncing}
                      title="Опросить прямо сейчас"
                      className="p-1.5 border border-[var(--crt-phosphor-dim)] hover:border-[var(--crt-phosphor)] rounded cursor-pointer transition-colors"
                    >
                      <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                    </button>

                    {/* Simulate Change */}
                    <button
                      onClick={() => {
                        pipAudio.playGeiger(4);
                        onSimulateChange(link.id);
                      }}
                      title="Смоделировать появление нового контента (тест diff)"
                      className="text-[11px] px-2 py-1 border border-amber-500/70 hover:border-amber-400 bg-amber-950/30 text-amber-300 rounded cursor-pointer transition-colors font-mono flex items-center gap-1"
                    >
                      <Zap size={11} /> ТЕСТ DIFF
                    </button>

                    {/* Graphical & Written Data Inspection */}
                    <button
                      onClick={() => {
                        pipAudio.playClick();
                        setInspectingLinkId(link.id);
                      }}
                      title="Адаптивное графическо-письменное отображение данных с сайта (пинг, состав контента, заголовки, структура)"
                      className="text-[11px] px-2.5 py-1 border border-[var(--crt-phosphor)] hover:border-[var(--crt-phosphor-bright)] bg-[var(--crt-phosphor)]/15 text-[var(--crt-phosphor-bright)] hover:bg-[var(--crt-phosphor)] hover:text-black rounded cursor-pointer transition-colors font-mono flex items-center gap-1 font-bold"
                    >
                      <BarChart3 size={12} /> ДАННЫЕ & ГРАФИКА
                    </button>

                    {/* Ask AI about this specific site */}
                    <button
                      onClick={() => {
                        pipAudio.playSuccess();
                        setAiConsultantInitialLinkId(link.id);
                        setIsAIConsultantOpen(true);
                      }}
                      title="Спросить у встроенной нейросети по этому сайту"
                      className="text-[11px] px-2.5 py-1 border border-amber-400/80 hover:border-amber-300 bg-amber-950/40 text-amber-300 hover:bg-amber-400 hover:text-black rounded cursor-pointer transition-colors font-mono flex items-center gap-1 font-bold shadow-[0_0_8px_rgba(251,191,36,0.2)]"
                    >
                      <Bot size={12} /> СПРОСИТЬ ИИ
                    </button>

                    {/* Diff log button */}
                    {hasDiffs && (
                      <button
                        onClick={() => {
                          pipAudio.playClick();
                          setExpandedDiffId(isExpanded ? null : link.id);
                        }}
                        className={`text-[11px] px-2 py-1 border rounded cursor-pointer transition-colors flex items-center gap-1 ${
                          isExpanded
                            ? 'bg-[var(--crt-phosphor)] text-black border-[var(--crt-phosphor)] font-bold'
                            : 'border-[var(--crt-phosphor-dim)] text-[var(--crt-phosphor)]'
                        }`}
                      >
                        <History size={11} />
                        ИСТОРИЯ ({link.diffHistory.length})
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => {
                        pipAudio.playClick();
                        onDeleteLink(link.id);
                      }}
                      title="Удалить из мониторинга"
                      className="p-1.5 border border-red-900/60 hover:border-red-500 text-red-400 rounded cursor-pointer transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Diff History Expansion */}
                {isExpanded && hasDiffs && (
                  <div className="mt-3 pt-3 border-t border-[var(--crt-phosphor-dim)]/40 space-y-2">
                    <div className="text-[11px] font-bold tracking-wider opacity-80 uppercase flex items-center gap-1">
                      <FileCode size={12} /> ХРОНОЛОГИЯ ИЗМЕНЕНИЙ КОНТЕНТА:
                    </div>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {link.diffHistory.map((diff) => (
                        <div
                          key={diff.id}
                          className="bg-black/80 border-l-2 border-amber-400 p-2 text-xs rounded-r font-mono"
                        >
                          <div className="flex items-center justify-between text-[10px] text-amber-300/80 mb-0.5">
                            <span>{new Date(diff.timestamp).toLocaleTimeString()} · {new Date(diff.timestamp).toLocaleDateString()}</span>
                            <span className="text-[var(--crt-phosphor)] font-bold">[DIFF DETECTED]</span>
                          </div>
                          <div className="font-semibold text-[var(--crt-phosphor-bright)]">
                            {diff.summary}
                          </div>
                          {diff.diffSnippet && (
                            <div className="text-[11px] opacity-75 mt-0.5">
                              {diff.diffSnippet}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      )}

      {/* Modal: Category Manager */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="border-2 border-[var(--crt-phosphor)] bg-[#050d06] p-5 rounded max-w-md w-full box-glow text-[var(--crt-phosphor)] space-y-4">
            <div className="text-sm font-bold tracking-wider uppercase flex items-center justify-between border-b border-[var(--crt-phosphor-dim)] pb-2">
              <span className="flex items-center gap-1.5">
                <FolderPlus size={16} /> МЕНЕДЖЕР КАТЕГОРИЙ PIP-BOY
              </span>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="cursor-pointer text-xs px-2 py-0.5 border border-[var(--crt-phosphor-dim)] hover:border-[var(--crt-phosphor)]"
              >
                ЗАКРЫТЬ
              </button>
            </div>

            {/* Create Category Form */}
            <form onSubmit={handleCreateCategory} className="flex gap-2 text-xs">
              <input
                type="text"
                placeholder="Новая категория (напр. ДИПЛОМ, ГРАНТЫ)..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 bg-black border border-[var(--crt-phosphor)] px-3 py-1.5 rounded text-[var(--crt-phosphor)] outline-none uppercase font-mono"
              />
              <button
                type="submit"
                className="bg-[var(--crt-phosphor)] text-black font-bold px-3 py-1.5 rounded cursor-pointer hover:bg-[var(--crt-phosphor-bright)] shrink-0"
              >
                + СОЗДАТЬ
              </button>
            </form>

            {/* Categories List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 text-xs">
              {categories.map((cat) => {
                const isEditingThis = editingCatId === cat.id;
                const linkCount = links.filter((l) => l.category === cat.id).length;

                return (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-2 border border-[var(--crt-phosphor-dim)]/50 bg-black/50 rounded"
                  >
                    {isEditingThis ? (
                      <div className="flex items-center gap-2 flex-1 mr-2">
                        <input
                          type="text"
                          value={editingCatName}
                          onChange={(e) => setEditingCatName(e.target.value)}
                          className="bg-black border border-[var(--crt-phosphor)] px-2 py-1 text-xs text-[var(--crt-phosphor)] outline-none rounded flex-1 uppercase"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveRenameCategory(cat.id)}
                          className="px-2 py-1 bg-[var(--crt-phosphor)] text-black font-bold rounded cursor-pointer"
                        >
                          ОК
                        </button>
                        <button
                          onClick={() => setEditingCatId(null)}
                          className="px-2 py-1 border border-zinc-600 rounded cursor-pointer"
                        >
                          ОТМЕНА
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[var(--crt-phosphor-bright)]">{cat.name}</span>
                          <span className="opacity-60 text-[10px]">({linkCount} ссылок)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              pipAudio.playClick();
                              setEditingCatId(cat.id);
                              setEditingCatName(cat.name);
                            }}
                            className="p-1 text-[var(--crt-phosphor)] hover:text-[var(--crt-phosphor-bright)] cursor-pointer"
                            title="Переименовать категорию"
                          >
                            <Edit2 size={13} />
                          </button>
                          {!cat.isDefault && (
                            <button
                              onClick={() => {
                                pipAudio.playClick();
                                onDeleteCategory(cat.id);
                              }}
                              className="p-1 text-red-400 hover:text-red-300 cursor-pointer"
                              title="Удалить категорию"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New Link */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="border-2 border-[var(--crt-phosphor)] bg-[#050d06] p-5 rounded max-w-md w-full box-glow text-[var(--crt-phosphor)]">
            <div className="text-sm font-bold tracking-wider uppercase mb-3 flex items-center justify-between border-b border-[var(--crt-phosphor-dim)] pb-2">
              <span>[ROBCO PROTOCOL] ПОДКЛЮЧЕНИЕ ССЫЛКИ</span>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="cursor-pointer text-xs px-2 py-0.5 border border-[var(--crt-phosphor-dim)] hover:border-[var(--crt-phosphor)]"
              >
                ЗАКРЫТЬ
              </button>
            </div>

            <form onSubmit={handleSubmitNew} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-bold">НАЗВАНИЕ РЕСУРСА:</label>
                <input
                  type="text"
                  required
                  placeholder="Например: Личный кабинет МГУ / Кафедра биохимии"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-black border border-[var(--crt-phosphor)] px-3 py-2 text-[var(--crt-phosphor)] outline-none rounded"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold">URL АДРЕС (ССЫЛКА):</label>
                <input
                  type="text"
                  required
                  placeholder="https://portal.university.edu"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full bg-black border border-[var(--crt-phosphor)] px-3 py-2 text-[var(--crt-phosphor)] outline-none rounded"
                />
              </div>

              {/* Categories & Interval row */}
              <div className="space-y-3">
                {/* Category block */}
                <div className="bg-black/60 p-2.5 rounded border border-[var(--crt-phosphor-dim)]/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                      <FolderEdit size={12} className="text-[var(--crt-phosphor)]" />
                      КАТЕГОРИЯ ССЫЛКИ:
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        pipAudio.playClick();
                        setIsAddingInlineCat(!isAddingInlineCat);
                      }}
                      className="text-[10px] text-[var(--crt-phosphor-bright)] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={11} /> {isAddingInlineCat ? 'Отмена' : '+ Новая категория'}
                    </button>
                  </div>

                  {!isAddingInlineCat ? (
                    <div className="flex gap-2">
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="flex-1 bg-black border border-[var(--crt-phosphor)] px-2.5 py-1.5 text-[var(--crt-phosphor)] outline-none rounded font-mono uppercase"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          pipAudio.playClick();
                          setIsCategoryModalOpen(true);
                        }}
                        className="px-2 py-1.5 border border-[var(--crt-phosphor-dim)] hover:border-[var(--crt-phosphor)] text-[10px] rounded cursor-pointer"
                        title="Управление всеми категориями"
                      >
                        Менеджер
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="Название новой категории..."
                        value={inlineCatName}
                        onChange={(e) => setInlineCatName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleCreateInlineCategory();
                          }
                        }}
                        autoFocus
                        className="flex-1 bg-black border border-[var(--crt-phosphor)] px-2 py-1 text-xs text-[var(--crt-phosphor)] outline-none rounded uppercase font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleCreateInlineCategory}
                        className="bg-[var(--crt-phosphor)] text-black font-bold px-2.5 py-1 text-xs rounded cursor-pointer hover:bg-[var(--crt-phosphor-bright)]"
                      >
                        ОК
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingInlineCat(false);
                          setInlineCatName('');
                        }}
                        className="border border-zinc-600 px-2 py-1 text-xs rounded cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* Polling Interval block */}
                <div className="bg-black/60 p-2.5 rounded border border-[var(--crt-phosphor-dim)]/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                      <Clock size={12} className="text-[var(--crt-phosphor)]" />
                      ИНТЕРВАЛ ОПРОСА РЕСУРСА:
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        pipAudio.playClick();
                        setIsCustomInterval(!isCustomInterval);
                      }}
                      className="text-[10px] text-[var(--crt-phosphor-bright)] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 size={10} />
                      {isCustomInterval ? 'Выбрать из списка' : 'Задать вручную (сек)'}
                    </button>
                  </div>

                  {!isCustomInterval ? (
                    <select
                      value={newInterval}
                      onChange={(e) => setNewInterval(Number(e.target.value))}
                      className="w-full bg-black border border-[var(--crt-phosphor)] px-2.5 py-1.5 text-[var(--crt-phosphor)] outline-none rounded font-mono"
                    >
                      <option value={15}>Каждые 15 секунд (Сверхбыстрый)</option>
                      <option value={30}>Каждые 30 секунд (Высокий приоритет)</option>
                      <option value={45}>Каждые 45 секунд</option>
                      <option value={60}>Каждую 1 минуту (Рекомендуется)</option>
                      <option value={120}>Каждые 2 минуты</option>
                      <option value={180}>Каждые 3 минуты</option>
                      <option value={300}>Каждые 5 минут (Экономия батареи)</option>
                      <option value={600}>Каждые 10 минут</option>
                      <option value={1800}>Каждые 30 минут</option>
                      <option value={3600}>Каждый 1 час</option>
                    </select>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={10}
                          max={86400}
                          step={5}
                          value={customIntervalVal}
                          onChange={(e) => setCustomIntervalVal(Number(e.target.value))}
                          placeholder="Секунды (напр. 45)"
                          className="flex-1 bg-black border border-[var(--crt-phosphor)] px-3 py-1.5 text-xs text-[var(--crt-phosphor)] outline-none rounded font-mono"
                        />
                        <span className="text-xs text-[var(--crt-phosphor-bright)] font-mono shrink-0">
                          сек. ({customIntervalVal >= 60 ? `${(customIntervalVal / 60).toFixed(1)} мин.` : `${customIntervalVal} с`})
                        </span>
                      </div>
                      <div className="text-[10px] opacity-60">
                        Минимум 10 сек., максимум 86400 сек. (24 ч).
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block mb-1 font-bold">ТЕГИ (ЧЕРЕЗ ЗАПЯТУЮ ИЛИ ПРОБЕЛ):</label>
                <input
                  type="text"
                  placeholder="сессия, дедлайн, лабораторные, crispr..."
                  value={newTagsStr}
                  onChange={(e) => setNewTagsStr(e.target.value)}
                  className="w-full bg-black border border-[var(--crt-phosphor)] px-3 py-2 text-[var(--crt-phosphor)] outline-none rounded font-mono"
                />
                <div className="text-[10px] opacity-60 mt-1">
                  Теги помогут мгновенно фильтровать и находить ссылки через поиск
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="notifyCheck"
                  checked={newNotify}
                  onChange={(e) => setNewNotify(e.target.checked)}
                  className="cursor-pointer accent-[var(--crt-phosphor)]"
                />
                <label htmlFor="notifyCheck" className="cursor-pointer font-bold">
                  Отправлять Push-уведомление при обнаружении изменений
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--crt-phosphor-dim)]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 border border-zinc-600 hover:border-zinc-400 rounded cursor-pointer"
                >
                  ОТМЕНА
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 border border-[var(--crt-phosphor)] bg-[var(--crt-phosphor)] text-black font-bold hover:bg-[var(--crt-phosphor-bright)] rounded cursor-pointer"
                >
                  + ПОДКЛЮЧИТЬ К СИСТЕМЕ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Site Telemetry & Graphical / Written Inspection Modal */}
      {inspectingLinkId && (
        (() => {
          const targetLink = links.find((l) => l.id === inspectingLinkId);
          if (!targetLink) return null;
          return (
            <SiteTelemetryModal
              link={targetLink}
              onClose={() => setInspectingLinkId(null)}
              onOpenAIWithLink={(linkId) => {
                setInspectingLinkId(null);
                setAiConsultantInitialLinkId(linkId);
                setIsAIConsultantOpen(true);
              }}
              onScanSingle={onScanSingle}
            />
          );
        })()
      )}

      {/* Site AI Consultant Modal */}
      {isAIConsultantOpen && (
        <SiteAIConsultantModal
          links={links}
          initialSelectedLinkId={aiConsultantInitialLinkId}
          onClose={() => {
            setIsAIConsultantOpen(false);
            setAiConsultantInitialLinkId(null);
          }}
        />
      )}
    </div>
  );
};
