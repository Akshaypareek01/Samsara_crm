import { CreateCompanyRequest } from '@/services/companyService';

/** Form fields that can fail client-side validation on company registration. */
export type CompanyRegistrationField =
  | 'companyName'
  | 'email'
  | 'domain'
  | 'numberOfEmployees'
  | 'gstNumber'
  | 'companyLogo'
  | 'address'
  | 'city'
  | 'pincode'
  | 'country'
  | 'contact1Name'
  | 'contact1Email'
  | 'contact1Mobile'
  | 'contact1Designation'
  | 'contact2Name'
  | 'contact2Email'
  | 'contact2Mobile'
  | 'contact2Designation'
  | 'agreedToTerms';

/** DOM id to scroll to when a field fails validation. */
export const COMPANY_REGISTRATION_FIELD_IDS: Record<CompanyRegistrationField, string> = {
  companyName: 'company-name',
  email: 'company-email',
  domain: 'company-domain',
  numberOfEmployees: 'company-employees',
  gstNumber: 'company-gst',
  companyLogo: 'company-logo',
  address: 'company-address',
  city: 'company-city',
  pincode: 'company-pincode',
  country: 'company-country',
  contact1Name: 'contact1-name',
  contact1Email: 'contact1-email',
  contact1Mobile: 'contact1-mobile',
  contact1Designation: 'contact1-designation',
  contact2Name: 'contact2-name',
  contact2Email: 'contact2-email',
  contact2Mobile: 'contact2-mobile',
  contact2Designation: 'contact2-designation',
  agreedToTerms: 'company-reg-terms',
};

