import ApiService from './ApiService';

export interface PlatformBankDetails {
  accountHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
}

export interface PlatformAccountDocument {
  id?: string;
  _id?: string;
  title?: string;
  documentNumber?: string;
  fileUrl: string;
  fileName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlatformAccountDetails {
  id?: string;
  bankDetails?: PlatformBankDetails;
  documents?: PlatformAccountDocument[];
  updatedAt?: string;
}

export interface UpdatePlatformAccountDetailsRequest {
  bankDetails?: PlatformBankDetails;
  documents?: Array<{
    title?: string;
    documentNumber?: string;
    fileUrl: string;
    fileName?: string;
  }>;
}

/**
 * Fetch platform account details (bank + documents).
 */
export async function getPlatformAccountDetails(): Promise<PlatformAccountDetails> {
  return ApiService.get('/account-details');
}

/**
 * Update platform account details (admin only).
 *
 * @param body - Bank details and/or documents list.
 */
export async function updatePlatformAccountDetails(
  body: UpdatePlatformAccountDetailsRequest
): Promise<PlatformAccountDetails> {
  return ApiService.put('/account-details', body);
}
