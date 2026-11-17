import { siteConfig } from '@/config/site.config';

export const MARKETING_COPY = {
  HOME_TITLE: 'Home',
  HOME_DESCRIPTION: `${siteConfig.name} is a starter for a new product: a public site, user accounts, and email. Clone it, replace this copy, and keep the pieces you need.`,
  HERO_TITLE: 'Ship the next project from a working base.',
  HERO_BODY:
    'The public site, accounts, and email are already connected. Clone this repo, then replace the placeholder copy.',
  CTA_REGISTER: 'Create an account',
  NAV_LOGIN: 'Sign in',
  NAV_REGISTER: 'Create account',
  NAV_MENU: 'Open menu',
  NAV_ACCOUNT: 'Account',
  THEME_TO_DARK: 'Switch to dark theme',
  THEME_TO_LIGHT: 'Switch to light theme',
  FEATURES_TITLE: 'What you keep',
  FEATURES_INTRO: 'The starter includes the pages and account flow a new product needs on day one.',
  FEATURES: [
    {
      title: 'Public site',
      body: 'A landing page, privacy policy, terms, and a thank-you page, with metadata and a share image.',
    },
    {
      title: 'Accounts',
      body: 'People can register, verify email, sign in, reset a password, and update the name on their profile.',
    },
    {
      title: 'Room to grow',
      body: 'Roles, an audit log, and dashboard totals already exist on the API. Admin screens can sit on top.',
    },
  ],
  HOW_TITLE: 'How it works',
  HOW_STEPS: [
    {
      title: 'Clone the repo',
      body: 'Copy the project, set the site name, and point it at your own database.',
    },
    {
      title: 'Create an account',
      body: 'Register, open the verification email, and sign in to the account page.',
    },
    {
      title: 'Replace this copy',
      body: 'Swap the placeholder sentences, colors, and legal text for the product you are shipping.',
    },
  ],
  FAQ_TITLE: 'Questions',
  FAQ: [
    {
      question: 'Do I need to verify email before I sign in?',
      answer:
        'No. Sign-in works before the email is verified. The thank-you page can send the verification email again.',
    },
    {
      question: 'Where does the session live?',
      answer:
        'The session stays in httpOnly cookies. Page scripts cannot read the access token or the refresh token.',
    },
    {
      question: 'Can I change the name and the green color?',
      answer:
        'Yes. The name, tagline, and contact email live in the site config. The green color is a theme token.',
    },
    {
      question: 'Is an admin portal included?',
      answer:
        'The API already covers admin user actions, dashboard totals, and the audit log. The admin screens are the next build step.',
    },
  ],
  FOOTER_PRIVACY: 'Privacy',
  FOOTER_TERMS: 'Terms',
  FOOTER_NOTE: `${siteConfig.name} is a starter template.`,
  PRIVACY_TITLE: 'Privacy',
  PRIVACY_DESCRIPTION: `This privacy policy is a template for ${siteConfig.name}. It explains account data, cookies, and how to reach us. Replace it with your own policy before launch.`,
  PRIVACY_INTRO: (name: string) =>
    `${name} stores the account details you submit so you can sign in and recover a password. Replace this page before launch.`,
  PRIVACY_CONTACT: 'Questions about this policy can be sent to',
  PRIVACY_SECTIONS: [
    {
      title: 'Account data',
      body: 'Creating an account stores your name, email, a password hash, and the time the account was created.',
    },
    {
      title: 'Cookies',
      body: 'Sign-in uses httpOnly cookies. Scripts on the page cannot read them, and they are sent only to this site.',
    },
    {
      title: 'Email',
      body: 'Verification and password reset messages go to the email address on the account. You can ask for a new link from the site.',
    },
  ],
  TERMS_TITLE: 'Terms',
  TERMS_DESCRIPTION: `These terms are a template for using ${siteConfig.name}. They cover accounts, acceptable use, and how to contact us. Replace them with terms written for your product.`,
  TERMS_INTRO: (name: string) =>
    `These terms cover use of the ${name} starter. They are placeholder text. Replace them with terms written for your product.`,
  TERMS_CONTACT: 'Questions about these terms can be sent to',
  TERMS_SECTIONS: [
    {
      title: 'Using the starter',
      body: 'You may clone this project for your own product. Replace this page, the privacy page, and the site config before you launch.',
    },
    {
      title: 'Accounts',
      body: 'You are responsible for the password on your account and for what happens after you sign in.',
    },
    {
      title: 'Changes',
      body: 'When you edit the site config or these pages, the published text changes with the next deployment.',
    },
  ],
  LEGAL_TEMPLATE: 'This page is placeholder text. Replace it before you launch.',
  LEGAL_UPDATED: (date: string) => `Last updated ${date}.`,
  THANK_YOU_TITLE: 'Check your inbox',
  THANK_YOU_DESCRIPTION: `Your ${siteConfig.name} account is ready. Check your inbox for the verification email, resend it if it does not arrive, then sign in to open your account.`,
  THANK_YOU_BODY: (email: string) =>
    `We sent a verification link to ${email}. You can sign in before you open it.`,
  THANK_YOU_BODY_NO_EMAIL:
    'Your account is created. Check your inbox for the verification link. You can sign in before you open it.',
  THANK_YOU_RESEND: 'Resend email',
  THANK_YOU_RESEND_WAIT: (seconds: number) => `Resend email in ${seconds}s`,
  THANK_YOU_LOGIN: 'Sign in',
  THANK_YOU_MISSING_EMAIL:
    'Open this page from the registration form to resend the verification email.',
} as const;
