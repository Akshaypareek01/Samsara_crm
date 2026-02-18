"use client";

import React from "react";

/** Centered modal per UI_DESIGN_SPEC: overlay 50% black, white panel, 10px padding. */
export function CrmModal({
  open,
  onClose,
  title,
  children,
  footer,
  maxWidth = "max-w-md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`bg-white rounded-lg shadow-xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col ${maxWidth}`}
      >
        <div className="flex justify-between items-center p-[10px] border-b border-gray-200">
          <h3 className="text-sm font-bold text-gray-800">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
            aria-label="Close"
          >
            <i className="ri-close-line text-lg" />
          </button>
        </div>
        <div className="p-[10px] overflow-auto flex-1">{children}</div>
        {footer && (
          <div className="flex justify-end p-[10px] border-t border-gray-200 gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
