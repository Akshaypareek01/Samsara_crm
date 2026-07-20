"use client";

import Link from "next/link";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import Pageheader from "@/shared/layout-components/page-header/pageheader";
import Seo from "@/shared/layout-components/seo/seo";
import wellnessFeedbackService, {
  type CompanyFeedbackAnalytics,
  type FeedbackBreakdownItem,
} from "@/services/wellnessFeedbackService";
import { TRAINER_RATING_CRITERIA } from "@/constants/wellnessFeedbackFormOptions";
import { formatInr } from "@/shared/utils/invoiceCalculationUtils";
import "./feedback-analytics.css";

type SummaryCardProps = {
  label: string;
  value: string;
  sub?: string;
  accent?: "primary" | "success" | "warning" | "info";
};

/**
 * Renders a single KPI card on the analytics dashboard.
 */
function SummaryCard({ label, value, sub, accent }: SummaryCardProps) {
  return (
    <article className={`feedback-analytics-card${accent ? ` accent-${accent}` : ""}`}>
      <span className="feedback-analytics-card-label">{label}</span>
      <strong className="feedback-analytics-card-value">{value}</strong>
      {sub ? <span className="feedback-analytics-card-sub">{sub}</span> : null}
    </article>
  );
}

type BreakdownPanelProps = {
  title: string;
  description: string;
  items: FeedbackBreakdownItem[];
  barColor?: string;
};

/**
 * Renders a labeled breakdown list with percentage bars.
 */
