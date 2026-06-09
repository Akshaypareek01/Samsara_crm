import type { EapTraining } from '@/services/eapTrainingService';
import {
  formatEapDurationLabel,
  getSyllabusEntryDescription,
  normalizeEapDurationHours,
} from '@/shared/utils/eapTrainingUtils';

/** Visual theme for an EAP training browse card icon. */
export type EapTrainingIconTheme = {
  icon: string;
  bg: string;
  color: string;
};

const TRAINING_ICON_THEMES: { keywords: string[]; theme: EapTrainingIconTheme }[] = [
  { keywords: ['stress', 'workplace'], theme: { icon: 'ri-mental-health-line', bg: '#dbeafe', color: '#2563eb' } },
  { keywords: ['mental', 'health', 'awareness'], theme: { icon: 'ri-heart-pulse-line', bg: '#dcfce7', color: '#16a34a' } },
  { keywords: ['work', 'life', 'balance'], theme: { icon: 'ri-scales-3-line', bg: '#ffedd5', color: '#ea580c' } },
  { keywords: ['emotional', 'intelligence'], theme: { icon: 'ri-team-line', bg: '#ede9fe', color: '#7c3aed' } },
  { keywords: ['resilience', 'resilient'], theme: { icon: 'ri-mountain-line', bg: '#fce7f3', color: '#db2777' } },
];

const FALLBACK_THEMES: EapTrainingIconTheme[] = [
  { icon: 'ri-graduation-cap-line', bg: '#dbeafe', color: '#2563eb' },
  { icon: 'ri-presentation-line', bg: '#dcfce7', color: '#16a34a' },
  { icon: 'ri-lightbulb-line', bg: '#ffedd5', color: '#ea580c' },
  { icon: 'ri-group-line', bg: '#ede9fe', color: '#7c3aed' },
  { icon: 'ri-shield-check-line', bg: '#fce7f3', color: '#db2777' },
];

/**
 * Pick icon colors for a training title (keyword match, then stable hash fallback).
 *
 * @param title - Training program title.
 */
export function getEapTrainingIconTheme(title: string): EapTrainingIconTheme {
  const lower = title.toLowerCase();
  for (const entry of TRAINING_ICON_THEMES) {
    if (entry.keywords.some((word) => lower.includes(word))) {
      return entry.theme;
    }
  }
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = (hash + title.charCodeAt(i) * (i + 1)) % FALLBACK_THEMES.length;
  }
  return FALLBACK_THEMES[hash] ?? FALLBACK_THEMES[0];
}

/**
 * Short description for browse cards from syllabus or duration options.
 *
 * @param training - EAP training record.
 */
export function getEapTrainingDescription(training: EapTraining): string {
  const firstEntry = training.syllabus?.[0];
  const firstText = getSyllabusEntryDescription(firstEntry);
  if (firstText) {
    const line = firstText.split('\n').find((l) => l.trim()) ?? firstText;
    const text = line.trim();
    return text.length > 110 ? `${text.slice(0, 107)}…` : text;
  }
  const labels = (training.durationOptions ?? [])
    .map((hours) => formatEapDurationLabel(normalizeEapDurationHours(hours)))
    .join(', ');
  return labels
    ? `Structured EAP program with ${labels} session options for your team.`
    : 'Structured EAP program designed for workplace wellness.';
}

/**
 * Format trainer experience for showcase cards.
 *
 * @param experience - Raw experience enum value from trainer profile.
 */
export function formatTrainerExperienceLabel(experience?: string): string {
  if (!experience) return 'Experienced professional';
  if (experience.startsWith('Above')) return '15+ Years Experience';
  const match = experience.match(/^(\d+)/);
  if (match) return `${match[1]}+ Years Experience`;
  return experience;
}
