/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  MonitoredLink,
  CustomCategory,
  StudentProfile,
  PipBoySettings,
  PipBoyNotification
} from './types/pipboy';
import { INITIAL_STUDENT_LINKS, INITIAL_CATEGORIES, checkMonitoredLink } from './utils/siteChecker';
import { pipAudio } from './utils/audio';
import { sendNativeNotification } from './utils/notifications';
import { PipBoyShell, ActiveTab } from './components/PipBoyShell';
import { TabMonitor } from './components/TabMonitor';
import { TabScience } from './components/TabScience';
import { TabWidget } from './components/TabWidget';
import { TabInstallPWA } from './components/TabInstallPWA';
import { TabProfile } from './components/TabProfile';
import { TabGuide } from './components/TabGuide';
import { TabGitHub } from './components/TabGitHub';

const STORAGE_KEYS = {
  LINKS: 'pipboy_clean_links_v3',
  CATEGORIES: 'pipboy_clean_categories_v3',
  PROFILE: 'pipboy_clean_profile_v3',
  SETTINGS: 'pipboy_clean_settings_v3',
  NOTIFS: 'pipboy_clean_notifs_v3'
};

const EMPTY_PROFILE: StudentProfile = {
  fullName: '',
  studentId: '',
  university: '',
  faculty: '',
  group: '',
  course: 1,
  email: '',
  notes: ''
};

const DEFAULT_SETTINGS: PipBoySettings = {
  colorTheme: 'green',
  audioEnabled: true,
  scanlines: true,
  crtFlicker: false,
  autoCheckGlobal: true,
  globalInterval: 45,
  pushNotificationsAllowed: true
};

