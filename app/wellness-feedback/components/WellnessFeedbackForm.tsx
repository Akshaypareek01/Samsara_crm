"use client";

import React, { useMemo, useState } from "react";
import wellnessFeedbackService, {
    type WellnessFeedbackContext,
} from "@/services/wellnessFeedbackService";
import {
    WELLNESS_FEEDBACK_CITY_OPTIONS,
    WELLNESS_FEEDBACK_ENJOYED_OPTIONS,
    WELLNESS_FEEDBACK_TOPIC_OPTIONS,
    WELLNESS_SATISFACTION_OPTIONS,
    WELLNESS_STRESS_RELIEF_OPTIONS,
    WELLNESS_WANT_MORE_OPTIONS,
    TRAINER_RATING_CRITERIA,
} from "@/constants/wellnessFeedbackFormOptions";
import SessionAttendedDropdown from "./SessionAttendedDropdown";
import TrainerEvaluationBlock, {
    type TrainerFormState,
} from "./TrainerEvaluationBlock";

export type WellnessFeedbackFormProps = {
    token: string;
    context: WellnessFeedbackContext;
};

/**
 * Public employee wellness feedback form matching the reference HTML design.
 */
const WellnessFeedbackForm: React.FC<WellnessFeedbackFormProps> = ({ token, context }) => {
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const [employeeName, setEmployeeName] = useState("");
    const [city, setCity] = useState(context.city || "");
    const [companyName, setCompanyName] = useState(context.companyName || "");
    const [sessionDate, setSessionDate] = useState(context.sessionDate || "");
    const [sessionsAttended, setSessionsAttended] = useState<string[]>(
        context.sessionAttendedPrefill || []
    );
    const [overallSatisfaction, setOverallSatisfaction] = useState("");
    const [stressRelief, setStressRelief] = useState("");
    const [wantMoreSessions, setWantMoreSessions] = useState("");
    const [enjoyedActivities, setEnjoyedActivities] = useState<string[]>(
        context.sessionAttendedPrefill || []
    );
    const [preferredTopics, setPreferredTopics] = useState<string[]>([]);
    const [otherTopic, setOtherTopic] = useState("");
    const [additionalComments, setAdditionalComments] = useState("");

    const initialTrainerState = useMemo(() => {
        const map: Record<string, TrainerFormState> = {};
        for (const trainer of context.trainers) {
            map[trainer.trainerId] = { ratings: {}, likedMost: "", suggestions: "" };
        }
        return map;
    }, [context.trainers]);

    const [trainerStates, setTrainerStates] =
        useState<Record<string, TrainerFormState>>(initialTrainerState);

    const updateTrainerState = (trainerId: string, patch: Partial<TrainerFormState>) => {
        setTrainerStates((prev) => ({
            ...prev,
            [trainerId]: { ...prev[trainerId], ...patch },
        }));
    };

    const toggleCheckbox = (
        list: string[],
        value: string,
        setter: (next: string[]) => void
    ) => {
        if (list.includes(value)) setter(list.filter((v) => v !== value));
        else setter([...list, value]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError("");

        if (!overallSatisfaction || !stressRelief || !wantMoreSessions) {
            setSubmitError("Please complete all required satisfaction questions.");
            return;
        }

        const missingTrainerRatings = context.trainers.some((trainer) => {
            const ratings = trainerStates[trainer.trainerId]?.ratings || {};
            return TRAINER_RATING_CRITERIA.some((criterion) => !ratings[criterion.key]);
        });
        if (missingTrainerRatings) {
            setSubmitError("Please rate the trainer on all criteria before submitting.");
            return;
        }

        try {
            setSubmitting(true);
            await wellnessFeedbackService.submitFeedback({
                token,
                employeeName: employeeName.trim(),
                city: city.trim(),
                companyName: companyName.trim(),
                sessionDate: sessionDate || undefined,
                sessionsAttended,
                trainerMode: context.trainers.length > 1 ? "both" : "trainer",
                trainers: context.trainers.map((trainer) => ({
                    trainerId: trainer.trainerId,
                    order: trainer.order,
                    name: trainer.name,
                    ratings: trainerStates[trainer.trainerId]?.ratings || {},
                    likedMost: trainerStates[trainer.trainerId]?.likedMost || "",
                    suggestions: trainerStates[trainer.trainerId]?.suggestions || "",
                })),
                overallSatisfaction,
                enjoyedActivities,
                stressRelief,
                wantMoreSessions,
                preferredTopics: otherTopic.trim()
                    ? [...preferredTopics, `Other: ${otherTopic.trim()}`]
                    : preferredTopics,
                additionalComments: additionalComments.trim(),
            });
            setSubmitted(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (err: unknown) {
            setSubmitError(
                err instanceof Error ? err.message : "Failed to submit feedback. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="wellness-feedback-page">
                <div className="hero">
                    <span className="leaf" aria-hidden="true">🌿</span>
                    <h1>Samsara Wellness 365</h1>
                </div>
                <div className="wrap">
                    <div className="thankyou show" role="status">
                        <span className="leaf" aria-hidden="true">🌿</span>
                        <h2>Thank You!</h2>
                        <p>
                            Your feedback has been recorded. We appreciate you taking the time to
                            help us build healthier, happier workplaces.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="wellness-feedback-page">
            <div className="hero">
                <span className="leaf" aria-hidden="true">🌿</span>
                <h1>Samsara Wellness 365</h1>
                <p>
                    Employee Wellness Session Feedback — thank you for attending today&apos;s session.
                    Your feedback helps us improve future programs and create a healthier workplace.
                </p>
            </div>

            <div className="wrap">
                <form id="feedbackForm" onSubmit={(e) => void handleSubmit(e)}>
                    <div className="section">
                        <div className="section-title">
                            <span className="dot" aria-hidden="true" />
                            Employee Details
                        </div>
                        <div className="field">
                            <label className="field-label" htmlFor="employee-name">
                                Name <span className="opt">(Optional)</span>
                            </label>
                            <input
                                id="employee-name"
                                type="text"
                                placeholder="Enter your name"
                                value={employeeName}
                                onChange={(e) => setEmployeeName(e.target.value)}
                            />
                        </div>
                        <div className="field">
                            <label className="field-label" htmlFor="employee-city">
                                City
                            </label>
                            <select
                                id="employee-city"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                            >
                                <option value="" disabled>
                                    Select your city
                                </option>
                                {WELLNESS_FEEDBACK_CITY_OPTIONS.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label className="field-label" htmlFor="company-name">
                                Company Name
                            </label>
                            <input
                                id="company-name"
                                type="text"
                                placeholder="Enter your organisation name"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                            />
                        </div>
                        <div className="field">
                            <label className="field-label" htmlFor="session-date">
                                Session Date
                            </label>
                            <input
                                id="session-date"
                                type="date"
                                value={sessionDate}
                                onChange={(e) => setSessionDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="section">
                        <div className="section-title">
                            <span className="dot" aria-hidden="true" />
                            Session Attended
                        </div>
                        <div className="q">
                            <div className="q-title">Q1. Which wellness session(s) did you attend?</div>
                            <div className="q-hint">(Select all that apply)</div>
                            <SessionAttendedDropdown
                                options={context.sessionAttendedOptions}
                                value={sessionsAttended}
                                onChange={setSessionsAttended}
                            />
                        </div>
                    </div>

                    <div className="section">
                        <div className="section-title">
                            <span className="dot" aria-hidden="true" />
                            Trainer Evaluation &amp; Session Satisfaction
                        </div>

                        {context.trainers.map((trainer) => (
                            <TrainerEvaluationBlock
                                key={trainer.trainerId}
                                trainer={trainer}
                                state={
                                    trainerStates[trainer.trainerId] || {
                                        ratings: {},
                                        likedMost: "",
                                        suggestions: "",
                                    }
                                }
                                onChange={(patch) => updateTrainerState(trainer.trainerId, patch)}
                            />
                        ))}

                        <div className="q" style={{ marginTop: 16 }}>
                            <div className="q-title">
                                How satisfied were you with the overall wellness session?
                            </div>
                            <div className="radio-stack" data-group="satisfaction">
                                {WELLNESS_SATISFACTION_OPTIONS.map((option) => (
                                    <label
                                        key={option}
                                        className={`radio-row${overallSatisfaction === option ? " checked" : ""}`}
                                    >
                                        <input
                                            type="radio"
                                            name="satisfaction"
                                            value={option}
                                            checked={overallSatisfaction === option}
                                            onChange={() => setOverallSatisfaction(option)}
                                        />
                                        {option}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="q">
                            <div className="q-title">
                                Did this session help reduce stress or improve your wellbeing?
                            </div>
                            <div className="radio-stack" data-group="wellbeing">
                                {WELLNESS_STRESS_RELIEF_OPTIONS.map((option) => (
                                    <label
                                        key={option}
                                        className={`radio-row${stressRelief === option ? " checked" : ""}`}
                                    >
                                        <input
                                            type="radio"
                                            name="wellbeing"
                                            value={option}
                                            checked={stressRelief === option}
                                            onChange={() => setStressRelief(option)}
                                        />
                                        {option}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="section">
                        <div className="section-title">
                            <span className="dot" aria-hidden="true" />
                            Overall Wellness Experience
                        </div>

                        <div className="q">
                            <div className="q-title">Q1. Which activity did you enjoy the most?</div>
                            <div className="q-hint">(Select all that apply)</div>
                            <div className="option-grid" data-group="enjoyed">
                                {WELLNESS_FEEDBACK_ENJOYED_OPTIONS.map((option) => (
                                    <label
                                        key={option}
                                        className={`opt-pill${enjoyedActivities.includes(option) ? " checked" : ""}`}
                                    >
                                        <input
                                            type="checkbox"
                                            value={option}
                                            checked={enjoyedActivities.includes(option)}
                                            onChange={() =>
                                                toggleCheckbox(enjoyedActivities, option, setEnjoyedActivities)
                                            }
                                        />
                                        {option}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="q">
                            <div className="q-title">
                                Q2. Would you like more wellness sessions in your organisation?
                            </div>
                            <div className="radio-stack" data-group="more">
                                {WELLNESS_WANT_MORE_OPTIONS.map((option) => (
                                    <label
                                        key={option}
                                        className={`radio-row${wantMoreSessions === option ? " checked" : ""}`}
                                    >
                                        <input
                                            type="radio"
                                            name="more"
                                            value={option}
                                            checked={wantMoreSessions === option}
                                            onChange={() => setWantMoreSessions(option)}
                                        />
                                        {option}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="q">
                            <div className="q-title">
                                Q3. Which wellness topics would you like to see in future?
                            </div>
                            <div className="q-hint">(Select all that apply)</div>
                            <div className="option-grid" data-group="topics">
                                {WELLNESS_FEEDBACK_TOPIC_OPTIONS.map((option) => (
                                    <label
                                        key={option}
                                        className={`opt-pill${preferredTopics.includes(option) ? " checked" : ""}`}
                                    >
                                        <input
                                            type="checkbox"
                                            value={option}
                                            checked={preferredTopics.includes(option)}
                                            onChange={() =>
                                                toggleCheckbox(preferredTopics, option, setPreferredTopics)
                                            }
                                        />
                                        {option}
                                    </label>
                                ))}
                                <label
                                    className={`opt-pill${otherTopic ? " checked" : ""}`}
                                    id="otherPill"
                                >
                                    <input
                                        type="checkbox"
                                        id="otherCheck"
                                        value="Other"
                                        checked={Boolean(otherTopic)}
                                        onChange={(e) => {
                                            if (!e.target.checked) setOtherTopic("");
                                        }}
                                    />
                                    Other
                                </label>
                            </div>
                            <div className={`other-input${otherTopic ? " show" : ""}`} id="otherInputWrap">
                                <input
                                    type="text"
                                    id="otherText"
                                    placeholder="Please specify..."
                                    value={otherTopic}
                                    onChange={(e) => setOtherTopic(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="field">
                            <label className="field-label" htmlFor="additional-comments">
                                Q4. Additional Comments
                            </label>
                            <textarea
                                id="additional-comments"
                                placeholder="Share your thoughts, ideas, or any suggestions that can help us improve future wellness sessions."
                                value={additionalComments}
                                onChange={(e) => setAdditionalComments(e.target.value)}
                            />
                        </div>
                    </div>

                    {submitError && (
                        <p className="wellness-feedback-page__error" role="alert">
                            {submitError}
                        </p>
                    )}

                    <div className="submit-wrap">
                        <button type="submit" className="submit-btn" disabled={submitting}>
                            {submitting ? "Submitting…" : "✅ Submit Feedback"}
                        </button>
                    </div>
                    <div className="footer-note">
                        Thank you for your valuable feedback.
                        <br />
                        Your responses help us create healthier, happier workplaces.
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WellnessFeedbackForm;
