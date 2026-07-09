"use client";

import React from "react";
import type { Booking } from "@/services/bookingService";
import {
    formatBookingTime,
    formatDuration,
    getStatusLabel,
} from "@/shared/utils/bookingUtils";
import {
    getBookingSessions,
    getTrainerApprovalProgress,
} from "@/shared/utils/bookingSessionUtils";
import { getTrainerIdFromRef } from "@/shared/utils/bookingTrainerUtils";

export type BookingSessionsTableProps = {
    booking: Booking;
    /** Highlight the row for this trainer id (trainer portal). */
    highlightTrainerId?: string;
    showApprovalStatus?: boolean;
};

/**
 * Renders all sessions in a booking as a table.
 */
const BookingSessionsTable: React.FC<BookingSessionsTableProps> = ({
    booking,
    highlightTrainerId,
    showApprovalStatus = true,
}) => {
    const sessions = getBookingSessions(booking);
    const progress = getTrainerApprovalProgress(booking);

    if (sessions.length === 0) return null;

    return (
        <div className="mt-4">
            {sessions.length > 1 && showApprovalStatus && (
                <p className="text-sm text-muted mb-2" role="status">
                    Trainer approvals: {progress.approved} of {progress.total}
                </p>
            )}
            <div className="table-responsive rounded-lg border border-defaultborder overflow-hidden">
                <table className="table table-sm whitespace-nowrap mb-0">
                    <thead>
                        <tr>
                            <th scope="col">Trainer</th>
                            <th scope="col">Time</th>
                            <th scope="col">Duration</th>
                            <th scope="col">Training</th>
                            {showApprovalStatus && sessions.length > 1 && (
                                <th scope="col">Trainer status</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {sessions.map((session, idx) => {
                            const trainerName =
                                typeof session.trainer === "object" && session.trainer?.name
                                    ? session.trainer.name
                                    : "Trainer";
                            const trainerId = getTrainerIdFromRef(session.trainer);
                            const isHighlighted =
                                highlightTrainerId &&
                                trainerId === String(highlightTrainerId);
                            const status = session.trainerStatus || "pending";

                            return (
                                <tr
                                    key={`${trainerId}-${session.startTime}-${idx}`}
                                    className={isHighlighted ? "bg-primary/5" : undefined}
                                >
                                    <td>
                                        {trainerName}
                                        {isHighlighted && (
                                            <span className="badge bg-primary/10 text-primary ms-1 text-[0.65rem]">
                                                Your session
                                            </span>
                                        )}
                                    </td>
                                    <td>{formatBookingTime(session.startTime)}</td>
                                    <td>{formatDuration(session.duration)}</td>
                                    <td>{(session.typeOfTraining || []).join(", ") || "—"}</td>
                                    {showApprovalStatus && sessions.length > 1 && (
                                        <td>
                                            <span className="text-xs font-medium capitalize">
                                                {getStatusLabel(
                                                    status === "approved"
                                                        ? "approved"
                                                        : status === "rejected"
                                                          ? "rejected"
                                                          : "pending_approval"
                                                )}
                                            </span>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BookingSessionsTable;
