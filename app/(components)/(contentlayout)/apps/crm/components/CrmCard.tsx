"use client";

import React from "react";

/** Content card per UI_DESIGN_SPEC: white, shadow-sm, border gray-100. */
export function CrmCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white shadow-sm border border-gray-100 overflow-hidden rounded ${className}`}
    >
      {children}
    </div>
  );
}
