"use client";
import React from 'react';
import {
  COMPANY_LEGAL_META,
  COMPANY_PRIVACY_INTRO,
  COMPANY_PRIVACY_SECTIONS,
  COMPANY_TERMS_INTRO,
  COMPANY_TERMS_SECTIONS,
  CompanyLegalSection,
} from '@/shared/content/companyLegalContent';

/**
 * Render a numbered legal section with optional bullet list.
 *
 * @param section - Section title, id, and body content.
 * @returns Semantic section element.
 */
function LegalSectionBlock({ section }: { section: CompanyLegalSection }) {
  return (
    <section id={section.id} className="company-legal-section scroll-mt-24" aria-labelledby={`${section.id}-heading`}>
      <h3 id={`${section.id}-heading`} className="company-legal-section-title">
        {section.title}
      </h3>
      {section.paragraphs.map((paragraph) => (
        <p key={paragraph} className="company-legal-paragraph">
          {paragraph}
        </p>
      ))}
      {section.bullets && section.bullets.length > 0 && (
        <ul className="company-legal-list">
          {section.bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

/**
 * Full company Terms & Conditions and Privacy Policy document body.
 *
 * @returns Structured legal content for corporate CRM users.
 */
const CompanyLegalDocument: React.FC = () => {
  return (
    <article className="company-legal-article">
      <header className="company-legal-doc-header">
        <p className="company-legal-eyebrow">Samsara Wellness CRM — Corporate Clients</p>
        <h1 className="company-legal-doc-title">{COMPANY_LEGAL_META.documentTitle}</h1>
        <dl className="company-legal-meta-grid">
          <div>
            <dt>Version</dt>
            <dd>{COMPANY_LEGAL_META.version}</dd>
          </div>
          <div>
            <dt>Operating entity</dt>
            <dd>{COMPANY_LEGAL_META.operatingEntity}</dd>
          </div>
          <div>
            <dt>Brand portal</dt>
            <dd>{COMPANY_LEGAL_META.brandPortal}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt>Applicability</dt>
            <dd>{COMPANY_LEGAL_META.applicability}</dd>
          </div>
        </dl>
      </header>

      <nav className="company-legal-toc" aria-label="Document sections">
        <p className="company-legal-toc-label">On this page</p>
        <ul>
          <li>
            <a href="#terms">Part 1: Terms and Conditions</a>
          </li>
          <li>
            <a href="#privacy">Part 2: Data Privacy &amp; Protection Policy</a>
          </li>
          <li>
            <a href="#contact">Legal &amp; privacy contact</a>
          </li>
        </ul>
      </nav>

      <section id="terms" className="company-legal-part scroll-mt-24" aria-labelledby="terms-part-heading">
        <h2 id="terms-part-heading" className="company-legal-part-title">
          Part 1: Terms and Conditions (T&amp;C)
        </h2>
        {COMPANY_TERMS_INTRO.map((paragraph) => (
          <p key={paragraph} className="company-legal-paragraph">
            {paragraph}
          </p>
        ))}
        {COMPANY_TERMS_SECTIONS.map((section) => (
          <LegalSectionBlock key={section.id} section={section} />
        ))}
      </section>

      <section id="privacy" className="company-legal-part scroll-mt-24" aria-labelledby="privacy-part-heading">
        <h2 id="privacy-part-heading" className="company-legal-part-title">
          Part 2: Data Privacy &amp; Protection Policy
        </h2>
        {COMPANY_PRIVACY_INTRO.map((paragraph) => (
          <p key={paragraph} className="company-legal-paragraph">
            {paragraph}
          </p>
        ))}
        {COMPANY_PRIVACY_SECTIONS.map((section) => (
          <LegalSectionBlock key={section.id} section={section} />
        ))}
      </section>

      <footer id="contact" className="company-legal-contact scroll-mt-24">
        <h2 className="company-legal-part-title">Legal &amp; privacy contact</h2>
        <p className="company-legal-paragraph mb-0">
          Email:{' '}
          <a href={`mailto:${COMPANY_LEGAL_META.legalEmail}`} className="company-legal-link">
            {COMPANY_LEGAL_META.legalEmail}
          </a>
        </p>
      </footer>
    </article>
  );
};

export default CompanyLegalDocument;
