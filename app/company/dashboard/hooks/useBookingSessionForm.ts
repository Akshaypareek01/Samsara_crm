"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import TrainerService, { Trainer } from "@/services/trainerService";
import companyService from "@/services/companyService";
import bookingService, {
    CheckAvailabilityResult,
    CreateMultiSessionBookingRequest,
} from "@/services/bookingService";
import { getMinBookingDate, isBookingDateAllowed, validateDuration } from "@/shared/utils/bookingUtils";
import { isWithinWeeklyAvailability } from "@/shared/components/booking/BookingStartTimeField";

/** Local form state for one session row. */
export interface SessionFormRow {
    key: string;
    trainerId: string;
    startTime: string;
    duration: number;
    typeOfTraining: string[];
}

export interface UseBookingSessionFormOptions {
    isOpen: boolean;
    maxSessions?: number;
}

/**
 * Manages multi-session booking form state, trainer list, and availability checks.
 *
 * @param options - Hook configuration.
 */
export function useBookingSessionForm({ isOpen, maxSessions = 10 }: UseBookingSessionFormOptions) {
    const [companyId, setCompanyId] = useState("");
    const [bookingDate, setBookingDate] = useState("");
    const [notes, setNotes] = useState("");
    const [sessions, setSessions] = useState<SessionFormRow[]>([]);
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [loadingTrainers, setLoadingTrainers] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [availability, setAvailability] = useState<CheckAvailabilityResult[]>([]);
    const [checkingAvailability, setCheckingAvailability] = useState(false);

    const minBookingDate = getMinBookingDate();

    const createEmptySession = useCallback((): SessionFormRow => ({
        key: `session-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        trainerId: "",
        startTime: "",
        duration: 2,
        typeOfTraining: [],
    }), []);

    const resetForm = useCallback(() => {
        setBookingDate("");
        setNotes("");
        setSessions([createEmptySession()]);
        setAvailability([]);
    }, [createEmptySession]);

    useEffect(() => {
        if (!isOpen) return;

        const load = async () => {
            try {
                setLoadingTrainers(true);
                const [profile, trainerRes] = await Promise.all([
                    companyService.getCompanyProfile(),
                    TrainerService.getTrainers({
                        status: true,
                        acceptingBookings: true,
                        limit: 100,
                    }),
                ]);
                setCompanyId(profile._id || profile.id || "");
                setTrainers(trainerRes.results || []);
                resetForm();
            } catch (error) {
                console.error("Failed to load booking form data:", error);
            } finally {
                setLoadingTrainers(false);
            }
        };

        void load();
    }, [isOpen, resetForm]);

    const trainerMap = useMemo(() => {
        const map = new Map<string, Trainer>();
        trainers.forEach((t) => {
            const id = t._id || t.id;
            if (id) map.set(id, t);
        });
        return map;
    }, [trainers]);

    const selectedTrainerIds = useMemo(
        () => new Set(sessions.map((s) => s.trainerId).filter(Boolean)),
        [sessions]
    );

    /**
     * Updates a session row by key.
     */
    const updateSession = useCallback((key: string, patch: Partial<SessionFormRow>) => {
        setSessions((prev) =>
            prev.map((row) => (row.key === key ? { ...row, ...patch } : row))
        );
    }, []);

    /**
     * Adds a new empty session row.
     */
    const addSession = useCallback(() => {
        setSessions((prev) => {
            if (prev.length >= maxSessions) return prev;
            return [...prev, createEmptySession()];
        });
    }, [createEmptySession, maxSessions]);

    /**
     * Removes a session row (keeps at least one).
     */
    const removeSession = useCallback((key: string) => {
        setSessions((prev) => {
            if (prev.length <= 1) return prev;
            return prev.filter((row) => row.key !== key);
        });
    }, []);

    /**
     * Trainers available for a given row (excludes trainers picked in other rows).
     */
    const getAvailableTrainersForRow = useCallback(
        (rowKey: string): Trainer[] => {
            const current = sessions.find((s) => s.key === rowKey);
            return trainers.filter((t) => {
                const id = t._id || t.id || "";
                if (!id) return false;
                if (current?.trainerId === id) return true;
                return !selectedTrainerIds.has(id);
            });
        },
        [sessions, selectedTrainerIds, trainers]
    );

    /**
     * Runs server-side availability check when date and sessions are filled.
     */
    const runAvailabilityCheck = useCallback(async () => {
        const completeSessions = sessions.filter(
            (s) => s.trainerId && s.startTime && s.duration
        );
        if (!bookingDate || completeSessions.length === 0) {
            setAvailability([]);
            return;
        }

        try {
            setCheckingAvailability(true);
            const res = await bookingService.checkBookingAvailability({
                bookingDate,
                sessions: completeSessions.map((s) => ({
                    trainer: s.trainerId,
                    startTime: s.startTime,
                    duration: s.duration,
                })),
            });
            setAvailability(res.results || []);
        } catch {
            setAvailability([]);
        } finally {
            setCheckingAvailability(false);
        }
    }, [bookingDate, sessions]);

    useEffect(() => {
        const timer = setTimeout(() => {
            void runAvailabilityCheck();
        }, 400);
        return () => clearTimeout(timer);
    }, [runAvailabilityCheck]);

    /**
     * Client-side validation before submit.
     */
    const validate = useCallback((): string | null => {
        if (!bookingDate) return "Please select a booking date";
        if (!isBookingDateAllowed(bookingDate)) {
            return "Booking date must be tomorrow or later";
        }
        if (sessions.length === 0) return "Add at least one session";

        const trainerSet = new Set<string>();
        for (let i = 0; i < sessions.length; i++) {
            const row = sessions[i];
            const label = `Session ${i + 1}`;
            if (!row.trainerId) return `${label}: select a trainer`;
            if (trainerSet.has(row.trainerId)) {
                return "Each trainer can only appear once per booking";
            }
            trainerSet.add(row.trainerId);
            if (!row.startTime) return `${label}: select a start time`;
            if (!validateDuration(row.duration)) {
                return `${label}: duration must be between 0.5 and 24 hours`;
            }
            if (row.typeOfTraining.length === 0) {
                return `${label}: select at least one training type`;
            }

            const trainer = trainerMap.get(row.trainerId);
            if (trainer?.weeklyAvailability?.length) {
                if (
                    !isWithinWeeklyAvailability(
                        trainer.weeklyAvailability,
                        bookingDate,
                        row.startTime,
                        row.duration
                    )
                ) {
                    return `${label}: time is outside trainer availability`;
                }
            }

            const bookingDateTime = new Date(`${bookingDate}T${row.startTime}`);
            if (bookingDateTime <= new Date()) {
                return `${label}: date and time must be in the future`;
            }

            const avail = availability.find((a) => a.index === i);
            if (avail && !avail.available) {
                return `${label}: ${avail.reason || "not available"}`;
            }
        }

        return null;
    }, [availability, bookingDate, sessions, trainerMap]);

    /**
     * Builds API payload from current form state.
     */
    const buildPayload = useCallback((): CreateMultiSessionBookingRequest => ({
        company: companyId,
        bookingDate,
        notes: notes.trim() || undefined,
        sessions: sessions.map((s) => ({
            trainer: s.trainerId,
            startTime: s.startTime,
            duration: s.duration,
            typeOfTraining: s.typeOfTraining,
        })),
    }), [bookingDate, companyId, notes, sessions]);

    /**
     * Submits the multi-session booking.
     */
    const submit = useCallback(async (): Promise<void> => {
        const error = validate();
        if (error) throw new Error(error);
        setSubmitting(true);
        try {
            await bookingService.createMultiSessionBooking(buildPayload());
        } finally {
            setSubmitting(false);
        }
    }, [buildPayload, validate]);

    return {
        companyId,
        bookingDate,
        setBookingDate,
        notes,
        setNotes,
        sessions,
        updateSession,
        addSession,
        removeSession,
        trainers,
        trainerMap,
        loadingTrainers,
        submitting,
        availability,
        checkingAvailability,
        minBookingDate,
        maxSessions,
        getAvailableTrainersForRow,
        validate,
        submit,
        resetForm,
    };
}
