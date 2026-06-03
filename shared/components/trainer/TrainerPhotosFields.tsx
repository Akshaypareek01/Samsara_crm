"use client";
import React, { RefObject } from 'react';
import type { TrainerImage } from '@/services/trainerService';
import '@/shared/styles/trainer-form.css';
import TrainerFormSectionTitle from '@/shared/components/trainer/TrainerFormSectionTitle';

/** Maximum gallery images allowed on trainer profile / registration. */
export const MAX_TRAINER_GALLERY_IMAGES = 3;

interface TrainerPhotosFieldsProps {
  profilePhoto: TrainerImage | null | undefined;
  images: TrainerImage[] | undefined;
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
 * Profile photo and training gallery upload UI shared by registration and profile edit.
 * Matches trainer_registration_form_v2.html layout (circle profile + 3-slot gallery grid).
 *
 * @param props - Image state, refs and upload handlers.
 * @returns Hidden file inputs plus profile and gallery upload controls.
 */
const TrainerPhotosFields: React.FC<TrainerPhotosFieldsProps> = ({
  profilePhoto,
  images,
  profilePhotoInputRef,
  galleryInputRefs,
  uploadingProfilePhoto,
  uploadingGallerySlot,
  onProfilePhotoChange,
  onGallerySlotChange,
  onClearProfilePhoto,
  onRemoveGalleryImage,
}) => {
  const galleryCount = (images || []).filter((img) => Boolean(img)).length;
  const gallerySlots = Array.from({ length: MAX_TRAINER_GALLERY_IMAGES }, (_, i) => images?.[i]);

  return (
    <div className="space-y-6">
      <input
        type="file"
        ref={profilePhotoInputRef as RefObject<HTMLInputElement>}
        accept="image/*"
        onChange={onProfilePhotoChange}
        className="hidden"
        aria-hidden="true"
      />

      {/* Profile photo */}
      <div>
        <TrainerFormSectionTitle title="Profile Photo" iconClass="ri-account-circle-line" />
        <div className="trainer-form-profile-row">
          <button
            type="button"
            className="trainer-form-profile-circle"
            onClick={() => profilePhotoInputRef.current?.click()}
            disabled={uploadingProfilePhoto}
            aria-label="Upload profile photo"
          >
            {profilePhoto?.path ? (
              <img src={profilePhoto.path} alt="Profile preview" />
            ) : uploadingProfilePhoto ? (
              <span className="spinner-border spinner-border-sm text-primary" role="status" />
            ) : (
              <i className="ri-user-line text-[28px] text-[#c9bef8]" aria-hidden="true" />
            )}
          </button>
          <div className="trainer-form-profile-info flex-1 min-w-0">
            <strong>Upload your profile photo</strong>
            <p>
              Click the circle to upload. Use a clear, professional headshot. JPG or PNG, min
              300×300px recommended.
            </p>
            {profilePhoto?.path && (
              <button
                type="button"
                onClick={onClearProfilePhoto}
                className="text-xs text-danger font-semibold mt-1 hover:underline"
              >
                Remove photo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div>
        <TrainerFormSectionTitle title="Training Gallery Photos" iconClass="ri-image-line" />
        <p className="text-xs text-muted mb-2">
          {galleryCount} of {MAX_TRAINER_GALLERY_IMAGES} uploaded
        </p>
        <div className="trainer-form-gallery-grid">
          {gallerySlots.map((slotImage, index) => {
            const uploading = uploadingGallerySlot === index;
            return (
              <div key={`gallery-slot-${index}`} className="relative">
                <input
                  type="file"
                  ref={(el) => {
                    if (galleryInputRefs.current) {
                      galleryInputRefs.current[index] = el;
                    }
                  }}
                  accept="image/*"
                  onChange={(e) => onGallerySlotChange(index, e)}
                  className="hidden"
                  aria-hidden="true"
                />
                <div
                  role="button"
                  tabIndex={0}
                  className="trainer-form-gallery-box w-full"
                  onClick={() => !uploading && galleryInputRefs.current?.[index]?.click()}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !uploading) {
                      e.preventDefault();
                      galleryInputRefs.current?.[index]?.click();
                    }
                  }}
                  aria-label={`Upload gallery photo ${index + 1}`}
                  aria-disabled={uploading}
                >
                  {slotImage?.path ? (
                    <>
                      <img src={slotImage.path} alt={`Gallery ${index + 1}`} />
                      <button
                        type="button"
                        className="trainer-form-gallery-remove"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveGalleryImage(index);
                        }}
                        aria-label={`Remove gallery photo ${index + 1}`}
                      >
                        <i className="ri-close-line text-sm" aria-hidden="true" />
                      </button>
                    </>
                  ) : uploading ? (
                    <span className="spinner-border spinner-border-sm text-primary" role="status" />
                  ) : (
                    <>
                      <i className="ri-camera-line g-icon" aria-hidden="true" />
                      <span className="g-label">Photo {index + 1}</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrainerPhotosFields;
