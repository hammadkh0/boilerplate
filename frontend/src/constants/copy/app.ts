import { siteConfig } from '@/config/site.config';

export const APP_COPY = {
  HOME_TITLE: 'Home',
  HOME_DESCRIPTION: siteConfig.description,
  HOME_HEADING: siteConfig.name,
  HOME_TAGLINE: siteConfig.tagline,
  ERROR_TITLE: 'Something went wrong',
  ERROR_DESCRIPTION: 'The page failed to load. Try again, or go back to the home page.',
  ERROR_RETRY: 'Try again',
  ERROR_HOME: 'Go home',
  LOADING: 'Loading',
} as const;
