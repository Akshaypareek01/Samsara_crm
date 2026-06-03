"use client";
import React from 'react';
import {
  MAX_TRAINER_CERTIFICATION_ENTRIES,
  MAX_TRAINER_EDUCATION_ENTRIES,
  TrainerCertification,
  TrainerEducation,
  TrainerProfileDetails,
} from '@/services/trainerService';
import {
  createEmptyCertificationEntry,
  createEmptyEducationEntry,
} from '@/shared/utils/trainerQualificationUtils';
import TrainerFormSectionTitle from '@/shared/components/trainer/TrainerFormSectionTitle';
import '@/shared/styles/trainer-form.css';

interface TrainerQualificationFieldsProps {
  /** Current education entries. */
  education?: TrainerEducation[];
  /** Current certification entries. */
  certification?: TrainerCertification[];
  /** Emit a partial patch to merge into the parent form state. */
  onChange: (patch: Partial<TrainerProfileDetails>) => void;
}

/**
 * Parse a year input string into a number, or null when empty/invalid.
 *
 * @param raw - Raw input value.
 * @returns Year as a number, or null.
 */
const toYear = (raw: string): number | null => {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  return digits ? Number(digits) : null;
};

/**
 * Reusable group of education and certification inputs for trainers.
 * Supports multiple entries (max 5 each) with add/remove controls.
 *
 * @param props - Current values and change handler.
 * @returns Education and certification form sections.
 */
