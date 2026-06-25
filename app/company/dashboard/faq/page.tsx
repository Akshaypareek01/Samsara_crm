"use client";

import React, { Fragment } from "react";
import Seo from "@/shared/layout-components/seo/seo";

/** One bullet list rendered inside an FAQ answer. */
const AnswerList: React.FC<{ items: React.ReactNode[]; ordered?: boolean }> = ({
    items,
    ordered = false,
}) => {
    const Tag = ordered ? "ol" : "ul";
    return (
        <Tag
            className={`${ordered ? "list-decimal" : "list-disc"} ps-5 space-y-1 mt-2 mb-0`}
        >
            {items.map((item, idx) => (
                <li key={idx}>{item}</li>
            ))}
        </Tag>
    );
};

type FaqItem = {
    id: string;
    question: string;
    answer: React.ReactNode;
    defaultOpen?: boolean;
};

type FaqSection = {
    title?: string;
    items: FaqItem[];
};

const FAQ_SECTIONS: FaqSection[] = [
    {
        title: "General",
        items: [
            {
                id: "1",
                question: "What is SAMSARA Wellness 365?",
                answer: (
                    <p className="mb-0">
                        SAMSARA Wellness 365 is a corporate wellness platform that helps HR
                        teams and organizations hire certified wellness professionals
                        across India for employee wellbeing programs.
                    </p>
                ),
                defaultOpen: true,
            },
            {
                id: "2",
                question: "Who can use SAMSARA Wellness 365?",
                answer: (
                    <p className="mb-0">
                        Any organization, HR team, admin, or corporate wellness manager
                        looking to conduct wellness sessions for employees can use the
                        platform.
                    </p>
                ),
            },
            {
                id: "3",
                question: "What types of wellness professionals can be booked?",
                answer: (
                    <>
                        <p className="mb-0">You can hire a wide range of wellness experts, including:</p>
                        <AnswerList
                            items={[
                                "Yoga Trainers",
                                "Meditation Coaches",
                                "Sound Healers",
                                "Psychologists",
                                "Mental Wellness Experts",
                                "Women's Health Coaches",
                                "And many more",
                            ]}
                        />
                    </>
                ),
            },
            {
                id: "4",
                question: "Can we book professionals for a single session?",
                answer: (
                    <>
                        <p className="mb-0">Yes. Organizations can book professionals for:</p>
                        <AnswerList items={["1 Hour", "2 Hours", "Half-Day Sessions", "Full-Day Programs"]} />
                    </>
                ),
            },
            {
                id: "5",
                question: "Do you offer long-term wellness programs?",
                answer: (
                    <>
                        <p className="mb-0">Yes. Professionals can be engaged for:</p>
                        <AnswerList items={["One Week", "One Month", "Quarterly Programs", "Annual Wellness Programs"]} />
                    </>
                ),
            },
            {
                id: "6",
                question: "Are the sessions available online and offline?",
                answer: (
                    <p className="mb-0">
                        Yes. Depending on your requirements and location, sessions can be
                        conducted online, offline, or in a hybrid format.
                    </p>
                ),
            },
            {
                id: "7",
                question: "Which locations do you serve?",
                answer: (
                    <p className="mb-0">
                        SAMSARA Wellness 365 provides wellness professionals across India,
                        covering metro cities, Tier 2 cities, and remote locations.
                    </p>
                ),
            },
            {
                id: "8",
                question: "Can we organize wellness programs across multiple office locations?",
                answer: (
                    <p className="mb-0">
                        Yes. We can coordinate and manage wellness programs across multiple
                        office locations nationwide.
                    </p>
                ),
            },
            {
                id: "9",
                question: "How do we choose the right wellness expert?",
                answer: (
                    <p className="mb-0">
                        You can browse professional profiles, review their expertise and
                        experience, and select the wellness professional that best matches
                        your organization&apos;s requirements.
                    </p>
                ),
            },
            {
                id: "10",
                question: "Can sessions be customized for our employees?",
                answer: (
                    <p className="mb-0">
                        Yes. Programs can be tailored based on employee demographics,
                        wellness goals, industry requirements, and organizational
                        objectives.
                    </p>
                ),
            },
            {
                id: "11",
                question: "Do you provide wellness programs for special occasions?",
                answer: (
                    <>
                        <p className="mb-0">Yes. We support:</p>
                        <AnswerList
                            items={[
                                "International Yoga Day",
                                "Women's Wellness Programs",
                                "Mental Health Awareness Initiatives",
                                "Employee Engagement Activities",
                                "Stress Management Campaigns",
                                "Annual Wellness Calendars",
                                "Health & Wellness Weeks",
                            ]}
                        />
                    </>
                ),
            },
            {
                id: "12",
                question: "How do we book a wellness professional?",
                answer: (
                    <>
                        <p className="mb-0">Simply:</p>
                        <AnswerList
                            ordered
                            items={[
                                "Browse wellness professionals on SAMSARA Wellness 365.",
                                "Select the profile of the wellness expert you wish to engage.",
                                "Review their experience, expertise, and services.",
                                "Choose your preferred date and time.",
                                <>
                                    Select the session duration:
                                    <AnswerList
                                        items={[
                                            "1 Hour",
                                            "2 Hours",
                                            "Half-Day",
                                            "Full-Day",
                                            "One Week",
                                            "One Month",
                                            "Yearly Engagement",
                                        ]}
                                    />
                                </>,
                                "Submit your booking request.",
                            ]}
                        />
                        <p className="mb-0 mt-2">
                            Once confirmed, the wellness professional will conduct the
                            session as per the selected schedule and requirements.
                        </p>
                    </>
                ),
            },
        ],
    },
    {
        title: "Commercial & Contractual",
        items: [
            {
                id: "13",
                question: "What are the payment terms?",
                answer: (
                    <>
                        <p className="mb-2">
                            For all one-time sessions, workshops, events, and short-term
                            engagements, advance payment is required to confirm the
                            booking.
                        </p>
                        <p className="mb-2">
                            For long-term engagements, including monthly, quarterly, and
                            annual wellness programs, payment is due within 7 days of the
                            completion of the service period, as per the agreed contract
                            terms.
                        </p>
                        <p className="mb-0">
                            All invoices are issued with applicable GST, and complete
                            payment details are shared at the time of booking confirmation.
                        </p>
                    </>
                ),
            },
            {
                id: "14",
                question: "Do you offer pilot or trial sessions?",
                answer: (
                    <p className="mb-0">
                        Yes. Organizations can book pilot or trial sessions to evaluate the
                        wellness professional and program before committing to larger
                        engagements.
                    </p>
                ),
            },
        ],
    },
    {
        title: "Compliance & Safety",
        items: [
            {
                id: "15",
                question:
                    "Is there a vetting process for professionals working in sensitive areas such as mental health and women's health?",
                answer: (
                    <p className="mb-0">
                        Yes. Professionals working in sensitive wellness domains undergo
                        qualification verification, certification review, and experience
                        assessment before onboarding.
                    </p>
                ),
            },
            {
                id: "16",
                question: "How is employee information handled?",
                answer: (
                    <p className="mb-0">
                        SAMSARA Wellness 365 is committed to maintaining confidentiality and
                        privacy. Any information shared during consultations remains
                        confidential and is handled in accordance with applicable laws and
                        professional ethical standards.
                    </p>
                ),
            },
        ],
    },
    {
        title: "Support",
        items: [
            {
                id: "17",
                question: "What support is available during an ongoing engagement?",
                answer: (
                    <p className="mb-0">
                        A dedicated SAMSARA representative supports scheduling,
                        coordination, communication, and issue resolution throughout the
                        engagement.
                    </p>
                ),
            },
            {
                id: "18",
                question: "How do we report an issue with a professional or session quality?",
                answer: (
                    <p className="mb-0">
                        Organizations can contact their assigned SAMSARA representative.
                        All concerns are reviewed promptly, and appropriate action is taken
                        to ensure service quality.
                    </p>
                ),
            },
            {
                id: "19",
                question: "What channels can we reach SAMSARA through?",
                answer: (
                    <>
                        <p className="mb-0">You can contact us via:</p>
                        <AnswerList
                            items={["Email", "Phone", "WhatsApp", "Dedicated Account Manager (for ongoing engagements)"]}
                        />
                    </>
                ),
            },
        ],
    },
    {
        title: "Vetting & Quality Control",
        items: [
            {
                id: "20",
                question: "How are wellness professionals verified?",
                answer: (
                    <>
                        <p className="mb-0">All professionals undergo a screening process that may include:</p>
                        <AnswerList
                            items={[
                                "Identity Verification",
                                "Qualification Verification",
                                "Certification Review",
                                "Experience Assessment",
                                "Profile Evaluation",
                            ]}
                        />
                    </>
                ),
            },
            {
                id: "21",
                question: "What happens if a trainer cancels a session or is not the right fit?",
                answer: (
                    <p className="mb-0">
                        In the event of an unforeseen cancellation or mismatch, SAMSARA will
                        work to arrange a suitable replacement professional or reschedule
                        the session, subject to availability.
                    </p>
                ),
            },
            {
                id: "22",
                question: "Is there a feedback mechanism after sessions?",
                answer: (
                    <p className="mb-0">
                        Yes. Feedback can be submitted after every session, enabling
                        continuous quality improvement and better participant experiences.
                    </p>
                ),
            },
        ],
    },
    {
        title: "Data & Platform",
        items: [
            {
                id: "23",
                question: "Is there a dashboard for HR teams?",
                answer: (
                    <>
                        <p className="mb-0">Yes. HR teams can use the SAMSARA Wellness 365 platform to:</p>
                        <AnswerList
                            items={[
                                "Browse Wellness Professionals",
                                "Manage Bookings",
                                "View Upcoming Sessions",
                                "Track Engagement History",
                                "Access Program Information",
                                "Manage Wellness Requirements",
                            ]}
                        />
                    </>
                ),
            },
        ],
    },
    {
        title: "Operations & Logistics",
        items: [
            {
                id: "24",
                question: "What is the cancellation and rescheduling policy?",
                answer: (
                    <p className="mb-0">
                        Cancellation and rescheduling policies depend on the professional,
                        engagement type, and notice period provided. Applicable terms will
                        be communicated before booking confirmation.
                    </p>
                ),
            },
            {
                id: "25",
                question: "Are travel and venue costs included in pricing?",
                answer: (
                    <p className="mb-0">
                        For onsite engagements, travel, accommodation, venue, and other
                        logistical expenses may be charged separately unless explicitly
                        included in the quotation.
                    </p>
                ),
            },
        ],
    },
    {
        title: "Annual Wellness Programs",
        items: [
            {
                id: "26",
                question: "Can we build an annual wellness calendar through SAMSARA?",
                answer: (
                    <>
                        <p className="mb-0">
                            Yes. Organizations can create customized annual wellness
                            calendars featuring:
                        </p>
                        <AnswerList
                            items={[
                                "Yoga",
                                "Meditation",
                                "Mental Wellbeing",
                                "Women's Health",
                                "Nutrition",
                                "Ayurveda",
                                "Stress Management",
                                "Mindfulness",
                                "Employee Engagement Activities",
                                "Health Awareness Campaigns",
                            ]}
                        />
                    </>
                ),
            },
        ],
    },
    {
        title: "Why SAMSARA Wellness 365?",
        items: [
            {
                id: "27",
                question: "Why do corporates choose SAMSARA Wellness 365?",
                answer: (
                    <AnswerList
                        items={[
                            "One Platform for All Wellness Needs",
                            "Verified Wellness Professionals",
                            "Flexible Booking Durations",
                            "Online & Offline Sessions",
                            "Pan-India Coverage",
                            "Dedicated Corporate Support",
                            "HR-Friendly Booking Platform",
                            "Trial Sessions Available",
                            "Annual Wellness Planning Support",
                            "Customized Employee Wellbeing Programs",
                        ]}
                    />
                ),
            },
        ],
    },
];

