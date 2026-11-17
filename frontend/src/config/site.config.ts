import { publicEnv } from './env';

export const siteConfig = {
  name: 'Acme',
  tagline: 'Start the next client project from here.',
  description:
    'Acme is the starting point for a new product. It includes a public site, user accounts, and an admin portal you can clone and make your own.',
  url: publicEnv.NEXT_PUBLIC_SITE_URL,
  contactEmail: 'hello@example.com',
  legalUpdatedLabel: 'November 17, 2026',
  contentUpdated: '2026-11-17',
} as const;
