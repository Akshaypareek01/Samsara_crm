"use client";

import React from "react";
import type { Trainer } from "@/services/trainerService";
import {
    displayOrDash,
    trainerSpecialistList,
    trainerTrainingList,
} from "./companyTrainerProfileUtils";
import { trainerCategoryLabels } from "../utils/trainerCardDisplayUtils";
import { trainerLocationLine } from "../utils/trainerCardDisplayUtils";
import TrainerCategoryBadges from "@/shared/components/trainer/TrainerCategoryBadges";

type CompanyBookingTrainerPreviewProps = {
    trainer: Trainer;
};

/**
 * Trainer summary column shown in the booking drawer (details + gallery).
 */
const CompanyBookingTrainerPreview: React.FC<CompanyBookingTrainerPreviewProps> = ({
    trainer,
}) => {
    const specialists = trainerSpecialistList(trainer.specialistIn);
    const trainings = trainerTrainingList(trainer.typeOfTraining);
    const categoryLabels = trainerCategoryLabels(trainer);
    const location = trainerLocationLine(trainer);
    const galleryImages = trainer.images?.filter((img) => img.path) ?? [];
    const bio =
        trainer.bio && trainer.bio !== "none" ? trainer.bio.trim() : "";

    return (
        <div className="company-booking-preview" aria-label="Trainer information">
            <div className="company-booking-preview__hero">
                {trainer.profilePhoto?.path ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={trainer.profilePhoto.path}
                        alt=""
                        className="company-booking-preview__avatar"
                    />
                ) : (
                    <span className="company-booking-preview__avatar-fallback" aria-hidden="true">
                        {trainer.name.charAt(0).toUpperCase()}
                    </span>
                )}
                <div className="min-w-0">
                    <h3 className="company-booking-preview__name">{trainer.name}</h3>
                    <p className="company-booking-preview__title">{trainer.title}</p>
                    {categoryLabels.length > 0 && (
                        <TrainerCategoryBadges labels={categoryLabels} className="mt-1" />
                    )}
                </div>
            </div>

            {bio && (
                <section className="company-booking-preview__section">
                    <h4 className="company-booking-preview__label">About</h4>
                    <p className="company-booking-preview__text">{bio}</p>
                </section>
            )}

            <section className="company-booking-preview__section">
                <h4 className="company-booking-preview__label">Details</h4>
                <dl className="company-booking-preview__details">
                    {location && (
                        <div>
                            <dt>Location</dt>
                            <dd>{location}</dd>
                        </div>
                    )}
                    <div>
                        <dt>Experience</dt>
                        <dd>{displayOrDash(trainer.experience)}</dd>
                    </div>
                    {trainer.duration && (
                        <div>
                            <dt>Typical session</dt>
                            <dd>{trainer.duration}</dd>
                        </div>
                    )}
                </dl>
            </section>

            {specialists.length > 0 && (
                <section className="company-booking-preview__section">
                    <h4 className="company-booking-preview__label">Training for</h4>
                    <div className="company-booking-preview__chips">
                        {specialists.map((s) => (
                            <span key={s} className="company-booking-preview__chip">
                                {s}
                            </span>
                        ))}
                    </div>
                </section>
            )}

            {trainings.length > 0 && (
                <section className="company-booking-preview__section">
                    <h4 className="company-booking-preview__label">Specializations</h4>
                    <div className="company-booking-preview__chips">
                        {trainings.map((t) => (
                            <span
                                key={t}
                                className="company-booking-preview__chip company-booking-preview__chip--violet"
                            >
                                {t}
                            </span>
                        ))}
                    </div>
                </section>
            )}

            <section className="company-booking-preview__section">
                <h4 className="company-booking-preview__label">
                    Gallery
                    {galleryImages.length > 0 ? ` (${galleryImages.length})` : ""}
                </h4>
                {galleryImages.length === 0 ? (
                    <p className="company-booking-preview__empty">No photos uploaded.</p>
                ) : (
                    <div className="company-booking-preview__gallery">
                        {galleryImages.map((img, idx) => (
                            <div key={img.key || idx} className="company-booking-preview__gallery-item">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={img.path}
                                    alt={`${trainer.name} ${idx + 1}`}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).parentElement!.style.display =
                                            "none";
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default CompanyBookingTrainerPreview;
