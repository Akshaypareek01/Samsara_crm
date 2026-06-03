"use client";

import React, { useEffect } from "react";

export type CompanyRightDrawerProps = {
    open: boolean;
    title: string;
    onClose: () => void;
    children: React.ReactNode;
    footer?: React.ReactNode;
    /** Tailwind max-width class for the panel */
    maxWidthClass?: string;
    ariaLabelledBy?: string;
    /** When true, body has no padding (full-bleed tab layouts). */
    flushBody?: boolean;
    /** When true, renders above another open drawer (e.g. profile → book). */
    stacked?: boolean;
};

/**
 * Shared right-side drawer shell for company dashboard flows.
 */
const CompanyRightDrawer: React.FC<CompanyRightDrawerProps> = ({
    open,
    title,
    onClose,
    children,
    footer,
    maxWidthClass = "max-w-lg",
    ariaLabelledBy = "company-drawer-title",
    flushBody = false,
    stacked = false,
}) => {
    const overlayZ = stacked ? "z-[1055]" : "z-[1040]";
    const panelZ = stacked ? "z-[1060]" : "z-[1050]";
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <>
            <div
                className={`fixed inset-0 bg-black/50 ${overlayZ} transition-opacity`}
                onClick={onClose}
                aria-hidden="true"
            />
            <aside
                className={`fixed right-0 top-0 h-full w-full ${maxWidthClass} bg-white dark:bg-bodybg shadow-xl ${panelZ} flex flex-col animate-slide-in-right`}
                role="dialog"
                aria-modal="true"
                aria-labelledby={ariaLabelledBy}
            >
                <div className="flex items-center justify-between px-4 py-3 border-b border-defaultborder dark:border-white/10 shrink-0">
                    <h2 id={ariaLabelledBy} className="text-base font-semibold text-defaulttextcolor mb-0">
                        {title}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="ti-btn ti-btn-sm ti-btn-ghost !p-2"
                        aria-label="Close drawer"
                    >
                        <i className="ri-close-line text-lg" aria-hidden="true"></i>
                    </button>
                </div>
                <div
                    className={`flex-1 overflow-y-auto min-h-0 ${flushBody ? "" : "px-4 py-4"}`}
                >
                    {children}
                </div>
                {footer ? (
                    <div className="shrink-0 px-4 py-4 border-t border-defaultborder dark:border-white/10">
                        {footer}
                    </div>
                ) : null}
            </aside>
        </>
    );
};

export default CompanyRightDrawer;
