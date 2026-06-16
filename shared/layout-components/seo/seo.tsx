"use client";

import React, { useEffect } from "react";

/** Browser tab brand prefix for company and trainer portals. */
export const APP_DOCUMENT_TITLE = "Samsara Wellness";

type SeoProps = {
  title?: string;
};

/**
 * Sets the browser document title for portal pages.
 *
 * @param props - Optional page title segment after the brand name.
 */
const Seo: React.FC<SeoProps> = ({ title }) => {
  useEffect(() => {
    document.title = title?.trim()
      ? `${APP_DOCUMENT_TITLE} - ${title.trim()}`
      : APP_DOCUMENT_TITLE;
  }, [title]);

  return null;
};

export default Seo;