/** Single Preline `hs-accordion` item — header toggle + collapsible answer body. */
const FaqAccordionItem: React.FC<FaqItem> = ({ id, question, answer, defaultOpen }) => {
    const headingId = `hs-accordion-heading-faq-${id}`;
    const collapseId = `hs-accordion-collapse-faq-${id}`;

    return (
        <div
            className={`hs-accordion ${defaultOpen ? "active" : ""} overflow-hidden border -mt-px first:rounded-t-sm last:rounded-b-sm dark:bg-bgdark dark:border-white/10`}
            id={headingId}
        >
            <button
                className="hs-accordion-toggle hs-accordion-active:text-primary hs-accordion-active:bg-primary/10 group py-4 px-5 inline-flex items-center justify-between gap-x-3 w-full font-semibold text-start text-gray-800 transition hover:text-gray-500 dark:hs-accordion-active:text-primary dark:text-gray-200 dark:hover:text-white/80"
                aria-controls={collapseId}
                type="button"
            >
                <span>{question}</span>
                <svg
                    className="hs-accordion-active:hidden hs-accordion-active:text-primary hs-accordion-active:group-hover:text-primary flex-shrink-0 block w-4 h-3 text-gray-600 group-hover:text-gray-500 dark:text-[#8c9097] dark:text-white/50"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M2 5L8.16086 10.6869C8.35239 10.8637 8.64761 10.8637 8.83914 10.6869L15 5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                </svg>
                <svg
                    className="hs-accordion-active:block hs-accordion-active:text-primary hs-accordion-active:group-hover:text-primary flex-shrink-0 hidden w-4 h-3 text-gray-600 group-hover:text-gray-500 dark:text-[#8c9097] dark:text-white/50"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M2 11L8.16086 5.31305C8.35239 5.13625 8.64761 5.13625 8.83914 5.31305L15 11"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                </svg>
            </button>
            <div
                id={collapseId}
                className={`hs-accordion-content ${defaultOpen ? "w-full" : "hidden w-full"} overflow-hidden transition-[height] duration-300`}
                aria-labelledby={headingId}
            >
                <div className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed py-4 px-5">
                    {answer}
                </div>
            </div>
        </div>
    );
};

const CompanyFaqPage = () => {
    return (
        <Fragment>
            <Seo title={"FAQ"} />
            <div>
                <h4 className="text-lg sm:text-xl font-bold mb-4 text-defaulttextcolor">
                    SAMSARA Wellness 365 — Frequently Asked Questions
                </h4>

                {FAQ_SECTIONS.map((section, sectionIdx) => (
                    <div className="box" key={section.title || `section-${sectionIdx}`}>
                        {section.title && (
                            <div className="box-header">
                                <div className="box-title">{section.title}</div>
                            </div>
                        )}
                        <div className="box-body">
                            <div className="hs-accordion-group">
                                {section.items.map((item) => (
                                    <FaqAccordionItem key={item.id} {...item} />
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Fragment>
    );
};

export default CompanyFaqPage;
