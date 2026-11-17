import { siteConfig } from '@/config/site.config';

export const APP_COPY = {
  ERROR_TITLE: 'Something went wrong',
  ERROR_DESCRIPTION: 'The page failed to load. Try again, or go back to the home page.',
  ERROR_RETRY: 'Try again',
  ERROR_HOME: 'Go home',
  LOADING: 'Loading',
  NOT_FOUND_TITLE: 'Page not found',
  NOT_FOUND_DESCRIPTION: `This address is not a page on the ${siteConfig.name} site. Go back to the home page, or sign in if you were trying to reach your account.`,
  NOT_FOUND_BODY: `This address is not a page on the ${siteConfig.name} site. Check the link, or use one of the actions below.`,
  NOT_FOUND_HOME: 'Go home',
  NOT_FOUND_LOGIN: 'Sign in',
} as const;
