/** Backend-aligned class category options. */
export const CLASS_CATEGORY_OPTIONS = [
  { label: 'Yoga Class', value: 'yoga class' },
  { label: 'Meditation Class', value: 'meditation class' },
  { label: 'PCOS/PCOD Class', value: 'pcos/pcod class' },
  { label: 'Thyroid Class', value: 'thyroid class' },
] as const;

/** Backend-aligned difficulty levels. */
export const CLASS_LEVEL_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'] as const;

/** Short day codes accepted by Class.schedules.days enum. */
export const CLASS_DAY_OPTIONS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export type ClassLevel = (typeof CLASS_LEVEL_OPTIONS)[number];
export type ClassDay = (typeof CLASS_DAY_OPTIONS)[number];
export type ClassCategory = (typeof CLASS_CATEGORY_OPTIONS)[number]['value'];
