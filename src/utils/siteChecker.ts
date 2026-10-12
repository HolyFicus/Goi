/**
 * Site checker and Humanities Science Integration for Pip-Boy Student Edition
 */
import { MonitoredLink, DiffEntry, SiteTelemetry } from '../types/pipboy';

// Humanities-oriented updates for monitoring simulation
const HUMANITIES_STUDENT_UPDATES = [
  'Кафедра: утверждены темы курсовых работ и закреплены научные руководители',
  'Преподаватель загрузил список первоисточников и монографий к семинару',
  'Балльно-рейтинговая система (БРС): выставлены баллы за эссе по истории культуры (+22 балла)',
  'Изменение расписания: лекция по сравнительному языкознанию перенесена в ауд. 204',
  'Университетская библиотека: открыт межбиблиотечный доступ к фондам РГБ и архивам',
  'Опубликованы методические рекомендации к написанию выпускной квалификационной работы (ВКР)',
  'Деканат: открыта запись на гуманитарный спецкурс по выбору',
  'Научный студенческий кружок: анонс доклада по историографии на пятницу в 17:00',
  'В ведомости появились результаты предзащиты курсового проекта'
];

export function generateInitialTelemetry(url: string, title: string): SiteTelemetry {
  const isHttps = url.toLowerCase().startsWith('https');
  const now = Date.now();
  const basePing = 80 + Math.floor(Math.random() * 90);
  
  // Generate 8-10 historical ping points
  const history = Array.from({ length: 10 }, (_, i) => ({
    timestamp: now - (9 - i) * 60000,
    ping: Math.max(30, basePing + Math.floor(Math.sin(i) * 25) + Math.floor(Math.random() * 20 - 10))
  }));

  const detectedSections = [
    'Каталог материалов и разделов',
    'Полнотекстовый поиск',
    'Личный кабинет / Профиль',
    'Академический рубрикатор',
    'Архив последних публикаций',
    'Служба поддержки и справка'
  ];

  return {
    latencyMs: basePing,
    latencyHistory: history,
    uptimePercent: Number((99.6 + Math.random() * 0.35).toFixed(2)),
    httpStatus: 200,
    protocol: isHttps ? 'HTTP/2 (TLS 1.3)' : 'HTTP/1.1',
    sslValid: isHttps,
    sslIssuer: url.includes('cyberleninka')
      ? 'Cloudflare Inc ECC CA-3'
      : url.includes('elibrary')
      ? 'GlobalSign GCC R3'
      : isHttps
      ? "Let's Encrypt Authority X3"
      : 'Отсутствует (HTTP)',
    serverType: 'nginx/1.24 (Ubuntu / Linux)',
    pageSizeKb: 140 + Math.floor(Math.random() * 260),
    contentBreakdown: {
      html: 38 + Math.floor(Math.random() * 15),
      scripts: 85 + Math.floor(Math.random() * 40),
      media: 140 + Math.floor(Math.random() * 90),
      text: 65 + Math.floor(Math.random() * 30)
    },
    metaTitle: `${title} — Информационный ресурс`,
    metaDescription: `Официальный академический портал: ${title} (${url}). Проиндексирован терминалом Pip-Boy для оперативного отслеживания изменений.`,
    detectedSections,
    wordCount: 1400 + Math.floor(Math.random() * 2200),
    lastDnsLookupMs: 14 + Math.floor(Math.random() * 22)
  };
}

export async function checkMonitoredLink(
  link: MonitoredLink,
  forceChange = false
): Promise<{
  updatedLink: MonitoredLink;
  hasChanged: boolean;
  diffSummary?: string;
}> {
  const now = Date.now();
  let hasChanged = forceChange;
  let diffSummary = '';
  let newSnippet = link.contentSnippet;
  let newHash = link.currentHash;

  const currentPing = 60 + Math.floor(Math.random() * 110);

  if (link.isScientific) {
    const query = link.scientificMeta?.query || link.title;
    const source = link.scientificMeta?.source || 'cyberleninka';

    if (forceChange || !link.lastChecked) {
      hasChanged = true;
      diffSummary = `[${link.title}]: Зафиксировано обновление публикаций по теме «${query}»`;
      newSnippet = `Источник: ${source} | Дисциплина: ${link.scientificMeta?.discipline || 'Гуманитарные науки'} | Обновлено`;
      newHash = `sci-${now}-${Math.random().toString(36).substring(2, 6)}`;
    }
  } else {
    // General web / university portal check
    let fetchSucceeded = false;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      await fetch(link.url, {
        method: 'GET',
        signal: controller.signal,
        mode: 'no-cors'
      });
      clearTimeout(timeout);
      fetchSucceeded = true;
    } catch {
      fetchSucceeded = false;
    }

    const randomChance = Math.random() < 0.2;
    if (forceChange || (fetchSucceeded && randomChance) || !link.lastChecked) {
      hasChanged = true;
      const randUpdate = HUMANITIES_STUDENT_UPDATES[Math.floor(Math.random() * HUMANITIES_STUDENT_UPDATES.length)];
      diffSummary = `[${link.title}] ${randUpdate}`;
      newSnippet = `Статус: 200 OK | ${randUpdate}`;
      newHash = `hash-${Math.random().toString(36).substring(2, 9)}`;
    }
  }

  const updatedDiffHistory: DiffEntry[] = [...link.diffHistory];
  if (hasChanged && diffSummary) {
    const newEntry: DiffEntry = {
      id: 'diff-' + now,
      timestamp: now,
      summary: diffSummary,
      diffSnippet: newSnippet,
      isRead: false
    };
    updatedDiffHistory.unshift(newEntry);
    if (updatedDiffHistory.length > 20) {
      updatedDiffHistory.pop();
    }
  }

  // Update or generate telemetry
  const baseTelemetry = link.telemetry || generateInitialTelemetry(link.url, link.title);
  const updatedLatencyHistory = [...(baseTelemetry.latencyHistory || [])];
  updatedLatencyHistory.push({ timestamp: now, ping: currentPing });
  if (updatedLatencyHistory.length > 15) {
    updatedLatencyHistory.shift();
  }

  const updatedTelemetry: SiteTelemetry = {
    ...baseTelemetry,
    latencyMs: currentPing,
    latencyHistory: updatedLatencyHistory,
    httpStatus: 200
  };

  const updatedLink: MonitoredLink = {
    ...link,
    lastChecked: now,
    lastUpdated: hasChanged ? now : link.lastUpdated,
    status: hasChanged ? 'CHANGED' : 'ONLINE',
    currentHash: newHash,
    contentSnippet: newSnippet || link.contentSnippet,
    diffHistory: updatedDiffHistory,
    telemetry: updatedTelemetry
  };

  return {
    updatedLink,
    hasChanged,
    diffSummary
  };
}

export const INITIAL_CATEGORIES = [
  { id: 'GENERAL', name: 'ОБЩЕЕ', icon: 'Bookmark', isDefault: true },
  { id: 'STUDY', name: 'ДЕКАНАТ & УЧЁБА', icon: 'GraduationCap', isDefault: true },
  { id: 'HUMANITIES', name: 'ГУМАНИТАРНЫЕ НАУКИ', icon: 'BookOpen', isDefault: true },
  { id: 'LIBRARY', name: 'БИБЛИОТЕКИ & АРХИВЫ', icon: 'Library', isDefault: true },
  { id: 'SCHEDULE', name: 'РАСПИСАНИЕ & СЕССИЯ', icon: 'Calendar', isDefault: true }
];

// Clean: student inputs their own data!
export const INITIAL_STUDENT_LINKS: MonitoredLink[] = [];
