/**
 * Pip-Boy Student Edition Type Definitions
 * Professional Student Workstation (No game elements)
 */

export interface CustomCategory {
  id: string;
  name: string;
  icon?: string;
  isDefault?: boolean;
}

export type LinkCategory = string;

export type LinkStatus = 'ONLINE' | 'CHANGED' | 'SYNCING' | 'ALERT' | 'ERROR';

export interface DiffEntry {
  id: string;
  timestamp: number;
  summary: string;
  diffSnippet: string;
  isRead: boolean;
}

export interface SiteTelemetry {
  latencyMs: number;
  latencyHistory: { timestamp: number; ping: number }[];
  uptimePercent: number;
  httpStatus: number;
  protocol: string;
  sslValid: boolean;
  sslIssuer: string;
  serverType: string;
  pageSizeKb: number;
  contentBreakdown: {
    html: number; // in KB or %
    scripts: number;
    media: number;
    text: number;
  };
  metaTitle: string;
  metaDescription: string;
  detectedSections: string[];
  wordCount: number;
  lastDnsLookupMs: number;
}

export interface MonitoredLink {
  id: string;
  title: string;
  url: string;
  category: string;
  tags: string[];
  checkIntervalSec: number;
  lastChecked: number;
  lastUpdated: number;
  status: LinkStatus;
  currentHash: string;
  contentSnippet: string;
  diffHistory: DiffEntry[];
  autoRefresh: boolean;
  notificationEnabled: boolean;
  telemetry?: SiteTelemetry;
  isScientific?: boolean;
  scientificMeta?: {
    query?: string;
    source?: string;
    paperCount?: number;
    latestTitle?: string;
    author?: string;
    discipline?: string;
    journal?: string;
  };
}

export interface SiteQAMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
  siteIds?: string[];
  siteTitles?: string[];
}

export interface StudentProfile {
  fullName: string;
  studentId: string;
  university: string;
  faculty: string;
  group: string;
  course: number;
  email: string;
  notes: string;
}

export interface PipBoyNotification {
  id: string;
  timestamp: number;
  title: string;
  message: string;
  type: 'INFO' | 'ALERT' | 'UPDATE' | 'SCIENCE';
  linkId?: string;
  read: boolean;
  sourceUrl?: string;
}

export type ThemeColor = 'green' | 'amber' | 'cyan' | 'lilac';

export interface PipBoySettings {
  colorTheme: ThemeColor;
  audioEnabled: boolean;
  scanlines: boolean;
  crtFlicker: boolean;
  autoCheckGlobal: boolean;
  globalInterval: number; // in seconds
  pushNotificationsAllowed: boolean;
}
