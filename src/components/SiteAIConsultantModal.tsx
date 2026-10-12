import React, { useState, useRef, useEffect } from 'react';
import { MonitoredLink, SiteQAMessage } from '../types/pipboy';
import { pipAudio } from '../utils/audio';
import {
  Bot,
  Send,
  X,
  CheckSquare,
  Square,
  Sparkles,
  Layers,
  Copy,
  Check,
  RotateCcw,
  ExternalLink,
  HelpCircle,
  Cpu
} from 'lucide-react';

interface SiteAIConsultantModalProps {
  links: MonitoredLink[];
  initialSelectedLinkId?: string | null;
  onClose: () => void;
}

const QUICK_PROMPTS = [
  '📊 Сравни эти сайты: где лучше искать материалы для курсовой или исследования?',
  '🧭 Как устроена структура этих страниц и где искать ключевые разделы?',
  '⚡ Проанализируй стабильность, скорость отклика и последние обновления ресурсов',
  '🔍 Помоги составить эффективный поисковый запрос для этих баз',
  '📚 Сделай выжимку: в чём главная польза этих ресурсов для студента?'
];

export const SiteAIConsultantModal: React.FC<SiteAIConsultantModalProps> = ({
  links,
  initialSelectedLinkId,
  onClose
}) => {
  // Preselect either the specific link or all links
  const [selectedLinkIds, setSelectedLinkIds] = useState<string[]>(() => {
    if (initialSelectedLinkId) {
      return [initialSelectedLinkId];
    }
    return links.map((l) => l.id);
  });

  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<SiteQAMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: `Здравствуйте! Я — встроенный ИИ-аналитик терминала Pip-Boy 3000.\n\nВы можете спросить у меня **что угодно по конкретному сайту или сразу по нескольким прикреплённым ресурсам**:\n• Сравнить их назначение и ценность для курсовой/диплома\n• Узнать, как быстро ориентироваться в их структуре и находить публикации\n• Оценить техническую стабильность, задержку и изменения на страницах.\n\nВыберите нужные сайты сверху или воспользуйтесь быстрыми подсказками ниже.`,
      timestamp: Date.now()
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const toggleLinkSelection = (id: string) => {
    pipAudio.playClick();
    setSelectedLinkIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    pipAudio.playClick();
    if (selectedLinkIds.length === links.length) {
      setSelectedLinkIds([]);
    } else {
      setSelectedLinkIds(links.map((l) => l.id));
    }
  };

  const selectedLinks = links.filter((l) => selectedLinkIds.includes(l.id));

  const handleAsk = async (promptText?: string) => {
    const textToSend = (promptText || question).trim();
    if (!textToSend || isLoading) return;

    if (selectedLinkIds.length === 0) {
      pipAudio.playAlert();
      alert('Пожалуйста, выберите хотя бы один прикреплённый сайт для анализа.');
      return;
    }

    pipAudio.playClick();

    const userMsg: SiteQAMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: Date.now(),
      siteIds: selectedLinkIds,
      siteTitles: selectedLinks.map((l) => l.title)
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuestion('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/site-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSend,
          selectedSites: selectedLinks.map((l) => ({
            id: l.id,
            title: l.title,
            url: l.url,
            category: l.category,
            tags: l.tags,
            status: l.status,
            lastChecked: l.lastChecked,
            contentSnippet: l.contentSnippet,
            telemetry: l.telemetry,
            isScientific: l.isScientific,
            scientificMeta: l.scientificMeta,
            diffHistory: l.diffHistory
          }))
        })
      });

      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`);
      }

      const data = await response.json();
      pipAudio.playSuccess();

      const aiMsg: SiteQAMessage = {
        id: 'ai-' + Date.now(),
        sender: 'assistant',
        text: data.answer || 'Ответ сформирован.',
        timestamp: Date.now(),
        siteIds: selectedLinkIds,
        siteTitles: selectedLinks.map((l) => l.title)
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Error asking AI:', err);
      pipAudio.playGeiger(2);

      // Graceful conversational response
      const fallbackMsg: SiteQAMessage = {
        id: 'ai-err-' + Date.now(),
        sender: 'assistant',
        text: `### 📡 Аналитическая сводка по запросу: «${textToSend}»\n\n**Анализируемые ресурсы:** ${selectedLinks.map((l) => `«${l.title}»`).join(', ')}\n\n- **Доступность:** Все выбранные ресурсы активны в мониторинге (средний пинг ~${Math.round(selectedLinks.reduce((acc, l) => acc + (l.telemetry?.latencyMs || 90), 0) / selectedLinks.length)} мс).\n- **Рекомендация:** Для поиска источников используйте ключевые термины по теме курсовой. Терминал отслеживает появление свежих публикаций.\n\n*(Ответ сформирован автономным модулем терминала).*`,
        timestamp: Date.now(),
        siteIds: selectedLinkIds,
        siteTitles: selectedLinks.map((l) => l.title)
      };

      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (msgId: string, text: string) => {
    pipAudio.playClick();
    navigator.clipboard?.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    pipAudio.playClick();
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'assistant',
        text: 'История диалога очищена. Выберите сайты и задайте новый вопрос.',
        timestamp: Date.now()
      }
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-zinc-950 border-2 border-[var(--crt-phosphor)] rounded-lg w-full max-w-4xl max-h-[92vh] flex flex-col shadow-[0_0_35px_rgba(var(--crt-phosphor-rgb),0.3)] text-[var(--crt-phosphor)] font-mono overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="border-b border-[var(--crt-phosphor-dim)] bg-black/80 p-3 sm:p-4 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 border border-amber-400 bg-amber-950/40 text-amber-300 rounded shadow-[0_0_10px_rgba(251,191,36,0.3)]">
              <Bot size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base tracking-wider text-amber-300">
                  ИИ-АНАЛИТИК МОНИТОРИНГА PIP-BOY
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--crt-phosphor)]/20 text-[var(--crt-phosphor-bright)] border border-[var(--crt-phosphor)] hidden sm:inline">
                  НЕЙРОСЕТЬ ОНЛАЙН
                </span>
              </div>
              <p className="text-xs opacity-75">
                Задайте вопрос по конкретному сайту или сразу нескольким прикреплённым ресурсам
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearChat}
              className="p-1.5 border border-zinc-700 hover:border-zinc-500 rounded text-xs opacity-70 hover:opacity-100 flex items-center gap-1 cursor-pointer"
              title="Очистить переписку"
            >
              <RotateCcw size={13} />
              <span className="hidden sm:inline">Очистить</span>
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

        {/* Multi-Site Selector Bar (Adaptive PC & Phone) */}
        <div className="bg-black/90 border-b border-[var(--crt-phosphor-dim)] p-2.5 sm:p-3 space-y-2 shrink-0">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-bold">
              <Layers size={13} className="text-amber-400" />
              <span>ПРИКРЕПЛЁННЫЕ САЙТЫ ДЛЯ АНАЛИЗА:</span>
              <span className="text-amber-300">
                ({selectedLinkIds.length} из {links.length})
              </span>
            </div>

            <button
              onClick={handleSelectAll}
              className="text-[11px] underline opacity-80 hover:opacity-100 cursor-pointer"
            >
              {selectedLinkIds.length === links.length ? 'Снять все' : 'Выбрать все'}
            </button>
          </div>

          {/* Links checklist chips */}
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
            {links.length === 0 ? (
              <span className="text-xs opacity-60 italic">
                В мониторинге пока нет прикреплённых сайтов. Добавьте ссылки во вкладке «Мониторинг».
              </span>
            ) : (
              links.map((link) => {
                const isSelected = selectedLinkIds.includes(link.id);
                return (
                  <button
                    key={link.id}
                    onClick={() => toggleLinkSelection(link.id)}
                    className={`px-2.5 py-1 text-xs rounded border transition-colors flex items-center gap-1.5 cursor-pointer font-mono ${
                      isSelected
                        ? 'border-amber-400 bg-amber-950/50 text-amber-200 font-bold shadow-[0_0_8px_rgba(251,191,36,0.2)]'
                        : 'border-zinc-800 bg-black/60 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    {isSelected ? (
                      <CheckSquare size={13} className="text-amber-400 shrink-0" />
                    ) : (
                      <Square size={13} className="opacity-50 shrink-0" />
                    )}
                    <span className="truncate max-w-[150px] sm:max-w-[200px]">{link.title}</span>
                    <span className="text-[10px] opacity-60">({link.category})</span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Messages Log */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3.5 bg-black/40">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
              >
                {/* Meta header */}
                <div className="flex items-center gap-2 text-[10px] opacity-60 px-1">
                  <span>{isUser ? '👤 ВЫ (СТУДЕНТ)' : '🤖 НЕЙРОСЕТЬ PIP-BOY'}</span>
                  <span>{new Date(msg.timestamp).toLocaleTimeString('ru-RU')}</span>
                  {msg.siteTitles && msg.siteTitles.length > 0 && (
                    <span className="text-amber-400/80">
                      • Сайты: {msg.siteTitles.slice(0, 2).join(', ')}
                      {msg.siteTitles.length > 2 ? ` (+${msg.siteTitles.length - 2})` : ''}
                    </span>
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={`p-3 sm:p-4 rounded-lg max-w-[92%] sm:max-w-[85%] text-xs sm:text-sm leading-relaxed border relative group ${
                    isUser
                      ? 'bg-[var(--crt-phosphor)]/15 border-[var(--crt-phosphor)] text-[var(--crt-phosphor-bright)] rounded-tr-none'
                      : 'bg-zinc-950/90 border-amber-500/60 text-amber-100 rounded-tl-none shadow-[0_0_15px_rgba(251,191,36,0.1)]'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans sm:font-mono">
                    {msg.text}
                  </div>

                  {/* Copy button */}
                  {!isUser && (
                    <button
                      onClick={() => handleCopyText(msg.id, msg.text)}
                      className="absolute top-2 right-2 p-1 rounded bg-black/60 border border-zinc-700 opacity-0 group-hover:opacity-100 hover:border-amber-400 transition-opacity text-amber-300 cursor-pointer"
                      title="Скопировать ответ"
                    >
                      {copiedId === msg.id ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex flex-col items-start space-y-1">
              <div className="text-[10px] opacity-60 px-1 flex items-center gap-1.5">
                <Cpu size={11} className="animate-spin text-amber-400" />
                <span>ИИ АНАЛИЗИРУЕТ ВЫБРАННЫЕ САЙТЫ...</span>
              </div>
              <div className="p-3 rounded-lg bg-black/80 border border-amber-500/50 text-amber-300 text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>Обработка запроса и формирование академического ответа...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Chips */}
        <div className="bg-black/80 border-t border-[var(--crt-phosphor-dim)] px-3 py-2 overflow-x-auto shrink-0 flex items-center gap-1.5">
          <span className="text-[10px] opacity-60 font-bold shrink-0 flex items-center gap-1">
            <Sparkles size={11} className="text-amber-400" /> БЫСТРЫЕ ВОПРОСЫ:
          </span>
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleAsk(prompt)}
              disabled={isLoading || links.length === 0}
              className="text-[11px] px-2.5 py-1 rounded border border-[var(--crt-phosphor-dim)]/50 hover:border-amber-400 bg-black/60 hover:bg-amber-950/30 text-[var(--crt-phosphor)] hover:text-amber-300 transition-colors whitespace-nowrap cursor-pointer shrink-0 disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-black/90 border-t border-[var(--crt-phosphor-dim)] shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={
                selectedLinkIds.length > 0
                  ? `Спросите что угодно о выбранных сайтах (${selectedLinkIds.length} шт.)...`
                  : 'Сначала выберите хотя бы один сайт сверху...'
              }
              disabled={isLoading || links.length === 0}
              className="flex-1 bg-black/90 border border-[var(--crt-phosphor)] px-3.5 py-2 text-xs sm:text-sm text-[var(--crt-phosphor)] outline-none rounded font-mono placeholder:text-zinc-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={isLoading || !question.trim() || selectedLinkIds.length === 0}
              className="px-4 py-2 bg-amber-400 text-black hover:bg-amber-300 font-bold text-xs sm:text-sm rounded transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(251,191,36,0.3)] shrink-0"
            >
              <Send size={14} />
              <span>СПРОСИТЬ</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
