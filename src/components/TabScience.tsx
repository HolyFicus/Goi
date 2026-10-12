import React, { useState } from 'react';
import { queryEuropePmc, queryPubMed, queryAlphaFold } from '../utils/siteChecker';
import { pipAudio } from '../utils/audio';
import { MonitoredLink } from '../types/pipboy';
import {
  Atom,
  Search,
  ExternalLink,
  BookOpen,
  Dna,
  CheckCircle,
  Plus,
  RefreshCw,
  BookmarkPlus,
  FlaskConical,
  Sparkles
} from 'lucide-react';

interface TabScienceProps {
  onAddScientificLink: (link: Omit<MonitoredLink, 'id' | 'lastChecked' | 'lastUpdated' | 'status' | 'currentHash' | 'diffHistory'>) => void;
}

export const TabScience: React.FC<TabScienceProps> = ({ onAddScientificLink }) => {
  const [activeSubTab, setActiveSubTab] = useState<'literature' | 'alphafold'>('literature');
  const [searchQuery, setSearchQuery] = useState('CRISPR Cas9 Gene Editing');
  const [sourceDb, setSourceDb] = useState<'europepmc' | 'pubmed'>('europepmc');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Literature Results
  const [litResult, setLitResult] = useState<{
    count: number;
    latestTitle: string;
    pmid?: string;
    journal?: string;
    abstractText?: string;
  } | null>(null);

  // AlphaFold results
  const [afUniprot, setAfUniprot] = useState('P68871');
  const [afLoading, setAfLoading] = useState(false);
  const [afResult, setAfResult] = useState<{
    entryFound: boolean;
    gene?: string;
    organism?: string;
    plddtAvg?: number;
    pdbUrl?: string;
  } | null>(null);

  const [addedSuccess, setAddedSuccess] = useState<string | null>(null);

  const handleSearchLit = async (queryToUse?: string) => {
    const q = (queryToUse || searchQuery).trim();
    if (!q) return;

    setIsSearching(true);
    pipAudio.playGeiger(3);

    try {
      if (sourceDb === 'europepmc') {
        const res = await queryEuropePmc(q);
        setLitResult(res);
      } else {
        const res = await queryPubMed(q);
        setLitResult(res);
      }
      setHasSearched(true);
      pipAudio.playSuccess();
    } catch {
      //
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchAlphaFold = async (idToUse?: string) => {
    const id = (idToUse || afUniprot).trim();
    if (!id) return;

    setAfLoading(true);
    pipAudio.playGeiger(4);

    try {
      const res = await queryAlphaFold(id);
      setAfResult(res);
      pipAudio.playSuccess();
    } finally {
      setAfLoading(false);
    }
  };

  const handleTrackQuery = () => {
    if (!litResult) return;
    pipAudio.playSuccess();

    onAddScientificLink({
      title: `[${sourceDb.toUpperCase()}] ${searchQuery}`,
      url: sourceDb === 'pubmed' 
        ? `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(searchQuery)}`
        : `https://europepmc.org/search?query=${encodeURIComponent(searchQuery)}`,
      category: 'SCIENCE',
      tags: ['наука', sourceDb, searchQuery.toLowerCase().slice(0, 15)],
      checkIntervalSec: 60,
      contentSnippet: `Статей в базе: ${litResult.count} | Посл: "${litResult.latestTitle.slice(0, 60)}..."`,
      autoRefresh: true,
      notificationEnabled: true,
      isScientific: true,
      scientificMeta: {
        query: searchQuery,
        source: sourceDb,
        paperCount: litResult.count,
        latestTitle: litResult.latestTitle,
        pmid: litResult.pmid,
        journal: litResult.journal
      }
    });

    setAddedSuccess(`Тема «${searchQuery}» добавлена в фоновый мониторинг!`);
    setTimeout(() => setAddedSuccess(null), 4000);
  };

  const handleTrackAlphaFold = () => {
    if (!afResult) return;
    pipAudio.playSuccess();

    onAddScientificLink({
      title: `AlphaFold DB: Белок ${afUniprot} (${afResult.gene})`,
      url: `https://alphafold.ebi.ac.uk/entry/${afUniprot}`,
      category: 'SCIENCE',
      tags: ['alphafold', 'белки', '3d-структура', afUniprot.toLowerCase()],
      checkIntervalSec: 120,
      contentSnippet: `pLDDT score: ${afResult.plddtAvg}% | ${afResult.organism} | ${afResult.gene}`,
      autoRefresh: true,
      notificationEnabled: true,
      isScientific: true,
      scientificMeta: {
        query: afUniprot,
        source: 'alphafold',
        paperCount: 1,
        latestTitle: `${afResult.gene} (${afResult.organism})`
      }
    });

    setAddedSuccess(`Белок «${afUniprot}» добавлен в фоновый мониторинг!`);
    setTimeout(() => setAddedSuccess(null), 4000);
  };

  const PRESET_TOPICS = [
    { title: 'CRISPR Cas9 Base Editing', db: 'europepmc' },
    { title: 'AlphaFold 3 protein complexes', db: 'europepmc' },
    { title: 'Single-cell RNA sequencing genomics', db: 'pubmed' },
    { title: 'CAR-T cell immunotherapy oncology', db: 'pubmed' },
    { title: 'Generative AI molecular drug design', db: 'europepmc' }
  ];

  const PRESET_PROTEINS = [
    { id: 'P68871', name: 'HBB (Hemoglobin beta)' },
    { id: 'P04637', name: 'TP53 (Tumor suppressor p53)' },
    { id: 'P01308', name: 'INS (Insulin)' },
    { id: 'P00533', name: 'EGFR (Epidermal growth factor)' }
  ];

  return (
    <div className="space-y-5">
      {/* Module Title */}
      <div className="border border-[var(--crt-phosphor-dim)] bg-black/40 p-3 rounded flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlaskConical className="text-[var(--crt-phosphor-bright)] animate-pulse" size={20} />
          <div>
            <div className="font-bold text-sm tracking-wider uppercase text-[var(--crt-phosphor-bright)]">
              НАУЧНАЯ ЛАБОРАТОРИЯ PIP-BOY: SCIENCE MONITOR
            </div>
            <div className="text-[11px] opacity-70">
              Прямая интеграция с PubMed Entrez, Europe PMC REST API и базой структур AlphaFold DB (DeepMind)
            </div>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-1 text-xs">
          <button
            onClick={() => {
              pipAudio.playClick();
              setActiveSubTab('literature');
            }}
            className={`px-3 py-1.5 rounded cursor-pointer uppercase font-bold transition-colors ${
              activeSubTab === 'literature'
                ? 'bg-[var(--crt-phosphor)] text-black'
                : 'border border-[var(--crt-phosphor-dim)] text-[var(--crt-phosphor)] hover:border-[var(--crt-phosphor)]'
            }`}
          >
            PubMed & PMC
          </button>
          <button
            onClick={() => {
              pipAudio.playClick();
              setActiveSubTab('alphafold');
            }}
            className={`px-3 py-1.5 rounded cursor-pointer uppercase font-bold transition-colors ${
              activeSubTab === 'alphafold'
                ? 'bg-[var(--crt-phosphor)] text-black'
                : 'border border-[var(--crt-phosphor-dim)] text-[var(--crt-phosphor)] hover:border-[var(--crt-phosphor)]'
            }`}
          >
            AlphaFold DB
          </button>
        </div>
      </div>

      {addedSuccess && (
        <div className="p-3 bg-[var(--crt-phosphor)]/20 border border-[var(--crt-phosphor)] text-[var(--crt-phosphor-bright)] text-xs rounded flex items-center gap-2 animate-fade-in font-bold">
          <CheckCircle size={16} />
          {addedSuccess}
        </div>
      )}

      {/* Subtab 1: Biomedical Literature */}
      {activeSubTab === 'literature' && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="border border-[var(--crt-phosphor-dim)] p-4 rounded bg-black/40 space-y-3">
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex-1 min-w-[240px] relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchLit()}
                  placeholder="Введите научный запрос (например: CRISPR, mRNA vaccines, MicroRNA)..."
                  className="w-full bg-black border border-[var(--crt-phosphor)] px-3 py-2 text-xs text-[var(--crt-phosphor)] outline-none rounded pl-8 font-mono"
                />
                <Search size={14} className="absolute left-2.5 top-2.5 opacity-60" />
              </div>

              {/* DB Selector */}
              <div className="flex items-center gap-1 border border-[var(--crt-phosphor-dim)] rounded p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setSourceDb('europepmc')}
                  className={`px-2 py-1 rounded cursor-pointer font-bold ${
                    sourceDb === 'europepmc' ? 'bg-[var(--crt-phosphor)] text-black' : 'text-zinc-400'
                  }`}
                >
                  Europe PMC
                </button>
                <button
                  type="button"
                  onClick={() => setSourceDb('pubmed')}
                  className={`px-2 py-1 rounded cursor-pointer font-bold ${
                    sourceDb === 'pubmed' ? 'bg-[var(--crt-phosphor)] text-black' : 'text-zinc-400'
                  }`}
                >
                  NCBI PubMed
                </button>
              </div>

              {/* Submit */}
              <button
                onClick={() => handleSearchLit()}
                disabled={isSearching}
                className="px-4 py-2 bg-[var(--crt-phosphor)] text-black font-bold text-xs rounded cursor-pointer hover:bg-[var(--crt-phosphor-bright)] transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw size={13} className={isSearching ? 'animate-spin' : ''} />
                {isSearching ? 'ПОИСК В БАЗЕ...' : 'ИСКАТЬ В БАЗЕ'}
              </button>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-1">
              <span className="opacity-60 flex items-center gap-1">
                <Sparkles size={11} /> Готовые темы:
              </span>
              {PRESET_TOPICS.map((p) => (
                <button
                  key={p.title}
                  onClick={() => {
                    setSearchQuery(p.title);
                    setSourceDb(p.db as 'europepmc' | 'pubmed');
                    handleSearchLit(p.title);
                  }}
                  className="border border-[var(--crt-phosphor-dim)]/50 hover:border-[var(--crt-phosphor)] px-2 py-0.5 rounded cursor-pointer text-[10px] text-[var(--crt-phosphor)]/80 hover:text-[var(--crt-phosphor-bright)]"
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          {/* Results display */}
          {litResult ? (
            <div className="border border-[var(--crt-phosphor)] bg-black/60 p-4 rounded space-y-3 box-glow-subtle">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--crt-phosphor-dim)]/60 pb-2">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-[var(--crt-phosphor-bright)] font-bold">
                    РЕЗУЛЬТАТ ЗАПРОСА В {sourceDb.toUpperCase()}
                  </div>
                  <div className="text-xs opacity-75">
                    Всего публикаций в индексе: <strong className="text-[var(--crt-phosphor-bright)]">{litResult.count.toLocaleString()}</strong>
                  </div>
                </div>

                <button
                  onClick={handleTrackQuery}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[var(--crt-phosphor)] text-black font-bold rounded cursor-pointer hover:bg-[var(--crt-phosphor-bright)] transition-colors"
                >
                  <BookmarkPlus size={14} /> ОТСЛЕЖИВАТЬ НОВЫЕ ПУБЛИКАЦИИ
                </button>
              </div>

              {/* Latest paper card */}
              <div className="bg-black/80 border border-[var(--crt-phosphor-dim)] p-3 rounded space-y-2">
                <div className="text-xs font-bold text-[var(--crt-phosphor-bright)] leading-relaxed">
                  {litResult.latestTitle}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-[11px] opacity-80">
                  {litResult.pmid && (
                    <span className="font-mono bg-[var(--crt-phosphor)]/15 px-1.5 py-0.5 rounded border border-[var(--crt-phosphor-dim)]">
                      PMID: {litResult.pmid}
                    </span>
                  )}
                  {litResult.journal && (
                    <span className="italic">Издание: {litResult.journal}</span>
                  )}
                  <a
                    href={
                      litResult.pmid
                        ? `https://pubmed.ncbi.nlm.nih.gov/${litResult.pmid}/`
                        : `https://europepmc.org/search?query=${encodeURIComponent(searchQuery)}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[var(--crt-phosphor)] hover:underline ml-auto"
                  >
                    Открыть на сайте первоисточника <ExternalLink size={11} />
                  </a>
                </div>

                {litResult.abstractText && (
                  <div className="text-[11px] opacity-75 bg-black p-2 rounded border border-zinc-800 font-mono line-clamp-3">
                    {litResult.abstractText}
                  </div>
                )}
              </div>
            </div>
          ) : !hasSearched ? (
            <div className="border border-dashed border-[var(--crt-phosphor-dim)] p-6 rounded text-center text-xs opacity-70">
              Введите поисковый запрос или выберите одну из готовых тем выше для проверки научных баз
            </div>
          ) : null}
        </div>
      )}

      {/* Subtab 2: AlphaFold DB & Structures */}
      {activeSubTab === 'alphafold' && (
        <div className="space-y-4">
          <div className="border border-[var(--crt-phosphor-dim)] p-4 rounded bg-black/40 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--crt-phosphor-bright)]">
              ПОИСК 3D СТРУКТУР В БАЗЕ ALPHAFOLD DB (EBI / DEEPMIND)
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  value={afUniprot}
                  onChange={(e) => setAfUniprot(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchAlphaFold()}
                  placeholder="UniProt ID (например: P68871, P04637, P01308)..."
                  className="w-full bg-black border border-[var(--crt-phosphor)] px-3 py-2 text-xs text-[var(--crt-phosphor)] outline-none rounded font-mono uppercase"
                />
              </div>
              <button
                onClick={() => handleSearchAlphaFold()}
                disabled={afLoading}
                className="px-4 py-2 bg-[var(--crt-phosphor)] text-black font-bold text-xs rounded cursor-pointer hover:bg-[var(--crt-phosphor-bright)] transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw size={13} className={afLoading ? 'animate-spin' : ''} />
                {afLoading ? 'ЗАГРУЗКА...' : 'ПОЛУЧИТЬ СТРУКТУРУ'}
              </button>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-1">
              <span className="opacity-60">Тестовые белки:</span>
              {PRESET_PROTEINS.map((prot) => (
                <button
                  key={prot.id}
                  onClick={() => {
                    setAfUniprot(prot.id);
                    handleSearchAlphaFold(prot.id);
                  }}
                  className="border border-[var(--crt-phosphor-dim)]/50 hover:border-[var(--crt-phosphor)] px-2 py-0.5 rounded cursor-pointer text-[10px] text-[var(--crt-phosphor)]/80"
                >
                  {prot.name}
                </button>
              ))}
            </div>
          </div>

          {/* AF Result Card */}
          {afResult && (
            <div className="border border-[var(--crt-phosphor)] bg-black/60 p-4 rounded space-y-3 box-glow-subtle">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--crt-phosphor-dim)]/60 pb-2">
                <div>
                  <div className="font-bold text-sm text-[var(--crt-phosphor-bright)]">
                    {afResult.gene} ({afUniprot})
                  </div>
                  <div className="text-xs opacity-75">Организм: {afResult.organism}</div>
                </div>

                <button
                  onClick={handleTrackAlphaFold}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[var(--crt-phosphor)] text-black font-bold rounded cursor-pointer hover:bg-[var(--crt-phosphor-bright)]"
                >
                  <BookmarkPlus size={14} /> ДОБАВИТЬ БЕЛОК В МОНИТОР
                </button>
              </div>

              {/* pLDDT Meter */}
              <div className="bg-black/80 border border-[var(--crt-phosphor-dim)] p-3 rounded space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span>ДОСТОВЕРНОСТЬ МОДЕЛИ (pLDDT SCORE):</span>
                  <span className="text-[var(--crt-phosphor-bright)]">{afResult.plddtAvg}%</span>
                </div>
                <div className="w-full bg-zinc-900 h-3 rounded overflow-hidden border border-zinc-700">
                  <div
                    className="bg-[var(--crt-phosphor)] h-full transition-all duration-500"
                    style={{ width: `${afResult.plddtAvg}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] opacity-60">
                  <span>Низкая (&lt;50)</span>
                  <span>Удовлетворительная (70)</span>
                  <span>Очень высокая (&gt;90)</span>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="opacity-75">Формат: Координаты PDB / mmCIF доступны</span>
                  <a
                    href={`https://alphafold.ebi.ac.uk/entry/${afUniprot}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[var(--crt-phosphor-bright)] hover:underline"
                  >
                    3D Визуализация на AlphaFold EBI <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
