"use client";

import { useCallback, useState } from "react";
import type { Booking } from "@/services/bookingService";
import TrainerService, { type Trainer } from "@/services/trainerService";
import { getBookingTrainer, getTrainerIdFromRef } from "@/shared/utils/bookingTrainerUtils";
import Swal from "sweetalert2";

/**
 * Loads and shows the company trainer profile drawer.
 */
export function useCompanyTrainerProfileDrawer() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [trainer, setTrainer] = useState<Trainer | null>(null);

    /**
     * Opens the drawer and fetches the full trainer profile.
     *
     * @param trainerRef - Trainer id string or populated trainer from a booking.
     */
    const openTrainerProfile = useCallback(async (trainerRef: Booking["trainer"] | string) => {
        const id = getTrainerIdFromRef(trainerRef);
        if (!id) return;

        setOpen(true);
        setLoading(true);

        const partial =
            typeof trainerRef === "object" && trainerRef
                ? (trainerRef as Trainer)
                : getBookingTrainer({ trainer: trainerRef } as Booking);
        if (partial?.name) {
            setTrainer(partial);
        }

        try {
            const full = await TrainerService.getTrainerById(id);
            setTrainer(full);
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Failed to load trainer profile";
            void Swal.fire({ icon: "error", title: "Error", text: msg });
            setOpen(false);
            setTrainer(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const closeTrainerProfile = useCallback(() => {
        setOpen(false);
        setTrainer(null);
    }, []);

    return {
        trainerDrawerOpen: open,
        trainerDrawerLoading: loading,
        profileTrainer: trainer,
        openTrainerProfile,
        closeTrainerProfile,
    };
}
