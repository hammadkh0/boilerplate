import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

import { AppConfigService } from '../config/app-config.service';
import { buildEmailBranding, renderEmailTemplate } from './helpers';

export type OutboundEmail = {
  to: string;
  subject: string;
  html: string;
};

/**
 * Sends transactional mail through Resend.
 * In tests it keeps the message in memory so the suite can read the one-time link.
 * Callers send after the database transaction commits.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly outbox: OutboundEmail[] = [];
  private resend: Resend | undefined;

  constructor(private readonly config: AppConfigService) {}

  /** Messages captured while `NODE_ENV` is `test`. Empty in other environments. */
  get sent(): readonly OutboundEmail[] {
    return this.outbox;
  }

  async sendVerification(to: string, fullName: string, token: string): Promise<void> {
    const actionUrl = `${this.config.frontendUrl}/verify-email?token=${encodeURIComponent(token)}`;
    await this.send(to, 'Verify your email', 'verify-email', { fullName, actionUrl });
  }

  async sendPasswordReset(to: string, fullName: string, token: string): Promise<void> {
    const actionUrl = `${this.config.frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;
    await this.send(to, 'Reset your password', 'reset-password', { fullName, actionUrl });
  }

  async sendPasswordChanged(to: string, fullName: string): Promise<void> {
    await this.send(to, 'Your password was changed', 'password-changed', { fullName });
  }

  private async send(
    to: string,
    subject: string,
    templateName: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    const html = await renderEmailTemplate(
      templateName,
      { ...buildEmailBranding(this.config.appName), ...data },
      'auth',
    );
    const message = { to, subject, html };

    if (this.config.nodeEnv === 'test') {
      this.outbox.push(message);
      return;
    }

    this.resend ??= new Resend(this.config.resendApiKey);
    const result = await this.resend.emails.send({
      from: this.config.emailFrom,
      to,
      subject,
      html,
    });
    if (result.error) {
      this.logger.error(`Email send failed: ${result.error.name}`);
      throw new Error('Email send failed');
    }
  }
}