const TrainerQualificationFields: React.FC<TrainerQualificationFieldsProps> = ({
  education = [],
  certification = [],
  onChange,
}) => {
  const educationEntries = education;
  const certificationEntries = certification;
  const educationFull = educationEntries.length >= MAX_TRAINER_EDUCATION_ENTRIES;
  const certificationFull = certificationEntries.length >= MAX_TRAINER_CERTIFICATION_ENTRIES;

  /** Update a single education row by index. */
  const patchEducationAt = (index: number, patch: Partial<TrainerEducation>) => {
    const next = educationEntries.map((entry, i) => (i === index ? { ...entry, ...patch } : entry));
    onChange({ education: next });
  };

  /** Update a single certification row by index. */
  const patchCertificationAt = (index: number, patch: Partial<TrainerCertification>) => {
    const next = certificationEntries.map((entry, i) => (i === index ? { ...entry, ...patch } : entry));
    onChange({ certification: next });
  };

  /** Append a blank education row. */
  const addEducation = () => {
    if (educationFull) return;
    onChange({ education: [...educationEntries, createEmptyEducationEntry()] });
  };

  /** Append a blank certification row. */
  const addCertification = () => {
    if (certificationFull) return;
    onChange({ certification: [...certificationEntries, createEmptyCertificationEntry()] });
  };

  /** Remove an education row by index. */
  const removeEducation = (index: number) => {
    onChange({ education: educationEntries.filter((_, i) => i !== index) });
  };

  /** Remove a certification row by index. */
  const removeCertification = (index: number) => {
    onChange({ certification: certificationEntries.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      {/* Education */}
      <section aria-labelledby="trainer-education-heading">
        <TrainerFormSectionTitle title="Education" iconClass="ri-graduation-cap-line" />
        <div className="trainer-form-sub-card">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h4 id="trainer-education-heading" className="sr-only">
            Education entries
          </h4>
          <button
            type="button"
            onClick={addEducation}
            disabled={educationFull}
            className="ti-btn ti-btn-outline-primary whitespace-nowrap shrink-0"
            aria-label="Add education entry"
          >
            <i className="ri-add-line" aria-hidden="true" />
            Add education
          </button>
        </div>

        {educationFull && (
          <p className="text-xs text-muted mb-3">Maximum {MAX_TRAINER_EDUCATION_ENTRIES} education entries.</p>
        )}

        {educationEntries.length === 0 ? (
          <p className="text-sm text-muted mb-0 rounded-lg border border-dashed border-defaultborder p-4 text-center">
            No education added yet. Click &quot;Add education&quot; to include your qualifications.
          </p>
        ) : (
          <div className="space-y-4">
            {educationEntries.map((entry, index) => (
              <fieldset
                key={`education-${index}`}
                className="rounded-lg border border-[#ede8ff] bg-[#faf9ff] p-4"
              >
                <legend className="px-1 text-sm font-semibold text-defaulttextcolor">
                  Education {index + 1}
                </legend>
                <div className="flex justify-end mb-3">
                  <button
                    type="button"
                    onClick={() => removeEducation(index)}
                    className="ti-btn ti-btn-soft-danger whitespace-nowrap shrink-0"
                    aria-label={`Remove education entry ${index + 1}`}
                  >
                    <i className="ri-delete-bin-line" aria-hidden="true" />
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="trainer-form-label" htmlFor={`edu-qualification-${index}`}>
                      Qualification
                    </label>
                    <input
                      id={`edu-qualification-${index}`}
                      type="text"
                      className="form-control trainer-form-control"
                      value={entry.qualification || ''}
                      onChange={(e) => patchEducationAt(index, { qualification: e.target.value })}
                      placeholder="e.g. B.Sc, M.A, PhD"
                    />
                  </div>
                  <div>
                    <label className="trainer-form-label" htmlFor={`edu-university-${index}`}>
                      University / Institution
                    </label>
                    <input
                      id={`edu-university-${index}`}
                      type="text"
                      className="form-control trainer-form-control"
                      value={entry.university || ''}
                      onChange={(e) => patchEducationAt(index, { university: e.target.value })}
                      placeholder="University name"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="trainer-form-label" htmlFor={`edu-year-${index}`}>
                      Year of Completion
                    </label>
                    <input
                      id={`edu-year-${index}`}
                      type="text"
                      inputMode="numeric"
                      className="form-control trainer-form-control"
                      value={entry.yearOfCompletion ?? ''}
                      onChange={(e) =>
                        patchEducationAt(index, { yearOfCompletion: toYear(e.target.value) })
                      }
                      placeholder="e.g. 2018"
                      maxLength={4}
                    />
                  </div>
                </div>
              </fieldset>
            ))}
          </div>
        )}
        </div>
      </section>

      {/* Certification */}
      <section aria-labelledby="trainer-certification-heading">
        <TrainerFormSectionTitle title="Certifications & Courses" iconClass="ri-award-line" />
        <div className="trainer-form-sub-card">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h4 id="trainer-certification-heading" className="sr-only">
            Certification entries
          </h4>
          <button
            type="button"
            onClick={addCertification}
            disabled={certificationFull}
            className="ti-btn ti-btn-outline-primary whitespace-nowrap shrink-0"
            aria-label="Add certification entry"
          >
            <i className="ri-add-line" aria-hidden="true" />
            Add certification
          </button>
        </div>

        {certificationFull && (
          <p className="text-xs text-muted mb-3">
            Maximum {MAX_TRAINER_CERTIFICATION_ENTRIES} certification entries.
          </p>
        )}

        {certificationEntries.length === 0 ? (
          <p className="text-sm text-muted mb-0 rounded-lg border border-dashed border-defaultborder p-4 text-center">
            No certifications added yet. Click &quot;Add certification&quot; to include your courses.
          </p>
        ) : (
          <div className="space-y-4">
            {certificationEntries.map((entry, index) => (
              <fieldset
                key={`certification-${index}`}
                className="rounded-lg border border-[#ede8ff] bg-[#faf9ff] p-4"
              >
                <legend className="px-1 text-sm font-semibold text-defaulttextcolor">
                  Certification {index + 1}
                </legend>
                <div className="flex justify-end mb-3">
                  <button
                    type="button"
                    onClick={() => removeCertification(index)}
                    className="ti-btn ti-btn-soft-danger whitespace-nowrap shrink-0"
                    aria-label={`Remove certification entry ${index + 1}`}
                  >
                    <i className="ri-delete-bin-line" aria-hidden="true" />
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="trainer-form-label" htmlFor={`cert-name-${index}`}>
                      Certification / Qualification
                    </label>
                    <input
                      id={`cert-name-${index}`}
                      type="text"
                      className="form-control trainer-form-control"
                      value={entry.name || ''}
                      onChange={(e) => patchCertificationAt(index, { name: e.target.value })}
                      placeholder="e.g. RYT 200, CBT Level 2"
                    />
                  </div>
                  <div>
                    <label className="trainer-form-label" htmlFor={`cert-institute-${index}`}>
                      Institute / Awarding Body
                    </label>
                    <input
                      id={`cert-institute-${index}`}
                      type="text"
                      className="form-control trainer-form-control"
                      value={entry.institute || ''}
                      onChange={(e) => patchCertificationAt(index, { institute: e.target.value })}
                      placeholder="Institute name"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="trainer-form-label" htmlFor={`cert-year-${index}`}>
                      Year
                    </label>
                    <input
                      id={`cert-year-${index}`}
                      type="text"
                      inputMode="numeric"
                      className="form-control trainer-form-control"
                      value={entry.year ?? ''}
                      onChange={(e) => patchCertificationAt(index, { year: toYear(e.target.value) })}
                      placeholder="e.g. 2022"
                      maxLength={4}
                    />
                  </div>
                </div>
              </fieldset>
            ))}
          </div>
        )}
        </div>
      </section>
    </div>
  );
};

export default TrainerQualificationFields;
