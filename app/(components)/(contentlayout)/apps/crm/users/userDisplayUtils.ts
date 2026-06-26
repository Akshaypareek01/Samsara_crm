import { User } from '@/services/userService';

type CompanyRef = {
  _id?: string;
  companyName?: string;
  companyId?: string;
};

/**
 * Resolve linked company name from a user record (populated or string ref).
 *
 * @param user - User record from the API.
 */
export function getUserCompanyName(user: User): string {
  const ref = user.company_name as string | CompanyRef | undefined;
  if (!ref) {
    return '—';
  }
  if (typeof ref === 'object') {
    return ref.companyName || '—';
  }
  return ref;
}

/**
 * Resolve company ID string shown for corporate users.
 *
 * @param user - User record from the API.
 */
export function getUserCompanyIdDisplay(user: User): string {
  if (user.companyId) {
    return user.companyId;
  }
  const ref = user.company_name as CompanyRef | undefined;
  if (ref && typeof ref === 'object' && ref.companyId) {
    return ref.companyId;
  }
  return '—';
}