function BreakdownPanel({ title, description, items, barColor = "#6366f1" }: BreakdownPanelProps) {
  return (
    <section className="feedback-analytics-panel" aria-labelledby={`panel-${title}`}>
      <div className="feedback-analytics-panel-header">
        <h2 id={`panel-${title}`}>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="feedback-analytics-panel-body">
        {items.length === 0 ? (
          <p className="text-muted text-sm mb-0">No responses yet.</p>
        ) : (
          items.map((item) => (
            <div className="feedback-analytics-breakdown-row" key={item.label}>
              <span className="feedback-analytics-breakdown-label">{item.label}</span>
              <span className="feedback-analytics-breakdown-meta">
                {item.count} ({item.percentage}%)
              </span>
              <div className="feedback-analytics-bar" aria-hidden="true">
                <div
                  className="feedback-analytics-bar-fill"
                  style={{ width: `${item.percentage}%`, background: barColor }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

/**
 * Maps satisfaction score (1–4) to a readable label.
 *
 * @param score - Average satisfaction score.
 */
function satisfactionLabel(score: number | null): string {
  if (score == null) return "—";
  if (score >= 3.5) return "Excellent";
  if (score >= 2.5) return "Good";
  if (score >= 1.5) return "Average";
  return "Needs improvement";
}

/**
 * Company dashboard for session feedback analytics.
 */
const FeedbackAnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<CompanyFeedbackAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await wellnessFeedbackService.getCompanyAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error("Failed to load feedback analytics:", err);
      setError("Could not load feedback analytics. Please try again.");
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAnalytics();
  }, [fetchAnalytics]);

  const summary = analytics?.summary;

  return (
    <Fragment>
      <Seo title="Analytics" />
      <Pageheader currentpage="Analytics" activepage="Company" mainpage="Session Feedback" />

      <div className="feedback-analytics-page">
        <header className="feedback-analytics-hero">
          <div>
            <h1>Session feedback analytics</h1>
            <p>
              Insights from employee wellness feedback — satisfaction, engagement, wellness impact,
              and cost per participant across completed sessions.
            </p>
          </div>
          <Link
            href="/company/dashboard/bookings"
            className="ti-btn ti-btn-primary-full whitespace-nowrap"
          >
            View bookings
          </Link>
        </header>

        {loading ? (
          <div className="feedback-analytics-empty" role="status" aria-live="polite">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading analytics…</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger mb-0" role="alert">
            {error}
          </div>
        ) : !analytics || summary?.totalResponses === 0 ? (
          <div className="feedback-analytics-panel">
            <div className="feedback-analytics-empty">
              <h3>No feedback yet</h3>
              <p className="mb-3">
                Share the feedback form link with employees after a completed session to see analytics here.
              </p>
              <Link href="/company/dashboard/bookings" className="ti-btn ti-btn-primary-full">
                Go to bookings
              </Link>
            </div>
          </div>
        ) : (
          <>
            <section className="feedback-analytics-grid" aria-label="Key metrics">
              <SummaryCard
                label="Employee engagement"
                value={`${summary?.employeeEngagementPct ?? 0}%`}
                sub="Employees who want more sessions (Yes or Maybe)"
                accent="primary"
              />
              <SummaryCard
                label="Overall satisfaction"
                value={summary?.avgSatisfactionScore?.toFixed(1) ?? "—"}
                sub={`${satisfactionLabel(summary?.avgSatisfactionScore ?? null)} · out of 4.0`}
                accent="success"
              />
              <SummaryCard
                label="Wellness impact"
                value={`${summary?.wellnessImpactPct ?? 0}%`}
                sub="Reported stress relief (significant or somewhat)"
                accent="info"
              />
              <SummaryCard
                label="Cost per participant"
                value={
                  summary?.costPerParticipant != null
                    ? formatInr(summary.costPerParticipant)
                    : "—"
                }
                sub={
                  summary?.totalSessionSpend != null
                    ? `${formatInr(summary.totalSessionSpend)} across ${summary.spendSessionsTracked} paid sessions`
                    : "Available when session payment is recorded"
                }
                accent="warning"
              />
            </section>

            <section className="feedback-analytics-grid" aria-label="Response overview">
              <SummaryCard
                label="Total responses"
                value={String(summary?.totalResponses ?? 0)}
                sub={`${summary?.sessionsWithFeedback ?? 0} sessions with feedback`}
              />
              <SummaryCard
                label="Response rate"
                value={`${summary?.responseRate ?? 0}%`}
                sub={`${summary?.expectedParticipants ?? 0} expected attendees`}
              />
              <SummaryCard
                label="Completed sessions"
                value={String(summary?.completedSessions ?? 0)}
                sub="All completed bookings"
              />
              <SummaryCard
                label="Avg trainer rating"
                value={(() => {
                  const ratings = Object.values(analytics.avgTrainerRatings).filter(
                    (value): value is number => typeof value === "number"
                  );
                  if (ratings.length === 0) return "—";
                  const avg = ratings.reduce((sum, value) => sum + value, 0) / ratings.length;
                  return `${avg.toFixed(1)}/5`;
                })()}
                sub="Across knowledge, communication, engagement, energy, usefulness"
              />
            </section>

            <section className="feedback-analytics-panel" aria-labelledby="trainer-ratings-title">
              <div className="feedback-analytics-panel-header">
                <h2 id="trainer-ratings-title">Trainer evaluation averages</h2>
                <p>From employee ratings on knowledge, communication, engagement, energy, and usefulness.</p>
              </div>
              <div className="feedback-analytics-panel-body">
                <div className="feedback-analytics-rating-grid">
                  {TRAINER_RATING_CRITERIA.map((criterion) => (
                    <div className="feedback-analytics-rating-item" key={criterion.key}>
                      <strong>{analytics.avgTrainerRatings[criterion.key]?.toFixed(1) ?? "—"}</strong>
                      <span>{criterion.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <div className="feedback-analytics-two-col">
              <BreakdownPanel
                title="Overall satisfaction"
                description="How satisfied employees were with the wellness session."
                items={analytics.overallSatisfaction}
                barColor="#10b981"
              />
              <BreakdownPanel
                title="Wellness impact"
                description="Did the session help reduce stress or improve wellbeing?"
                items={analytics.stressRelief}
                barColor="#3b82f6"
              />
            </div>

            <div className="feedback-analytics-two-col">
              <BreakdownPanel
                title="Future session interest"
                description="Would employees like more wellness sessions?"
                items={analytics.wantMoreSessions}
                barColor="#6366f1"
              />
              <BreakdownPanel
                title="Sessions attended"
                description="Which wellness sessions employees reported attending."
                items={analytics.sessionsAttended}
                barColor="#8b5cf6"
              />
            </div>

            <div className="feedback-analytics-two-col">
              <BreakdownPanel
                title="Most enjoyed activities"
                description="Activities employees enjoyed the most."
                items={analytics.enjoyedActivities}
                barColor="#f59e0b"
              />
              <BreakdownPanel
                title="Preferred future topics"
                description="Topics employees want in upcoming sessions."
                items={analytics.preferredTopics}
                barColor="#ec4899"
              />
            </div>

          </>
        )}
      </div>
    </Fragment>
  );
};

export default FeedbackAnalyticsDashboard;
