import type { Metadata } from 'next';

import { LegalPage } from '@/components/marketing/legal-page';
import { siteConfig } from '@/config/site.config';
import { MARKETING_COPY } from '@/constants/copy/marketing';
import { ROUTES } from '@/constants';

export const metadata: Metadata = {
  title: MARKETING_COPY.TERMS_TITLE,
  description: MARKETING_COPY.TERMS_DESCRIPTION,
  alternates: { canonical: ROUTES.TERMS },
};

export default function TermsPage() {
  return (
    <LegalPage
      title={MARKETING_COPY.TERMS_TITLE}
      intro={MARKETING_COPY.TERMS_INTRO(siteConfig.name)}
      contactLead={MARKETING_COPY.TERMS_CONTACT}
      sections={MARKETING_COPY.TERMS_SECTIONS}
    />
  );
}
