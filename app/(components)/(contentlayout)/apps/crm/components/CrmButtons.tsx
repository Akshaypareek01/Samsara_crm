"use client";

import React from "react";

const btnBase =
  "flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded transition-colors";

/** Primary CTA per spec: purple-600. */
export function CrmBtnPrimary({
  children,
  onClick,
  type = "button",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={`${btnBase} bg-purple-600 text-white hover:bg-purple-700 shadow-sm ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

/** Success/Add: emerald-600. */
export function CrmBtnSuccess({
  children,
  onClick,
  type = "button",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={`${btnBase} bg-emerald-600 text-white hover:bg-emerald-700 ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

/** Secondary: white border gray. */
export function CrmBtnSecondary({
  children,
  onClick,
  type = "button",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={`${btnBase} bg-white border border-gray-200 text-[#495057] hover:bg-gray-50 shadow-sm ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

/** Icon-only action buttons for table row: 28×28, rounded. */
const iconBtnBase =
  "w-7 h-7 rounded flex items-center justify-center transition-colors";

export function CrmBtnEdit({
  onClick,
  title = "Edit",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`${iconBtnBase} bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 opacity-80 group-hover:opacity-100`}
      onClick={onClick}
      title={title}
      {...props}
    >
      <i className="ri-pencil-line text-xs" />
    </button>
  );
}

export function CrmBtnDelete({
  onClick,
  title = "Delete",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`${iconBtnBase} bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 opacity-80 group-hover:opacity-100`}
      onClick={onClick}
      title={title}
      {...props}
    >
      <i className="ri-delete-bin-line text-xs" />
    </button>
  );
}

export function CrmBtnView({
  onClick,
  title = "View",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`${iconBtnBase} bg-sky-50 text-sky-600 border border-sky-100 hover:bg-sky-100 opacity-80 group-hover:opacity-100`}
      onClick={onClick}
      title={title}
      {...props}
    >
      <i className="ri-eye-line text-xs" />
    </button>
  );
}

/** Container for table row action buttons. */
export function CrmActionGroup({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-end gap-1 ${className}`}
    >
      {children}
    </div>
  );
}
