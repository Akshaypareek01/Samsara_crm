import {
  CreateTrainerRequest,
  EXPERIENCE_OPTIONS,
  SPECIALIST_OPTIONS,
  TRAINER_CATEGORY_OPTIONS,
  TYPE_OF_TRAINING_OPTIONS,
} from '@/services/trainerService';
import { validateTrainerDateOfBirth } from '@/shared/utils/trainerDateUtils';

/** Form fields that can fail client-side validation on registration. */
export type TrainerRegistrationField =
  | 'category'
  | 'name'
  | 'title'
  | 'dateOfBirth'
  | 'mobile'
  | 'email'
  | 'city'
  | 'pinCode'
  | 'experience'
  | 'bio'
  | 'specialistIn'
  | 'typeOfTraining'
  | 'agreedToTerms';

/** DOM id to scroll to when a field fails validation. */
export const TRAINER_REGISTRATION_FIELD_IDS: Record<TrainerRegistrationField, string> = {
  category: 'trainer-category',
  name: 'reg-name',
  title: 'reg-title',
  dateOfBirth: 'trainer-dob',
  mobile: 'reg-mobile',
  email: 'reg-email',
  city: 'trainer-city',
  pinCode: 'trainer-pincode',
  experience: 'trainer-experience',
  bio: 'reg-bio',
  specialistIn: 'reg-specialist-in',
  typeOfTraining: 'reg-type-of-training',
  agreedToTerms: 'reg-terms',
};

/** Validation order matches the registration form layout. */
const FIELD_ORDER: TrainerRegistrationField[] = [
  'category',
  'name',
  'title',
  'dateOfBirth',
  'mobile',
  'email',
  'city',
  'pinCode',
  'experience',
  'bio',
  'specialistIn',
  'typeOfTraining',
  'agreedToTerms',
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^[0-9]{10}$/;
const PIN_REGEX = /^[0-9]{6}$/;

export interface TrainerRegistrationValidationResult {
  isValid: boolean;
  errors: Partial<Record<TrainerRegistrationField, string>>;
  errorMessages: string[];
  firstError?: string;
  firstField?: TrainerRegistrationField;
}

/**
 * Validate trainer registration form values before submit.
 *
 * @param data - Current form state.
 * @param agreedToTerms - Whether the user accepted terms.
 * @returns Field-level errors and the first failing field for scroll/focus.
 */
export function validateTrainerRegistration(
  data: CreateTrainerRequest,
  agreedToTerms: boolean
): TrainerRegistrationValidationResult {
  const errors: Partial<Record<TrainerRegistrationField, string>> = {};

  const category = (data.category || '').trim();
  if (!category) {
    errors.category = 'Trainer category is required';
  } else if (!TRAINER_CATEGORY_OPTIONS.includes(category as (typeof TRAINER_CATEGORY_OPTIONS)[number])) {
    errors.category = 'Please select a valid trainer category';
  }

  if (!(data.name || '').trim()) {
    errors.name = 'Full name is required';
  }

  if (!(data.title || '').trim()) {
    errors.title = 'Professional title is required';
  }

  const dobError = validateTrainerDateOfBirth(data.dateOfBirth);
  if (dobError) {
    errors.dateOfBirth = dobError;
  }

  const mobileDigits = (data.mobile || '').replace(/\D/g, '');
  if (!mobileDigits) {
    errors.mobile = 'Mobile number is required';
  } else if (!MOBILE_REGEX.test(mobileDigits)) {
    errors.mobile = 'Mobile number must be exactly 10 digits';
  }

  const email = (data.email || '').trim();
  if (!email) {
    errors.email = 'Email is required';
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!(data.city || '').trim()) {
    errors.city = 'City is required';
  }

  const pin = (data.pinCode || '').trim();
  if (!pin) {
    errors.pinCode = 'PIN code is required';
  } else if (!PIN_REGEX.test(pin)) {
    errors.pinCode = 'PIN code must be exactly 6 digits';
  }

  const experience = (data.experience || '').trim();
  if (!experience) {
    errors.experience = 'Years of experience is required';
  } else if (!EXPERIENCE_OPTIONS.includes(experience)) {
    errors.experience = 'Please select a valid experience range';
  }

  const bio = (data.bio || '').trim();
  if (!bio) {
    errors.bio = 'About you (bio) is required';
  } else if (bio.length > 2000) {
    errors.bio = 'Bio must be 2000 characters or less';
  }

  const specialistIn = Array.isArray(data.specialistIn)
    ? data.specialistIn.filter(Boolean)
    : [data.specialistIn].filter(Boolean);
  if (specialistIn.length === 0) {
    errors.specialistIn = 'Select at least one Training For option';
  } else if (specialistIn.some((item) => !SPECIALIST_OPTIONS.includes(item))) {
    errors.specialistIn = 'One or more Training For options are invalid';
  }

  const typeOfTraining = Array.isArray(data.typeOfTraining)
    ? data.typeOfTraining.filter(Boolean)
    : [data.typeOfTraining].filter(Boolean);
  if (typeOfTraining.length === 0) {
    errors.typeOfTraining = 'Select at least one specialization';
  } else if (typeOfTraining.some((item) => !TYPE_OF_TRAINING_OPTIONS.includes(item))) {
    errors.typeOfTraining = 'One or more specializations are invalid';
  }

  if (!agreedToTerms) {
    errors.agreedToTerms = 'Please accept the Terms & Conditions to continue';
  }

  const errorMessages = FIELD_ORDER.filter((field) => errors[field]).map(
    (field) => errors[field] as string
  );
  const firstField = FIELD_ORDER.find((field) => errors[field]);

  return {
    isValid: errorMessages.length === 0,
    errors,
    errorMessages,
    firstError: firstField ? errors[firstField] : undefined,
    firstField,
  };
}

/**
 * Map a backend validation message to a form field when possible.
 *
 * @param message - Server error text (often comma-separated Joi messages).
 * @returns Matching field key or undefined.
 */
export function mapBackendErrorToField(message: string): TrainerRegistrationField | undefined {
  const lower = message.toLowerCase();
  if (lower.includes('email')) return 'email';
  if (lower.includes('mobile')) return 'mobile';
  if (lower.includes('category') || lower.includes('trainer type')) return 'category';
  if (lower.includes('name') && !lower.includes('user name')) return 'name';
  if (lower.includes('title')) return 'title';
  if (lower.includes('date of birth') || lower.includes('dateofbirth')) return 'dateOfBirth';
  if (lower.includes('city')) return 'city';
  if (lower.includes('pin')) return 'pinCode';
  if (lower.includes('experience')) return 'experience';
  if (lower.includes('bio')) return 'bio';
  if (lower.includes('specialist') || lower.includes('training for')) return 'specialistIn';
  if (lower.includes('type of training') || lower.includes('specialization')) return 'typeOfTraining';
  return undefined;
}
