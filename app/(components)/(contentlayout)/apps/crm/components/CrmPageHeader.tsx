"use client";

import React from "react";

/** Page header per UI_DESIGN_SPEC: title strip with purple accent bar, optional actions. */
export function CrmPageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-2">
        <div className="w-[3px] h-5 bg-purple-600 rounded-full shrink-0" />
        <div>
          <h1 className="text-sm font-bold text-gray-800 !mb-0">{title}</h1>
          {subtitle && (
            <p className="text-[11px] font-medium text-[#495057] mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-1.5">{actions}</div>}
    </div>
  );
}
