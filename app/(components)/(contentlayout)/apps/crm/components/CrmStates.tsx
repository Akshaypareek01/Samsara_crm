"use client";

import React from "react";

/** Loading state per spec: spinner + "Loading Data" label. */
export function CrmLoading({ label = "Loading Data" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 opacity-50 mb-3" />
      <span className="text-[10px] text-gray-400 font-bold tracking-[0.2em] uppercase">
        {label}
      </span>
    </div>
  );
}

/** Empty state per spec: icon circle + "DATA EMPTY". */
export function CrmEmpty({
  title = "No data found",
  icon,
}: {
  title?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
        {icon ?? <i className="ri-inbox-line text-xl text-gray-200" />}
      </div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
        {title}
      </p>
    </div>
  );
}
