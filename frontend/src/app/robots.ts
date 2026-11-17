import type { MetadataRoute } from 'next';

import { siteConfig } from '@/config/site.config';
import { ROUTES } from '@/constants';

export default function robots(): MetadataRoute.Robots {
  const origin = siteConfig.url.replace(/\/$/, '');

  return {
    rules: {
      userAgent: '*',
      allow: ROUTES.HOME,
      disallow: [
        '/admin',
        ROUTES.ACCOUNT,
        ROUTES.LOGIN,
        ROUTES.REGISTER,
        ROUTES.FORGOT_PASSWORD,
        ROUTES.RESET_PASSWORD,
        ROUTES.VERIFY_EMAIL,
      ],
    },
    sitemap: `${origin}/sitemap.xml`,
  };
}
