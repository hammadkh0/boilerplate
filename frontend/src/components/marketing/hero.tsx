import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site.config';
import { MARKETING_COPY } from '@/constants/copy/marketing';
import { ROUTES } from '@/constants';

export function Hero() {
  return (
    <section
      id="hero"
      className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-8 md:grid-cols-2 md:items-center md:py-14"
    >
      <div className="flex flex-col gap-4">
        <p className="text-primary text-sm font-medium">{siteConfig.name}</p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
          {MARKETING_COPY.HERO_TITLE}
        </h1>
        <p className="text-muted-foreground text-base md:text-lg">{MARKETING_COPY.HERO_BODY}</p>
        <div>
          <Button asChild className="h-10">
            <Link href={ROUTES.REGISTER}>{MARKETING_COPY.CTA_REGISTER}</Link>
          </Button>
        </div>
      </div>
      <div className="bg-muted flex flex-col gap-3 rounded-xl p-5">
        <p className="text-sm font-medium">{siteConfig.tagline}</p>
        <p className="text-muted-foreground text-sm">{MARKETING_COPY.FEATURES_INTRO}</p>
      </div>
    </section>
  );
}
