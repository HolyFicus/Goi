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
  isScientific?: boolean;
  scientificMeta?: {
    query?: string;
    source?: 'pubmed' | 'europepmc' | 'alphafold' | 'uniprot';
    paperCount?: number;
    latestTitle?: string;
    pmid?: string;
    journal?: string;
  };
  isGitHub?: boolean;
  githubMeta?: {
    owner: string;
    repo: string;
    lastCommitSha?: string;
    lastCommitMessage?: string;
    lastCommitDate?: string;
    latestReleaseTag?: string;
    stars?: number;
    openIssues?: number;
    defaultBranch?: string;
  };
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

export type ThemeColor = 'green' | 'amber' | 'cyan';

export interface PipBoySettings {
  colorTheme: ThemeColor;
  audioEnabled: boolean;
  scanlines: boolean;
  crtFlicker: boolean;
  autoCheckGlobal: boolean;
  globalInterval: number; // in seconds
  pushNotificationsAllowed: boolean;
}
