import React from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Bell,
  Smartphone,
  Layers,
  FlaskConical,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  FolderPlus
} from 'lucide-react';

interface TabGuideProps {
  onGoToMonitor: () => void;
  onGoToScience: () => void;
  onGoToInstall: () => void;
  onGoToGitHub?: () => void;
}

export const TabGuide: React.FC<TabGuideProps> = ({
  onGoToMonitor,
  onGoToScience,
  onGoToInstall,
  onGoToGitHub
}) => {
  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="border border-[var(--crt-phosphor-dim)] bg-black/50 p-4 rounded-lg flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="text-sm font-bold uppercase tracking-wider text-[var(--crt-phosphor-bright)] flex items-center gap-2">
            <BookOpen size={18} /> КРАТКОЕ РУКОВОДСТВО ПО ЭКСПЛУАТАЦИИ PIP-BOY STUDENT
          </div>
          <div className="text-xs opacity-80 max-w-2xl leading-relaxed">
            Приложение предназначено для непрерывного отслеживания обновлений на учебных порталах, публикации оценок в деканате, изменений в расписании и выхода новых научных статей.
          </div>
        </div>

        <button
          onClick={onGoToMonitor}
          className="px-4 py-2 bg-[var(--crt-phosphor)] text-black font-bold text-xs rounded cursor-pointer hover:bg-[var(--crt-phosphor-bright)] transition-colors uppercase tracking-wider flex items-center gap-1.5"
        >
          <Plus size={14} /> НАЧАТЬ РАБОТУ СО ССЫЛКАМИ
        </button>
      </div>

      {/* Step by step cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Step 1 */}
        <div className="border border-[var(--crt-phosphor-dim)] bg-black/40 p-4 rounded-lg space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[var(--crt-phosphor)] text-black font-extrabold text-xs flex items-center justify-center">
              1
            </span>
            <div className="font-bold text-xs uppercase tracking-wider text-[var(--crt-phosphor-bright)]">
              ДОБАВЛЕНИЕ ССЫЛОК И НАСТРОЙКА ОПРОСА
            </div>
          </div>
          <p className="text-xs opacity-85 leading-relaxed">
            Перейдите во вкладку <strong>«МОНИТОРИНГ»</strong> и нажмите <strong>«+ НОВАЯ ССЫЛКА»</strong>.
          </p>
          <ul className="text-xs opacity-80 list-disc list-inside space-y-1">
            <li>Укажите название (например: <em>«Личный кабинет»</em> или <em>«Расписание 3 курса»</em>).</li>
            <li>Вставьте URL-адрес сайта.</li>
            <li>Выберите интервал фоновой проверки: <strong>каждые 30 секунд</strong>, <strong>1 минуту</strong> или <strong>5 минут</strong>.</li>
            <li>Включите галочку <strong>«Отправлять Push-уведомление при изменениях»</strong>.</li>
          </ul>
        </div>

        {/* Step 2 */}
        <div className="border border-[var(--crt-phosphor-dim)] bg-black/40 p-4 rounded-lg space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[var(--crt-phosphor)] text-black font-extrabold text-xs flex items-center justify-center">
              2
            </span>
            <div className="font-bold text-xs uppercase tracking-wider text-[var(--crt-phosphor-bright)]">
              ТЕГИ И НАСТРАИВАЕМЫЕ КАТЕГОРИИ
            </div>
          </div>
          <p className="text-xs opacity-85 leading-relaxed">
            Для быстрой навигации организуйте ресурсы по папкам и ключевым словам:
          </p>
          <ul className="text-xs opacity-80 list-disc list-inside space-y-1">
            <li>
              Нажмите <strong>«КАТЕГОРИИ»</strong>, чтобы создать свои папки: <em>«ДИПЛОМ»</em>, <em>«ГРАНТЫ»</em>, <em>«ПРАКТИКА»</em>.
            </li>
            <li>
              Привязывайте теги (например: <code>#сессия</code>, <code>#лабы</code>, <code>#дедлайн</code>).
            </li>
            <li>
              Строка поиска находит нужное <strong>мгновенно</strong>: ищите по названию, URL или кликайте по чипам тегов.
            </li>
          </ul>
        </div>

        {/* Step 3 */}
        <div className="border border-[var(--crt-phosphor-dim)] bg-black/40 p-4 rounded-lg space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[var(--crt-phosphor)] text-black font-extrabold text-xs flex items-center justify-center">
              3
            </span>
            <div className="font-bold text-xs uppercase tracking-wider text-[var(--crt-phosphor-bright)]">
              ОТСЛЕЖИВАНИЕ ИЗМЕНЕНИЙ (DIFF DETECTOR)
            </div>
          </div>
          <p className="text-xs opacity-85 leading-relaxed">
            Терминал регулярно опрашивает сайты и вычисляет контрольные суммы содержимого:
          </p>
          <ul className="text-xs opacity-80 list-disc list-inside space-y-1">
            <li>При обнаружении изменений карточка подсветится статусом <strong>«DIFF: ОБНОВЛЕНО»</strong>.</li>
            <li>Раздастся звуковой сигнал и придет системное Push-уведомление.</li>
            <li>Кнопка <strong>«ИСТОРИЯ»</strong> покажет точное время каждого изменения и хронологию правок.</li>
            <li>Вы можете протестировать логику кнопкой <strong>«ТЕСТ DIFF»</strong>.</li>
          </ul>
        </div>

        {/* Step 4 */}
        <div className="border border-[var(--crt-phosphor-dim)] bg-black/40 p-4 rounded-lg space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[var(--crt-phosphor)] text-black font-extrabold text-xs flex items-center justify-center">
              4
            </span>
            <div className="font-bold text-xs uppercase tracking-wider text-[var(--crt-phosphor-bright)]">
              УСТАНОВКА НА РАБОЧИЙ СТОЛ (PWA) И ВИДЖЕТ
            </div>
          </div>
          <p className="text-xs opacity-85 leading-relaxed">
            Для работы без открытия браузера добавьте приложение на устройство:
          </p>
          <ul className="text-xs opacity-80 list-disc list-inside space-y-1">
            <li>
              Во вкладке <strong>«УСТАНОВКА PWA»</strong> нажмите <strong>«Установить на устройство»</strong>.
            </li>
            <li>
              Разрешите отправку Push-уведомлений, чтобы получать предупреждения в фоновом режиме.
            </li>
            <li>
              Во вкладке <strong>«ВИДЖЕТ»</strong> доступен <strong>«Режим плавающего HUD»</strong> — компактное окно, которое удобно закрепить поверх конспектов или кода.
            </li>
          </ul>
        </div>
      </div>

      {/* Science & GitHub Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Science Module Highlight */}
        <div className="border border-[var(--crt-phosphor)] bg-black/50 p-4 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xs text-[var(--crt-phosphor-bright)] uppercase tracking-wider">
              <FlaskConical size={16} /> НАУКА (PUBMED & ALPHAFOLD)
            </div>
            <button
              onClick={onGoToScience}
              className="text-xs underline text-[var(--crt-phosphor-bright)] cursor-pointer"
            >
              Перейти →
            </button>
          </div>
          <p className="text-xs opacity-85 leading-relaxed">
            Поиск биомедицинских статей в NCBI PubMed, препринтов в Europe PMC и 3D-структур в AlphaFold DB с добавлением в авто-мониторинг.
          </p>
        </div>

        {/* GitHub Highlight */}
        <div className="border border-[var(--crt-phosphor)] bg-black/50 p-4 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xs text-[var(--crt-phosphor-bright)] uppercase tracking-wider">
              <FolderPlus size={16} /> СОВМЕСТИМОСТЬ С GITHUB
            </div>
            {onGoToGitHub && (
              <button
                onClick={onGoToGitHub}
                className="text-xs underline text-[var(--crt-phosphor-bright)] cursor-pointer"
              >
                В GitHub →
              </button>
            )}
          </div>
          <p className="text-xs opacity-85 leading-relaxed">
            Отслеживание коммитов и новых релизов учебных репозиториев через GitHub API, просмотр профиля и экспорт бэкапа настроек в GitHub Gist.
          </p>
        </div>
      </div>

      {/* FAQ / Troubleshooting */}
      <div className="border border-[var(--crt-phosphor-dim)] bg-black/40 p-4 rounded-lg space-y-3">
        <div className="font-bold text-xs uppercase tracking-wider text-[var(--crt-phosphor-bright)] flex items-center gap-2">
          <HelpCircle size={15} /> ЧАСТО ЗАДАВАЕМЫЕ ВОПРОСЫ
        </div>

        <div className="space-y-2 text-xs opacity-85">
          <div>
            <strong className="text-[var(--crt-phosphor-bright)] block">
              — Сохраняются ли добавленные ссылки при перезагрузке страницы?
            </strong>
            <span>
              Да, все ссылки, теги, категории и настройки автоматически сохраняются в локальном хранилище вашего браузера (LocalStorage).
            </span>
          </div>

          <div>
            <strong className="text-[var(--crt-phosphor-bright)] block">
              — Как отключить звук кликов или изменить цвет экрана?
            </strong>
            <span>
              В правом верхнем углу панели управления нажмите на значок звука для отключения аудио или кнопку цвета для переключения между зеленым (Green), янтарным (Amber) и голубым (Cyan).
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
