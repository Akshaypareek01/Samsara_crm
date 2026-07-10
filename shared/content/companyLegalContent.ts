/** Metadata shown at the top of the company legal document. */
export const COMPANY_LEGAL_META = {
  documentTitle: 'Terms and Conditions & Data Privacy Policy',
  version: '2026.1',
  operatingEntity: 'Samsaraa WellTek Pvt Ltd, Bangalore',
  brandPortal: 'Samsara Wellness CRM',
  applicability:
    'Corporate HR Departments, Corporate Entities, and Hotel & Resort Administrators (hereafter referred to as "the Client", "You", or "Your").',
  legalEmail: 'legal@samsarawellness.in',
};

export interface CompanyLegalSection {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

/** Part 1 — Terms and Conditions for company CRM users. */
export const COMPANY_TERMS_INTRO = [
  'This document contains the complete, legally integrated Terms and Conditions and Data Privacy Policy governing the use of the Samsara Wellness Customer Relationship Management (CRM) platform.',
  'By logging into, activating an account on, or scheduling services through this CRM platform, the Client explicitly acknowledges and agrees to be bound by these Terms and Conditions.',
];

export const COMPANY_TERMS_SECTIONS: CompanyLegalSection[] = [
  {
    id: 'scope',
    title: '1. Scope of Service: Pure Third-Party Intermediary Status',
    paragraphs: [],
    bullets: [
      'Intermediary Marketplace: This CRM is a proprietary enterprise software operated by Samsaraa WellTek Pvt Ltd under the brand Samsara Wellness. The Company acts strictly as a third-party service provider and digital facilitator.',
      'No Employment Relationship: The wellness professionals (including Yoga Trainers, Sound Healers, Psychologists, Ayurveda Doctors, and Employee Assistance Program [EAP] Trainers, collectively referred to as "Trainers") visible on this CRM are independent, third-party service providers. They are not employees, agents, or joint-venture partners of Samsara Wellness.',
      'Independent Contracting: Any booking generated through this CRM establishes a direct service arrangement between You (the Client) and the independent Trainer. Samsara Wellness is not a party to the actual execution, quality, safety, or physical delivery of that offline service.',
    ],
  },
  {
    id: 'account-security',
    title: '2. Client Account Security & Booking Authority',
    paragraphs: [],
    bullets: [
      'Access Control: The Client is entirely responsible for maintaining the confidentiality of the CRM login credentials assigned to their HR managers, coordinators, or resort front-desk staff.',
      'Authorized Bookings: Any booking or scheduling request routed through Your corporate CRM account is deemed legally authorized by Your organization, and the Client will be held liable for all associated billing, cancellation metrics, and platform fees.',
    ],
  },
  {
    id: 'liability',
    title: '3. Limitation of Liability & Physical Disclaimers',
    paragraphs: [],
    bullets: [
      'Offline Service Execution Risks: Because the finalized wellness sessions are executed physically on Your corporate premises, hotel properties, or designated resort venues, Samsara Wellness assumes zero liability for physical injuries, health complications, property damage, accidents, or theft occurring during an offline session.',
      'No Clinical Liability: For Psychological and EAP services, the platform provides scheduling infrastructure only. Samsara Wellness does not monitor, review, or take responsibility for the clinical advice, mental health diagnosis, or counseling outcomes delivered by the independent Trainer.',
      'No Service Guarantees: While Samsara Wellness assists in onboarding vetted profiles, the Company does not guarantee the punctuality, real-time behavior, or specific outcomes of the independent Trainers.',
    ],
  },
  {
    id: 'indemnification',
    title: '4. Mutual Indemnification',
    paragraphs: [
      'The Client explicitly agrees to indemnify, defend, and hold harmless Samsaraa WellTek Pvt Ltd, its directors, and employees from any third-party claims, guest grievances, employee disputes, financial losses, or damages arising directly out of the physical wellness activities hosted by the Client and arranged via this CRM.',
    ],
  },
  {
    id: 'jurisdiction',
    title: '5. Governing Law and Exclusive Jurisdiction',
    paragraphs: [
      'These Terms and all operational scheduling via the CRM are governed strictly by the laws of India, including the Information Technology Act, 2000 and the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules.',
      'Any legal dispute, action, or litigation arising between Samsaraa WellTek Pvt Ltd and the Client shall be subject to the exclusive jurisdiction of the competent courts in Bangalore, Karnataka.',
    ],
  },
  {
    id: 'legal-contact',
    title: '6. Legal Desk Contact',
    paragraphs: [
      'For all formal legal notices, contract escalations, or administrative grievances, the Client must reach out to the legal desk email listed at the end of this document.',
    ],
  },
];

/** Part 2 — Data Privacy & Protection Policy. */
export const COMPANY_PRIVACY_INTRO = [
  'This policy outlines how corporate, guest, and employee data provided by You is handled within the Samsara Wellness CRM, strictly in our capacity as a Data Processor under the Digital Personal Data Protection (DPDP) Act, 2023 of India.',
];

export const COMPANY_PRIVACY_SECTIONS: CompanyLegalSection[] = [
  {
    id: 'data-processed',
    title: '1. Nature of Client Data Processed',
    paragraphs: ['To facilitate seamless offline matching and corporate billing, the CRM processes:'],
    bullets: [
      'Corporate Profile Data: Company/Hotel registered names, authorized administrator details, internal billing departments, corporate email domains, and GST numbers.',
      'Beneficiary Allocation Data: Names, employee IDs, or guest reference identifiers provided voluntarily by Your administrators to assign an individual to a booked offline wellness slot.',
      'Voluntary Fitness Notes: Any physical limitations and injury notices explicitly input by Your coordinators to ensure the assigned Trainer can execute physical activities (like Yoga) safely.',
    ],
  },
  {
    id: 'mental-health-privacy',
    title: '2. Strict Privacy Isolation for Mental Health & EAP',
    paragraphs: [
      'Confidentiality Directive: In alignment with mental health privacy standards and our third-party intermediary status, the Samsara Wellness CRM is structurally incapable of capturing, logging, or storing personal disclosures, medical/psychological case notes, or discussion records from sessions with Psychologists or EAP Trainers. The CRM acts strictly as an operational shell, recording only metadata (date, time, duration, and completion status) necessary for Your corporate utilization analytics and invoicing.',
    ],
  },
  {
    id: 'data-sharing',
    title: '3. Restricted Data Sharing',
    paragraphs: [],
    bullets: [
      'Authorized Transmission: Beneficiary slot details entered by Your admins are made visible only to the specific independent Trainer selected and booked by You for that session.',
      'No Data Commercialization: Samsara Wellness does not sell, rent, license, or trade any corporate database info, employee details, or guest lists with third-party marketing networks or advertisers.',
    ],
  },
  {
    id: 'security',
    title: '4. Platform Security & System Breaches',
    paragraphs: [
      'We deploy strict role-based access tokens, end-to-end data encryption in transit, and secure data hosting environments to prevent unauthorized data leaks, account intrusions, or structural alterations within your CRM instance.',
    ],
  },
  {
    id: 'rectification',
    title: '5. Right to Rectification & Deletion',
    paragraphs: [
      'The Client retains the right to edit corporate profile data or request the permanent archiving/deletion of their account data from the active CRM environment, subject to outstanding invoice clearances and transaction retention laws mandatory under Indian tax regulations.',
    ],
  },
  {
    id: 'privacy-contact',
    title: '6. Privacy Grievances & Data Protection Officer',
    paragraphs: [
      'For data protection inquiries, access rights, or security concerns regarding Your CRM account, please contact our designated desk as required under Section 13 of the DPDP Act, 2023.',
    ],
  },
];
