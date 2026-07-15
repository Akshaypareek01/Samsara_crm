"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import wellnessFeedbackService, {
    type WellnessFeedbackContext,
} from "@/services/wellnessFeedbackService";
import WellnessFeedbackForm from "./components/WellnessFeedbackForm";
import "./wellness-feedback.css";

/**
 * Loads booking context from token and renders the feedback form.
 */
const WellnessFeedbackPageInner = () => {
    const searchParams = useSearchParams();
    const token = searchParams.get("token") || "";
    const [context, setContext] = useState<WellnessFeedbackContext | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!token) {
            setError("This feedback link is missing or invalid. Ask your company admin for a new link.");
            setLoading(false);
            return;
        }

        let cancelled = false;

        const load = async () => {
            try {
                setLoading(true);
                setError("");
                const data = await wellnessFeedbackService.getFeedbackContext(token);
                if (!cancelled) setContext(data);
            } catch (err: unknown) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Unable to load this feedback form. The link may have expired."
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        void load();
        return () => {
            cancelled = true;
        };
    }, [token]);

    if (loading) {
        return (
            <div className="wellness-feedback-page wellness-feedback-page--centered" role="status">
                <p className="wellness-feedback-page__message">Loading feedback form…</p>
            </div>
        );
    }

    if (error || !context) {
        return (
            <div className="wellness-feedback-page wellness-feedback-page--centered" role="alert">
                <p className="wellness-feedback-page__message">{error || "Feedback form unavailable."}</p>
            </div>
        );
    }

    return <WellnessFeedbackForm token={token} context={context} />;
};

const WellnessFeedbackPage = () => (
    <Suspense
        fallback={
            <div className="wellness-feedback-page wellness-feedback-page--centered" role="status">
                <p className="wellness-feedback-page__message">Loading…</p>
            </div>
        }
    >
        <WellnessFeedbackPageInner />
    </Suspense>
);

export default WellnessFeedbackPage;
