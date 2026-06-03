"use client";
import React from 'react';

interface TrainerFormFieldErrorProps {
  /** Error message to display below the field. */
  message?: string;
  /** id of the related input for aria-describedby. */
  fieldId: string;
}

/**
 * Inline validation error shown under a trainer form field.
 *
 * @param props - Error message and related field id.
 * @returns Error text or null when no message.
 */
const TrainerFormFieldError: React.FC<TrainerFormFieldErrorProps> = ({ message, fieldId }) => {
  if (!message) return null;

  return (
    <p
      id={`${fieldId}-error`}
      className="trainer-form-field-error"
      role="alert"
    >
      {message}
    </p>
  );
};

export default TrainerFormFieldError;
