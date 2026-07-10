"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import type { Trainer } from "@/services/trainerService";
import CompanyRightDrawer from "./CompanyRightDrawer";
import { trainerProfilePageUrl } from "../utils/trainerProfilePageUrl";
import { trainerCategoryLabels } from "../utils/trainerCardDisplayUtils";
import { trainerSpecialistList } from "./companyTrainerProfileUtils";
import "./company-booking-drawer.css";

export type CompanyTrainerPickerDrawerProps = {
    open: boolean;
    trainers: Trainer[];
    selectedTrainerId?: string;
    returnTo?: string;
    sessionLabel?: string;
    onClose: () => void;
    onSelect: (trainerId: string) => void;
};

/**
 * Filters trainers by name, title, category, or specialization labels.
 *
 * @param trainers - Full trainer list for the session row.
 * @param query - Search string from the drawer input.
 */
function filterTrainersForPicker(trainers: Trainer[], query: string): Trainer[] {
    const q = query.trim().toLowerCase();
    if (!q) return trainers;

    return trainers.filter((trainer) => {
        const haystack = [
            trainer.name,
            trainer.title,
            trainer.bio,
            ...trainerCategoryLabels(trainer),
            ...trainerSpecialistList(trainer.specialistIn),
            ...(Array.isArray(trainer.typeOfTraining)
                ? trainer.typeOfTraining
                : trainer.typeOfTraining
                  ? [trainer.typeOfTraining]
                  : []),
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        return haystack.includes(q);
    });
}

/**
 * Right drawer to search and pick a trainer for a booking session.
 */
const CompanyTrainerPickerDrawer: React.FC<CompanyTrainerPickerDrawerProps> = ({
    open,
    trainers,
    selectedTrainerId,
    returnTo = "/company/dashboard/bookings/new",
    sessionLabel = "session",
    onClose,
    onSelect,
}) => {
    const [search, setSearch] = useState("");

    const filtered = useMemo(
        () => filterTrainersForPicker(trainers, search),
        [trainers, search]
    );

    const handleClose = () => {
        setSearch("");
        onClose();
    };

    const handleSelect = (trainerId: string) => {
        onSelect(trainerId);
        setSearch("");
        onClose();
    };

    return (
        <CompanyRightDrawer
            open={open}
            title={`Select trainer for ${sessionLabel}`}
            onClose={handleClose}
            maxWidthClass="max-w-md"
            ariaLabelledBy="company-trainer-picker-title"
            stacked
        >
            <div className="p-4 space-y-4">
                <div>
                    <label className="form-label text-sm" htmlFor="trainer-picker-search">
                        Search trainers
                    </label>
                    <div className="relative">
                        <i
                            className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                            aria-hidden="true"
                        />
                        <input
                            id="trainer-picker-search"
                            type="search"
                            className="form-control !ps-10"
                            placeholder="Name, title, specialization…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            aria-label="Search trainers by name or specialization"
                        />
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <p className="text-sm text-muted text-center py-8 mb-0">
                        No trainers match your search.
                    </p>
                ) : (
                    <ul className="space-y-3 list-none p-0 m-0" role="listbox" aria-label="Available trainers">
                        {filtered.map((trainer) => {
                            const id = trainer._id || trainer.id || "";
                            if (!id) return null;
                            const isSelected = selectedTrainerId === id;
                            const specialists = trainerSpecialistList(trainer.specialistIn).slice(0, 3);

                            return (
                                <li key={id} role="option" aria-selected={isSelected}>
                                    <article className="company-trainer-picker-card rounded-xl border border-defaultborder p-3 bg-white dark:bg-bodybg">
                                        <div className="flex items-start gap-3">
                                            {trainer.profilePhoto?.path ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={trainer.profilePhoto.path}
                                                    alt=""
                                                    className="w-12 h-12 rounded-full object-cover border border-primary/20 shrink-0"
                                                />
                                            ) : (
                                                <span
                                                    className="w-12 h-12 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center shrink-0"
                                                    aria-hidden="true"
                                                >
                                                    {trainer.name.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold mb-0 truncate">
                                                    {trainer.name}
                                                </p>
                                                <p className="text-xs text-muted mb-1 truncate">
                                                    {trainer.title}
                                                </p>
                                                {specialists.length > 0 && (
                                                    <p className="text-xs text-muted mb-0 line-clamp-2">
                                                        {specialists.join(" · ")}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="company-trainer-picker-card__actions mt-3">
                                            <button
                                                type="button"
                                                className={`company-trainer-picker-card__btn ti-btn ${
                                                    isSelected ? "ti-btn-success" : "ti-btn-primary"
                                                }`}
                                                onClick={() => handleSelect(id)}
                                            >
                                                {isSelected ? "Selected" : "Select"}
                                            </button>
                                            <Link
                                                href={trainerProfilePageUrl(id, returnTo)}
                                                className="company-trainer-picker-card__btn ti-btn ti-btn-light"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                View profile
                                                <i
                                                    className="ri-arrow-right-line shrink-0"
                                                    aria-hidden="true"
                                                />
                                            </Link>
                                        </div>
                                    </article>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </CompanyRightDrawer>
    );
};

export default CompanyTrainerPickerDrawer;
