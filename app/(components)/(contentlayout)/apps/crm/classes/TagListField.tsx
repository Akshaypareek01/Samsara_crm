'use client';

import React, { useState } from 'react';

interface TagListFieldProps {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
}

/**
 * Tag list editor for perfectFor / skipIf / whatYoullGain.
 */
const TagListField: React.FC<TagListFieldProps> = ({
  label,
  values,
  onChange,
  placeholder,
}) => {
  const [draft, setDraft] = useState('');

  /**
   * Appends the draft tag when non-empty.
   */
  const addTag = () => {
    const next = draft.trim();
    if (!next) return;
    onChange([...values, next]);
    setDraft('');
  };

  return (
    <div className="col-span-1 md:col-span-2">
      <label className="form-label">{label}</label>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          className="form-control"
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag();
            }
          }}
          aria-label={label}
        />
        <button type="button" className="ti-btn ti-btn-primary !m-0" onClick={addTag} aria-label={`Add ${label}`}>
          Add
        </button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2" role="list" aria-label={`${label} items`}>
          {values.map((item, index) => (
            <span key={`${item}-${index}`} className="badge bg-primary/80 flex items-center gap-1" role="listitem">
              {item}
              <button
                type="button"
                className="ms-1"
                aria-label={`Remove ${item}`}
                onClick={() => onChange(values.filter((_, i) => i !== index))}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagListField;
