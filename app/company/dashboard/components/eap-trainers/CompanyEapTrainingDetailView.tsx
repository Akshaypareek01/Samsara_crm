"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { EapTraining } from "@/services/eapTrainingService";
import type { Trainer } from "@/services/trainerService";
import { isTrainerAcceptingBookings } from "@/services/trainerService";
import {
  getEapTrainingTrainer,
  getEapTrainingTrainerId,
} from "@/shared/utils/eapTrainingTrainerUtils";
import CompanyTrainerProfilePanel from "../CompanyTrainerProfilePanel";
import CompanyEapBookingDrawer from "./CompanyEapBookingDrawer";

type CompanyEapTrainingDetailViewProps = {
  training: EapTraining;
  fullTrainer?: Trainer | null;
  trainerLoading?: boolean;
};

/**
 * Training detail layout for the company EAP catalog detail route.
 */
const CompanyEapTrainingDetailView: React.FC<CompanyEapTrainingDetailViewProps> = ({
  training,
  fullTrainer,
  trainerLoading = false,
}) => {
  const [bookingOpen, setBookingOpen] = useState(false);
  const populatedTrainer = getEapTrainingTrainer(training);
  const trainer: Trainer | null =
    fullTrainer ||
    (populatedTrainer
      ? ({
          ...populatedTrainer,
          _id: getEapTrainingTrainerId(training),
        } as Trainer)
      : null);
  const canBook = trainer ? isTrainerAcceptingBookings(trainer) : false;

  return (
    <div className="company-eap-detail">
      <Link href="/company/dashboard/eap-trainers" className="company-eap-detail__back">
        <i className="ri-arrow-left-line" aria-hidden="true" />
        Back to programs
      </Link>

      <section className="company-eap-detail__hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={training.coverImage} alt="" className="company-eap-detail__hero-image" />
        <div className="company-eap-detail__hero-body">
          <h1 className="company-eap-detail__title">{training.title}</h1>
          <div className="company-eap-detail__badges">
            {training.durationOptions.map((hours) => (
              <span key={hours} className="company-eap-detail__badge">
                {hours} hour{hours === 1 ? "" : "s"}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="company-eap-detail__section" aria-labelledby="eap-outline-heading">
        <h2 id="eap-outline-heading" className="company-eap-detail__section-title">
          Session outline
        </h2>
        <div className="company-eap-detail__syllabus-grid">
          {training.syllabus.map((entry) => (
            <div key={entry.durationHours} className="company-eap-detail__syllabus-block">
              <h3 className="company-eap-detail__syllabus-title">
                {entry.durationHours} hour session
              </h3>
              <ul className="company-eap-detail__points">
                {entry.points.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="company-eap-detail__section" aria-labelledby="eap-trainer-heading">
        <h2 id="eap-trainer-heading" className="company-eap-detail__section-title">
          Trainer profile
        </h2>
        <CompanyTrainerProfilePanel
          trainer={trainer}
          loading={trainerLoading}
          variant="embedded"
        />
      </section>

      <div className="company-eap-detail__book-bar">
        {!canBook && (
          <p className="company-eap-detail__book-note" role="status">
            This trainer is not accepting new bookings right now.
          </p>
        )}
        <button
          type="button"
          className="company-eap-detail__book-btn"
          disabled={!canBook || trainerLoading}
          onClick={() => setBookingOpen(true)}
        >
          <i className="ri-calendar-check-line" aria-hidden="true" />
          Book this program
        </button>
      </div>

      <CompanyEapBookingDrawer
        trainer={trainer}
        training={training}
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
      />
    </div>
  );
};

export default CompanyEapTrainingDetailView;
