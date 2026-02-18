"use client";

import React from "react";

/** Table wrapper per UI_DESIGN_SPEC: min-h, overflow-x-auto. */
export function CrmTableWrapper({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`overflow-x-auto min-h-[300px] ${className}`}>
      {children}
    </div>
  );
}

/** Table element: w-full border-collapse border gray-200. */
export const crmTableClass =
  "w-full border-collapse border border-gray-200 whitespace-nowrap";

/** thead tr: bg-gray-50/30. */
export const crmTheadTrClass = "bg-[rgba(249,250,251,0.3)]";

/** th: 11px bold uppercase, gray-200 border. */
export const crmThClass =
  "px-1.5 py-3 text-left text-[11px] font-bold text-[#495057] uppercase tracking-wider border border-gray-200 first:pl-[10px] last:pr-[10px]";

/** tbody tr: hover gray-50/50, group. */
export const crmTbodyTrClass =
  "hover:bg-[rgba(249,250,251,0.5)] transition-colors group";

/** td: 12px, gray-200 border. */
export const crmTdClass =
  "px-1.5 py-2.5 text-[12px] border border-gray-200 first:pl-[10px] last:pr-[10px]";

/** Actions column: align right. */
export const crmThActionsClass = `${crmThClass} text-right`;
export const crmTdActionsClass = `${crmTdClass} text-right`;
