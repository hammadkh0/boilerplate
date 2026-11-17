import type { Metadata } from 'next';

import { LegalPage } from '@/components/marketing/legal-page';
import { siteConfig } from '@/config/site.config';
import { MARKETING_COPY } from '@/constants/copy/marketing';
import { ROUTES } from '@/constants';

export const metadata: Metadata = {
  title: MARKETING_COPY.PRIVACY_TITLE,
  description: MARKETING_COPY.PRIVACY_DESCRIPTION,
  alternates: { canonical: ROUTES.PRIVACY },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title={MARKETING_COPY.PRIVACY_TITLE}
      intro={MARKETING_COPY.PRIVACY_INTRO(siteConfig.name)}
      contactLead={MARKETING_COPY.PRIVACY_CONTACT}
      sections={MARKETING_COPY.PRIVACY_SECTIONS}
    />
  );
}
