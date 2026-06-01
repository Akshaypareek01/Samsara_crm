"use client";
import React from 'react';
import { EXPERIENCE_OPTIONS, TrainerProfileDetails } from '@/services/trainerService';

interface TrainerPersonalDetailsFieldsProps {
  /** Current values for the personal-detail fields. */
  values: Pick<TrainerProfileDetails, 'dateOfBirth' | 'city' | 'pinCode' | 'experience'>;
  /** Emit a partial patch to merge into the parent form state. */
  onChange: (patch: Partial<TrainerProfileDetails>) => void;
  /** Render asterisks and mark inputs as required (registration flow). */
  requiredFields?: boolean;
}

/**
 * Reusable group of trainer personal-detail inputs: date of birth, city,
 * PIN code and years-of-experience range. Shared by the registration and
 * profile-edit screens to avoid duplicating markup.
 *
 * @param props - Current values, change handler and required-field toggle.
 * @returns A grid of labelled inputs.
 */
const TrainerPersonalDetailsFields: React.FC<TrainerPersonalDetailsFieldsProps> = ({
  values,
  onChange,
  requiredFields = false,
}) => {
  const star = requiredFields ? <span className="text-danger">*</span> : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="form-label" htmlFor="trainer-dob">
          Date of Birth {star}
        </label>
        <input
          id="trainer-dob"
          type="date"
          className="form-control border-2 focus:border-primary"
          value={values.dateOfBirth ? String(values.dateOfBirth).slice(0, 10) : ''}
          onChange={(e) => onChange({ dateOfBirth: e.target.value || null })}
          required={requiredFields}
        />
      </div>
      <div>
        <label className="form-label" htmlFor="trainer-experience">
          Years of Experience {star}
        </label>
        <select
          id="trainer-experience"
          className="form-control border-2 focus:border-primary"
          value={values.experience || ''}
          onChange={(e) => onChange({ experience: e.target.value })}
          required={requiredFields}
        >
          <option value="">— Select experience range —</option>
          {EXPERIENCE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="form-label" htmlFor="trainer-city">
          City {star}
        </label>
        <input
          id="trainer-city"
          type="text"
          className="form-control border-2 focus:border-primary"
          value={values.city || ''}
          onChange={(e) => onChange({ city: e.target.value })}
          placeholder="Your city"
          required={requiredFields}
        />
      </div>
      <div>
        <label className="form-label" htmlFor="trainer-pincode">
          PIN Code {star}
        </label>
        <input
          id="trainer-pincode"
          type="text"
          inputMode="numeric"
          className="form-control border-2 focus:border-primary"
          value={values.pinCode || ''}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
            onChange({ pinCode: digits });
          }}
          placeholder="6-digit PIN"
          maxLength={6}
          required={requiredFields}
        />
      </div>
    </div>
  );
};

export default TrainerPersonalDetailsFields;
