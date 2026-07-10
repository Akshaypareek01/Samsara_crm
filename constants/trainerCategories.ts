/** Wellness practice categories for corporate Trainer profiles */
export const TRAINER_CATEGORY_OPTIONS = [
  'Yoga Trainer',
  'Zumba Trainer',
  'Sound Healer',
  'Psychologist',
  'Ayurveda Doctor',
  'EAP Trainer',
] as const;

export type TrainerCategory = (typeof TRAINER_CATEGORY_OPTIONS)[number];

/** Categories for Teacher (user role) profiles */
export const TEACHER_CATEGORY_OPTIONS = [
  'Fitness Coach',
  'Ayurveda Specialist',
  'Mental Health Specialist',
  'Yoga Trainer',
  'Sound Healing',
  'Psychologist',
  'General Trainer',
] as const;

export type TeacherCategory = (typeof TEACHER_CATEGORY_OPTIONS)[number];
