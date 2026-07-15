"use client";

import React, { useEffect, useRef, useState } from "react";

export type SessionAttendedDropdownProps = {
    options: readonly string[];
    value: string[];
    onChange: (next: string[]) => void;
};

/**
 * Multi-select session dropdown matching the reference feedback form UI.
 */
const SessionAttendedDropdown: React.FC<SessionAttendedDropdownProps> = ({
    options,
    value,
    onChange,
}) => {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("click", onDocClick);
        return () => document.removeEventListener("click", onDocClick);
    }, []);

    const toggleValue = (option: string) => {
        if (value.includes(option)) {
            onChange(value.filter((v) => v !== option));
        } else {
            onChange([...value, option]);
        }
    };

    let label = "Select session(s)";
    if (value.length === 1) label = value[0];
    else if (value.length === 2) label = value.join(", ");
    else if (value.length > 2) label = `${value.length} sessions selected`;

    return (
        <div className={`dd${open ? " open" : ""}`} ref={rootRef} data-group="sessions">
            <button
                type="button"
                className="dd-toggle"
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen((prev) => !prev);
                }}
                aria-expanded={open}
                aria-haspopup="listbox"
            >
                <span className={`dd-toggle-text${value.length ? " filled" : ""}`}>{label}</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>
            <div className="dd-panel" role="listbox" aria-label="Sessions attended">
                {options.map((option) => (
                    <label key={option} className="dd-option">
                        <input
                            type="checkbox"
                            value={option}
                            checked={value.includes(option)}
                            onChange={() => toggleValue(option)}
                        />
                        <span className="dd-check" aria-hidden="true" />
                        {option} Session
                    </label>
                ))}
            </div>
        </div>
    );
};

export default SessionAttendedDropdown;
