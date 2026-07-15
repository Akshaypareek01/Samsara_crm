"use client";

import React from "react";
import {
    TRAINER_RATING_CRITERIA,
    type TrainerRatingKey,
} from "@/constants/wellnessFeedbackFormOptions";
import type { WellnessFeedbackTrainerContext } from "@/services/wellnessFeedbackService";

export type TrainerFormState = {
    ratings: Partial<Record<TrainerRatingKey, number>>;
    likedMost: string;
    suggestions: string;
};

export type TrainerEvaluationBlockProps = {
    trainer: WellnessFeedbackTrainerContext;
    state: TrainerFormState;
    onChange: (patch: Partial<TrainerFormState>) => void;
};

/**
 * Trainer rating table and open-text fields for one trainer.
 */
const TrainerEvaluationBlock: React.FC<TrainerEvaluationBlockProps> = ({
    trainer,
    state,
    onChange,
}) => {
    const setRating = (key: TrainerRatingKey, value: number) => {
        onChange({ ratings: { ...state.ratings, [key]: value } });
    };

    return (
        <div className="wellness-feedback-trainer-block">
            <p className="wellness-feedback-trainer-block__name" aria-label="Trainer name">
                Trainer: <strong>{trainer.name || "—"}</strong>
            </p>

            <div className="q">
                <div className="q-title">Please rate the trainer</div>
                <div className="q-hint">1 = Poor · 5 = Excellent</div>
                <table className="rating-table">
                    <thead>
                        <tr>
                            <th scope="col">Criteria</th>
                            <th scope="col">1</th>
                            <th scope="col">2</th>
                            <th scope="col">3</th>
                            <th scope="col">4</th>
                            <th scope="col">5</th>
                        </tr>
                    </thead>
                    <tbody>
                        {TRAINER_RATING_CRITERIA.map((criterion) => (
                            <tr key={criterion.key}>
                                <td className="crit">{criterion.label}</td>
                                {[1, 2, 3, 4, 5].map((score) => (
                                    <td key={score}>
                                        <input
                                            type="radio"
                                            name={`${criterion.key}_t${trainer.order}`}
                                            value={score}
                                            checked={state.ratings[criterion.key] === score}
                                            onChange={() => setRating(criterion.key, score)}
                                            aria-label={`${criterion.label} ${score}`}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="scale-caption">
                    <span>Poor</span>
                    <span>Excellent</span>
                </div>
            </div>

            <div className="field" style={{ marginTop: 16 }}>
                <label className="field-label" htmlFor={`liked-${trainer.trainerId}`}>
                    What did you like most about this trainer?
                </label>
                <textarea
                    id={`liked-${trainer.trainerId}`}
                    placeholder="Share your thoughts..."
                    value={state.likedMost}
                    onChange={(e) => onChange({ likedMost: e.target.value })}
                />
            </div>

            <div className="field">
                <label className="field-label" htmlFor={`suggestions-${trainer.trainerId}`}>
                    Feedback &amp; Suggestions
                </label>
                <textarea
                    id={`suggestions-${trainer.trainerId}`}
                    placeholder="Tell us more..."
                    value={state.suggestions}
                    onChange={(e) => onChange({ suggestions: e.target.value })}
                />
            </div>
        </div>
    );
};

export default TrainerEvaluationBlock;
