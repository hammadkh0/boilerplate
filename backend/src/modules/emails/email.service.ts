import { Injectable, Logger } from '@nestjs/common';
import { createTransport, type Transporter } from 'nodemailer';
import { Resend } from 'resend';

import { AppConfigService } from '../config/app-config.service';
import { EMAIL_TRANSPORT, ENVIRONMENTS } from '../shared/constants';
import { buildEmailBranding, renderEmailTemplate } from './helpers';

export type OutboundEmail = {
  to: string;
  subject: string;
  html: string;
};

/**
 * Sends transactional mail through Resend, or through SMTP to a local inbox such as Mailpit.
 * In Jest tests it keeps the message in memory so the suite can read the one-time link.
 * Callers send after the database transaction commits.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly outbox: OutboundEmail[] = [];
  private resend: Resend | undefined;
  private smtp: Transporter | undefined;

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

    if (this.config.nodeEnv === ENVIRONMENTS.TEST) {
      this.outbox.push(message);
      return;
    }

    if (this.config.emailTransport === EMAIL_TRANSPORT.SMTP) {
      await this.sendSmtp(message);
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

  private async sendSmtp(message: OutboundEmail): Promise<void> {
    this.smtp ??= createTransport({ ...this.config.smtp, secure: false });
    try {
      await this.smtp.sendMail({ from: this.config.emailFrom, ...message });
    } catch (error: unknown) {
      this.logger.error(`SMTP send failed: ${error instanceof Error ? error.name : 'unknown'}`);
      throw new Error('Email send failed', { cause: error });
    }
  }
}
