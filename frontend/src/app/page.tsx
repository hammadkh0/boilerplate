import type { Metadata } from 'next';

import { APP_COPY } from '@/constants/copy/app';
import { ROUTES } from '@/constants';
import { siteConfig } from '@/config/site.config';

export const metadata: Metadata = {
  title: APP_COPY.HOME_TITLE,
  description: APP_COPY.HOME_DESCRIPTION,
  alternates: { canonical: ROUTES.HOME },
};

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-4 px-6 py-24">
      <p className="text-primary text-sm font-medium">{siteConfig.name}</p>
      <h1 className="text-4xl font-semibold tracking-tight">{APP_COPY.HOME_HEADING}</h1>
      <p className="text-muted-foreground max-w-xl text-lg">{APP_COPY.HOME_TAGLINE}</p>
    </main>
  );
}
