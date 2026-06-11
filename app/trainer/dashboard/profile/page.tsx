"use client";

import Pageheader from "@/shared/layout-components/page-header/pageheader";
import Seo from "@/shared/layout-components/seo/seo";
import React, { Fragment, useState } from "react";
import { isTrainerAcceptingBookings } from "@/services/trainerService";
import { useTrainerProfileForm } from "@/hooks/useTrainerProfileForm";
import CompanyTrainerProfilePanel from "@/app/company/dashboard/components/CompanyTrainerProfilePanel";
import "@/app/company/dashboard/components/company-trainer-profile-drawer.css";
import TrainerProfileEditForm from "./TrainerProfileEditForm";
import TrainerWeeklyAvailabilityEditor from "../components/TrainerWeeklyAvailabilityEditor";

const TrainerProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
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
    weeklyAvailability,
    setWeeklyAvailability,
    scheduleSaving,
    handleSaveWeeklyAvailability,
    fetchProfile,
  } = useTrainerProfileForm();

  /**
   * Saves profile edits and returns to view mode on success.
   */
  const handleSave = async (e: React.FormEvent) => {
    const saved = await handleSubmit(e);
    if (saved) setIsEditing(false);
  };

  /**
   * Discards unsaved edits and returns to read-only profile view.
   */
  const handleCancelEdit = () => {
    void fetchProfile();
    setIsEditing(false);
  };

  return (
    <Fragment>
      <Seo title="Trainer Profile" />
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
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-lg font-bold text-defaulttextcolor mb-1">
                  {isEditing ? "Edit profile" : "My profile"}
                </h2>
                <p className="text-muted text-sm mb-0">
                  {isEditing
                    ? "Update your trainer details visible to companies."
                    : "How companies see your trainer profile on Samsara Wellness."}
                </p>
              </div>
              {!isEditing && (
                <button
                  type="button"
                  className="ti-btn ti-btn-primary !bg-primary !text-white !font-semibold inline-flex items-center gap-2"
                  onClick={() => setIsEditing(true)}
                  aria-label="Edit trainer profile"
                >
                  <i className="ri-pencil-line" aria-hidden="true" />
                  Edit profile
                </button>
              )}
            </div>

            {trainer && trainer.status !== false && (
              <>
                <div className="rounded-xl border border-defaultborder p-4 mb-6 bg-gray-50 dark:bg-black/20">
                  <h4 className="font-semibold mb-1 text-base">Booking availability</h4>
                  <p className="text-muted text-sm mb-3">
                    When this is off, companies cannot book new sessions with you. Existing bookings
                    are unchanged.
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
                      {acceptingBookingsSaving ? "Saving…" : "Accept new bookings"}
                    </label>
                  </div>
                </div>
                {!isEditing && (
                  <div className="rounded-xl border border-defaultborder p-4 mb-6 bg-gray-50 dark:bg-black/20">
                    <TrainerWeeklyAvailabilityEditor
                      value={weeklyAvailability}
                      saving={scheduleSaving}
                      onChange={setWeeklyAvailability}
                      onSave={handleSaveWeeklyAvailability}
                    />
                  </div>
                )}
              </>
            )}

            {isEditing ? (
              <TrainerProfileEditForm
                trainer={trainer}
                formData={formData}
                saving={saving}
                uploadingProfilePhoto={uploadingProfilePhoto}
                uploadingGallerySlot={uploadingGallerySlot}
                profilePhotoInputRef={profilePhotoInputRef}
                galleryInputRefs={galleryInputRefs}
                setFormData={setFormData}
                patchDetails={patchDetails}
                onProfilePhotoChange={handleProfilePhotoChange}
                onGallerySlotChange={handleGallerySlotChange}
                onClearProfilePhoto={clearProfilePhoto}
                onRemoveGalleryImage={removeImage}
                onSubmit={(e) => void handleSave(e)}
                onCancel={handleCancelEdit}
              />
            ) : (
              <CompanyTrainerProfilePanel trainer={trainer} variant="embedded" />
            )}
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default TrainerProfile;
