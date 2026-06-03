"use client";
import React from 'react';
import '@/shared/styles/trainer-form.css';

interface TrainerChipSelectProps {
  /** Field label shown above the chip group. */
  label: string;
  /** Available options rendered as toggle chips. */
  options: string[];
  /** Currently selected option values. */
  value: string[];
  /** Called when selection changes. */
  onChange: (selected: string[]) => void;
  /** Show required asterisk on the label. */
  required?: boolean;
  /** Validation error message. */
  error?: string;
  /** Element id for scroll/focus on validation errors. */
  fieldId?: string;
}

/**
 * Multi-select rendered as pill chips (matches trainer_registration_form_v2.html).
 *
 * @param props - Label, options, value and change handler.
 * @returns Accessible chip toggle group.
 */
const TrainerChipSelect: React.FC<TrainerChipSelectProps> = ({
  label,
  options,
  value,
  onChange,
  required = false,
  error,
  fieldId,
}) => {
  /**
   * Toggle a single option in the selected list.
   *
   * @param option - Option label to add or remove.
   */
  const toggleOption = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  return (
    <div id={fieldId}>
      <span className="trainer-form-label">
        {label}
        {required && <span className="trainer-form-req"> *</span>}
      </span>
      <div
        className={`trainer-form-chip-group${error ? ' trainer-form-control-error rounded-[10px] p-2' : ''}`}
        role="group"
        aria-label={label}
        aria-invalid={Boolean(error)}
        aria-describedby={error && fieldId ? `${fieldId}-error` : undefined}
      >
        {options.map((option) => {
          const selected = value.includes(option);
          return (
            <button
              key={option}
              type="button"
              className={`trainer-form-chip${selected ? ' selected' : ''}`}
              aria-pressed={selected}
              onClick={() => toggleOption(option)}
            >
              {option}
            </button>
          );
        })}
      </div>
      {error && (
        <p id={fieldId ? `${fieldId}-error` : undefined} className="trainer-form-field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default TrainerChipSelect;
