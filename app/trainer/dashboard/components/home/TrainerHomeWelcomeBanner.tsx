"use client";

import React from "react";
import { basePath } from "@/Config/basePath";

type TrainerHomeWelcomeBannerProps = {
  userName: string;
  loading?: boolean;
};

const heroSrc = `${process.env.NODE_ENV === "production" ? basePath : ""}/assets/images/trainerdsahbordabnner.jpeg`;

/**
 * Hero welcome strip for the trainer home dashboard — matches company dashboard banner UI.
 */
const TrainerHomeWelcomeBanner: React.FC<TrainerHomeWelcomeBannerProps> = ({
  userName,
  loading = false,
}) => {
  const greetingName = userName.trim() || "there";

  return (
    <section className="trainer-home-welcome mb-6" aria-label="Welcome">
      <div className="trainer-home-welcome__inner">
        <div className="trainer-home-welcome__copy">
          {loading ? (
            <>
              <h1 className="trainer-home-welcome-title">Welcome back!</h1>
              <p className="trainer-home-welcome-text">Loading your dashboard…</p>
            </>
          ) : (
            <>
              <h1 className="trainer-home-welcome-title">
                Welcome back, {greetingName}! <span aria-hidden="true">👋</span>
              </h1>
              <p className="trainer-home-welcome-text">
                Heal. Guide. Transform lives. Manage your sessions and grow your
                wellness coaching practice.
              </p>
            </>
          )}
        </div>
        <div className="trainer-home-welcome-hero-wrap" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroSrc}
            alt=""
            className="trainer-home-welcome-hero"
            onError={(e) => {
              const wrap = (e.target as HTMLImageElement).closest(
                ".trainer-home-welcome-hero-wrap"
              );
              if (wrap) (wrap as HTMLElement).style.display = "none";
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default TrainerHomeWelcomeBanner;
