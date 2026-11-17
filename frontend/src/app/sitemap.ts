import type { MetadataRoute } from 'next';

import { siteConfig } from '@/config/site.config';
import { ROUTES } from '@/constants';

const PUBLIC_PATHS = [ROUTES.HOME, ROUTES.PRIVACY, ROUTES.TERMS] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = siteConfig.url.replace(/\/$/, '');
  const lastModified = new Date(siteConfig.contentUpdated);

  return PUBLIC_PATHS.map((path) => ({
    url: `${origin}${path}`,
    lastModified,
  }));
}
