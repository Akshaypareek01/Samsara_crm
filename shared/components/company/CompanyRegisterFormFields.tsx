"use client";
import React, { RefObject } from 'react';
import { CreateCompanyRequest, ContactPerson } from '@/services/companyService';
import TrainerFormSectionTitle from '@/shared/components/trainer/TrainerFormSectionTitle';
import TrainerFormFieldError from '@/shared/components/trainer/TrainerFormFieldError';
import CompanyLogoUpload from '@/shared/components/company/CompanyLogoUpload';
import { CompanyRegistrationField } from '@/shared/utils/companyRegistrationValidation';
import '@/shared/styles/trainer-form.css';

interface CompanyRegisterFormFieldsProps {
  formData: CreateCompanyRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateCompanyRequest>>;
  updateContactPerson: (personNumber: 1 | 2, field: keyof ContactPerson, value: string) => void;
  logoInputRef: RefObject<HTMLInputElement | null>;
  uploadingLogo: boolean;
  onLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearLogo: () => void;
  fieldErrors: Partial<Record<CompanyRegistrationField, string>>;
  fieldClass: (field: CompanyRegistrationField, extra?: string) => string;
  clearFieldError: (field: CompanyRegistrationField) => void;
}

/**
 * Company registration form fields with trainer-form styling and inline validation.
 *
 * @param props - Form state, handlers and field error helpers.
 * @returns Styled registration form sections.
 */
