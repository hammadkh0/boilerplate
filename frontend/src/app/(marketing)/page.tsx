import type { Metadata } from 'next';

import { Faq } from '@/components/marketing/faq';
import { Features } from '@/components/marketing/features';
import { Hero } from '@/components/marketing/hero';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { MARKETING_COPY } from '@/constants/copy/marketing';
import { ROUTES } from '@/constants';

export const metadata: Metadata = {
  title: MARKETING_COPY.HOME_TITLE,
  description: MARKETING_COPY.HOME_DESCRIPTION,
  alternates: { canonical: ROUTES.HOME },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <Faq />
    </>
  );
}
