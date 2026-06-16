"use client";
import React, { RefObject, useEffect, useRef, useState } from 'react';
import type { TrainerImage } from '@/services/trainerService';
import ProfilePhotoCropModal from '@/shared/components/trainer/ProfilePhotoCropModal';
import TrainerFormSectionTitle from '@/shared/components/trainer/TrainerFormSectionTitle';
import { validateProfilePhotoFile } from '@/shared/utils/imageCropUtils';
import '@/shared/styles/trainer-form.css';

/** Maximum gallery images allowed on trainer profile / registration. */
export const MAX_TRAINER_GALLERY_IMAGES = 6;

interface TrainerPhotosFieldsProps {
  profilePhoto: TrainerImage | null | undefined;
  images: TrainerImage[] | undefined;
  profilePhotoInputRef: RefObject<HTMLInputElement | null>;
  galleryInputRefs: RefObject<(HTMLInputElement | null)[]>;
  uploadingProfilePhoto: boolean;
  uploadingGallerySlot: number | null;
  /** Called with the cropped profile photo file ready for upload. */
  onProfilePhotoFileReady: (file: File) => void | Promise<void>;
  onGallerySlotChange: (slotIndex: number, e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearProfilePhoto: () => void;
  onRemoveGalleryImage: (index: number) => void;
  /** Optional validation error shown via Swal in the parent. */
  onProfilePhotoValidationError?: (message: string) => void;
}

/**
 * Profile photo and training gallery upload UI shared by registration and profile edit.
 * Profile photos open a square crop dialog before upload.
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
  onProfilePhotoFileReady,
  onGallerySlotChange,
  onClearProfilePhoto,
  onRemoveGalleryImage,
  onProfilePhotoValidationError,
}) => {
  const internalInputRef = useRef<HTMLInputElement | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [pendingFileName, setPendingFileName] = useState('profile-photo.jpg');

  const galleryCount = (images || []).filter((img) => Boolean(img)).length;
  const gallerySlots = Array.from({ length: MAX_TRAINER_GALLERY_IMAGES }, (_, i) => images?.[i]);

  useEffect(() => {
    return () => {
      if (cropImageSrc?.startsWith('blob:')) {
        URL.revokeObjectURL(cropImageSrc);
      }
    };
  }, [cropImageSrc]);

  /**
   * Sync the hidden file input with optional parent ref.
   *
   * @param element - File input element or null on unmount.
   */
  const setProfilePhotoInputRef = (element: HTMLInputElement | null) => {
    internalInputRef.current = element;
    if (profilePhotoInputRef && 'current' in profilePhotoInputRef) {
      (profilePhotoInputRef as React.MutableRefObject<HTMLInputElement | null>).current = element;
    }
  };

  /**
   * Close the crop dialog and release any temporary object URL.
   */
  const closeCropModal = () => {
    setCropOpen(false);
    if (cropImageSrc?.startsWith('blob:')) {
      URL.revokeObjectURL(cropImageSrc);
    }
    setCropImageSrc(null);
    const input = profilePhotoInputRef.current ?? internalInputRef.current;
    if (input) input.value = '';
  };

  /**
   * Open the crop dialog after basic file validation.
   *
   * @param event - File input change event for the profile photo.
   */
  const handleProfilePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateProfilePhotoFile(file);
    if (validationError) {
      onProfilePhotoValidationError?.(validationError);
      event.target.value = '';
      return;
    }

    if (cropImageSrc?.startsWith('blob:')) {
      URL.revokeObjectURL(cropImageSrc);
    }

    setPendingFileName(file.name);
    setCropImageSrc(URL.createObjectURL(file));
    setCropOpen(true);
  };

  /**
   * Upload the cropped profile photo file via the parent handler.
   *
   * @param file - Cropped JPEG file from the crop modal.
   */
  const handleCropConfirm = async (file: File) => {
    await onProfilePhotoFileReady(file);
  };

  return (
    <div className="space-y-6">
      <input
        type="file"
        ref={setProfilePhotoInputRef}
        accept="image/*"
        onChange={handleProfilePhotoSelect}
        className="hidden"
        aria-hidden="true"
      />

      <ProfilePhotoCropModal
        open={cropOpen}
        imageSrc={cropImageSrc}
        fileName={pendingFileName}
        onClose={closeCropModal}
        onConfirm={handleCropConfirm}
      />

      {/* Profile photo */}
      <div>
        <TrainerFormSectionTitle title="Profile Photo" iconClass="ri-account-circle-line" />
        <div className="trainer-form-profile-row">
          <button
            type="button"
            className="trainer-form-profile-circle"
            onClick={() => (profilePhotoInputRef.current ?? internalInputRef.current)?.click()}
            disabled={uploadingProfilePhoto || cropOpen}
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
              Click the circle to choose a photo, crop it to a headshot, then upload. JPG or PNG,
              min 300×300px recommended.
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
