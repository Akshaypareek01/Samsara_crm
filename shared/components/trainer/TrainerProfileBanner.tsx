"use client";
import React from 'react';
import type { TrainerImage } from '@/services/trainerService';

interface TrainerProfileBannerProps {
  name: string;
  title?: string;
  email?: string;
  mobile?: string;
  category?: string;
  profilePhoto?: TrainerImage | null;
}

/**
 * Profile summary banner with avatar, name and read-only contact details.
 *
 * @param props - Trainer identity fields to display at the top of the profile form.
 * @returns A responsive banner row with avatar and metadata.
 */
const TrainerProfileBanner: React.FC<TrainerProfileBannerProps> = ({
  name,
  title,
  email,
  mobile,
  category,
  profilePhoto,
}) => {
  const initials = (name || 'T').charAt(0).toUpperCase();

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 p-4 sm:p-5 mb-6 rounded-xl border border-defaultborder bg-gradient-to-r from-primary/5 via-white to-primary/5 dark:from-primary/10 dark:via-bodybg dark:to-primary/10">
      {profilePhoto?.path ? (
        <img
          src={profilePhoto.path}
          alt={name}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-primary/30 flex-shrink-0 shadow-sm"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <div
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 border-2 border-primary/20"
          aria-hidden="true"
        >
          <span className="text-primary font-bold text-3xl">{initials}</span>
        </div>
      )}

      <div className="flex-1 text-center sm:text-left min-w-0">
        <h2 className="text-xl sm:text-2xl font-bold text-defaulttextcolor mb-0 truncate">{name}</h2>
        {title ? <p className="text-muted text-sm mt-1 mb-2">{title}</p> : null}
        <div className="flex flex-wrap gap-3 justify-center sm:justify-start text-sm text-defaulttextcolor/80">
          {email ? (
            <span className="inline-flex items-center gap-1.5 min-w-0">
              <i className="ri-mail-line text-primary flex-shrink-0" aria-hidden="true"></i>
              <span className="truncate">{email}</span>
            </span>
          ) : null}
          {mobile ? (
            <span className="inline-flex items-center gap-1.5">
              <i className="ri-phone-line text-primary flex-shrink-0" aria-hidden="true"></i>
              <span>{mobile}</span>
            </span>
          ) : null}
          {category ? (
            <span className="inline-flex items-center gap-1.5">
              <i className="ri-price-tag-3-line text-primary flex-shrink-0" aria-hidden="true"></i>
              <span>{category}</span>
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default TrainerProfileBanner;
