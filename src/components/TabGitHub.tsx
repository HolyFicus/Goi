import React, { useState } from 'react';
import { MonitoredLink, CustomCategory, StudentProfile } from '../types/pipboy';
import { queryGitHubRepo, queryGitHubUser, parseGitHubUrl } from '../utils/siteChecker';
import { pipAudio } from '../utils/audio';
import {
  GitBranch,
  GitCommit,
  GitPullRequest,
  Star,
  ExternalLink,
  Plus,
  Search,
  CheckCircle,
  Copy,
  Download,
  Code2,
  BookmarkPlus,
  RefreshCw,
  FolderGit2,
  Tag,
  User,
  Sparkles,
  Github
} from 'lucide-react';

interface TabGitHubProps {
  onAddGitHubLink: (link: Omit<MonitoredLink, 'id' | 'lastChecked' | 'lastUpdated' | 'status' | 'currentHash' | 'diffHistory'>) => void;
  allLinks: MonitoredLink[];
  categories: CustomCategory[];
  profile: StudentProfile;
}

export const TabGitHub: React.FC<TabGitHubProps> = ({
  onAddGitHubLink,
  allLinks,
  categories,
  profile
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'repo' | 'user' | 'sync'>('repo');

  // Repo search state
  const [repoInput, setRepoInput] = useState('google-deepmind/alphafold');
  const [isRepoLoading, setIsRepoLoading] = useState(false);
  const [repoResult, setRepoResult] = useState<{
    name: string;
    fullName: string;
    description: string;
    stars: number;
    forks: number;
    openIssues: number;
    defaultBranch: string;
    htmlUrl: string;
    lastCommit?: {
      sha: string;
      message: string;
      author: string;
      date: string;
    };
    latestRelease?: {
      tagName: string;
      name: string;
      publishedAt: string;
    };
  } | null>(null);

  // User search state
  const [usernameInput, setUsernameInput] = useState('');
  const [isUserLoading, setIsUserLoading] = useState(false);
  const [userResult, setUserResult] = useState<{
    login: string;
    name: string;
    avatarUrl: string;
    bio: string;
    publicRepos: number;
    followers: number;
    htmlUrl: string;
    repos: Array<{
      name: string;
      fullName: string;
      description: string;
      stars: number;
      updatedAt: string;
      language: string;
      htmlUrl: string;
    }>;
  } | null>(null);

  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const [copiedConfig, setCopiedConfig] = useState(false);

  const handleSearchRepo = async (targetRepo?: string) => {
    const raw = (targetRepo || repoInput).trim();
    if (!raw) return;

    const parsed = parseGitHubUrl(raw);
    if (!parsed) {
      alert('Пожалуйста, укажите репозиторий в формате "owner/repo" или полную ссылку на GitHub.');
      return;
    }

    setIsRepoLoading(true);
    pipAudio.playClick();

    try {
      const res = await queryGitHubRepo(parsed.owner, parsed.repo);
      setRepoResult(res);
      pipAudio.playSuccess();
    } catch {
      //
    } finally {
      setIsRepoLoading(false);
    }
  };

  const handleSearchUser = async (targetUser?: string) => {
    const uname = (targetUser || usernameInput).trim();
    if (!uname) return;

    setIsUserLoading(true);
    pipAudio.playClick();

    try {
      const res = await queryGitHubUser(uname);
      setUserResult(res);
      pipAudio.playSuccess();
    } finally {
      setIsUserLoading(false);
    }
  };

  const handleTrackRepo = (customRepo?: { fullName: string; htmlUrl: string; description: string; lastCommit?: { sha: string; message: string; author: string; date: string }; latestRelease?: { tagName: string }; stars: number; defaultBranch: string }) => {
    const r = customRepo || repoResult;
    if (!r) return;

    pipAudio.playSuccess();
    const [owner, repo] = r.fullName.split('/');

    onAddGitHubLink({
      title: `GitHub: ${r.fullName}`,
      url: r.htmlUrl,
      category: 'SCIENCE',
      tags: ['github', 'код', repo.toLowerCase(), 'репозиторий'],
      checkIntervalSec: 60,
      contentSnippet: `Коммит [${r.lastCommit?.sha || 'HEAD'}]: ${r.lastCommit?.message || 'Код актуален'} | Stars: ${r.stars}`,
      autoRefresh: true,
      notificationEnabled: true,
      isGitHub: true,
      githubMeta: {
        owner,
        repo,
        lastCommitSha: r.lastCommit?.sha,
        lastCommitMessage: r.lastCommit?.message,
        lastCommitDate: r.lastCommit?.date,
        latestReleaseTag: r.latestRelease?.tagName,
        stars: r.stars,
        defaultBranch: r.defaultBranch
      }
    });

    setNotificationMsg(`Репозиторий «${r.fullName}» подключен к непрерывному мониторингу коммитов!`);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const handleCopyConfig = () => {
    pipAudio.playSuccess();
    const payload = JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        app: 'Pip-Boy 3000 Student Edition',
        profile,
        categories,
        links: allLinks
      },
      null,
      2
    );
    navigator.clipboard.writeText(payload).catch(() => {});
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 3000);
  };

  const handleDownloadConfig = () => {
    pipAudio.playSuccess();
    const payload = JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        app: 'Pip-Boy 3000 Student Edition',
        profile,
        categories,
        links: allLinks
      },
      null,
      2
    );
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pipboy-student-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const POPULAR_STUDENT_REPOS = [
    { name: 'google-deepmind/alphafold', desc: 'Нейросетевая модель предсказания 3D структур белков' },
    { name: 'biopython/biopython', desc: 'Библиотека вычислительной молекулярной биологии' },
    { name: 'pytorch/pytorch', desc: 'Фреймворк машинного обучения и нейросетей' },
    { name: 'microsoft/vscode', desc: 'Среда разработки кода и расширений' },
    { name: 'torvalds/linux', desc: 'Исходный код ядра операционной системы Linux' }
  ];

  return (
    <div className="space-y-5">
      {/* Module Title */}
      <div className="border border-[var(--crt-phosphor-dim)] bg-black/40 p-3 rounded-lg flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <FolderGit2 className="text-[var(--crt-phosphor-bright)] animate-pulse" size={22} />
          <div>
            <div className="font-bold text-sm tracking-wider uppercase text-[var(--crt-phosphor-bright)]">
              ИНТЕГРАЦИЯ С GITHUB: РЕПОЗИТОРИИ & РЕЛИЗЫ
            </div>
            <div className="text-[11px] opacity-75">
              Прямой мониторинг коммитов и релизов через GitHub REST API, профиль студента и экспорт бэкапа в Gist
            </div>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-1 text-xs font-mono">
          <button
            onClick={() => {
              pipAudio.playClick();
              setActiveSubTab('repo');
            }}
            className={`px-3 py-1.5 rounded cursor-pointer uppercase font-bold transition-colors ${
              activeSubTab === 'repo'
                ? 'bg-[var(--crt-phosphor)] text-black'
                : 'border border-[var(--crt-phosphor-dim)] text-[var(--crt-phosphor)] hover:border-[var(--crt-phosphor)]'
            }`}
          >
            Репозитории
          </button>
          <button
            onClick={() => {
              pipAudio.playClick();
              setActiveSubTab('user');
            }}
            className={`px-3 py-1.5 rounded cursor-pointer uppercase font-bold transition-colors ${
              activeSubTab === 'user'
                ? 'bg-[var(--crt-phosphor)] text-black'
                : 'border border-[var(--crt-phosphor-dim)] text-[var(--crt-phosphor)] hover:border-[var(--crt-phosphor)]'
            }`}
          >
            Профиль GitHub
          </button>
          <button
            onClick={() => {
              pipAudio.playClick();
              setActiveSubTab('sync');
            }}
            className={`px-3 py-1.5 rounded cursor-pointer uppercase font-bold transition-colors ${
              activeSubTab === 'sync'
                ? 'bg-[var(--crt-phosphor)] text-black'
                : 'border border-[var(--crt-phosphor-dim)] text-[var(--crt-phosphor)] hover:border-[var(--crt-phosphor)]'
            }`}
          >
            Бэкап / Gist
          </button>
        </div>
      </div>

      {notificationMsg && (
        <div className="p-3 bg-[var(--crt-phosphor)]/20 border border-[var(--crt-phosphor)] text-[var(--crt-phosphor-bright)] text-xs rounded flex items-center gap-2 animate-fade-in font-bold">
          <CheckCircle size={16} />
          {notificationMsg}
        </div>
      )}

      {/* Subtab 1: Repository Monitor */}
      {activeSubTab === 'repo' && (
        <div className="space-y-4">
          <div className="border border-[var(--crt-phosphor-dim)] p-4 rounded-lg bg-black/40 space-y-3 font-mono">
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--crt-phosphor-bright)]">
              ПОИСК РЕПОЗИТОРИЯ ДЛЯ МОНИТОРИНГА КОММИТОВ И РЕЛИЗОВ
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex-1 min-w-[240px] relative">
                <input
                  type="text"
                  value={repoInput}
                  onChange={(e) => setRepoInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchRepo()}
                  placeholder="owner/repo или https://github.com/owner/repo..."
                  className="w-full bg-black border border-[var(--crt-phosphor)] px-3 py-2 text-xs text-[var(--crt-phosphor)] outline-none rounded pl-8"
                />
                <Search size={14} className="absolute left-2.5 top-2.5 opacity-60" />
              </div>

              <button
                onClick={() => handleSearchRepo()}
                disabled={isRepoLoading}
                className="px-4 py-2 bg-[var(--crt-phosphor)] text-black font-extrabold text-xs rounded cursor-pointer hover:bg-[var(--crt-phosphor-bright)] transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw size={13} className={isRepoLoading ? 'animate-spin' : ''} />
                {isRepoLoading ? 'ЗАПРОС GITHUB...' : 'ПРОВЕРИТЬ'}
              </button>
            </div>

            {/* Popular presets */}
            <div className="pt-1 space-y-1">
              <span className="text-[10px] opacity-60 uppercase font-bold">Популярные научные и студенческие проекты:</span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_STUDENT_REPOS.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => {
                      setRepoInput(p.name);
                      handleSearchRepo(p.name);
                    }}
                    className="border border-[var(--crt-phosphor-dim)]/50 hover:border-[var(--crt-phosphor)] px-2 py-0.5 rounded text-[10px] text-[var(--crt-phosphor)]/80 hover:text-[var(--crt-phosphor-bright)] cursor-pointer"
                    title={p.desc}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Repo Card Result */}
          {repoResult && (
            <div className="border-2 border-[var(--crt-phosphor)] bg-black/60 p-4 rounded-lg space-y-3 box-glow-subtle font-mono">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--crt-phosphor-dim)]/60 pb-2">
                <div>
                  <div className="font-bold text-sm text-[var(--crt-phosphor-bright)] flex items-center gap-2">
                    <FolderGit2 size={16} />
                    {repoResult.fullName}
                  </div>
                  <div className="text-xs opacity-80 mt-0.5">{repoResult.description}</div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={repoResult.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-2.5 py-1 border border-[var(--crt-phosphor-dim)] hover:border-[var(--crt-phosphor)] rounded flex items-center gap-1 opacity-80 hover:opacity-100"
                  >
                    GitHub <ExternalLink size={11} />
                  </a>

                  <button
                    onClick={() => handleTrackRepo()}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 bg-[var(--crt-phosphor)] text-black font-extrabold rounded cursor-pointer hover:bg-[var(--crt-phosphor-bright)] transition-colors uppercase tracking-wider"
                  >
                    <BookmarkPlus size={14} /> ПОДКЛЮЧИТЬ К МОНИТОРУ
                  </button>
                </div>
              </div>

              {/* Stats badges */}
              <div className="flex flex-wrap items-center gap-3 text-xs opacity-90 pt-1">
                <span className="flex items-center gap-1 border border-[var(--crt-phosphor-dim)] px-2 py-0.5 rounded">
                  <Star size={12} className="text-amber-400" /> {repoResult.stars.toLocaleString()} stars
                </span>
                <span className="flex items-center gap-1 border border-[var(--crt-phosphor-dim)] px-2 py-0.5 rounded">
                  <GitBranch size={12} /> {repoResult.defaultBranch}
                </span>
                <span className="flex items-center gap-1 border border-[var(--crt-phosphor-dim)] px-2 py-0.5 rounded">
                  <GitPullRequest size={12} /> {repoResult.openIssues} issues
                </span>
              </div>

              {/* Latest Commit Details */}
              {repoResult.lastCommit && (
                <div className="bg-black/90 border border-[var(--crt-phosphor-dim)] p-3 rounded space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[10px] text-amber-300">
                    <span className="flex items-center gap-1 font-bold">
                      <GitCommit size={12} /> ПОСЛЕДНИЙ КОММИТ [SHA: {repoResult.lastCommit.sha}]
                    </span>
                    <span>{new Date(repoResult.lastCommit.date).toLocaleDateString()} · {new Date(repoResult.lastCommit.date).toLocaleTimeString()}</span>
                  </div>
                  <div className="font-bold text-[var(--crt-phosphor-bright)]">
                    {repoResult.lastCommit.message}
                  </div>
                  <div className="text-[10px] opacity-70">
                    Автор: {repoResult.lastCommit.author}
                  </div>
                </div>
              )}

              {/* Latest Release if available */}
              {repoResult.latestRelease && (
                <div className="bg-black/90 border border-[var(--crt-phosphor-dim)] p-2.5 rounded text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold text-[var(--crt-phosphor-bright)]">
                    <Tag size={13} /> РЕЛИЗ: {repoResult.latestRelease.tagName} ({repoResult.latestRelease.name})
                  </span>
                  <span className="text-[10px] opacity-70">
                    {new Date(repoResult.latestRelease.publishedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Subtab 2: User Profile & Repos */}
      {activeSubTab === 'user' && (
        <div className="space-y-4">
          <div className="border border-[var(--crt-phosphor-dim)] p-4 rounded-lg bg-black/40 space-y-3 font-mono">
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--crt-phosphor-bright)]">
              ПОИСК СТУДЕНТА / РАЗРАБОТЧИКА НА GITHUB
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex-1 min-w-[200px] relative">
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchUser()}
                  placeholder="Введите GitHub логин (например: torvalds, gaearon или ваш)..."
                  className="w-full bg-black border border-[var(--crt-phosphor)] px-3 py-2 text-xs text-[var(--crt-phosphor)] outline-none rounded pl-8"
                />
                <User size={14} className="absolute left-2.5 top-2.5 opacity-60" />
              </div>

              <button
                onClick={() => handleSearchUser()}
                disabled={isUserLoading}
                className="px-4 py-2 bg-[var(--crt-phosphor)] text-black font-extrabold text-xs rounded cursor-pointer hover:bg-[var(--crt-phosphor-bright)] transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw size={13} className={isUserLoading ? 'animate-spin' : ''} />
                {isUserLoading ? 'ПОИСК...' : 'НАЙТИ ПРОФИЛЬ'}
              </button>
            </div>
          </div>

          {/* User Result */}
          {userResult && (
            <div className="border border-[var(--crt-phosphor)] bg-black/60 p-4 rounded-lg space-y-4 font-mono">
              <div className="flex items-center gap-4">
                <img
                  src={userResult.avatarUrl}
                  alt={userResult.login}
                  className="w-16 h-16 rounded-full border-2 border-[var(--crt-phosphor)]"
                />
                <div className="space-y-0.5">
                  <div className="font-bold text-sm text-[var(--crt-phosphor-bright)]">
                    {userResult.name} (@{userResult.login})
                  </div>
                  <div className="text-xs opacity-75">{userResult.bio}</div>
                  <div className="text-[11px] opacity-60">
                    Репозиториев: {userResult.publicRepos} | Подписчиков: {userResult.followers}
                  </div>
                </div>
              </div>

              {/* Repos list */}
              <div className="space-y-2 pt-2 border-t border-[var(--crt-phosphor-dim)]/50">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--crt-phosphor-bright)]">
                  ПУБЛИЧНЫЕ РЕПОЗИТОРИИ:
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {userResult.repos.map((repo) => (
                    <div
                      key={repo.name}
                      className="border border-[var(--crt-phosphor-dim)]/60 bg-black/80 p-2.5 rounded flex flex-col justify-between"
                    >
                      <div>
                        <div className="font-bold text-xs text-[var(--crt-phosphor-bright)] truncate">
                          {repo.name}
                        </div>
                        <div className="text-[11px] opacity-75 line-clamp-1 mt-0.5">
                          {repo.description}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 mt-2 border-t border-[var(--crt-phosphor-dim)]/30 text-[10px]">
                        <span className="opacity-70">{repo.language} · ⭐ {repo.stars}</span>
                        <button
                          onClick={() => handleTrackRepo({
                            fullName: repo.fullName,
                            htmlUrl: repo.htmlUrl,
                            description: repo.description,
                            stars: repo.stars,
                            defaultBranch: 'main'
                          })}
                          className="px-2 py-0.5 bg-[var(--crt-phosphor)] text-black font-bold rounded cursor-pointer hover:bg-[var(--crt-phosphor-bright)]"
                        >
                          + МОНИТОРИНГ
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Subtab 3: Backup & Gist */}
      {activeSubTab === 'sync' && (
        <div className="border border-[var(--crt-phosphor-dim)] p-4 rounded-lg bg-black/40 space-y-4 font-mono text-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--crt-phosphor-bright)] flex items-center gap-2">
            <Code2 size={16} /> РЕЗЕРВНОЕ КОПИРОВАНИЕ ДАННЫХ В GITHUB GIST
          </div>

          <p className="opacity-85 leading-relaxed">
            Вы можете экспортировать все настроенные ссылки, теги, категории и профиль в структурированный JSON-формат для сохранения в личный <strong>GitHub Gist</strong> или репозиторий. Это позволяет легко переносить свои списки мониторинга между ПК и телефоном.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={handleCopyConfig}
              className="px-4 py-2 bg-[var(--crt-phosphor)] text-black font-extrabold rounded cursor-pointer hover:bg-[var(--crt-phosphor-bright)] transition-colors flex items-center gap-1.5 uppercase"
            >
              {copiedConfig ? <CheckCircle size={14} /> : <Copy size={14} />}
              {copiedConfig ? 'СКОПИРОВАНО В БУФЕР' : 'СКОПИРОВАТЬ ДАННЫЕ В JSON'}
            </button>

            <button
              onClick={handleDownloadConfig}
              className="px-4 py-2 border border-[var(--crt-phosphor)] bg-black text-[var(--crt-phosphor)] hover:bg-[var(--crt-phosphor)]/20 font-bold rounded cursor-pointer transition-colors flex items-center gap-1.5 uppercase"
            >
              <Download size={14} /> СКАЧАТЬ ФАЙЛ БЭКАПА
            </button>

            <a
              href="https://gist.github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 border border-zinc-700 hover:border-zinc-500 rounded flex items-center gap-1.5 opacity-80 hover:opacity-100"
            >
              Открыть GitHub Gist <ExternalLink size={13} />
            </a>
          </div>

          <div className="p-3 bg-black/80 border border-[var(--crt-phosphor-dim)]/40 rounded space-y-1 text-[11px] opacity-80">
            <div className="font-bold text-[var(--crt-phosphor-bright)]">Инструкция по сохранению в GitHub Gist:</div>
            <div>1. Нажмите «СКОПИРОВАТЬ ДАННЫЕ В JSON» выше.</div>
            <div>2. Перейдите на <strong>gist.github.com</strong> и вставьте скопированный текст.</div>
            <div>3. Назовите файл <code>pipboy-student-config.json</code> и нажмите «Create secret gist».</div>
            <div>Все ваши ресурсы и настройки будут надежно сохранены в вашем аккаунте GitHub!</div>
          </div>
        </div>
      )}
    </div>
  );
};
