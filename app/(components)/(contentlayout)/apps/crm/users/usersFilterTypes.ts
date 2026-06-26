/** Category tab for admin users list. */
export type UserCategoryTab = 'all' | 'Personal' | 'Corporate';

/** Filter fields for the admin users list. */
export type UsersListFilters = {
  search: string;
  companyId: string;
  companyName: string;
  corporateId: string;
  mobile: string;
  city: string;
  status: '' | 'true' | 'false';
};

/**
 * Default empty filter state for the users list.
 */
export function emptyUsersListFilters(): UsersListFilters {
  return {
    search: '',
    companyId: '',
    companyName: '',
    corporateId: '',
    mobile: '',
    city: '',
    status: '',
  };
}

/**
 * Returns true when any filter field has a value.
 *
 * @param filters - Current filter state.
 */
export function hasActiveUsersFilters(filters: UsersListFilters): boolean {
  return Object.values(filters).some((value) => value !== '');
}
