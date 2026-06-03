"use client";
import React from 'react';
import {
  TrainerCertification,
  TrainerEducation,
} from '@/services/trainerService';
import { displayOrDash } from '@/app/company/dashboard/components/companyTrainerProfileUtils';
import {
  normalizeCertificationList,
  normalizeEducationList,
} from '@/shared/utils/trainerQualificationUtils';

interface TrainerQualificationsDisplayProps {
  /** Education entries (legacy object or array). */
  education?: TrainerEducation | TrainerEducation[] | null;
  /** Certification entries (legacy object or array). */
  certification?: TrainerCertification | TrainerCertification[] | null;
  /** When false, hides the education block. Defaults to true. */
  showEducation?: boolean;
  /** When false, hides the certifications block. Defaults to true. */
  showCertification?: boolean;
}

/**
 * Read-only education and certification sections for trainer profile views.
 *
 * @param props - Raw education and certification values from a trainer record.
 * @returns Styled education and certification display blocks.
 */
const TrainerQualificationsDisplay: React.FC<TrainerQualificationsDisplayProps> = ({
  education,
  certification,
  showEducation = true,
  showCertification = true,
}) => {
  const educationEntries = normalizeEducationList(education);
  const certificationEntries = normalizeCertificationList(certification);

  return (
    <>
      {showEducation && (
      <section className="rounded-lg border border-defaultborder p-4 bg-light/30 dark:bg-black/20">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted mb-3">Education</h4>
        {educationEntries.length === 0 ? (
          <p className="text-sm text-muted mb-0">{displayOrDash(null)}</p>
        ) : (
          <div className="space-y-3">
            {educationEntries.map((entry, index) => (
              <dl
                key={`education-display-${index}`}
                className="grid grid-cols-1 gap-2 text-sm mb-0 rounded-md border border-defaultborder/60 p-3 bg-white/50 dark:bg-black/10"
              >
                {educationEntries.length > 1 && (
                  <div className="col-span-full">
                    <dt className="text-muted text-xs mb-0.5">Entry</dt>
                    <dd className="font-medium mb-0">Education {index + 1}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-muted text-xs">Qualification</dt>
                  <dd className="font-medium mb-0">{displayOrDash(entry.qualification)}</dd>
                </div>
                <div>
                  <dt className="text-muted text-xs">University / institution</dt>
                  <dd className="font-medium mb-0">{displayOrDash(entry.university)}</dd>
                </div>
                <div>
                  <dt className="text-muted text-xs">Year of completion</dt>
                  <dd className="font-medium mb-0">{displayOrDash(entry.yearOfCompletion)}</dd>
                </div>
              </dl>
            ))}
          </div>
        )}
      </section>
      )}

      {showCertification && (
      <section className="rounded-lg border border-defaultborder p-4 bg-light/30 dark:bg-black/20">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted mb-3">
          Certifications &amp; Courses
        </h4>
        {certificationEntries.length === 0 ? (
          <p className="text-sm text-muted mb-0">{displayOrDash(null)}</p>
        ) : (
          <div className="space-y-3">
            {certificationEntries.map((entry, index) => (
              <dl
                key={`certification-display-${index}`}
                className="grid grid-cols-1 gap-2 text-sm mb-0 rounded-md border border-defaultborder/60 p-3 bg-white/50 dark:bg-black/10"
              >
                {certificationEntries.length > 1 && (
                  <div className="col-span-full">
                    <dt className="text-muted text-xs mb-0.5">Entry</dt>
                    <dd className="font-medium mb-0">Certification {index + 1}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-muted text-xs">Course / certification</dt>
                  <dd className="font-medium mb-0">{displayOrDash(entry.name)}</dd>
                </div>
                <div>
                  <dt className="text-muted text-xs">Institute</dt>
                  <dd className="font-medium mb-0">{displayOrDash(entry.institute)}</dd>
                </div>
                <div>
                  <dt className="text-muted text-xs">Year</dt>
                  <dd className="font-medium mb-0">{displayOrDash(entry.year)}</dd>
                </div>
              </dl>
            ))}
          </div>
        )}
      </section>
      )}
    </>
  );
};

export default TrainerQualificationsDisplay;
