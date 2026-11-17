import type { Metadata } from 'next';
import { Suspense } from 'react';
import { z } from 'zod';

import { ThankYouPanel } from '@/components/marketing/thank-you-panel';
import { MARKETING_COPY } from '@/constants/copy/marketing';
import { PRIVATE_PAGE_ROBOTS } from '@/constants';
import { readSearchParam } from '@/lib/utils';
import MarketingLoading from '../loading';

export const metadata: Metadata = {
  title: MARKETING_COPY.THANK_YOU_TITLE,
  description: MARKETING_COPY.THANK_YOU_DESCRIPTION,
  robots: PRIVATE_PAGE_ROBOTS,
};

export default function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<MarketingLoading />}>
      <ThankYouContent searchParams={searchParams} />
    </Suspense>
  );
}

async function ThankYouContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const parsed = z
    .email()
    .max(254)
    .safeParse(readSearchParam(params.email) ?? '');

  return <ThankYouPanel email={parsed.success ? parsed.data : null} />;
}