const CompanyRegisterFormFields: React.FC<CompanyRegisterFormFieldsProps> = ({
  formData,
  setFormData,
  updateContactPerson,
  logoInputRef,
  uploadingLogo,
  onLogoChange,
  onClearLogo,
  fieldErrors,
  fieldClass,
  clearFieldError,
}) => {
  /**
   * Restrict mobile input to digits with a max length of 10.
   *
   * @param raw - Raw input value.
   * @returns Sanitized mobile digits.
   */
  const sanitizeMobile = (raw: string) => raw.replace(/\D/g, '').slice(0, 10);

  /**
   * Restrict pincode input to 6 digits.
   *
   * @param raw - Raw input value.
   * @returns Sanitized pincode digits.
   */
  const sanitizePincode = (raw: string) => raw.replace(/\D/g, '').slice(0, 6);

  /**
   * Normalize domain input as the user types (lowercase, no protocol).
   *
   * @param raw - Raw domain input.
   * @returns Sanitized domain string.
   */
  const sanitizeDomain = (raw: string) =>
    raw.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0] ?? '';

  return (
    <div className="space-y-2">
      <section>
        <TrainerFormSectionTitle title="Company Information" iconClass="ri-building-line" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="trainer-form-label" htmlFor="company-name">
              Company Name <span className="trainer-form-req">*</span>
            </label>
            <input
              id="company-name"
              type="text"
              className={fieldClass('companyName')}
              value={formData.companyName}
              onChange={(e) => {
                clearFieldError('companyName');
                setFormData({ ...formData, companyName: e.target.value });
              }}
              placeholder="Your company name"
              aria-invalid={Boolean(fieldErrors.companyName)}
              aria-describedby={fieldErrors.companyName ? 'company-name-error' : undefined}
            />
            <TrainerFormFieldError message={fieldErrors.companyName} fieldId="company-name" />
          </div>
          <div>
            <label className="trainer-form-label" htmlFor="company-email">
              Email <span className="trainer-form-req">*</span>
            </label>
            <input
              id="company-email"
              type="email"
              className={fieldClass('email')}
              value={formData.email}
              onChange={(e) => {
                clearFieldError('email');
                setFormData({ ...formData, email: e.target.value });
              }}
              placeholder="company@email.com"
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'company-email-error' : undefined}
            />
            <TrainerFormFieldError message={fieldErrors.email} fieldId="company-email" />
          </div>
          <div>
            <label className="trainer-form-label" htmlFor="company-domain">
              Domain <span className="trainer-form-req">*</span>
            </label>
            <input
              id="company-domain"
              type="text"
              className={fieldClass('domain')}
              value={formData.domain}
              onChange={(e) => {
                clearFieldError('domain');
                clearFieldError('email');
                setFormData({ ...formData, domain: sanitizeDomain(e.target.value) });
              }}
              placeholder="example.com"
              aria-invalid={Boolean(fieldErrors.domain)}
              aria-describedby={fieldErrors.domain ? 'company-domain-error' : undefined}
            />
            <TrainerFormFieldError message={fieldErrors.domain} fieldId="company-domain" />
          </div>
          <div>
            <label className="trainer-form-label" htmlFor="company-employees">
              Number of Employees <span className="trainer-form-req">*</span>
            </label>
            <input
              id="company-employees"
              type="number"
              className={fieldClass('numberOfEmployees')}
              value={formData.numberOfEmployees || ''}
              onChange={(e) => {
                clearFieldError('numberOfEmployees');
                setFormData({
                  ...formData,
                  numberOfEmployees: e.target.value ? parseInt(e.target.value, 10) : undefined,
                });
              }}
              min={1}
              placeholder="e.g. 50"
              aria-invalid={Boolean(fieldErrors.numberOfEmployees)}
              aria-describedby={fieldErrors.numberOfEmployees ? 'company-employees-error' : undefined}
            />
            <TrainerFormFieldError message={fieldErrors.numberOfEmployees} fieldId="company-employees" />
          </div>
          <div className="sm:col-span-2">
            <label className="trainer-form-label" htmlFor="company-gst">
              GST Number <span className="trainer-form-req">*</span>
            </label>
            <input
              id="company-gst"
              type="text"
              className={fieldClass('gstNumber')}
              value={formData.gstNumber}
              onChange={(e) => {
                clearFieldError('gstNumber');
                setFormData({ ...formData, gstNumber: e.target.value.toUpperCase().slice(0, 15) });
              }}
              placeholder="15-character GSTIN"
              maxLength={15}
              aria-invalid={Boolean(fieldErrors.gstNumber)}
              aria-describedby={fieldErrors.gstNumber ? 'company-gst-error' : undefined}
            />
            <TrainerFormFieldError message={fieldErrors.gstNumber} fieldId="company-gst" />
          </div>
          <div className="sm:col-span-2">
            <label className="trainer-form-label" htmlFor="company-pan">
              PAN Number <span className="trainer-form-req">*</span>
            </label>
            <input
              id="company-pan"
              type="text"
              className={fieldClass('panNumber')}
              value={formData.panNumber}
              onChange={(e) => {
                clearFieldError('panNumber');
                setFormData({
                  ...formData,
                  panNumber: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10),
                });
              }}
              placeholder="e.g. ABCDE1234F"
              maxLength={10}
              aria-invalid={Boolean(fieldErrors.panNumber)}
              aria-describedby={fieldErrors.panNumber ? 'company-pan-error' : undefined}
            />
            <TrainerFormFieldError message={fieldErrors.panNumber} fieldId="company-pan" />
          </div>
          <div className="sm:col-span-2" id="company-logo">
            <label className="trainer-form-label">
              Company Logo <span className="trainer-form-req">*</span>
            </label>
            <CompanyLogoUpload
              logoUrl={formData.companyLogo ?? ''}
              logoInputRef={logoInputRef}
              uploadingLogo={uploadingLogo}
              onLogoChange={onLogoChange}
              onClearLogo={onClearLogo}
              hasError={Boolean(fieldErrors.companyLogo)}
            />
            <TrainerFormFieldError message={fieldErrors.companyLogo} fieldId="company-logo" />
          </div>
        </div>
      </section>

      <section>
        <TrainerFormSectionTitle title="Address Information" iconClass="ri-map-pin-line" />
        <div className="trainer-form-sub-card">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="trainer-form-label" htmlFor="company-address">
                Address <span className="trainer-form-req">*</span>
              </label>
              <input
                id="company-address"
                type="text"
                className={fieldClass('address')}
                value={formData.address}
                onChange={(e) => {
                  clearFieldError('address');
                  setFormData({ ...formData, address: e.target.value });
                }}
                placeholder="Street address"
                aria-invalid={Boolean(fieldErrors.address)}
                aria-describedby={fieldErrors.address ? 'company-address-error' : undefined}
              />
              <TrainerFormFieldError message={fieldErrors.address} fieldId="company-address" />
            </div>
            <div>
              <label className="trainer-form-label" htmlFor="company-city">
                City <span className="trainer-form-req">*</span>
              </label>
              <input
                id="company-city"
                type="text"
                className={fieldClass('city')}
                value={formData.city}
                onChange={(e) => {
                  clearFieldError('city');
                  setFormData({ ...formData, city: e.target.value });
                }}
                placeholder="Your city"
                aria-invalid={Boolean(fieldErrors.city)}
                aria-describedby={fieldErrors.city ? 'company-city-error' : undefined}
              />
              <TrainerFormFieldError message={fieldErrors.city} fieldId="company-city" />
            </div>
            <div>
              <label className="trainer-form-label" htmlFor="company-pincode">
                Pincode <span className="trainer-form-req">*</span>
              </label>
              <input
                id="company-pincode"
                type="text"
                inputMode="numeric"
                className={fieldClass('pincode')}
                value={formData.pincode}
                onChange={(e) => {
                  clearFieldError('pincode');
                  setFormData({ ...formData, pincode: sanitizePincode(e.target.value) });
                }}
                placeholder="6-digit PIN"
                maxLength={6}
                aria-invalid={Boolean(fieldErrors.pincode)}
                aria-describedby={fieldErrors.pincode ? 'company-pincode-error' : undefined}
              />
              <TrainerFormFieldError message={fieldErrors.pincode} fieldId="company-pincode" />
            </div>
            <div className="sm:col-span-2">
              <label className="trainer-form-label" htmlFor="company-country">
                Country <span className="trainer-form-req">*</span>
              </label>
              <input
                id="company-country"
                type="text"
                className={fieldClass('country')}
                value={formData.country}
                onChange={(e) => {
                  clearFieldError('country');
                  setFormData({ ...formData, country: e.target.value });
                }}
                placeholder="Country"
                aria-invalid={Boolean(fieldErrors.country)}
                aria-describedby={fieldErrors.country ? 'company-country-error' : undefined}
              />
              <TrainerFormFieldError message={fieldErrors.country} fieldId="company-country" />
            </div>
          </div>
        </div>
      </section>

      <section>
        <TrainerFormSectionTitle title="Primary Contact Person" iconClass="ri-user-line" />
        <div className="trainer-form-sub-card">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="trainer-form-label" htmlFor="contact1-name">
                Name <span className="trainer-form-req">*</span>
              </label>
              <input
                id="contact1-name"
                type="text"
                className={fieldClass('contact1Name')}
                value={formData.contactPerson1?.name || ''}
                onChange={(e) => {
                  clearFieldError('contact1Name');
                  updateContactPerson(1, 'name', e.target.value);
                }}
                aria-invalid={Boolean(fieldErrors.contact1Name)}
                aria-describedby={fieldErrors.contact1Name ? 'contact1-name-error' : undefined}
              />
              <TrainerFormFieldError message={fieldErrors.contact1Name} fieldId="contact1-name" />
            </div>
            <div>
              <label className="trainer-form-label" htmlFor="contact1-email">
                Email <span className="trainer-form-req">*</span>
              </label>
              <input
                id="contact1-email"
                type="email"
                className={fieldClass('contact1Email')}
                value={formData.contactPerson1?.email || ''}
                onChange={(e) => {
                  clearFieldError('contact1Email');
                  updateContactPerson(1, 'email', e.target.value);
                }}
                aria-invalid={Boolean(fieldErrors.contact1Email)}
                aria-describedby={fieldErrors.contact1Email ? 'contact1-email-error' : undefined}
              />
              <TrainerFormFieldError message={fieldErrors.contact1Email} fieldId="contact1-email" />
            </div>
            <div>
              <label className="trainer-form-label" htmlFor="contact1-mobile">
                Mobile Number <span className="trainer-form-req">*</span>
              </label>
              <input
                id="contact1-mobile"
                type="tel"
                inputMode="numeric"
                className={fieldClass('contact1Mobile')}
                value={formData.contactPerson1?.mobileNumber || ''}
                onChange={(e) => {
                  clearFieldError('contact1Mobile');
                  updateContactPerson(1, 'mobileNumber', sanitizeMobile(e.target.value));
                }}
                placeholder="10 digits"
                maxLength={10}
                aria-invalid={Boolean(fieldErrors.contact1Mobile)}
                aria-describedby={fieldErrors.contact1Mobile ? 'contact1-mobile-error' : undefined}
              />
              <TrainerFormFieldError message={fieldErrors.contact1Mobile} fieldId="contact1-mobile" />
            </div>
            <div>
              <label className="trainer-form-label" htmlFor="contact1-designation">
                Designation <span className="trainer-form-req">*</span>
              </label>
              <input
                id="contact1-designation"
                type="text"
                className={fieldClass('contact1Designation')}
                value={formData.contactPerson1?.designation || ''}
                onChange={(e) => {
                  clearFieldError('contact1Designation');
                  updateContactPerson(1, 'designation', e.target.value);
                }}
                aria-invalid={Boolean(fieldErrors.contact1Designation)}
                aria-describedby={fieldErrors.contact1Designation ? 'contact1-designation-error' : undefined}
              />
              <TrainerFormFieldError message={fieldErrors.contact1Designation} fieldId="contact1-designation" />
            </div>
          </div>
        </div>
      </section>

      <section>
        <TrainerFormSectionTitle title="Secondary Contact Person" iconClass="ri-user-add-line" />
        <div className="trainer-form-sub-card">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="trainer-form-label" htmlFor="contact2-name">
                Name <span className="trainer-form-req">*</span>
              </label>
              <input
                id="contact2-name"
                type="text"
                className={fieldClass('contact2Name')}
                value={formData.contactPerson2?.name || ''}
                onChange={(e) => {
                  clearFieldError('contact2Name');
                  updateContactPerson(2, 'name', e.target.value);
                }}
                aria-invalid={Boolean(fieldErrors.contact2Name)}
                aria-describedby={fieldErrors.contact2Name ? 'contact2-name-error' : undefined}
              />
              <TrainerFormFieldError message={fieldErrors.contact2Name} fieldId="contact2-name" />
            </div>
            <div>
              <label className="trainer-form-label" htmlFor="contact2-email">
                Email <span className="trainer-form-req">*</span>
              </label>
              <input
                id="contact2-email"
                type="email"
                className={fieldClass('contact2Email')}
                value={formData.contactPerson2?.email || ''}
                onChange={(e) => {
                  clearFieldError('contact2Email');
                  updateContactPerson(2, 'email', e.target.value);
                }}
                aria-invalid={Boolean(fieldErrors.contact2Email)}
                aria-describedby={fieldErrors.contact2Email ? 'contact2-email-error' : undefined}
              />
              <TrainerFormFieldError message={fieldErrors.contact2Email} fieldId="contact2-email" />
            </div>
            <div>
              <label className="trainer-form-label" htmlFor="contact2-mobile">
                Mobile Number <span className="trainer-form-req">*</span>
              </label>
              <input
                id="contact2-mobile"
                type="tel"
                inputMode="numeric"
                className={fieldClass('contact2Mobile')}
                value={formData.contactPerson2?.mobileNumber || ''}
                onChange={(e) => {
                  clearFieldError('contact2Mobile');
                  updateContactPerson(2, 'mobileNumber', sanitizeMobile(e.target.value));
                }}
                placeholder="10 digits"
                maxLength={10}
                aria-invalid={Boolean(fieldErrors.contact2Mobile)}
                aria-describedby={fieldErrors.contact2Mobile ? 'contact2-mobile-error' : undefined}
              />
              <TrainerFormFieldError message={fieldErrors.contact2Mobile} fieldId="contact2-mobile" />
            </div>
            <div>
              <label className="trainer-form-label" htmlFor="contact2-designation">
                Designation <span className="trainer-form-req">*</span>
              </label>
              <input
                id="contact2-designation"
                type="text"
                className={fieldClass('contact2Designation')}
                value={formData.contactPerson2?.designation || ''}
                onChange={(e) => {
                  clearFieldError('contact2Designation');
                  updateContactPerson(2, 'designation', e.target.value);
                }}
                aria-invalid={Boolean(fieldErrors.contact2Designation)}
                aria-describedby={fieldErrors.contact2Designation ? 'contact2-designation-error' : undefined}
              />
              <TrainerFormFieldError message={fieldErrors.contact2Designation} fieldId="contact2-designation" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CompanyRegisterFormFields;
