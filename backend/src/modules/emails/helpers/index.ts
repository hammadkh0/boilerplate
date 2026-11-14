import { readFile } from 'node:fs/promises';
import path from 'node:path';

import ejs from 'ejs';

export const EMAIL_LOGO_CONTENT_ID = 'app-logo';
export const EMAIL_LOGO_SRC = `cid:${EMAIL_LOGO_CONTENT_ID}`;

const TEMPLATE_ROOT = path.resolve(process.cwd(), 'src', 'modules', 'emails', 'templates');

/** Brand fields passed into every transactional template. */
export function buildEmailBranding(
  appName: string,
  logoUrl?: string,
): { appName: string; logoSrc: string } {
  return {
    appName,
    logoSrc: logoUrl ?? EMAIL_LOGO_SRC,
  };
}

/**
 * Renders an EJS file under `emails/templates` with HTML escaping.
 * `folderPath` is a relative folder such as `auth`. `..` segments are rejected.
 * Throws when the template file does not exist.
 */
export async function renderEmailTemplate(
  templateName: string,
  data: Record<string, unknown>,
  folderPath?: string,
): Promise<string> {
  const segments = folderPath?.split('/').filter((segment) => segment.length > 0) ?? [];
  if (segments.some((segment) => segment === '.' || segment === '..')) {
    throw new Error('Invalid template path');
  }
  if (!/^[a-z0-9-]+$/i.test(templateName)) {
    throw new Error('Invalid template name');
  }

  const templatePath = path.join(TEMPLATE_ROOT, ...segments, `${templateName}.ejs`);
  const template = await readFile(templatePath, 'utf8');
  return ejs.render(template, data, { filename: templatePath, async: false });
}

/** Replaces `{{key}}` placeholders. Missing values become an empty string. */
export function renderMessageTemplate(
  template: string,
  data?: Record<string, string | null | undefined>,
): string {
  return Object.entries(data ?? {}).reduce((result, [key, value]) => {
    return result.replaceAll(`{{${key}}}`, value ?? '');
  }, template);
}
