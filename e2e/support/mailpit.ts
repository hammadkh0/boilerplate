import { expect, type APIRequestContext } from '@playwright/test';

import { MAILPIT_URL } from './env';

type MailpitSearch = { messages: { ID: string }[] };

type MailpitMessage = { HTML: string };

/** Deletes every message so a run does not click a link from an earlier attempt. */
export async function clearInbox(request: APIRequestContext): Promise<void> {
  await request.delete(`${MAILPIT_URL}/api/v1/messages`);
}

/**
 * Polls Mailpit for the newest email to `to` whose HTML links to `pathname`, and returns that link.
 * Throws when no matching message arrives within 15 seconds.
 */
export async function emailLink(
  request: APIRequestContext,
  to: string,
  pathname: string,
): Promise<string> {
  let link: string | undefined;

  await expect
    .poll(
      async () => {
        const search = await request.get(`${MAILPIT_URL}/api/v1/search`, {
          params: { query: `to:"${to}"` },
        });
        const { messages } = (await search.json()) as MailpitSearch;
        for (const { ID } of messages) {
          const message = (await (
            await request.get(`${MAILPIT_URL}/api/v1/message/${ID}`)
          ).json()) as MailpitMessage;
          const match = message.HTML.match(new RegExp(`href="([^"]*${pathname}\\?token=[^"]+)"`));
          if (match?.[1]) {
            link = match[1].replaceAll('&amp;', '&');
            return true;
          }
        }
        return false;
      },
      { timeout: 15_000 },
    )
    .toBe(true);

  if (!link) {
    throw new Error(`No ${pathname} email for ${to}`);
  }
  return link;
}
