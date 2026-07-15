import type { Metadata } from 'next';
import './wellness-feedback.css';

export const metadata: Metadata = {
  title: 'Samsara Wellness 365 – Session Feedback',
  description: 'Employee wellness session feedback form',
};

/**
 * Minimal layout for the public wellness feedback form (no dashboard chrome).
 */
export default function WellnessFeedbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
