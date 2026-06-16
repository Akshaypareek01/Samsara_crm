"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import {
  getCroppedImageFile,
  type CropImageFileOptions,
} from '@/shared/utils/imageCropUtils';
import '@/shared/styles/profile-photo-crop-modal.css';

interface ProfilePhotoCropModalProps {
  /** Whether the crop dialog is visible. */
  open: boolean;
  /** Object URL or remote URL of the image to crop. */
  imageSrc: string | null;
  /** Original file name used for the cropped output file. */
  fileName: string;
  /** Close the dialog without applying a crop. */
  onClose: () => void;
  /** Called with the cropped image file ready for upload. */
  onConfirm: (file: File) => void | Promise<void>;
  /** Dialog title. */
  title?: string;
  /** Helper text below the crop area. */
  hint?: string;
  /** Round headshot vs square logo crop mask. */
  cropShape?: 'round' | 'rect';
  /** Zoom slider element id for accessibility. */
  zoomInputId?: string;
  /** Canvas export options for the cropped file. */
  exportOptions?: CropImageFileOptions;
}

/**
 * Modal dialog for cropping a trainer profile photo to a square headshot.
 *
 * @param props - Crop state, callbacks and source image.
 * @returns Square crop UI or null when closed.
 */
const ProfilePhotoCropModal: React.FC<ProfilePhotoCropModalProps> = ({
  open,
  imageSrc,
  fileName,
  onClose,
  onConfirm,
  title = 'Crop profile photo',
  hint = 'Drag to reposition. Pinch or use the slider to zoom. Your photo will be saved as a square headshot.',
  cropShape = 'round',
  zoomInputId = 'profile-photo-zoom',
  exportOptions,
}) => {
  const titleId = useId();
  const descId = useId();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setError('');
    setApplying(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeBtnRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !applying) onClose();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose, applying]);

  /**
   * Persist the latest pixel crop area from the cropper.
   *
   * @param _croppedArea - Percentage crop (unused).
   * @param pixels - Pixel crop used for canvas export.
   */
  const handleCropComplete = useCallback((_croppedArea: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  /**
   * Export the cropped image and pass it to the parent upload handler.
   */
  const handleApply = async () => {
    if (!imageSrc || !croppedAreaPixels) {
      setError('Adjust the crop area before continuing');
      return;
    }

    try {
      setApplying(true);
      setError('');
      const croppedFile = await getCroppedImageFile(
        imageSrc,
        croppedAreaPixels,
        fileName,
        exportOptions
      );
      await onConfirm(croppedFile);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not crop image');
    } finally {
      setApplying(false);
    }
  };

  if (!open || !imageSrc) return null;

  return (
    <div
      className="profile-photo-crop-overlay"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget && !applying) onClose();
      }}
    >
      <div
        className="profile-photo-crop-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
      >
        <div className="profile-photo-crop-modal__header">
          <h2 id={titleId} className="profile-photo-crop-modal__title">
            {title}
          </h2>
          <button
            ref={closeBtnRef}
            type="button"
            className="profile-photo-crop-modal__close"
            onClick={onClose}
            disabled={applying}
            aria-label="Close crop dialog"
          >
            <i className="ri-close-line text-lg" aria-hidden="true" />
          </button>
        </div>

        <div className="profile-photo-crop-modal__body">
          <div className="profile-photo-crop-modal__crop-area">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape={cropShape}
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
            />
          </div>
          <p id={descId} className="profile-photo-crop-modal__hint">
            {hint}
          </p>
          <div className="profile-photo-crop-modal__zoom">
            <label className="profile-photo-crop-modal__zoom-label" htmlFor={zoomInputId}>
              Zoom
            </label>
            <input
              id={zoomInputId}
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              className="profile-photo-crop-modal__zoom-input"
              aria-valuemin={1}
              aria-valuemax={3}
              aria-valuenow={zoom}
            />
          </div>
          {error && (
            <p className="trainer-form-field-error mt-2" role="alert">
              {error}
            </p>
          )}
        </div>

        <div className="profile-photo-crop-modal__actions">
          <button
            type="button"
            className="profile-photo-crop-modal__btn profile-photo-crop-modal__btn--secondary"
            onClick={onClose}
            disabled={applying}
          >
            Cancel
          </button>
          <button
            type="button"
            className="profile-photo-crop-modal__btn profile-photo-crop-modal__btn--primary"
            onClick={() => void handleApply()}
            disabled={applying}
          >
            {applying ? 'Applying…' : 'Apply & upload'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePhotoCropModal;
