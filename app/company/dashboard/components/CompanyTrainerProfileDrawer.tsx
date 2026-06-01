"use client";

import React from "react";
import type { Trainer } from "@/services/trainerService";
import { isTrainerAcceptingBookings } from "@/services/trainerService";
import CompanyRightDrawer from "./CompanyRightDrawer";
import {
    displayOrDash,
    formatTrainerDob,
    trainerSpecialistList,
    trainerTrainingList,
} from "./companyTrainerProfileUtils";
import TrainerQualificationsDisplay from "@/shared/components/trainer/TrainerQualificationsDisplay";

export type CompanyTrainerProfileDrawerProps = {
    open: boolean;
    trainer: Trainer | null;
    loading?: boolean;
    onClose: () => void;
    /** When omitted, drawer is read-only (no book CTA). */
    onBookSession?: (trainer: Trainer) => void;
};

/**
 * Read-only trainer profile for companies (right drawer).
 */
const CompanyTrainerProfileDrawer: React.FC<CompanyTrainerProfileDrawerProps> = ({
    open,
    trainer,
    loading = false,
    onClose,
    onBookSession,
}) => {
    const canBook = trainer ? isTrainerAcceptingBookings(trainer) : false;
    const specialists = trainer ? trainerSpecialistList(trainer.specialistIn) : [];
    const trainings = trainer ? trainerTrainingList(trainer.typeOfTraining) : [];

    const footer =
        trainer && !loading && onBookSession ? (
        <div className="flex flex-col gap-2">
            {!canBook && (
                <p className="text-xs text-warning mb-0 text-center" role="status">
                    This trainer is not accepting new bookings right now.
                </p>
            )}
            <button
                type="button"
                className="ti-btn ti-btn-primary !m-0 !float-none w-full inline-flex items-center justify-center gap-2 !px-4 !py-2.5 text-sm font-semibold min-h-[2.75rem] rounded-lg shadow-none"
                disabled={!canBook}
                onClick={() => onBookSession(trainer)}
            >
                <i className="ri-calendar-check-line text-base" aria-hidden="true"></i>
                Book Session
            </button>
        </div>
    ) : undefined;

    return (
        <CompanyRightDrawer
            open={open}
            title="Trainer profile"
            onClose={onClose}
            maxWidthClass="max-w-xl"
            ariaLabelledBy="company-trainer-profile-title"
            footer={footer}
        >
            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading profile…</span>
                    </div>
                    <p className="text-sm text-muted mb-0">Loading profile…</p>
                </div>
            ) : !trainer ? (
                <p className="text-sm text-muted">No trainer selected.</p>
            ) : (
                <div className="space-y-5">
                    <div className="text-center pb-4 border-b border-defaultborder/60">
                        {trainer.profilePhoto?.path ? (
                            <img
                                src={trainer.profilePhoto.path}
                                alt=""
                                className="w-28 h-28 rounded-full mx-auto mb-3 object-cover border-4 border-primary/20"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none";
                                }}
                            />
                        ) : (
                            <div
                                className="w-28 h-28 rounded-full bg-gradient-to-b from-primary/20 to-primary/40 flex items-center justify-center mx-auto mb-3 border-4 border-primary/20"
                                aria-hidden="true"
                            >
                                <span className="text-primary font-bold text-4xl">
                                    {trainer.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                        <h3 className="text-xl font-bold text-defaulttextcolor mb-0">{trainer.name}</h3>
                        <p className="text-muted text-sm mt-1 mb-2">{trainer.title}</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {trainer.category ? (
                                <span className="badge bg-primary/10 text-primary text-xs">{trainer.category}</span>
                            ) : null}
                            <span
                                className={`badge text-xs ${trainer.status !== false ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}
                            >
                                {trainer.status !== false ? "Active" : "Inactive"}
                            </span>
                            <span
                                className={`badge text-xs ${canBook ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}
                            >
                                {canBook ? "Accepting bookings" : "Not accepting bookings"}
                            </span>
                        </div>
                    </div>

                    {trainer.bio && trainer.bio !== "none" && (
                        <section>
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">About</h4>
                            <p className="text-sm text-defaulttextcolor leading-relaxed mb-0">{trainer.bio}</p>
                        </section>
                    )}

                    <section>
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">Training for</h4>
                        <div className="flex flex-wrap gap-1.5">
                            {specialists.length > 0 ? (
                                specialists.map((spec) => (
                                    <span key={spec} className="badge bg-info/10 text-info text-xs">
                                        {spec}
                                    </span>
                                ))
                            ) : (
                                <span className="text-sm text-muted">—</span>
                            )}
                        </div>
                    </section>

                    <section>
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">
                            Specializations
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                            {trainings.length > 0 ? (
                                trainings.map((t) => (
                                    <span key={t} className="badge bg-primary/10 text-primary text-xs">
                                        {t}
                                    </span>
                                ))
                            ) : (
                                <span className="text-sm text-muted">—</span>
                            )}
                        </div>
                    </section>

                    <section>
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">Details</h4>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-0">
                            <div>
                                <dt className="text-muted text-xs mb-0.5">Experience</dt>
                                <dd className="font-medium text-defaulttextcolor mb-0">
                                    {displayOrDash(trainer.experience)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-muted text-xs mb-0.5">City</dt>
                                <dd className="font-medium text-defaulttextcolor mb-0">{displayOrDash(trainer.city)}</dd>
                            </div>
                            <div>
                                <dt className="text-muted text-xs mb-0.5">PIN code</dt>
                                <dd className="font-medium text-defaulttextcolor mb-0">
                                    {displayOrDash(trainer.pinCode)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-muted text-xs mb-0.5">Date of birth</dt>
                                <dd className="font-medium text-defaulttextcolor mb-0">
                                    {formatTrainerDob(trainer.dateOfBirth)}
                                </dd>
                            </div>
                        </dl>
                    </section>

                    <TrainerQualificationsDisplay
                        education={trainer.education}
                        certification={trainer.certification}
                    />

                    {trainer.images && trainer.images.length > 0 && (
                        <section>
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">Gallery</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {trainer.images.map((img, idx) => (
                                    <img
                                        key={img.key || idx}
                                        src={img.path}
                                        alt={`${trainer.name} gallery ${idx + 1}`}
                                        className="w-full h-28 object-cover rounded-lg border border-defaultborder"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = "none";
                                        }}
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </CompanyRightDrawer>
    );
};

export default CompanyTrainerProfileDrawer;