const FIELD_ORDER: CompanyRegistrationField[] = [
  'companyName',
  'email',
  'domain',
  'numberOfEmployees',
  'gstNumber',
  'companyLogo',
  'address',
  'city',
  'pincode',
  'country',
  'contact1Name',
  'contact1Email',
  'contact1Mobile',
  'contact1Designation',
  'contact2Name',
  'contact2Email',
  'contact2Mobile',
  'contact2Designation',
  'agreedToTerms',
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^[0-9]{10}$/;
const PIN_REGEX = /^[0-9]{6}$/;
const DOMAIN_REGEX = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export interface CompanyRegistrationValidationResult {
  isValid: boolean;
  errors: Partial<Record<CompanyRegistrationField, string>>;
  errorMessages: string[];
  firstError?: string;
  firstField?: CompanyRegistrationField;
}

/**
 * Strip protocol, www prefix and trailing slashes from a domain string.
 *
 * @param raw - User-entered domain value.
 * @returns Normalized hostname in lowercase.
 */
export function normalizeCompanyDomain(raw: string): string {
  let value = (raw || '').trim().toLowerCase();
  value = value.replace(/^https?:\/\//, '');
  value = value.replace(/^www\./, '');
  value = value.split('/')[0] ?? '';
  return value;
}

/**
 * Validate a company domain hostname format.
 *
 * @param raw - User-entered domain value.
 * @returns Error message or undefined when valid.
 */
export function validateCompanyDomain(raw: string): string | undefined {
  const domain = normalizeCompanyDomain(raw);
  if (!domain) {
    return 'Company domain is required';
  }
  if (domain.includes('@')) {
    return 'Enter a domain only (e.g. example.com), not an email address';
  }
  if (!DOMAIN_REGEX.test(domain)) {
    return 'Please enter a valid domain (e.g. example.com)';
  }
  return undefined;
}

/**
 * Validate company registration form values before submit.
 *
 * @param data - Current form state.
 * @param agreedToTerms - Whether the user accepted terms.
 * @returns Field-level errors and the first failing field for scroll/focus.
 */
export function validateCompanyRegistration(
  data: CreateCompanyRequest,
  agreedToTerms: boolean
): CompanyRegistrationValidationResult {
  const errors: Partial<Record<CompanyRegistrationField, string>> = {};

  if (!(data.companyName || '').trim()) {
    errors.companyName = 'Company name is required';
  }

  const email = (data.email || '').trim();
  if (!email) {
    errors.email = 'Company email is required';
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Please enter a valid email address';
  }

  const domainError = validateCompanyDomain(data.domain || '');
  if (domainError) {
    errors.domain = domainError;
  } else if (email && EMAIL_REGEX.test(email)) {
    const emailDomain = email.split('@')[1]?.toLowerCase();
    const companyDomain = normalizeCompanyDomain(data.domain || '');
    if (emailDomain !== companyDomain) {
      errors.email = `Company email must use your domain (@${companyDomain})`;
    }
  }

  const employees = data.numberOfEmployees;
  if (employees === undefined || employees === null || Number.isNaN(employees)) {
    errors.numberOfEmployees = 'Number of employees is required';
  } else if (!Number.isInteger(employees) || employees < 1) {
    errors.numberOfEmployees = 'Enter a valid employee count (minimum 1)';
  }

  const gst = (data.gstNumber || '').trim().toUpperCase();
  if (!gst) {
    errors.gstNumber = 'GST number is required';
  } else if (!GST_REGEX.test(gst)) {
    errors.gstNumber = 'Please enter a valid 15-character GSTIN';
  }

  if (!(data.companyLogo || '').trim()) {
    errors.companyLogo = 'Company logo is required';
  }

  if (!(data.address || '').trim()) {
    errors.address = 'Address is required';
  }

  if (!(data.city || '').trim()) {
    errors.city = 'City is required';
  }

  const pincode = (data.pincode || '').trim();
  if (!pincode) {
    errors.pincode = 'Pincode is required';
  } else if (!PIN_REGEX.test(pincode)) {
    errors.pincode = 'Pincode must be exactly 6 digits';
  }

  if (!(data.country || '').trim()) {
    errors.country = 'Country is required';
  }

  const c1 = data.contactPerson1;
  if (!(c1?.name || '').trim()) {
    errors.contact1Name = 'Primary contact name is required';
  }

  const c1Email = (c1?.email || '').trim();
  if (!c1Email) {
    errors.contact1Email = 'Primary contact email is required';
  } else if (!EMAIL_REGEX.test(c1Email)) {
    errors.contact1Email = 'Please enter a valid email address';
  }

  const c1Mobile = (c1?.mobileNumber || '').replace(/\D/g, '');
  if (!c1Mobile) {
    errors.contact1Mobile = 'Primary contact mobile is required';
  } else if (!MOBILE_REGEX.test(c1Mobile)) {
    errors.contact1Mobile = 'Mobile number must be exactly 10 digits';
  }

  if (!(c1?.designation || '').trim()) {
    errors.contact1Designation = 'Primary contact designation is required';
  }

  const c2 = data.contactPerson2;
  if (!(c2?.name || '').trim()) {
    errors.contact2Name = 'Secondary contact name is required';
  }

  const c2Email = (c2?.email || '').trim();
  if (!c2Email) {
    errors.contact2Email = 'Secondary contact email is required';
  } else if (!EMAIL_REGEX.test(c2Email)) {
    errors.contact2Email = 'Please enter a valid email address';
  }

  const c2Mobile = (c2?.mobileNumber || '').replace(/\D/g, '');
  if (!c2Mobile) {
    errors.contact2Mobile = 'Secondary contact mobile is required';
  } else if (!MOBILE_REGEX.test(c2Mobile)) {
    errors.contact2Mobile = 'Mobile number must be exactly 10 digits';
  }

  if (!(c2?.designation || '').trim()) {
    errors.contact2Designation = 'Secondary contact designation is required';
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
export function mapBackendErrorToCompanyField(message: string): CompanyRegistrationField | undefined {
  const lower = message.toLowerCase();
  if (lower.includes('terms')) return 'agreedToTerms';
  if (lower.includes('company logo')) return 'companyLogo';
  if (lower.includes('company name')) return 'companyName';
  if (lower.includes('gst')) return 'gstNumber';
  if (lower.includes('number of employees') || lower.includes('employees')) return 'numberOfEmployees';
  if (lower.includes('pincode') || lower.includes('pin code')) return 'pincode';
  if (lower.includes('secondary contact') && lower.includes('mobile')) return 'contact2Mobile';
  if (lower.includes('secondary contact') && lower.includes('email')) return 'contact2Email';
  if (lower.includes('secondary contact') && lower.includes('designation')) return 'contact2Designation';
  if (lower.includes('secondary contact') && lower.includes('name')) return 'contact2Name';
  if (lower.includes('primary contact') && lower.includes('mobile')) return 'contact1Mobile';
  if (lower.includes('primary contact') && lower.includes('email')) return 'contact1Email';
  if (lower.includes('primary contact') && lower.includes('designation')) return 'contact1Designation';
  if (lower.includes('primary contact') && lower.includes('name')) return 'contact1Name';
  if (lower.includes('contact person') && lower.includes('mobile')) return 'contact1Mobile';
  if (lower.includes('contact person') && lower.includes('email')) return 'contact1Email';
  if (lower.includes('contact person') && lower.includes('designation')) return 'contact1Designation';
  if (lower.includes('contact person') && lower.includes('name')) return 'contact1Name';
  if (lower.includes('domain')) return 'domain';
  if (lower.includes('address')) return 'address';
  if (lower.includes('country')) return 'country';
  if (lower.includes('city')) return 'city';
  if (lower.includes('email')) return 'email';
  return undefined;
}