export default function App() {
  // Check URL params for widget or science direct link
  const initialTab: ActiveTab = (() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view');
      if (view === 'widget') return 'WIDGET';
      if (view === 'science') return 'SCIENCE';
      if (view === 'github') return 'GITHUB';
      if (view === 'guide') return 'GUIDE';
    }
    return 'MONITOR';
  })();

  const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab);
  const [compactHudMode, setCompactHudMode] = useState(false);
  const [isScanningAll, setIsScanningAll] = useState(false);

  // Clean Initial States: empty lists so user inputs their own data!
  const [links, setLinks] = useState<MonitoredLink[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LINKS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_STUDENT_LINKS; // []
  });

  const [categories, setCategories] = useState<CustomCategory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_CATEGORIES;
  });

  const [profile, setProfile] = useState<StudentProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (saved) return JSON.parse(saved);
    } catch {}
    return EMPTY_PROFILE;
  });

  const [settings, setSettings] = useState<PipBoySettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_SETTINGS;
  });

  const [notifications, setNotifications] = useState<PipBoyNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(links));
    } catch {}
  }, [links]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch {}
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch {}
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFS, JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  // Audio mute state sync
  useEffect(() => {
    pipAudio.isMuted = !settings.audioEnabled;
  }, [settings.audioEnabled]);

  // Handle Notifications Dispatch
  const addNotification = useCallback((notif: Omit<PipBoyNotification, 'id' | 'timestamp' | 'read'>) => {
    const newEntry: PipBoyNotification = {
      ...notif,
      id: 'notif-' + Date.now() + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now(),
      read: false
    };

    setNotifications((prev) => [newEntry, ...prev].slice(0, 30));

    // Send native OS push notification
    sendNativeNotification({
      title: `⚡ ${notif.title}`,
      body: notif.message,
      icon: '/icon-192.svg'
    });
  }, []);

  // Scan single link
  const handleScanSingle = useCallback(async (linkId: string, forceChange = false) => {
    const target = links.find((l) => l.id === linkId);
    if (!target) return;

    // Set syncing status
    setLinks((prev) =>
      prev.map((l) => (l.id === linkId ? { ...l, status: 'SYNCING' } : l))
    );

    const { updatedLink, hasChanged, diffSummary } = await checkMonitoredLink(target, forceChange);

    setLinks((prev) => prev.map((l) => (l.id === linkId ? updatedLink : l)));

    if (hasChanged && diffSummary) {
      if (target.notificationEnabled) {
        addNotification({
          title: `ОБНОВЛЕНИЕ: ${target.title}`,
          message: diffSummary,
          type: 'UPDATE',
          linkId: target.id,
          sourceUrl: target.url
        });
      }
      pipAudio.playAlert();
    }
  }, [links, addNotification]);

  // Scan all links
  const handleScanAll = useCallback(async () => {
    if (isScanningAll || links.length === 0) return;
    setIsScanningAll(true);

    const activeLinks = links.filter((l) => l.autoRefresh);

    for (const link of activeLinks) {
      await handleScanSingle(link.id);
    }

    pipAudio.playSuccess();
    setIsScanningAll(false);
  }, [isScanningAll, links, handleScanSingle]);

  // Background Auto-polling loop
  useEffect(() => {
    if (!settings.autoCheckGlobal || links.length === 0) return;

    const intervalMs = Math.max(15, settings.globalInterval) * 1000;
    const intervalTimer = setInterval(() => {
      const refreshable = links.filter((l) => l.autoRefresh);
      if (refreshable.length === 0) return;

      const oldest = [...refreshable].sort((a, b) => (a.lastChecked || 0) - (b.lastChecked || 0))[0];
      if (oldest) {
        handleScanSingle(oldest.id);
      }
    }, intervalMs);

    return () => clearInterval(intervalTimer);
  }, [settings.autoCheckGlobal, settings.globalInterval, links, handleScanSingle]);

  // Simulate change (test diff & push alerts)
  const handleSimulateChange = (id: string) => {
    handleScanSingle(id, true);
  };

  // Add Link
  const handleAddLink = (
    newLinkData: Omit<MonitoredLink, 'id' | 'lastChecked' | 'lastUpdated' | 'status' | 'currentHash' | 'diffHistory'>
  ) => {
    const id = 'link-' + Date.now();
    const createdLink: MonitoredLink = {
      ...newLinkData,
      id,
      lastChecked: Date.now(),
      lastUpdated: Date.now(),
      status: 'ONLINE',
      currentHash: 'init-hash',
      diffHistory: []
    };

    setLinks((prev) => [createdLink, ...prev]);

    addNotification({
      title: 'РЕСУРС ПОДКЛЮЧЕН К МОНИТОРИНГУ',
      message: `Ссылка «${createdLink.title}» добавлена в список отслеживания.`,
      type: 'INFO',
      linkId: id,
      sourceUrl: createdLink.url
    });
  };

  // Delete Link
  const handleDeleteLink = (id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  };

  // Toggle notification
  const handleToggleNotification = (id: string) => {
    setLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, notificationEnabled: !l.notificationEnabled } : l))
    );
  };

  // Update Link Tags
  const handleUpdateLinkTags = (id: string, tags: string[]) => {
    setLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, tags } : l))
    );
  };

  // Update Link Category
  const handleUpdateLinkCategory = (id: string, category: string) => {
    setLinks((prev) =>
      prev.map((l) => (l.category === id ? { ...l, category } : l))
    );
  };

  // Category management
  const handleAddCategory = (cat: CustomCategory) => {
    setCategories((prev) => [...prev, cat]);
  };

  const handleRenameCategory = (id: string, newName: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name: newName } : c))
    );
  };

  const handleDeleteCategory = (id: string) => {
    setLinks((prev) =>
      prev.map((l) => (l.category === id ? { ...l, category: 'GENERAL' } : l))
    );
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const handleClearNotifications = () => {
    pipAudio.playClick();
    setNotifications([]);
  };

  // Complete reset to clean state
  const handleResetAllData = () => {
    pipAudio.playClick();
    localStorage.removeItem(STORAGE_KEYS.LINKS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.NOTIFS);
    setLinks([]);
    setCategories(INITIAL_CATEGORIES);
    setProfile(EMPTY_PROFILE);
    setNotifications([]);
  };

  const changedCount = links.filter((l) => l.status === 'CHANGED').length;

  return (
    <PipBoyShell
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      settings={settings}
      onUpdateSettings={(partial) => setSettings((prev) => ({ ...prev, ...partial }))}
      profile={profile}
      linksCount={links.length}
      changedCount={changedCount}
      notifications={notifications}
      onClearNotifications={handleClearNotifications}
      onResetAllData={handleResetAllData}
      compactHudMode={compactHudMode}
      onToggleCompactHud={() => setCompactHudMode(!compactHudMode)}
    >
      {activeTab === 'MONITOR' && (
        <TabMonitor
          links={links}
          categories={categories}
          isScanningAll={isScanningAll}
          onScanAll={handleScanAll}
          onScanSingle={(id) => handleScanSingle(id)}
          onSimulateChange={handleSimulateChange}
          onAddLink={handleAddLink}
          onDeleteLink={handleDeleteLink}
          onToggleNotification={handleToggleNotification}
          onUpdateLinkTags={handleUpdateLinkTags}
          onUpdateLinkCategory={handleUpdateLinkCategory}
          onAddCategory={handleAddCategory}
          onRenameCategory={handleRenameCategory}
          onDeleteCategory={handleDeleteCategory}
        />
      )}

      {activeTab === 'SCIENCE' && (
        <TabScience
          onAddScientificLink={handleAddLink}
        />
      )}

      {activeTab === 'GITHUB' && (
        <TabGitHub
          onAddGitHubLink={handleAddLink}
          allLinks={links}
          categories={categories}
          profile={profile}
        />
      )}

      {activeTab === 'WIDGET' && (
        <TabWidget
          links={links}
          onScanAll={handleScanAll}
          isScanning={isScanningAll}
          onEnterCompactHud={() => setCompactHudMode(true)}
        />
      )}

      {activeTab === 'INSTALL' && (
        <TabInstallPWA />
      )}

      {activeTab === 'PROFILE' && (
        <TabProfile
          profile={profile}
          onUpdateProfile={setProfile}
        />
      )}

      {activeTab === 'GUIDE' && (
        <TabGuide
          onGoToMonitor={() => setActiveTab('MONITOR')}
          onGoToScience={() => setActiveTab('SCIENCE')}
          onGoToInstall={() => setActiveTab('INSTALL')}
          onGoToGitHub={() => setActiveTab('GITHUB')}
        />
      )}
    </PipBoyShell>
  );
}
