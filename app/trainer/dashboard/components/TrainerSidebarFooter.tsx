"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import TrainerService from "@/services/trainerService";
import HelpSupportModal from "@/shared/components/HelpSupportModal";

type TrainerFooterUser = {
  name?: string;
  profilePhoto?: string;
};

/**
 * Sidebar footer with help link and trainer profile shortcut.
 */
export default function TrainerSidebarFooter() {
  const [trainer, setTrainer] = useState<TrainerFooterUser | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    void TrainerService.getMyProfile()
      .then((profile) => {
        setTrainer({
          name: profile.name,
          profilePhoto:
            typeof profile.profilePhoto === "object" && profile.profilePhoto?.path
              ? profile.profilePhoto.path
              : undefined,
        });
      })
      .catch(() => {
        try {
          const raw = localStorage.getItem("user");
          if (raw) setTrainer(JSON.parse(raw) as TrainerFooterUser);
        } catch {
          /* ignore */
        }
      });
  }, []);

  const displayName = trainer?.name?.trim() || "Trainer";
  const initials = displayName
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <footer className="trainer-sidebar-footer" aria-label="Sidebar footer">
      <button
        type="button"
        className="trainer-sidebar-help"
        aria-label="Help and support"
        aria-haspopup="dialog"
        onClick={() => setHelpOpen(true)}
      >
        <i className="ri-customer-service-2-line text-lg" aria-hidden="true" />
        Help &amp; Support
      </button>

      <HelpSupportModal
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        description="Need assistance with bookings, sessions, or your trainer account? Reach out to our team and we'll get back to you as soon as possible."
      />

      <Link
        href="/trainer/dashboard/profile"
        className="trainer-sidebar-user"
        aria-label={`${displayName}. Open profile`}
      >
        {trainer?.profilePhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={trainer.profilePhoto}
            alt=""
            className="trainer-sidebar-user-avatar"
          />
        ) : (
          <span className="trainer-sidebar-user-initials" aria-hidden="true">
            {initials}
          </span>
        )}
        <span className="trainer-sidebar-user-meta">
          <span className="trainer-sidebar-user-name">{displayName}</span>
        </span>
        <i className="ri-arrow-right-s-line trainer-sidebar-user-chevron" aria-hidden="true" />
      </Link>
    </footer>
  );
}
