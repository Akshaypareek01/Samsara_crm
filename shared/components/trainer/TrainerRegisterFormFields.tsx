"use client";
import React, { RefObject } from 'react';
import {
  CreateTrainerRequest,
  EXPERIENCE_OPTIONS,
  SPECIALIST_OPTIONS,
  TRAINER_CATEGORY_OPTIONS,
  TYPE_OF_TRAINING_OPTIONS,
} from '@/services/trainerService';
import TrainerChipSelect from '@/shared/components/trainer/TrainerChipSelect';
import TrainerQualificationFields from '@/shared/components/trainer/TrainerQualificationFields';
import TrainerPhotosFields from '@/shared/components/trainer/TrainerPhotosFields';
import TrainerFormSectionTitle from '@/shared/components/trainer/TrainerFormSectionTitle';
import TrainerFormFieldError from '@/shared/components/trainer/TrainerFormFieldError';
import { TrainerRegistrationField } from '@/shared/utils/trainerRegistrationValidation';
import { getTrainerDobMaxDate, validateTrainerDateOfBirth } from '@/shared/utils/trainerDateUtils';
import '@/shared/styles/trainer-form.css';

interface TrainerRegisterFormFieldsProps {
  formData: CreateTrainerRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateTrainerRequest>>;
  patchDetails: (patch: Partial<CreateTrainerRequest>) => void;
  setFieldErrors: React.Dispatch<
    React.SetStateAction<Partial<Record<TrainerRegistrationField, string>>>
  >;
  fieldErrors: Partial<Record<TrainerRegistrationField, string>>;
  fieldClass: (field: TrainerRegistrationField, extra?: string) => string;
  clearFieldError: (field: TrainerRegistrationField) => void;
  profilePhotoInputRef: RefObject<HTMLInputElement | null>;
  galleryInputRefs: RefObject<(HTMLInputElement | null)[]>;
  uploadingProfilePhoto: boolean;
  uploadingGallerySlot: number | null;
  onProfilePhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGallerySlotChange: (slotIndex: number, e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearProfilePhoto: () => void;
  onRemoveGalleryImage: (index: number) => void;
}

/**
 * Trainer registration form fields — same section layout as company registration.
 *
 * @param props - Form state, validation helpers, and upload handlers.
 * @returns Styled registration form sections.
 */
const TrainerRegisterFormFields: React.FC<TrainerRegisterFormFieldsProps> = ({
  formData,
  setFormData,
  patchDetails,
  setFieldErrors,
  fieldErrors,
  fieldClass,
  clearFieldError,
  profilePhotoInputRef,
  galleryInputRefs,
  uploadingProfilePhoto,
  uploadingGallerySlot,
  onProfilePhotoChange,
  onGallerySlotChange,
  onClearProfilePhoto,
  onRemoveGalleryImage,
}) => {
  return (
    <div className="space-y-2">
      <section>
        <TrainerFormSectionTitle title="Trainer Information" iconClass="ri-user-line" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="trainer-form-label" htmlFor="trainer-category">
              Trainer Category <span className="trainer-form-req">*</span>
            </label>
            <select
              id="trainer-category"
              className={`${fieldClass('category')} trainer-form-select`}
              value={formData.category}
              onChange={(e) => {
                clearFieldError('category');
                setFormData((prev) => ({ ...prev, category: e.target.value }));
              }}
              required
              aria-required="true"
              aria-invalid={Boolean(fieldErrors.category)}
              aria-describedby={fieldErrors.category ? 'trainer-category-error' : undefined}
            >
              <option value="">— Select trainer type —</option>
              {TRAINER_CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <TrainerFormFieldError message={fieldErrors.category} fieldId="trainer-category" />
          </div>
          <div>
            <label className="trainer-form-label" htmlFor="reg-name">
              Full Name <span className="trainer-form-req">*</span>
            </label>
            <input
              id="reg-name"
              type="text"
              className={fieldClass('name')}
              value={formData.name}
              onChange={(e) => {
                clearFieldError('name');
                setFormData((prev) => ({ ...prev, name: e.target.value }));
              }}
              placeholder="Jane Doe"
              required
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? 'reg-name-error' : undefined}
            />
            <TrainerFormFieldError message={fieldErrors.name} fieldId="reg-name" />
          </div>
          <div>
            <label className="trainer-form-label" htmlFor="reg-title">
              Professional Title <span className="trainer-form-req">*</span>
            </label>
            <input
              id="reg-title"
              type="text"
              className={fieldClass('title')}
              value={formData.title}
              onChange={(e) => {
                clearFieldError('title');
                setFormData((prev) => ({ ...prev, title: e.target.value }));
              }}
              placeholder="e.g., Certified Yoga Instructor"
              required
              aria-invalid={Boolean(fieldErrors.title)}
              aria-describedby={fieldErrors.title ? 'reg-title-error' : undefined}
            />
            <TrainerFormFieldError message={fieldErrors.title} fieldId="reg-title" />
          </div>
          <div>
            <label className="trainer-form-label" htmlFor="trainer-dob">
              Date of Birth <span className="trainer-form-req">*</span>
            </label>
            <input
              id="trainer-dob"
              type="date"
              className={fieldClass('dateOfBirth')}
              value={formData.dateOfBirth ? String(formData.dateOfBirth).slice(0, 10) : ''}
              max={getTrainerDobMaxDate()}
              onChange={(e) => {
                const value = e.target.value;
                const dobError = value ? validateTrainerDateOfBirth(value) : undefined;
                if (dobError && value) {
                  setFieldErrors((prev) => ({ ...prev, dateOfBirth: dobError }));
                  return;
                }
                clearFieldError('dateOfBirth');
                patchDetails({ dateOfBirth: value || null });
              }}
              required
              aria-invalid={Boolean(fieldErrors.dateOfBirth)}
              aria-describedby={fieldErrors.dateOfBirth ? 'trainer-dob-error' : undefined}
            />
            <TrainerFormFieldError message={fieldErrors.dateOfBirth} fieldId="trainer-dob" />
          </div>
          <div>
            <label className="trainer-form-label" htmlFor="reg-mobile">
              Mobile Number <span className="trainer-form-req">*</span>
            </label>
            <input
              id="reg-mobile"
              type="tel"
              className={fieldClass('mobile')}
              value={formData.mobile}
              onChange={(e) => {
                clearFieldError('mobile');
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 10) {
                  setFormData((prev) => ({ ...prev, mobile: value }));
                }
              }}
              placeholder="10 digits"
              maxLength={10}
              inputMode="numeric"
              required
              aria-invalid={Boolean(fieldErrors.mobile)}
              aria-describedby={fieldErrors.mobile ? 'reg-mobile-error' : undefined}
            />
            <TrainerFormFieldError message={fieldErrors.mobile} fieldId="reg-mobile" />
          </div>
          <div className="sm:col-span-2">
            <label className="trainer-form-label" htmlFor="reg-email">
              Email <span className="trainer-form-req">*</span>
            </label>
            <input
              id="reg-email"
              type="email"
              className={fieldClass('email')}
              value={formData.email}
              onChange={(e) => {
                clearFieldError('email');
                setFormData((prev) => ({ ...prev, email: e.target.value }));
              }}
              placeholder="you@email.com"
              required
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'reg-email-error' : undefined}
            />
            <TrainerFormFieldError message={fieldErrors.email} fieldId="reg-email" />
          </div>
          <div>
            <label className="trainer-form-label" htmlFor="trainer-city">
              City <span className="trainer-form-req">*</span>
            </label>
            <input
              id="trainer-city"
              type="text"
              className={fieldClass('city')}
              value={formData.city || ''}
              onChange={(e) => {
                clearFieldError('city');
                patchDetails({ city: e.target.value });
              }}
              placeholder="Your city"
              required
              aria-invalid={Boolean(fieldErrors.city)}
              aria-describedby={fieldErrors.city ? 'trainer-city-error' : undefined}
            />
            <TrainerFormFieldError message={fieldErrors.city} fieldId="trainer-city" />
          </div>
          <div>
            <label className="trainer-form-label" htmlFor="trainer-pincode">
              Pincode <span className="trainer-form-req">*</span>
            </label>
            <input
              id="trainer-pincode"
              type="text"
              inputMode="numeric"
              className={fieldClass('pinCode')}
              value={formData.pinCode || ''}
              onChange={(e) => {
                clearFieldError('pinCode');
                const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
                patchDetails({ pinCode: digits });
              }}
              placeholder="6-digit PIN"
              maxLength={6}
              required
              aria-invalid={Boolean(fieldErrors.pinCode)}
              aria-describedby={fieldErrors.pinCode ? 'trainer-pincode-error' : undefined}
            />
            <TrainerFormFieldError message={fieldErrors.pinCode} fieldId="trainer-pincode" />
          </div>
          <div className="sm:col-span-2">
            <label className="trainer-form-label" htmlFor="trainer-experience">
              Years of Experience <span className="trainer-form-req">*</span>
            </label>
            <select
              id="trainer-experience"
              className={`${fieldClass('experience')} trainer-form-select`}
              value={formData.experience || ''}
              onChange={(e) => {
                clearFieldError('experience');
                patchDetails({ experience: e.target.value });
              }}
              required
              aria-invalid={Boolean(fieldErrors.experience)}
              aria-describedby={fieldErrors.experience ? 'trainer-experience-error' : undefined}
            >
              <option value="">— Select experience range —</option>
              {EXPERIENCE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <TrainerFormFieldError message={fieldErrors.experience} fieldId="trainer-experience" />
          </div>
        </div>
      </section>

      <section>
        <TrainerQualificationFields
          education={formData.education}
          certification={formData.certification}
          onChange={patchDetails}
        />
      </section>

      <section>
        <TrainerFormSectionTitle title="Professional Bio" iconClass="ri-file-text-line" />
        <div>
          <label className="trainer-form-label" htmlFor="reg-bio">
            About You <span className="trainer-form-req">*</span>
          </label>
          <textarea
            id="reg-bio"
            className={`${fieldClass('bio')} trainer-form-textarea`}
            rows={4}
            value={formData.bio}
            onChange={(e) => {
              clearFieldError('bio');
              setFormData((prev) => ({ ...prev, bio: e.target.value }));
            }}
            maxLength={2000}
            placeholder="Describe your expertise, philosophy, and experience... (max 2000 characters)"
            required
            aria-invalid={Boolean(fieldErrors.bio)}
            aria-describedby={fieldErrors.bio ? 'reg-bio-error' : undefined}
          />
          <TrainerFormFieldError message={fieldErrors.bio} fieldId="reg-bio" />
          <div className="trainer-form-char-count">{(formData.bio || '').length} / 2000</div>
        </div>
      </section>

      <section>
        <TrainerFormSectionTitle title="Training Focus" iconClass="ri-focus-3-line" />
        <div className="space-y-4">
          <TrainerChipSelect
            label="Training For"
            fieldId="reg-specialist-in"
            options={SPECIALIST_OPTIONS}
            value={Array.isArray(formData.specialistIn) ? formData.specialistIn : []}
            onChange={(selected) => {
              clearFieldError('specialistIn');
              setFormData((prev) => ({ ...prev, specialistIn: selected }));
            }}
            required
            error={fieldErrors.specialistIn}
          />
          <TrainerChipSelect
            label="Specializations"
            fieldId="reg-type-of-training"
            options={TYPE_OF_TRAINING_OPTIONS}
            value={Array.isArray(formData.typeOfTraining) ? formData.typeOfTraining : []}
            onChange={(selected) => {
              clearFieldError('typeOfTraining');
              setFormData((prev) => ({ ...prev, typeOfTraining: selected }));
            }}
            required
            error={fieldErrors.typeOfTraining}
          />
        </div>
      </section>

      <section>
        <TrainerPhotosFields
          profilePhoto={formData.profilePhoto}
          images={formData.images}
          profilePhotoInputRef={profilePhotoInputRef}
          galleryInputRefs={galleryInputRefs}
          uploadingProfilePhoto={uploadingProfilePhoto}
          uploadingGallerySlot={uploadingGallerySlot}
          onProfilePhotoChange={onProfilePhotoChange}
          onGallerySlotChange={onGallerySlotChange}
          onClearProfilePhoto={onClearProfilePhoto}
          onRemoveGalleryImage={onRemoveGalleryImage}
        />
      </section>
    </div>
  );
};

export default TrainerRegisterFormFields;
