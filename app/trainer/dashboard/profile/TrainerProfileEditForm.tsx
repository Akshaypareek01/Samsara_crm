"use client";

import React, { RefObject } from "react";
import {
  SPECIALIST_OPTIONS,
  TRAINER_CATEGORY_OPTIONS,
  TYPE_OF_TRAINING_OPTIONS,
  Trainer,
  UpdateTrainerRequest,
  mergeTrainerSelectOptions,
} from "@/services/trainerService";
import MultiSelect from "@/shared/components/MultiSelect";
import TrainerPersonalDetailsFields from "@/shared/components/trainer/TrainerPersonalDetailsFields";
import TrainerQualificationFields from "@/shared/components/trainer/TrainerQualificationFields";
import TrainerFormSectionHeader from "@/shared/components/trainer/TrainerFormSectionHeader";
import TrainerPhotosFields from "@/shared/components/trainer/TrainerPhotosFields";
import TrainerProfileBanner from "@/shared/components/trainer/TrainerProfileBanner";

type TrainerProfileEditFormProps = {
  trainer: Trainer | null;
  formData: UpdateTrainerRequest;
  saving: boolean;
  uploadingProfilePhoto: boolean;
  uploadingGallerySlot: number | null;
  profilePhotoInputRef: RefObject<HTMLInputElement | null>;
  galleryInputRefs: RefObject<(HTMLInputElement | null)[]>;
  setFormData: React.Dispatch<React.SetStateAction<UpdateTrainerRequest>>;
  patchDetails: (patch: Partial<UpdateTrainerRequest>) => void;
  onProfilePhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGallerySlotChange: (slotIndex: number, e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearProfilePhoto: () => void;
  onRemoveGalleryImage: (index: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
};

/**
 * Editable trainer profile form used on the trainer dashboard profile page.
 */
const TrainerProfileEditForm: React.FC<TrainerProfileEditFormProps> = ({
  trainer,
  formData,
  saving,
  uploadingProfilePhoto,
  uploadingGallerySlot,
  profilePhotoInputRef,
  galleryInputRefs,
  setFormData,
  patchDetails,
  onProfilePhotoChange,
  onGallerySlotChange,
  onClearProfilePhoto,
  onRemoveGalleryImage,
  onSubmit,
  onCancel,
}) => (
  <>
    <TrainerProfileBanner
      name={formData.name || trainer?.name || ""}
      title={formData.title || trainer?.title}
      email={trainer?.email}
      mobile={trainer?.mobile}
      category={formData.category || trainer?.category}
      profilePhoto={formData.profilePhoto}
    />

    <form onSubmit={onSubmit} className="space-y-7">
      <section>
        <TrainerFormSectionHeader number={1} title="Basic Information" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label" htmlFor="profile-name">
              Full Name <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <i
                className="ri-user-line absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                aria-hidden="true"
              />
              <input
                id="profile-name"
                type="text"
                className="form-control border-2 focus:border-primary !ps-10"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
          </div>
          <div>
            <label className="form-label" htmlFor="profile-title">
              Professional Title <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <i
                className="ri-award-line absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                aria-hidden="true"
              />
              <input
                id="profile-title"
                type="text"
                className="form-control border-2 focus:border-primary !ps-10"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Certified Yoga Instructor"
                required
              />
            </div>
          </div>
          <div>
            <label className="form-label" htmlFor="profile-trainer-category">
              Category <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <i
                className="ri-price-tag-3-line absolute left-3 top-1/2 -translate-y-1/2 text-muted z-10"
                aria-hidden="true"
              />
              <select
                id="profile-trainer-category"
                className="form-control border-2 focus:border-primary !ps-10"
                value={formData.category || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                required
                aria-required="true"
              >
                <option value="">Select your category</option>
                {TRAINER_CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="form-label" htmlFor="profile-email">
              Email
            </label>
            <div className="relative">
              <i
                className="ri-mail-line absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                aria-hidden="true"
              />
              <input
                id="profile-email"
                type="email"
                className="form-control border-2 !ps-10 bg-gray-50 dark:bg-black/20"
                value={trainer?.email || ""}
                readOnly
                disabled
                aria-readonly="true"
              />
            </div>
            <small className="text-muted">Contact support to change email</small>
          </div>
          <div className="sm:col-span-2">
            <label className="form-label" htmlFor="profile-mobile">
              Mobile Number
            </label>
            <div className="relative">
              <i
                className="ri-phone-line absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                aria-hidden="true"
              />
              <input
                id="profile-mobile"
                type="tel"
                className="form-control border-2 !ps-10 bg-gray-50 dark:bg-black/20"
                value={trainer?.mobile || ""}
                readOnly
                disabled
                aria-readonly="true"
              />
            </div>
            <small className="text-muted">Contact support to change mobile</small>
          </div>
          <div className="sm:col-span-2">
            <TrainerPersonalDetailsFields
              values={{
                dateOfBirth: formData.dateOfBirth,
                city: formData.city,
                pinCode: formData.pinCode,
                experience: formData.experience,
              }}
              onChange={patchDetails}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="form-label" htmlFor="profile-bio">
              Bio <span className="text-danger">*</span>
            </label>
            <textarea
              id="profile-bio"
              className="form-control border-2 focus:border-primary"
              rows={4}
              value={formData.bio}
              onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
              maxLength={2000}
              placeholder="Describe your expertise, philosophy, and experience..."
              required
            />
            <div className="flex justify-end">
              <small
                className={`text-xs ${(formData.bio || "").length > 1900 ? "text-warning" : "text-muted"}`}
              >
                {(formData.bio || "").length}/2000 characters
              </small>
            </div>
          </div>
        </div>
      </section>

      <section className="pt-6 border-t border-defaultborder/60">
        <TrainerFormSectionHeader number={2} title="Training Information" />
        <div className="space-y-4">
          <MultiSelect
            label="Training For"
            options={mergeTrainerSelectOptions(SPECIALIST_OPTIONS, formData.specialistIn)}
            value={Array.isArray(formData.specialistIn) ? formData.specialistIn : []}
            onChange={(selected) => setFormData((prev) => ({ ...prev, specialistIn: selected }))}
            placeholder="Select audience..."
            required
            maxHeight="200px"
            showTags={true}
          />
          <MultiSelect
            label="Specializations"
            options={mergeTrainerSelectOptions(TYPE_OF_TRAINING_OPTIONS, formData.typeOfTraining)}
            value={Array.isArray(formData.typeOfTraining) ? formData.typeOfTraining : []}
            onChange={(selected) => setFormData((prev) => ({ ...prev, typeOfTraining: selected }))}
            placeholder="Select specializations..."
            required
            maxHeight="300px"
            showTags={true}
          />
        </div>
      </section>

      <section className="pt-6 border-t border-defaultborder/60">
        <TrainerFormSectionHeader number={3} title="Education & Certifications" subtitle="optional" />
        <TrainerQualificationFields
          education={formData.education}
          certification={formData.certification}
          onChange={patchDetails}
        />
      </section>

      <section className="pt-6 border-t border-defaultborder/60">
        <TrainerFormSectionHeader number={4} title="Photos" subtitle="optional" />
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

      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
        <button
          type="button"
          className="ti-btn ti-btn-light !font-semibold text-sm sm:text-base !py-3"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="ti-btn ti-btn-primary !bg-primary !text-white !font-semibold text-sm sm:text-base !py-3 inline-flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-70"
          disabled={saving}
        >
          {saving ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" />
              Saving...
            </>
          ) : (
            <>
              <i className="ri-save-line" aria-hidden="true" />
              Save changes
            </>
          )}
        </button>
      </div>
    </form>
  </>
);

export default TrainerProfileEditForm;
