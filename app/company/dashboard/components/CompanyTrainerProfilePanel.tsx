"use client";

import React, { useEffect, useState } from "react";
import type { Trainer } from "@/services/trainerService";
import { isTrainerAcceptingBookings } from "@/services/trainerService";
import {
  displayOrDash,
  trainerSpecialistList,
  trainerTrainingList,
} from "./companyTrainerProfileUtils";
import TrainerQualificationsDisplay from "@/shared/components/trainer/TrainerQualificationsDisplay";
import TrainerAvailabilityDisplay from "@/shared/components/trainer/TrainerAvailabilityDisplay";
import TrainerRatingBadge from "@/shared/components/trainer/TrainerRatingBadge";
import TrainerCategoryBadges from "@/shared/components/trainer/TrainerCategoryBadges";
import { trainerCategoryLabels } from "@/shared/utils/trainerCategoryUtils";
import { formatTrainerCities, normalizeTrainerCities } from "@/shared/utils/trainerCityUtils";
import "./company-trainer-profile-drawer.css";

type ProfileTab = "overview" | "education" | "certifications" | "gallery";

const TABS: { id: ProfileTab; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "ri-user-line" },
  { id: "education", label: "Education", icon: "ri-graduation-cap-line" },
  { id: "certifications", label: "Certifications", icon: "ri-award-line" },
  { id: "gallery", label: "Gallery", icon: "ri-gallery-line" },
];

type CompanyTrainerProfilePanelProps = {
  trainer: Trainer | null;
  loading?: boolean;
  /** When embedded, adds card border for inline page sections. */
  variant?: "embedded" | "drawer";
};

/**
 * Tab strip for trainer profile sections.
 */
