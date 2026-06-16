"use client";

import React from "react";
import { basePath } from "@/Config/basePath";
import "@/shared/styles/samsara-wellness-cta-banner.css";

const BANNER_SRC = `${process.env.NODE_ENV === "production" ? basePath : ""}/assets/images/banner1.PNG`;

/**
 * Bottom promotional wellness banner used on company and trainer dashboards.
 */
const SamsaraWellnessCtaBanner: React.FC = () => (
  <section className="samsara-wellness-cta-banner" aria-label="Samsara wellness promotion">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src={BANNER_SRC}
      alt="Samsara Wellness App launching soon — yoga, Ayurveda, and mental well-being."
      className="samsara-wellness-cta-banner-img w-full h-auto rounded-2xl"
    />
  </section>
);

export default SamsaraWellnessCtaBanner;
