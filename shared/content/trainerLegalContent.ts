/** Metadata shown at the top of the trainer legal document. */
export const TRAINER_LEGAL_META = {
  documentTitle: 'Samsara Wellness CRM – Trainer Platform Agreement',
  subtitle:
    'Terms and Conditions and Data Privacy Policy governing use of the Samsara Wellness CRM platform by independent wellness professionals.',
  version: '2026.1',
  operatingEntity: 'Samsaraa WellTek Pvt Ltd, Bangalore',
  brandPortal: 'Samsara Wellness CRM',
  applicability:
    'Independent wellness professionals, including but not limited to Yoga Trainers, Sound Healers, Psychologists, Ayurveda Doctors, and Employee Assistance Program (EAP) Trainers (hereafter referred to as "the Trainer" or "You").',
  legalEmail: 'legal@samsarawellness.in',
};

export interface TrainerLegalSection {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

/** Part 1 — Terms and Conditions for trainer CRM users. */
export const TRAINER_TERMS_INTRO = [
  'This document contains the complete, legally integrated Terms and Conditions and Data Privacy Policy governing the use of the Samsara Wellness Customer Relationship Management (CRM) platform by independent wellness professionals.',
  'By logging into, creating a profile on, or accepting service requests through this CRM platform, the Trainer explicitly acknowledges and agrees to be bound by these Terms and Conditions.',
];

export const TRAINER_TERMS_SECTIONS: TrainerLegalSection[] = [
  {
    id: 'scope',
    title: '1. Scope of Service: Pure Third-Party Intermediary Status',
    paragraphs: [],
    bullets: [
      'Intermediary Marketplace: This CRM is a proprietary enterprise software operated by Samsaraa WellTek Pvt Ltd under the brand Samsara Wellness. The Company acts strictly as a third-party service provider and digital facilitator to connect You with Corporate HR departments and Hotel/Resort clients (collectively referred to as "Clients").',
      'No Employment Relationship: You register on this CRM as an independent professional. Under no circumstances does this engagement create an employer-employee relationship, partnership, agency, or joint venture between You and Samsara Wellness. You are solely responsible for Your own taxes, professional certifications, and liabilities.',
      'Direct Professional Contract: When a Client selects Your profile for an offline service through the CRM, the contract for service delivery is directly between You and the Client. Samsara Wellness is a third party to that operational arrangement and does not assume responsibility for the Client\'s physical infrastructure, environment, or guest/employee behavior.',
    ],
  },
  {
    id: 'accountability',
    title: '2. Trainer Account Accountability & Profile Accuracy',
    paragraphs: [],
    bullets: [
      'Profile Authenticity: You warrant that all information, professional certifications, degrees, licenses, and experience history uploaded by You into the CRM are genuine, unaltered, and valid under Indian laws.',
      'Right to Audit and Terminate: Samsara Wellness reserves the absolute right to verify Your credentials or background checks. Providing fraudulent, misleading, or expired documentation will result in immediate, permanent deactivation of Your CRM profile and potential legal escalation.',
      'Independent Execution: You shall provide the offline wellness services yourself. You are strictly prohibited from subcontracting or delegating an accepted CRM booking to a non-registered third-party trainer without explicit digital re-routing through the platform.',
    ],
  },
  {
    id: 'conduct-liability',
    title: '3. Professional Conduct & Limitation of Liability',
    paragraphs: [],
    bullets: [
      'Operational Autonomy and Risk: Because you execute your services offline at the Client\'s corporate offices or hotel resorts, You assume full professional liability for your sessions. Samsara Wellness assumes zero liability for physical injuries to participants, medical complications, or emotional distress arising out of Your physical or psychological techniques.',
      'Clinical Accountability (Psychologists & EAP): If You are a registered Psychologist or EAP Trainer, You retain sole clinical accountability for the guidance, counseling, or therapeutic advice given during sessions. You acknowledge that Samsara Wellness provides strictly the administrative scheduling framework and plays no role in Your professional clinical judgment.',
      'On-Site Adherence: You agree to adhere strictly to the time schedules, codes of conduct, and reasonable safety norms specified by the hosting corporate office or resort property.',
    ],
  },
  {
    id: 'indemnification',
    title: '4. Indemnification',
    paragraphs: [
      'The Trainer explicitly agrees to indemnify, defend, and hold harmless Samsaraa WellTek Pvt Ltd, its directors, and employees from any legal claims, malpractice allegations, third-party complaints, damages, costs, or consumer protection actions filed by Clients, employees, or hotel guests resulting directly from Your performance or conduct during an offline session.',
    ],
  },
  {
    id: 'jurisdiction',
    title: '5. Governing Law and Exclusive Jurisdiction',
    paragraphs: [
      'These Terms and all platform actions are governed strictly by the laws of India, including the Information Technology Act, 2000 and rules framework.',
      'Any legal dispute, action, or litigation arising between Samsaraa WellTek Pvt Ltd and the Trainer shall be subject to the exclusive jurisdiction of the competent courts in Bangalore, Karnataka.',
    ],
  },
  {
    id: 'legal-contact',
    title: '6. Legal Desk Contact',
    paragraphs: [
      'For all formal legal notices, system grievances, or administrative escalations, the Trainer must contact the legal desk email listed at the end of this document.',
    ],
  },
];

/** Part 2 — Data Privacy & Protection Policy. */
export const TRAINER_PRIVACY_INTRO = [
  'This policy outlines how Your professional, financial, and personal data is processed within the Samsara Wellness CRM, strictly in compliance with the Digital Personal Data Protection (DPDP) Act, 2023 of India.',
];

export const TRAINER_PRIVACY_SECTIONS: TrainerLegalSection[] = [
  {
    id: 'data-processed',
    title: '1. Nature of Trainer Data Processed',
    paragraphs: ['To enable marketplace visibility and complete billing processing, the CRM collects and maps:'],
    bullets: [
      'Professional Profile Data: Full name, profile photograph, gender, languages spoken, area of wellness expertise, certification files, and qualification history.',
      'Operational Data: Real-time calendar availability, service locations/geographies, and session completion records.',
      'Financial Data: Bank account numbers, IFSC codes, and PAN/GST details required to process automated payouts for sessions executed.',
    ],
  },
  {
    id: 'session-privacy',
    title: '2. Strict Privacy Isolation for Session Content',
    paragraphs: [
      'Confidentiality Directive: In strict alignment with medical/counseling ethics and our third-party intermediary status, the Samsara Wellness CRM does not capture, request, log, or store any personal disclosures, patient case histories, or clinical notes generated during Your sessions with employees or guests. The CRM operates strictly as a transactional shell, logging only metadata (date, time, booking status, and duration) required to process Your payouts and generate platform invoices.',
    ],
  },
  {
    id: 'visibility-sharing',
    title: '3. Controlled Profile Visibility and Data Sharing',
    paragraphs: [],
    bullets: [
      'Client Exposure: Your professional profile details (excluding direct banking information and sensitive personal IDs) are made visible through the CRM dashboard to verified Corporate HR and Hotel partners looking to contract offline services.',
      'Zero Third-Party Scraping: Samsara Wellness employs security protocols to ensure Your professional data is protected from external programmatic data harvesting or third-party marketing networks. We do not sell or rent Trainer databases to external entities.',
    ],
  },
  {
    id: 'security',
    title: '4. Data Security & Multi-Factor Protection',
    paragraphs: [
      'We deploy secure access controls, encrypted data-at-rest protocols, and role-based access tokens to ensure that unauthorized parties cannot access your credential documents or financial payout details mapped inside the CRM database.',
    ],
  },
  {
    id: 'erasure',
    title: '5. Right to Erasure & Profile Deactivation',
    paragraphs: [
      'Under the DPDP Act 2023, You retain the right to correct, update, or request the deletion/deactivation of Your data profile from the active CRM database. Profile deletion requests will be completed after the resolution of any pending bookings, active dispute mediations, or mandatory financial audit holdovers required under Indian tax laws.',
    ],
  },
  {
    id: 'privacy-contact',
    title: '6. Privacy Grievances & Data Protection Desk',
    paragraphs: [
      'For data privacy concerns, unauthorized profile access notifications, or security complaints, the Trainer may directly reach our designated compliance desk as required under the DPDP Act, 2023.',
    ],
  },
];
