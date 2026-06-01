"use client";

import React from "react";
import type { Trainer } from "@/services/trainerService";
import { isTrainerAcceptingBookings } from "@/services/trainerService";
import CrmRightDrawer from "../components/CrmRightDrawer";
import {
    displayOrDash,
    formatTrainerDob,
    trainerSpecialistList,
    trainerTrainingList,
} from "@/app/company/dashboard/components/companyTrainerProfileUtils";
import TrainerQualificationsDisplay from "@/shared/components/trainer/TrainerQualificationsDisplay";

export type AdminTrainerProfileDrawerProps = {
    open: boolean;
    trainer: Trainer | null;
    loading?: boolean;
    onClose: () => void;
    stacked?: boolean;
};

/**
 * Read-only trainer profile drawer for CRM admin.
 */
const AdminTrainerProfileDrawer: React.FC<AdminTrainerProfileDrawerProps> = ({
    open,
    trainer,
    loading = false,
    onClose,
    stacked = false,
}) => {
    const specialists = trainer ? trainerSpecialistList(trainer.specialistIn) : [];
    const trainings = trainer ? trainerTrainingList(trainer.typeOfTraining) : [];
    const canBook = trainer ? isTrainerAcceptingBookings(trainer) : false;

    return (
        <CrmRightDrawer
            open={open}
            title="Trainer profile"
            onClose={onClose}
            maxWidthClass="max-w-xl"
            ariaLabelledBy="admin-trainer-profile-title"
            zIndexClass={stacked ? "z-[1060]" : "z-[1050]"}
        >
            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading trainer…</span>
                    </div>
                    <p className="text-sm text-muted mb-0">Loading trainer…</p>
                </div>
            ) : !trainer ? (
                <p className="text-sm text-muted mb-0">No trainer selected.</p>
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
                                <dt className="text-muted text-xs mb-0.5">Email</dt>
                                <dd className="font-medium text-defaulttextcolor mb-0 break-all">
                                    {displayOrDash(trainer.email)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-muted text-xs mb-0.5">Mobile</dt>
                                <dd className="font-medium text-defaulttextcolor mb-0">
                                    {displayOrDash(trainer.mobile)}
                                </dd>
                            </div>
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
        </CrmRightDrawer>
    );
};

export default AdminTrainerProfileDrawer;
