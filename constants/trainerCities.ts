/** Cities where Samsara trainers operate (fixed order for filters and forms). */
export const TRAINER_CITY_OPTIONS = [
  'Ahmedabad',
  'Bangalore',
  'Chennai',
  'Cochin',
  'Delhi',
  'Goa',
  'Gurgaon',
  'Hyderabad',
  'Indore',
  'Jaipur',
  'Kolkata',
  'Mumbai',
  'Navi Mumbai',
  'Noida',
  'Pune',
] as const;

export type TrainerCity = (typeof TRAINER_CITY_OPTIONS)[number];
