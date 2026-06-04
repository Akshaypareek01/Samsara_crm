/** Cities where Samsara trainers operate (fixed order for filters and forms). */
export const TRAINER_CITY_OPTIONS = [
  'Bangalore',
  'Chennai',
  'Delhi',
  'Gurgaon',
  'Hyderabad',
  'Mumbai',
  'Navi Mumbai',
  'Noida',
  'Pune',
] as const;

export type TrainerCity = (typeof TRAINER_CITY_OPTIONS)[number];
