"use client";
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Base_url } from '@/Config/BaseUrl';
import TrainerService, {
  Trainer,
  UpdateTrainerRequest,
  TrainerImage,
} from '@/services/trainerService';
import {
  filterFilledCertificationEntries,
  filterFilledEducationEntries,
  normalizeCertificationList,
  normalizeEducationList,
} from '@/shared/utils/trainerQualificationUtils';
import { broadcastTrainerAcceptingBookings } from '@/utils/trainerAvailabilitySync';
import { broadcastTrainerProfileUpdated } from '@/utils/trainerProfileSync';
import type { WeeklyAvailabilityDay } from '@/shared/utils/trainerAvailabilityUtils';

const emptyForm: UpdateTrainerRequest = {
  name: '',
  title: '',
  bio: '',
  category: '',
  specialistIn: [],
  typeOfTraining: [],
  dateOfBirth: null,
  city: '',
  pinCode: '',
  experience: '',
  education: [],
  certification: [],
  images: [],
  profilePhoto: null,
};

/**
 * State and handlers for the trainer profile edit form (load, upload, save).
 *
 * @returns Profile form state, refs and event handlers for the profile page.
 */
export function useTrainerProfileForm() {
  const router = useRouter();
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploadingProfilePhoto, setUploadingProfilePhoto] = useState(false);
  const [uploadingGallerySlot, setUploadingGallerySlot] = useState<number | null>(null);
  const [acceptingBookingsSaving, setAcceptingBookingsSaving] = useState(false);
  const [weeklyAvailability, setWeeklyAvailability] = useState<WeeklyAvailabilityDay[]>([]);
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [formData, setFormData] = useState<UpdateTrainerRequest>(emptyForm);
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const patchDetails = useCallback((patch: Partial<UpdateTrainerRequest>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const profile = await TrainerService.getMyProfile();
      setTrainer(profile);
      setWeeklyAvailability(profile.weeklyAvailability ?? []);
      setFormData({
        name: profile.name || '',
        title: profile.title || '',
        bio: profile.bio || '',
        category: profile.category || '',
        specialistIn: Array.isArray(profile.specialistIn)
          ? profile.specialistIn
          : profile.specialistIn
            ? [profile.specialistIn]
            : [],
        typeOfTraining: Array.isArray(profile.typeOfTraining)
          ? profile.typeOfTraining
          : profile.typeOfTraining
            ? [profile.typeOfTraining]
            : [],
        dateOfBirth: profile.dateOfBirth || null,
        city: profile.city || '',
        pinCode: profile.pinCode || '',
        experience: profile.experience || '',
        education: normalizeEducationList(profile.education),
        certification: normalizeCertificationList(profile.certification),
        images: profile.images || [],
        profilePhoto: profile.profilePhoto || null,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load profile';
      setError(msg);
      Swal.fire('Error!', msg, 'error');
      if (msg.includes('401') || msg.includes('Unauthorized')) {
        router.push('/trainer/login');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  const handleFileUpload = async (file: File, isProfilePhoto: boolean, slotIndex?: number) => {
    try {
      if (isProfilePhoto) setUploadingProfilePhoto(true);
      else if (slotIndex !== undefined) setUploadingGallerySlot(slotIndex);

      const body = new FormData();
      body.append('file', file);
      const token = localStorage.getItem('token');
      const response = await axios.post(`${Base_url}/upload`, body, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.data.success || !response.data.url) {
        throw new Error('Upload failed: Invalid response');
      }

      const imageData: TrainerImage = {
        key: `trainer-${isProfilePhoto ? 'profile' : 'images'}/${response.data.fileName || file.name}`,
        path: response.data.url,
      };

      if (isProfilePhoto) {
        setFormData((prev) => ({ ...prev, profilePhoto: imageData }));
        Swal.fire('Success!', 'Profile photo uploaded successfully', 'success');
      } else if (slotIndex !== undefined) {
        setFormData((prev) => {
          const next = [...(prev.images || [])];
          next[slotIndex] = imageData;
          return { ...prev, images: next };
        });
        Swal.fire('Success!', 'Image uploaded successfully', 'success');
      }
    } catch (uploadErr: unknown) {
      const axiosErr = uploadErr as { response?: { data?: { message?: string } }; message?: string };
      Swal.fire(
        'Error!',
        axiosErr.response?.data?.message || axiosErr.message || 'Failed to upload file',
        'error'
      );
    } finally {
      if (isProfilePhoto) setUploadingProfilePhoto(false);
      else setUploadingGallerySlot(null);
    }
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      Swal.fire('Error!', 'Please select an image file', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire('Error!', 'File size should be less than 5MB', 'error');
      return;
    }
    void handleFileUpload(file, true);
    if (profilePhotoInputRef.current) profilePhotoInputRef.current.value = '';
  };

  const handleGallerySlotChange = (slotIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      Swal.fire('Error!', 'Please select an image file', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire('Error!', 'File size should be less than 5MB', 'error');
      return;
    }
    void handleFileUpload(file, false, slotIndex);
    const input = galleryInputRefs.current[slotIndex];
    if (input) input.value = '';
  };

  const removeImage = (index: number) => {
    setFormData((prev) => {
      const newImages = [...(prev.images || [])];
      delete newImages[index];
      return { ...prev, images: newImages };
    });
  };

  const clearProfilePhoto = () => {
    setFormData((prev) => ({ ...prev, profilePhoto: null }));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<boolean> => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');

      const specialistInArray: string[] = Array.isArray(formData.specialistIn)
        ? formData.specialistIn.filter((item): item is string => Boolean(item))
        : formData.specialistIn
          ? [formData.specialistIn]
          : [];
      const typeOfTrainingArray: string[] = Array.isArray(formData.typeOfTraining)
        ? formData.typeOfTraining.filter((item): item is string => Boolean(item))
        : formData.typeOfTraining
          ? [formData.typeOfTraining]
          : [];

      if (
        !formData.name ||
        !formData.title ||
        !formData.bio ||
        !formData.category ||
        specialistInArray.length === 0 ||
        typeOfTrainingArray.length === 0
      ) {
        Swal.fire('Error!', 'Please fill in all required fields', 'error');
        return false;
      }
      if (formData.bio.length > 2000) {
        Swal.fire('Error!', 'Bio must be less than 2000 characters', 'error');
        return false;
      }
      if (formData.pinCode && !/^[0-9]{6}$/.test(formData.pinCode)) {
        Swal.fire('Error!', 'PIN code must be 6 digits', 'error');
        return false;
      }

      const filledEducation = filterFilledEducationEntries(formData.education);
      const filledCertification = filterFilledCertificationEntries(formData.certification);

      const updateData: UpdateTrainerRequest = {
        name: formData.name.trim(),
        title: formData.title.trim(),
        bio: formData.bio.trim(),
        category: formData.category,
        specialistIn: specialistInArray,
        typeOfTraining: typeOfTrainingArray,
        dateOfBirth: formData.dateOfBirth || null,
        city: (formData.city || '').trim(),
        pinCode: formData.pinCode || '',
        experience: formData.experience || '',
        education: filledEducation,
        certification: filledCertification,
      };
      const filledImages = formData.images?.filter((img): img is TrainerImage => Boolean(img));
      if (filledImages?.length) updateData.images = filledImages;
      if (formData.profilePhoto) updateData.profilePhoto = formData.profilePhoto;

      const updatedTrainer = await TrainerService.updateMyProfile(updateData);
      setTrainer(updatedTrainer);
      broadcastTrainerProfileUpdated({
        name: updatedTrainer.name,
        title: updatedTrainer.title,
        profilePhoto: updatedTrainer.profilePhoto,
      });
      Swal.fire('Success!', 'Profile updated successfully', 'success');
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile';
      setError(msg);
      Swal.fire('Error!', msg, 'error');
      return false;
    } finally {
      setSaving(false);
    }
  };

  /**
   * Turn accepting new company bookings on or off.
   *
   * @param next - Whether the trainer accepts new bookings.
   */
  /**
   * Persist the trainer's weekly availability schedule.
   */
  const handleSaveWeeklyAvailability = async () => {
    if (!trainer || trainer.status === false) return;
    try {
      setScheduleSaving(true);
      const updated = await TrainerService.updateMyProfile({ weeklyAvailability });
      setTrainer(updated);
      setWeeklyAvailability(updated.weeklyAvailability ?? []);
      Swal.fire('Saved!', 'Weekly schedule updated.', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not save weekly schedule';
      Swal.fire('Error!', msg, 'error');
    } finally {
      setScheduleSaving(false);
    }
  };

  const handleAcceptingBookingsToggle = async (next: boolean) => {
    if (!trainer || trainer.status === false) return;
    try {
      setAcceptingBookingsSaving(true);
      const updated = await TrainerService.updateMyProfile({ acceptingBookings: next });
      setTrainer(updated);
      broadcastTrainerAcceptingBookings(next);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not update booking availability';
      Swal.fire('Error!', msg, 'error');
    } finally {
      setAcceptingBookingsSaving(false);
    }
  };

  return {
    trainer,
    loading,
    saving,
    error,
    formData,
    setFormData,
    patchDetails,
    uploadingProfilePhoto,
    uploadingGallerySlot,
    acceptingBookingsSaving,
    profilePhotoInputRef,
    galleryInputRefs,
    handleProfilePhotoChange,
    handleGallerySlotChange,
    removeImage,
    clearProfilePhoto,
    handleSubmit,
    handleAcceptingBookingsToggle,
    weeklyAvailability,
    setWeeklyAvailability,
    scheduleSaving,
    handleSaveWeeklyAvailability,
    fetchProfile,
  };
}
