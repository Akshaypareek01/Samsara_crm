"use client";

import React from 'react';
import { basePath } from '@/Config/basePath';

type CompanyHomeWelcomeBannerProps = {
  userName: string;
};

const heroSrc = `${process.env.NODE_ENV === 'production' ? basePath : ''}/assets/images/dahbordimage.png`;

/**
 * Hero welcome strip for the company home dashboard.
 */
const CompanyHomeWelcomeBanner: React.FC<CompanyHomeWelcomeBannerProps> = ({
  userName,
}) => {
  const greetingName = userName.trim() || 'there';

  return (
    <section className="company-home-welcome" aria-label="Welcome">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="max-w-2xl z-[1]">
          <h1 className="company-home-welcome-title">
            Welcome back, {greetingName}! <span aria-hidden="true">👋</span>
          </h1>
          <p className="company-home-welcome-text">
            Empower well-being. Inspire growth. Discover the best wellness trainers
            for a healthier, happier workplace.
          </p>
        </div>
        <div className="company-home-welcome-hero-wrap" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroSrc}
            alt=""
            className="company-home-welcome-hero"
          />
        </div>
      </div>
    </section>
  );
};

export default CompanyHomeWelcomeBanner;
