"use client";
import React, { RefObject } from 'react';
import type { TrainerImage } from '@/services/trainerService';

/** Maximum gallery images allowed on trainer profile / registration. */
export const MAX_TRAINER_GALLERY_IMAGES = 3;

interface TrainerPhotosFieldsProps {
  profilePhoto: TrainerImage | null | undefined;
  images: TrainerImage[] | undefined;
  profilePhotoInputRef: RefObject<HTMLInputElement | null>;
  imageInputRef: RefObject<HTMLInputElement | null>;
  uploadingProfilePhoto: boolean;
  uploadingImage: boolean;
  onProfilePhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGalleryImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearProfilePhoto: () => void;
  onRemoveGalleryImage: (index: number) => void;
}

/**
 * Profile photo and training gallery upload UI shared by registration and profile edit.
 *
 * @param props - Image state, refs and upload handlers.
 * @returns Hidden file inputs plus profile and gallery upload controls.
 */
const TrainerPhotosFields: React.FC<TrainerPhotosFieldsProps> = ({
  profilePhoto,
  images,
  profilePhotoInputRef,
  imageInputRef,
  uploadingProfilePhoto,
  uploadingImage,
  onProfilePhotoChange,
  onGalleryImageChange,
  onClearProfilePhoto,
  onRemoveGalleryImage,
}) => {
  const galleryCount = images?.length || 0;
  const galleryFull = galleryCount >= MAX_TRAINER_GALLERY_IMAGES;

  return (
    <>
      <input
        type="file"
        ref={profilePhotoInputRef as RefObject<HTMLInputElement>}
        accept="image/*"
        onChange={onProfilePhotoChange}
        className="hidden"
        aria-hidden="true"
      />
      <input
        type="file"
        ref={imageInputRef as RefObject<HTMLInputElement>}
        accept="image/*"
        onChange={onGalleryImageChange}
        className="hidden"
        aria-hidden="true"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Profile Photo</label>
          {profilePhoto?.path ? (
            <div className="relative w-full h-40 rounded-xl overflow-hidden border-2 border-defaultborder group">
              <img
                src={profilePhoto.path}
                alt="Profile preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => profilePhotoInputRef.current?.click()}
                  className="ti-btn ti-btn-sm !bg-white !text-defaulttextcolor !font-medium"
                  title="Change photo"
                  aria-label="Change profile photo"
                >
                  <i className="ri-refresh-line" aria-hidden="true"></i>
                </button>
                <button
                  type="button"
                  onClick={onClearProfilePhoto}
                  className="ti-btn ti-btn-sm !bg-danger !text-white !font-medium"
                  title="Remove photo"
                  aria-label="Remove profile photo"
                >
                  <i className="ri-delete-bin-line" aria-hidden="true"></i>
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => profilePhotoInputRef.current?.click()}
              disabled={uploadingProfilePhoto}
              className="w-full h-40 rounded-xl border-2 border-dashed border-defaultborder hover:border-primary hover:bg-primary/5 flex flex-col items-center justify-center gap-1.5 text-muted hover:text-primary transition-colors disabled:opacity-60"
            >
              {uploadingProfilePhoto ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                  <span className="text-sm">Uploading...</span>
                </>
              ) : (
                <>
                  <i className="ri-image-add-line text-3xl" aria-hidden="true"></i>
                  <span className="text-sm font-medium">Upload Profile Photo</span>
                  <span className="text-xs">JPG, PNG, GIF · Max 5MB</span>
                </>
              )}
            </button>
          )}
        </div>

        <div>
          <label className="form-label">
            Training Gallery Photos{' '}
            <span className="text-muted text-xs font-normal">
              ({galleryCount}/{MAX_TRAINER_GALLERY_IMAGES})
            </span>
          </label>
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={uploadingImage || galleryFull}
            className="w-full h-40 rounded-xl border-2 border-dashed border-defaultborder hover:border-primary hover:bg-primary/5 flex flex-col items-center justify-center gap-1.5 text-muted hover:text-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {uploadingImage ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status"></span>
                <span className="text-sm">Uploading...</span>
              </>
            ) : galleryFull ? (
              <>
                <i className="ri-checkbox-circle-line text-3xl" aria-hidden="true"></i>
                <span className="text-sm font-medium">
                  Maximum {MAX_TRAINER_GALLERY_IMAGES} images added
                </span>
                <span className="text-xs">Remove one to add another</span>
              </>
            ) : (
              <>
                <i className="ri-add-circle-line text-3xl" aria-hidden="true"></i>
                <span className="text-sm font-medium">Add Gallery Image</span>
                <span className="text-xs">
                  Up to {MAX_TRAINER_GALLERY_IMAGES} · JPG, PNG, GIF · Max 5MB each
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {images && images.length > 0 && (
        <div className="mt-4">
          <div className="grid grid-cols-3 gap-3">
            {images.map((img, idx) => (
              <div key={idx} className="relative group aspect-[4/3]">
                <img
                  src={img.path}
                  alt={`Gallery ${idx + 1}`}
                  className="w-full h-full object-cover rounded-lg border border-defaultborder"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => onRemoveGalleryImage(idx)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-danger text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                  title="Remove image"
                  aria-label={`Remove gallery image ${idx + 1}`}
                >
                  <i className="ri-close-line text-sm" aria-hidden="true"></i>
                </button>
              </div>
            ))}
          </div>
          <small className="text-muted text-xs mt-2 block">
            {galleryCount} of {MAX_TRAINER_GALLERY_IMAGES} image(s) added
          </small>
        </div>
      )}
    </>
  );
};

export default TrainerPhotosFields;
