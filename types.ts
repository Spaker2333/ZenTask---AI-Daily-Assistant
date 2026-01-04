export type Language = 'en' | 'zh';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  priority: Priority;
  tags: string[];
}

export enum Priority {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low'
}

export enum ThemeId {
  Midnight = 'midnight',
  Sunrise = 'sunrise',
  Forest = 'forest',
  Ocean = 'ocean',
  Berry = 'berry'
}

export interface Theme {
  id: ThemeId;
  name: string;
  colors: {
    bg: string;
    surface: string;
    primary: string;
    secondary: string;
    text: string;
    textMuted: string;
    accent: string;
    priorityHigh: string;
    priorityMed: string;
    priorityLow: string;
  };
}

export enum Tab {
  Focus = 'Focus',
  Tasks = 'Tasks',
  Wellness = 'Wellness',
  Summary = 'Summary',
  Stats = 'Stats'
}

export interface ReminderSettings {
  waterIntervalMinutes: number;
  stretchIntervalMinutes: number;
  enabled: boolean;
  notificationMode: 'sound' | 'visual' | 'both';
  soundType: 'beep' | 'chime' | 'pulse';
}

export interface FocusSession {
  durationMinutes: number;
  timeLeft: number;
  isActive: boolean;
  isPaused: boolean;
  mode: 'focus' | 'break';
}

export interface UserStats {
  totalTasksCompleted: number;
  totalFocusMinutes: number;
  unlockedAchievements: string[];
}

export interface Achievement {
  id: string;
  title: { en: string; zh: string };
  description: { en: string; zh: string };
  icon: string;
  condition: (stats: UserStats) => boolean;
}
