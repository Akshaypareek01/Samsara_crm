"use client";

import React from 'react';
import { basePath } from '@/Config/basePath';

const BANNER_SRC = `${process.env.NODE_ENV === 'production' ? basePath : ''}/assets/images/banner1.PNG`;

/**
 * Bottom promotional banner image on the company home dashboard.
 */
const CompanyHomeCtaBanner: React.FC = () => (
  <section className="company-home-cta-banner" aria-label="Samsara wellness promotion">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src={BANNER_SRC}
      alt="Samsara Wellness App launching soon — yoga, Ayurveda, and mental well-being."
      className="company-home-cta-banner-img w-full h-auto rounded-2xl"
    />
  </section>
);

export default CompanyHomeCtaBanner;
