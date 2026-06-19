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
      <div className="company-home-welcome__inner">
        <div className="company-home-welcome__copy">
          <h1 className="company-home-welcome-title">
            Welcome back, {greetingName}! <span aria-hidden="true">👋</span>
          </h1>
          <p className="company-home-welcome-text">
            Empower well-being. Inspire growth. Discover the best wellness trainers
            for a healthier, happier workplace.
          </p>
          <div className="company-home-welcome-stats" aria-label="Platform highlights">
            <span className="company-home-welcome-stat">
              <i className="ri-award-line" aria-hidden="true"></i>
              200+ certified trainers
            </span>
            <span className="company-home-welcome-stat-divider" aria-hidden="true"></span>
            <span className="company-home-welcome-stat">
              <i className="ri-map-pin-line" aria-hidden="true"></i>
              Available Across Major Cities
            </span>
            <span className="company-home-welcome-stat-divider" aria-hidden="true"></span>
            <span className="company-home-welcome-stat">
              <i className="ri-global-line" aria-hidden="true"></i>
              Online / Offline delivery
            </span>
          </div>
        </div>
        <div className="company-home-welcome-hero-wrap" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroSrc}
            alt=""
            className="company-home-welcome-hero"
            onError={(e) => {
              const wrap = (e.target as HTMLImageElement).closest(
                ".company-home-welcome-hero-wrap"
              );
              if (wrap) (wrap as HTMLElement).style.display = "none";
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default CompanyHomeWelcomeBanner;
