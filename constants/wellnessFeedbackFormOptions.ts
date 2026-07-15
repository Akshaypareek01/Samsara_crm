/**
 * City options for the public wellness feedback form.
 */
export const WELLNESS_FEEDBACK_CITY_OPTIONS = [
  'Bengaluru',
  'Mumbai',
  'Delhi NCR',
  'Hyderabad',
  'Chennai',
  'Pune',
  'Other',
] as const;

/**
 * Session attended checkbox values (reference form).
 */
export const WELLNESS_FEEDBACK_SESSION_OPTIONS = [
  'Yoga',
  'Sound Healing',
  'Psychology',
  "Women's Health",
  'Zumba',
] as const;

/**
 * Enjoyed activities options.
 */
export const WELLNESS_FEEDBACK_ENJOYED_OPTIONS = [
  'Yoga',
  'Sound Healing',
  'Psychology',
  "Women's Health",
  'Zumba',
] as const;

/**
 * Preferred future topics options.
 */
export const WELLNESS_FEEDBACK_TOPIC_OPTIONS = [
  'Stress Management',
  'Chair Yoga',
  'Breathwork & Meditation',
  'Sleep & Recovery',
  'Mental Wellbeing',
  "Women's Wellness",
  'Work-Life Balance',
  'Emotional Wellbeing',
  'Ayurveda – Diet & Nutrition',
] as const;

export const WELLNESS_SATISFACTION_OPTIONS = [
  'Excellent',
  'Good',
  'Average',
  'Needs Improvement',
] as const;

export const WELLNESS_STRESS_RELIEF_OPTIONS = [
  'Yes, significantly',
  'Somewhat',
  'Neutral',
  'Not really',
] as const;

export const WELLNESS_WANT_MORE_OPTIONS = ['Yes', 'Maybe', 'No'] as const;

export const TRAINER_RATING_CRITERIA = [
  { key: 'knowledge', label: 'Knowledge & Expertise' },
  { key: 'communication', label: 'Communication Skills' },
  { key: 'engagement', label: 'Audience Engagement' },
  { key: 'energy', label: 'Session Energy & Delivery' },
  { key: 'usefulness', label: 'Practical Usefulness' },
] as const;

export type TrainerRatingKey = (typeof TRAINER_RATING_CRITERIA)[number]['key'];
