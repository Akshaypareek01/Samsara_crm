/** Supported countries for company registration and settings. */
export const COMPANY_COUNTRY_OPTIONS = ['India'] as const;

export type CompanyCountry = (typeof COMPANY_COUNTRY_OPTIONS)[number];
