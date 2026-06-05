import { TRAINER_CATEGORY_OPTIONS } from '@/constants/trainerCategories';

/** Display labels for dashboard category rows (maps API category values). */
export const HOME_TRAINER_CATEGORY_LABELS: Record<
  (typeof TRAINER_CATEGORY_OPTIONS)[number],
  string
> = {
  'Yoga Trainer': 'Yoga Teachers',
  'Sound Healer': 'Sound Healers',
  Psychologist: 'Psychologist',
  'EAP Trainer': 'EAP Trainers',
};

export type HomeTrainerCategory = (typeof TRAINER_CATEGORY_OPTIONS)[number];

export const HOME_TRAINER_CATEGORIES: {
  category: HomeTrainerCategory;
  title: string;
}[] = TRAINER_CATEGORY_OPTIONS.filter((category) => category !== 'EAP Trainer').map(
  (category) => ({
    category,
    title: HOME_TRAINER_CATEGORY_LABELS[category],
  })
);
