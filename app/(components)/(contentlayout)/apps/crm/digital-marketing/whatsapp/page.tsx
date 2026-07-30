"use client";

import React, { Fragment } from "react";
import Seo from "@/shared/layout-components/seo/seo";
import { CrmPageHeader, CrmCard } from "../../components";

/**
 * Placeholder for future WhatsApp marketing integration.
 */
const WhatsAppMarketingPage = () => {
  return (
    <Fragment>
      <Seo title="WhatsApp Marketing" />
      <div className="p-[10px]">
        <CrmPageHeader
          title="WhatsApp Marketing"
          subtitle="Bulk WhatsApp campaigns will be available here soon"
        />
        <CrmCard>
          <div className="p-8 text-center" role="status" aria-live="polite">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 text-success text-3xl mb-4">
              <i className="ri-whatsapp-line" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Coming soon</h2>
            <p className="text-[13px] text-gray-500 max-w-md mx-auto">
              WhatsApp template messaging, audience segments, and delivery tracking are planned for a future release.
              Use Email Marketing and Contacts in the meantime.
            </p>
          </div>
        </CrmCard>
      </div>
    </Fragment>
  );
};

export default WhatsAppMarketingPage;
