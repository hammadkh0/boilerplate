'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { MARKETING_COPY } from '@/constants/copy/marketing';
import { ROUTES } from '@/constants';

const HERO_ID = 'hero';

export function StickyMobileCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById(HERO_ID);
    if (!hero) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry) {
        return;
      }
      setVisible(!entry.isIntersecting);
    });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className="bg-background fixed inset-x-0 bottom-0 z-40 border-t p-3 md:hidden">
      <Button asChild className="h-10 w-full">
        <Link href={ROUTES.REGISTER}>{MARKETING_COPY.CTA_REGISTER}</Link>
      </Button>
    </div>
  );
}
