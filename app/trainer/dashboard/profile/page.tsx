"use client";
import Pageheader from '@/shared/layout-components/page-header/pageheader';
import Seo from '@/shared/layout-components/seo/seo';
import React, { Fragment } from 'react';
import {
  SPECIALIST_OPTIONS,
  TRAINER_CATEGORY_OPTIONS,
  TYPE_OF_TRAINING_OPTIONS,
  isTrainerAcceptingBookings,
  mergeTrainerSelectOptions,
} from '@/services/trainerService';
import MultiSelect from '@/shared/components/MultiSelect';
import TrainerPersonalDetailsFields from '@/shared/components/trainer/TrainerPersonalDetailsFields';
import TrainerQualificationFields from '@/shared/components/trainer/TrainerQualificationFields';
import TrainerFormSectionHeader from '@/shared/components/trainer/TrainerFormSectionHeader';
import TrainerPhotosFields from '@/shared/components/trainer/TrainerPhotosFields';
import TrainerProfileBanner from '@/shared/components/trainer/TrainerProfileBanner';
import { useTrainerProfileForm } from '@/hooks/useTrainerProfileForm';

const TrainerProfile = () => {
    const {
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
    } = useTrainerProfileForm();

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
                    <div className="box-body !p-4 sm:!p-6 md:!p-8">
                        <TrainerProfileBanner
                            name={formData.name || trainer?.name || ''}
                            title={formData.title || trainer?.title}
                            email={trainer?.email}
                            mobile={trainer?.mobile}
                            category={formData.category || trainer?.category}
                            profilePhoto={formData.profilePhoto}
                        />

                        {trainer && trainer.status !== false && (
                            <div className="rounded-xl border border-defaultborder p-4 mb-6 bg-gray-50 dark:bg-black/20">
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

                        <form onSubmit={handleSubmit} className="space-y-7">
                            <section>
                                <TrainerFormSectionHeader number={1} title="Basic Information" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="form-label" htmlFor="profile-name">
                                            Full Name <span className="text-danger">*</span>
                                        </label>
                                        <div className="relative">
                                            <i className="ri-user-line absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true"></i>
                                            <input
                                                id="profile-name"
                                                type="text"
                                                className="form-control border-2 focus:border-primary !ps-10"
                                                value={formData.name}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                                                }
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="form-label" htmlFor="profile-title">
                                            Professional Title <span className="text-danger">*</span>
                                        </label>
                                        <div className="relative">
                                            <i className="ri-award-line absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true"></i>
                                            <input
                                                id="profile-title"
                                                type="text"
                                                className="form-control border-2 focus:border-primary !ps-10"
                                                value={formData.title}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                                                }
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
                                            <i className="ri-price-tag-3-line absolute left-3 top-1/2 -translate-y-1/2 text-muted z-10" aria-hidden="true"></i>
                                            <select
                                                id="profile-trainer-category"
                                                className="form-control border-2 focus:border-primary !ps-10"
                                                value={formData.category || ''}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({ ...prev, category: e.target.value }))
                                                }
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
                                        <label className="form-label" htmlFor="profile-email">Email</label>
                                        <div className="relative">
                                            <i className="ri-mail-line absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true"></i>
                                            <input
                                                id="profile-email"
                                                type="email"
                                                className="form-control border-2 !ps-10 bg-gray-50 dark:bg-black/20"
                                                value={trainer?.email || ''}
                                                readOnly
                                                disabled
                                                aria-readonly="true"
                                            />
                                        </div>
                                        <small className="text-muted">Contact support to change email</small>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="form-label" htmlFor="profile-mobile">Mobile Number</label>
                                        <div className="relative">
                                            <i className="ri-phone-line absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true"></i>
                                            <input
                                                id="profile-mobile"
                                                type="tel"
                                                className="form-control border-2 !ps-10 bg-gray-50 dark:bg-black/20"
                                                value={trainer?.mobile || ''}
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
                                            onChange={(e) =>
                                                setFormData((prev) => ({ ...prev, bio: e.target.value }))
                                            }
                                            maxLength={2000}
                                            placeholder="Describe your expertise, philosophy, and experience..."
                                            required
                                        />
                                        <div className="flex justify-end">
                                            <small
                                                className={`text-xs ${(formData.bio || '').length > 1900 ? 'text-warning' : 'text-muted'}`}
                                            >
                                                {(formData.bio || '').length}/2000 characters
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
                                        options={mergeTrainerSelectOptions(
                                            SPECIALIST_OPTIONS,
                                            formData.specialistIn
                                        )}
                                        value={Array.isArray(formData.specialistIn) ? formData.specialistIn : []}
                                        onChange={(selected) =>
                                            setFormData((prev) => ({ ...prev, specialistIn: selected }))
                                        }
                                        placeholder="Select audience..."
                                        required
                                        maxHeight="200px"
                                        showTags={true}
                                    />
                                    <MultiSelect
                                        label="Specializations"
                                        options={mergeTrainerSelectOptions(
                                            TYPE_OF_TRAINING_OPTIONS,
                                            formData.typeOfTraining
                                        )}
                                        value={Array.isArray(formData.typeOfTraining) ? formData.typeOfTraining : []}
                                        onChange={(selected) =>
                                            setFormData((prev) => ({ ...prev, typeOfTraining: selected }))
                                        }
                                        placeholder="Select specializations..."
                                        required
                                        maxHeight="300px"
                                        showTags={true}
                                    />
                                </div>
                            </section>

                            <section className="pt-6 border-t border-defaultborder/60">
                                <TrainerFormSectionHeader
                                    number={3}
                                    title="Education & Certifications"
                                    subtitle="optional"
                                />
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
                                    onProfilePhotoChange={handleProfilePhotoChange}
                                    onGallerySlotChange={handleGallerySlotChange}
                                    onClearProfilePhoto={clearProfilePhoto}
                                    onRemoveGalleryImage={removeImage}
                                />
                            </section>

                            <button
                                type="submit"
                                className="ti-btn ti-btn-primary w-full !bg-primary !text-white !font-semibold text-sm sm:text-base !py-3 inline-flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-70"
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm" role="status"></span>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <i className="ri-save-line" aria-hidden="true"></i>
                                        Update Profile
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </Fragment>
    );
};

export default TrainerProfile;