function ProfileTabs({
  active,
  onChange,
  galleryCount,
}: {
  active: ProfileTab;
  onChange: (tab: ProfileTab) => void;
  galleryCount: number;
}) {
  return (
    <div className="company-trainer-profile__tabs" role="tablist" aria-label="Trainer profile sections">
      {TABS.map(({ id, label, icon }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={active === id}
          aria-controls={`trainer-tab-${id}`}
          id={`trainer-tab-btn-${id}`}
          className={`company-trainer-profile__tab ${active === id ? "company-trainer-profile__tab--active" : ""}`}
          onClick={() => onChange(id)}
        >
          <i className={`${icon} me-1.5`} aria-hidden="true" />
          {label}
          {id === "gallery" && galleryCount > 0 ? (
            <span className="ms-1 text-[0.65rem] opacity-80">({galleryCount})</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

/**
 * Full tabbed trainer profile (overview, education, certifications, gallery).
 */
const CompanyTrainerProfilePanel: React.FC<CompanyTrainerProfilePanelProps> = ({
  trainer,
  loading = false,
  variant = "drawer",
}) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");

  useEffect(() => {
    setActiveTab("overview");
  }, [trainer?._id, trainer?.id]);

  const canBook = trainer ? isTrainerAcceptingBookings(trainer) : false;
  const categoryLabels = trainer ? trainerCategoryLabels(trainer) : [];
  const specialists = trainer ? trainerSpecialistList(trainer.specialistIn) : [];
  const trainings = trainer ? trainerTrainingList(trainer.typeOfTraining) : [];
  const galleryImages = trainer?.images?.filter((img) => img.path) ?? [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading trainer profile…</span>
        </div>
        <p className="text-sm text-gray-500 mb-0">Loading trainer profile…</p>
      </div>
    );
  }

  if (!trainer) {
    return <p className="text-sm text-gray-500 mb-0">Trainer profile unavailable.</p>;
  }

  return (
    <div
      className={
        variant === "embedded"
          ? "company-eap-detail__trainer-profile-wrap"
          : "company-trainer-profile-panel"
      }
    >
      <div className="company-trainer-profile__hero">
        {trainer.profilePhoto?.path ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={trainer.profilePhoto.path} alt="" className="company-trainer-profile__avatar" />
        ) : (
          <span className="company-trainer-profile__avatar-fallback" aria-hidden="true">
            {trainer.name.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-0 truncate">{trainer.name}</h3>
          <p className="text-sm text-gray-600 mb-1 truncate">{trainer.title}</p>
          <TrainerRatingBadge trainer={trainer} size="md" className="mb-2" />
          <div className="flex flex-wrap gap-1.5 items-center">
            <TrainerCategoryBadges labels={categoryLabels} />
            <span
              className={`text-[0.65rem] font-semibold px-2 py-0.5 rounded-full ${
                canBook ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
              }`}
            >
              {canBook ? "Accepting bookings" : "Not accepting bookings"}
            </span>
          </div>
        </div>
      </div>

      <ProfileTabs active={activeTab} onChange={setActiveTab} galleryCount={galleryImages.length} />

      <div className="company-trainer-profile__panel">
        {activeTab === "overview" && (
          <div
            id="trainer-tab-overview"
            role="tabpanel"
            aria-labelledby="trainer-tab-btn-overview"
            className="space-y-5"
          >
            {trainer.bio && trainer.bio !== "none" && (
              <section>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">About</h4>
                <p className="text-sm text-gray-700 leading-relaxed mb-0">{trainer.bio}</p>
              </section>
            )}
            <section>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                Training for
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {specialists.length > 0 ? (
                  specialists.map((spec) => (
                    <span key={spec} className="text-xs px-2 py-1 rounded-md bg-sky-50 text-sky-800">
                      {spec}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-400">—</span>
                )}
              </div>
            </section>
            <section>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                Specializations
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {trainings.length > 0 ? (
                  trainings.map((t) => (
                    <span key={t} className="text-xs px-2 py-1 rounded-md bg-primary/5 text-primary">
                      {t}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-400">—</span>
                )}
              </div>
            </section>
            <TrainerAvailabilityDisplay
              schedule={trainer.weeklyAvailability}
              acceptingBookings={canBook}
              className="mb-1"
            />
            <section>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Details</h4>
              <dl className="grid grid-cols-2 gap-3 text-sm mb-0">
                <div className="rounded-lg border border-gray-100 p-3 bg-gray-50/50">
                  <dt className="text-gray-500 text-xs">Experience</dt>
                  <dd className="font-medium text-gray-900 mb-0">{displayOrDash(trainer.experience)}</dd>
                </div>
                <div className="rounded-lg border border-gray-100 p-3 bg-gray-50/50">
                  <dt className="text-gray-500 text-xs">Cities</dt>
                  <dd className="font-medium text-gray-900 mb-0">
                    {displayOrDash(formatTrainerCities(normalizeTrainerCities(trainer)))}
                  </dd>
                </div>
              </dl>
            </section>
          </div>
        )}

        {activeTab === "education" && (
          <div id="trainer-tab-education" role="tabpanel" aria-labelledby="trainer-tab-btn-education">
            <TrainerQualificationsDisplay
              education={trainer.education}
              certification={trainer.certification}
              showEducation
              showCertification={false}
            />
          </div>
        )}

        {activeTab === "certifications" && (
          <div
            id="trainer-tab-certifications"
            role="tabpanel"
            aria-labelledby="trainer-tab-btn-certifications"
          >
            <TrainerQualificationsDisplay
              education={trainer.education}
              certification={trainer.certification}
              showEducation={false}
              showCertification
            />
          </div>
        )}

        {activeTab === "gallery" && (
          <div id="trainer-tab-gallery" role="tabpanel" aria-labelledby="trainer-tab-btn-gallery">
            {galleryImages.length === 0 ? (
              <p className="company-trainer-profile__empty mb-0">No gallery photos uploaded yet.</p>
            ) : (
              <div className="company-trainer-profile__gallery-grid">
                {galleryImages.map((img, idx) => (
                  <div key={img.key || idx} className="company-trainer-profile__gallery-item">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.path}
                      alt={`${trainer.name} photo ${idx + 1}`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).parentElement!.style.display = "none";
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyTrainerProfilePanel;
