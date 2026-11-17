import Link from 'next/link';

import { MARKETING_COPY } from '@/constants/copy/marketing';
import { ROUTES } from '@/constants';

const linkClass =
  'inline-flex min-h-10 items-center text-sm underline-offset-4 hover:text-foreground hover:underline';

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm">{MARKETING_COPY.FOOTER_NOTE}</p>
        <nav className="flex gap-4">
          <Link href={ROUTES.PRIVACY} className={linkClass}>
            {MARKETING_COPY.FOOTER_PRIVACY}
          </Link>
          <Link href={ROUTES.TERMS} className={linkClass}>
            {MARKETING_COPY.FOOTER_TERMS}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
