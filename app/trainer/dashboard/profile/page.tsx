"use client";
import Pageheader from '@/shared/layout-components/page-header/pageheader';
import Seo from '@/shared/layout-components/seo/seo';
import React, { Fragment, useEffect, useState, useRef } from 'react';
import TrainerService, { Trainer, UpdateTrainerRequest, SPECIALIST_OPTIONS, TYPE_OF_TRAINING_OPTIONS, TrainerImage, isTrainerAcceptingBookings } from '@/services/trainerService';
import Swal from 'sweetalert2';
import axios from 'axios';
import { Base_url } from '@/Config/BaseUrl';
import MultiSelect from '@/shared/components/MultiSelect';
import { useRouter } from 'next/navigation';
import { broadcastTrainerAcceptingBookings } from '@/utils/trainerAvailabilitySync';

const TrainerProfile = () => {
    const [trainer, setTrainer] = useState<Trainer | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [uploadingProfilePhoto, setUploadingProfilePhoto] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [acceptingBookingsSaving, setAcceptingBookingsSaving] = useState(false);
    const profilePhotoInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const [formData, setFormData] = useState<UpdateTrainerRequest>({
        name: '',
        title: '',
        bio: '',
        specialistIn: [],
        typeOfTraining: [],
        images: [],
        profilePhoto: null,
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError('');
            const profile = await TrainerService.getMyProfile();
            setTrainer(profile);
            setFormData({
                name: profile.name || '',
                title: profile.title || '',
                bio: profile.bio || '',
                specialistIn: Array.isArray(profile.specialistIn) ? profile.specialistIn : (profile.specialistIn ? [profile.specialistIn] : []),
                typeOfTraining: Array.isArray(profile.typeOfTraining) ? profile.typeOfTraining : (profile.typeOfTraining ? [profile.typeOfTraining] : []),
                images: profile.images || [],
                profilePhoto: profile.profilePhoto || null,
            });
        } catch (err: any) {
            setError(err.message || 'Failed to load profile');
            Swal.fire('Error!', err.message || 'Failed to load profile', 'error');
            if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
                router.push('/trainer/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (file: File, isProfilePhoto: boolean = false) => {
        if (!file) {
            return;
        }

        try {
            if (isProfilePhoto) {
                setUploadingProfilePhoto(true);
            } else {
                setUploadingImage(true);
            }

            const formData = new FormData();
            formData.append('file', file);

            const token = localStorage.getItem('token');
            const uploadUrl = `${Base_url}/upload`;
            
            const response = await axios.post(uploadUrl, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            });

            if (response.data.success && response.data.url) {
                const fileName = response.data.fileName || file.name;
                const key = `trainer-${isProfilePhoto ? 'profile' : 'images'}/${fileName}`;
                const imageData: TrainerImage = {
                    key,
                    path: response.data.url,
                };

                if (isProfilePhoto) {
                    setFormData((prev) => ({
                        ...prev,
                        profilePhoto: imageData,
                    }));
                    Swal.fire('Success!', 'Profile photo uploaded successfully', 'success');
                } else {
                    setFormData((prev) => ({
                        ...prev,
                        images: [...(prev.images || []), imageData],
                    }));
                    Swal.fire('Success!', 'Image uploaded successfully', 'success');
                }
            } else {
                throw new Error('Upload failed: Invalid response');
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            Swal.fire('Error!', error.response?.data?.message || error.message || 'Failed to upload file', 'error');
        } finally {
            if (isProfilePhoto) {
                setUploadingProfilePhoto(false);
            } else {
                setUploadingImage(false);
            }
        }
    };

    const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                Swal.fire('Error!', 'Please select an image file', 'error');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                Swal.fire('Error!', 'File size should be less than 5MB', 'error');
                return;
            }
            handleFileUpload(file, true);
        }
        if (profilePhotoInputRef.current) {
            profilePhotoInputRef.current.value = '';
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                Swal.fire('Error!', 'Please select an image file', 'error');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                Swal.fire('Error!', 'File size should be less than 5MB', 'error');
                return;
            }
            handleFileUpload(file, false);
        }
        if (imageInputRef.current) {
            imageInputRef.current.value = '';
        }
    };

    const removeImage = (index: number) => {
        setFormData((prev) => {
            const newImages = [...(prev.images || [])];
            newImages.splice(index, 1);
            return { ...prev, images: newImages };
        });
    };

    const clearProfilePhoto = () => {
        setFormData((prev) => ({ ...prev, profilePhoto: null }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            setError('');

            // Validate required fields
            const specialistInArray: string[] = Array.isArray(formData.specialistIn) 
                ? formData.specialistIn.filter((item): item is string => Boolean(item))
                : formData.specialistIn ? [formData.specialistIn] : [];
            const typeOfTrainingArray: string[] = Array.isArray(formData.typeOfTraining)
                ? formData.typeOfTraining.filter((item): item is string => Boolean(item))
                : formData.typeOfTraining ? [formData.typeOfTraining] : [];
            
            if (!formData.name || !formData.title || !formData.bio || specialistInArray.length === 0 || typeOfTrainingArray.length === 0) {
                Swal.fire('Error!', 'Please fill in all required fields', 'error');
                setSaving(false);
                return;
            }

            // Validate bio length
            if (formData.bio.length > 2000) {
                Swal.fire('Error!', 'Bio must be less than 2000 characters', 'error');
                setSaving(false);
                return;
            }

            const updateData: UpdateTrainerRequest = {
                name: formData.name.trim(),
                title: formData.title.trim(),
                bio: formData.bio.trim(),
                specialistIn: specialistInArray,
                typeOfTraining: typeOfTrainingArray,
            };

            // Only include images if they exist
            if (formData.images && formData.images.length > 0) {
                updateData.images = formData.images;
            }

            // Only include profilePhoto if it exists
            if (formData.profilePhoto) {
                updateData.profilePhoto = formData.profilePhoto;
            }

            const updatedTrainer = await TrainerService.updateMyProfile(updateData);
            setTrainer(updatedTrainer);
            Swal.fire('Success!', 'Profile updated successfully', 'success');
        } catch (err: any) {
            setError(err.message || 'Failed to update profile');
            Swal.fire('Error!', err.message || 'Failed to update profile', 'error');
        } finally {
            setSaving(false);
        }
    };

    /**
     * Turn accepting new company bookings on or off (persists via PATCH /trainers/me).
     *
     * @param next - Whether the trainer accepts new bookings.
     */
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

    return (
        <Fragment>
            <Seo title={"Trainer Profile"} />
            <Pageheader currentpage="Profile" activepage="Trainer" mainpage="Profile" />
            
            {error && (
                <div className="alert alert-danger mb-4" role="alert">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="box">
                    <div className="box-body text-center py-8">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 text-muted">Loading profile...</p>
                    </div>
                </div>
            ) : (
                <div className="box">
                    <div className="box-body !p-4 sm:!p-6 md:!p-[3rem]">
                        <p className="h5 font-semibold mb-4 text-lg sm:text-xl">Update Your Profile</p>

                        {trainer && trainer.status !== false && (
                            <div className="rounded-lg border border-defaultborder p-4 mb-6 bg-gray-50 dark:bg-black/20">
                                <h4 className="font-semibold mb-1 text-base">Booking availability</h4>
                                <p className="text-muted text-sm mb-3">
                                    When this is off, companies cannot book new sessions with you. Existing bookings are
                                    unchanged.
                                </p>
                                <div className="form-check form-switch">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        role="switch"
                                        id="trainer-accepting-bookings"
                                        checked={isTrainerAcceptingBookings(trainer)}
                                        disabled={acceptingBookingsSaving}
                                        onChange={(e) => {
                                            void handleAcceptingBookingsToggle(e.target.checked);
                                        }}
                                        aria-label="Accept new bookings from companies"
                                    />
                                    <label className="form-check-label" htmlFor="trainer-accepting-bookings">
                                        {acceptingBookingsSaving ? 'Saving…' : 'Accept new bookings'}
                                    </label>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                {/* Basic Information */}
                                <div className="border-b pb-4 mb-4">
                                    <h4 className="font-semibold mb-4 text-base sm:text-lg">Basic Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                        <div>
                                            <label className="form-label">Full Name *</label>
                                            <input
                                                type="text"
                                                className="form-control border-2 focus:border-primary"
                                                value={formData.name}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                                                }
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Professional Title *</label>
                                            <input
                                                type="text"
                                                className="form-control border-2 focus:border-primary"
                                                value={formData.title}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                                                }
                                                placeholder="e.g., Certified Yoga Instructor"
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="form-label">Bio * (Max 2000 characters)</label>
                                            <textarea
                                                className="form-control border-2 focus:border-primary"
                                                rows={4}
                                                value={formData.bio}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({ ...prev, bio: e.target.value }))
                                                }
                                                maxLength={2000}
                                                required
                                            />
                                            <small className="text-muted">
                                                {(formData.bio || '').length}/2000 characters
                                            </small>
                                        </div>
                                    </div>
                                </div>

                                {/* Training Information */}
                                <div className="border-b pb-4 mb-4">
                                    <h4 className="font-semibold mb-4 text-base sm:text-lg">Training Information</h4>
                                    <div className="space-y-3 sm:space-y-4">
                                        <div>
                                            <MultiSelect
                                                label="Specialist In"
                                                options={SPECIALIST_OPTIONS}
                                                value={Array.isArray(formData.specialistIn) ? formData.specialistIn : []}
                                                onChange={(selected) => setFormData((prev) => ({ ...prev, specialistIn: selected }))}
                                                placeholder="Select specialties..."
                                                required
                                                maxHeight="200px"
                                                showTags={true}
                                            />
                                        </div>
                                        <div>
                                            <MultiSelect
                                                label="Type of Training"
                                                options={TYPE_OF_TRAINING_OPTIONS}
                                                value={Array.isArray(formData.typeOfTraining) ? formData.typeOfTraining : []}
                                                onChange={(selected) => setFormData((prev) => ({ ...prev, typeOfTraining: selected }))}
                                                placeholder="Select training types..."
                                                required
                                                maxHeight="300px"
                                                showTags={false}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Profile Photo */}
                                <div className="border-b pb-4 mb-4">
                                    <h4 className="font-semibold mb-4 text-base sm:text-lg">Profile Photo</h4>
                                    <input
                                        type="file"
                                        ref={profilePhotoInputRef}
                                        accept="image/*"
                                        onChange={handleProfilePhotoChange}
                                        className="hidden"
                                    />
                                    <div className="flex flex-col gap-4">
                                        {formData.profilePhoto?.path && (
                                            <div className="flex items-start gap-4 p-3 bg-defaultborder/10 rounded-lg border border-defaultborder">
                                                <img
                                                    src={formData.profilePhoto.path}
                                                    alt="Profile"
                                                    className="w-24 h-24 rounded-lg object-cover border border-defaultborder flex-shrink-0"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                                <div className="flex flex-col gap-3 flex-1">
                                                    <span className="text-sm font-medium text-defaulttextcolor">Current Profile Photo</span>
                                                    <button
                                                        type="button"
                                                        onClick={clearProfilePhoto}
                                                        className="ti-btn ti-btn-sm !bg-danger !text-white !font-medium !px-2 !py-2 w-fit hover:!bg-danger/90 rounded"
                                                        title="Remove photo"
                                                    >
                                                        <i className="ri-delete-bin-line"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex flex-col gap-2">
                                            <button
                                                type="button"
                                                onClick={() => profilePhotoInputRef.current?.click()}
                                                disabled={uploadingProfilePhoto}
                                                className="ti-btn ti-btn-primary !bg-primary !text-white !font-medium !px-4 !py-2 w-fit"
                                            >
                                                {uploadingProfilePhoto ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                                        Uploading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="ri-upload-line me-2"></i>
                                                        {formData.profilePhoto ? 'Change Photo' : 'Upload Profile Photo'}
                                                    </>
                                                )}
                                            </button>
                                            <small className="text-muted text-sm">
                                                Supported formats: JPG, PNG, GIF (Max 5MB)
                                            </small>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Images */}
                                <div className="pb-4 mb-4">
                                    <h4 className="font-semibold mb-4 text-base sm:text-lg">Additional Images</h4>
                                    <input
                                        type="file"
                                        ref={imageInputRef}
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                    <div className="flex flex-col gap-4">
                                        <div className="flex flex-col gap-2">
                                            <button
                                                type="button"
                                                onClick={() => imageInputRef.current?.click()}
                                                disabled={uploadingImage}
                                                className="ti-btn ti-btn-primary !bg-primary !text-white !font-medium !px-4 !py-2 w-fit"
                                            >
                                                {uploadingImage ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                                        Uploading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="ri-upload-line me-2"></i>Upload Image
                                                    </>
                                                )}
                                            </button>
                                            <small className="text-muted text-sm">
                                                Supported formats: JPG, PNG, GIF (Max 5MB per image)
                                            </small>
                                        </div>
                                        {formData.images && formData.images.length > 0 && (
                                            <div className="mt-2">
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
                                                    {formData.images.map((img, idx) => (
                                                        <div key={idx} className="relative group">
                                                            <img
                                                                src={img.path}
                                                                alt={`Image ${idx + 1}`}
                                                                className="w-full h-32 object-cover rounded-lg border border-defaultborder"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                                }}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeImage(idx)}
                                                                className="absolute top-2 right-2 ti-btn ti-btn-sm ti-btn-danger opacity-0 group-hover:opacity-100 transition-opacity"
                                                                title="Remove image"
                                                            >
                                                                <i className="ri-close-line"></i>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <small className="text-muted text-sm mt-2 d-block">
                                                    {formData.images.length} image(s) added
                                                </small>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-12 gap-y-4 mt-4 sm:mt-6">
                                <div className="xl:col-span-12 col-span-12">
                                    <button
                                        type="submit"
                                        className="ti-btn ti-btn-primary w-full !bg-primary !text-white !font-medium text-sm sm:text-base py-2.5 sm:py-3"
                                        disabled={saving}
                                    >
                                        {saving ? 'Saving...' : 'Update Profile'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Fragment>
    );
};

export default TrainerProfile;
