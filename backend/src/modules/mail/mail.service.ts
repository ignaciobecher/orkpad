import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly resend: Resend | null;
  private readonly logger = new Logger(MailService.name);
  private readonly fromEmail: string;
  private readonly apiUrl: string;
  private readonly frontendUrl: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY is not set — emails will not be sent');
      this.resend = null;
    } else {
      this.resend = new Resend(apiKey);
    }
    this.fromEmail =
      configService.get<string>('FROM_EMAIL') ?? 'no-reply@orkpad.com';
    this.apiUrl =
      configService.get<string>('API_URL') ?? 'http://localhost:3000';
    this.frontendUrl =
      configService.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';
    this.logger.log(
      `Mail configured: from=${this.fromEmail} api=${this.apiUrl}`,
    );
  }

  /** Public check used by AuthService: self-hosted instances without an
   *  email provider verify new accounts immediately at registration. */
  isEmailEnabled(): boolean {
    return this.isEnabled();
  }

  /** Emails are disabled when RESEND_API_KEY is not set — log and skip. */
  private isEnabled(): boolean {
    if (!this.resend) {
      this.logger.warn('Skipping email — RESEND_API_KEY is not set');
      return false;
    }
    return true;
  }

  async sendVerificationEmail(
    to: string,
    name: string,
    token: string,
  ): Promise<void> {
    if (!this.isEnabled()) return;
    const verificationUrl = `${this.apiUrl}/auth/verify-email?token=${token}`;
    const firstName = name.split(' ')[0];

    this.logger.log(
      `Sending verification email to ${to} — url: ${verificationUrl}`,
    );
    const { data, error } = await this.resend!.emails.send({
      from: `Orkpad <${this.fromEmail}>`,
      to,
      subject: 'Confirma tu cuenta en Orkpad',
      html: this.buildVerificationTemplate(firstName, verificationUrl),
    });

    if (error) {
      this.logger.error(
        `Resend error sending verification to ${to}: ${JSON.stringify(error)}`,
      );
    } else {
      this.logger.log(`Verification email sent — id: ${data?.id}`);
    }
  }

  async sendPasswordResetEmail(
    to: string,
    name: string,
    token: string,
  ): Promise<void> {
    if (!this.isEnabled()) return;
    const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;
    const firstName = name.split(' ')[0];

    this.logger.log(`Sending password reset email to ${to}`);
    const { data, error } = await this.resend!.emails.send({
      from: `Orkpad <${this.fromEmail}>`,
      to,
      subject: 'Restablece tu contraseña de Orkpad',
      html: this.buildPasswordResetTemplate(firstName, resetUrl),
    });

    if (error) {
      this.logger.error(
        `Resend error sending reset to ${to}: ${JSON.stringify(error)}`,
      );
    } else {
      this.logger.log(`Password reset email sent — id: ${data?.id}`);
    }
  }

  private buildVerificationTemplate(name: string, url: string): string {
    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Confirma tu cuenta — Orkpad</title>
</head>
<body style="margin:0;padding:0;background-color:#09090f;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#09090f;padding:48px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
          <tr>
            <td style="padding:0 0 28px 0;">
              <span style="font-size:18px;font-weight:700;color:#e2e2f0;letter-spacing:-0.04em;">Orkpad</span><span style="display:inline-block;width:7px;height:7px;background:#5b4eff;margin-left:5px;vertical-align:middle;"></span>
            </td>
          </tr>
          <tr>
            <td style="background:#11111a;border:1px solid #1d1d2e;padding:40px;">
              <p style="margin:0 0 6px 0;font-size:10px;color:#5b4eff;text-transform:uppercase;letter-spacing:0.14em;font-family:'Courier New',monospace;">VERIFICACIÓN DE CUENTA</p>
              <h1 style="margin:0 0 18px 0;font-size:22px;font-weight:700;color:#e2e2f0;line-height:1.25;">Hola ${name}, confirmá tu email</h1>
              <p style="margin:0 0 28px 0;font-size:14px;color:#7b7b99;line-height:1.75;">Gracias por crear tu cuenta en Orkpad. Para activar tu workspace y empezar a gestionar tus proyectos, confirmá que este email es tuyo.</p>
              <table cellpadding="0" cellspacing="0" style="margin:0 0 28px 0;">
                <tr>
                  <td>
                    <a href="${url}" style="display:inline-block;background:#5b4eff;color:#ffffff;text-decoration:none;padding:13px 30px;font-size:11px;font-family:'Courier New',monospace;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">CONFIRMAR EMAIL &rarr;</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px 0;font-size:12px;color:#555570;line-height:1.6;">Si el botón no funciona, copiá este enlace en tu navegador:</p>
              <p style="margin:0 0 32px 0;font-size:12px;color:#5b4eff;word-break:break-all;line-height:1.6;">${url}</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="border-top:1px solid #1d1d2e;padding-top:24px;">
                  <p style="margin:0;font-size:12px;color:#3d3d55;line-height:1.65;">Este enlace vence en <strong style="color:#555570;">24 horas</strong>. Si no creaste una cuenta en Orkpad, podés ignorar este mensaje.</p>
                </td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 0 0 0;">
              <p style="margin:0;font-size:10px;color:#2e2e42;font-family:'Courier New',monospace;text-transform:uppercase;letter-spacing:0.06em;">© Orkpad</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  async sendTaskCompletionEmail(
    to: string,
    data: {
      clientName: string;
      projectName: string;
      taskTitle: string;
      taskDescription?: string;
      checklist?: { text: string; completed: boolean }[];
      dueDate?: Date;
      assigneeName?: string;
      completedAt: Date;
    },
  ): Promise<void> {
    const subject = `Tarea completada: ${data.taskTitle}${data.projectName ? ` - ${data.projectName}` : ''}`;
    if (!this.isEnabled()) return;
    this.logger.log(`Sending task completion email to ${to}`);
    const { data: resData, error } = await this.resend!.emails.send({
      from: `Orkpad <${this.fromEmail}>`,
      to,
      subject,
      html: this.buildTaskCompletionTemplate(data),
    });
    if (error) {
      this.logger.error(
        `Resend error sending task completion to ${to}: ${JSON.stringify(error)}`,
      );
    } else {
      this.logger.log(`Task completion email sent — id: ${resData?.id}`);
    }
  }

  private buildTaskCompletionTemplate(data: {
    clientName: string;
    projectName: string;
    taskTitle: string;
    taskDescription?: string;
    checklist?: { text: string; completed: boolean }[];
    dueDate?: Date;
    assigneeName?: string;
    completedAt: Date;
  }): string {
    const {
      clientName,
      projectName,
      taskTitle,
      taskDescription,
      checklist,
      dueDate,
      assigneeName,
      completedAt,
    } = data;
    const firstName = clientName.split(' ')[0];
    const completedStr = completedAt.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    const dueDateStr = dueDate
      ? dueDate.toLocaleDateString('es-AR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })
      : null;
    const plainDescription = taskDescription
      ? taskDescription
          .replace(/<\/p>/gi, '\n\n')
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<\/li>/gi, '\n')
          .replace(/<li>/gi, '• ')
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .trim()
      : null;

    let checklistHtml = '';
    if (checklist && checklist.length > 0) {
      const completedCount = checklist.filter((item) => item.completed).length;
      const totalCount = checklist.length;
      checklistHtml = `
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px 0;background:#0d0d16;border:1px solid #1d1d2e;padding:16px 20px;">
          <tr>
            <td>
              <p style="margin:0 0 12px 0;font-size:11px;color:#5b4eff;text-transform:uppercase;letter-spacing:0.1em;font-family:'Courier New',monospace;">Checklist (${completedCount}/${totalCount})</p>
              ${checklist
                .map(
                  (item) => `
                <tr>
                  <td style="padding:4px 0;font-size:13px;color:${item.completed ? '#10b981' : '#7b7b99'};${item.completed ? 'text-decoration:line-through;' : ''}">
                    ${item.completed ? '[X]' : '[ ]'} ${item.text}
                  </td>
                </tr>
              `,
                )
                .join('')}
            </td>
          </tr>
        </table>
      `;
    }

    const metaRows = [
      assigneeName
        ? `<tr><td style="padding:6px 0;font-size:13px;color:#7b7b99;">Realizado por</td><td style="padding:6px 0;font-size:13px;color:#e2e2f0;font-weight:500;">${assigneeName}</td></tr>`
        : '',
      dueDateStr
        ? `<tr><td style="padding:6px 0;font-size:13px;color:#7b7b99;">Fecha limite</td><td style="padding:6px 0;font-size:13px;color:#e2e2f0;">${dueDateStr}</td></tr>`
        : '',
      `<tr><td style="padding:6px 0;font-size:13px;color:#7b7b99;">Completado</td><td style="padding:6px 0;font-size:13px;color:#e2e2f0;">${completedStr}</td></tr>`,
    ]
      .filter(Boolean)
      .join('');

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Tarea completada — Orkpad</title>
</head>
<body style="margin:0;padding:0;background-color:#09090f;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#09090f;padding:48px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
          <tr>
            <td style="padding:0 0 28px 0;">
              <span style="font-size:18px;font-weight:700;color:#e2e2f0;letter-spacing:-0.04em;">Orkpad</span><span style="display:inline-block;width:7px;height:7px;background:#5b4eff;margin-left:5px;vertical-align:middle;"></span>
            </td>
          </tr>
          <tr>
            <td style="background:#11111a;border:1px solid #1d1d2e;padding:40px;">
              <p style="margin:0 0 6px 0;font-size:10px;color:#5b4eff;text-transform:uppercase;letter-spacing:0.14em;font-family:'Courier New',monospace;">ACTUALIZACION DE PROYECTO</p>
              <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:#e2e2f0;line-height:1.25;">Hola ${firstName}!</h1>
              <p style="margin:0 0 28px 0;font-size:14px;color:#7b7b99;line-height:1.75;">${projectName ? `Te informamos que finalizamos una tarea en el proyecto <strong style="color:#e2e2f0;">${projectName}</strong>.` : 'Te informamos que finalizamos la siguiente tarea.'}</p>
 
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px 0;background:#0d0d16;border:1px solid #1d1d2e;padding:20px 24px;">
                <tr>
                  <td>
                    <p style="margin:0 0 8px 0;font-size:10px;color:#5b4eff;text-transform:uppercase;letter-spacing:0.1em;font-family:'Courier New',monospace;">TAREA COMPLETADA</p>
                    <p style="margin:0 0 ${plainDescription ? '16px' : '0'};font-size:18px;font-weight:700;color:#e2e2f0;">[X] ${taskTitle}</p>
                    ${plainDescription ? `<p style="margin:0;font-size:13px;color:#7b7b99;line-height:1.65;">${plainDescription}</p>` : ''}
                    ${checklistHtml}
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px 0;border-collapse:collapse;">
                ${metaRows}
              </table>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="border-top:1px solid #1d1d2e;padding-top:24px;">
                  <p style="margin:0;font-size:13px;color:#7b7b99;line-height:1.65;">Si tenés alguna pregunta o feedback sobre esta tarea, no dudes en responder a este email. Estamos a disposición.</p>
                </td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 0 0 0;">
              <p style="margin:0;font-size:10px;color:#2e2e42;font-family:'Courier New',monospace;text-transform:uppercase;letter-spacing:0.06em;">© Orkpad</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }


  async sendFollowUpEmail(to: string, name: string): Promise<void> {
    if (!this.isEnabled()) return;
    const firstName = name.split(' ')[0];
    this.logger.log(`Sending follow-up email to ${to}`);
    const { data, error } = await this.resend!.emails.send({
      from: `Orkpad <${this.fromEmail}>`,
      to,
      subject: '¿Cómo viene tu experiencia con Orkpad?',
      html: this.buildFollowUpTemplate(firstName),
    });
    if (error) {
      this.logger.error(
        `Resend error sending follow-up to ${to}: ${JSON.stringify(error)}`,
      );
    } else {
      this.logger.log(`Follow-up email sent — id: ${data?.id}`);
    }
  }

  private buildFollowUpTemplate(firstName: string): string {
    const logoUrl = `${this.frontendUrl}/logo-white.png`;
    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>¿Cómo viene tu experiencia con Orkpad?</title>
</head>
<body style="margin:0;padding:0;background-color:#09090f;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#09090f;padding:48px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
          <tr>
            <td style="padding:0 0 28px 0;">
              <img src="${logoUrl}" alt="Orkpad" height="28" style="display:block;border:0;outline:none;text-decoration:none;">
            </td>
          </tr>
          <tr>
            <td style="background:#11111a;border:1px solid #1d1d2e;padding:40px;">
              <p style="margin:0 0 6px 0;font-size:10px;color:#5b4eff;text-transform:uppercase;letter-spacing:0.14em;font-family:'Courier New',monospace;">SEGUIMIENTO</p>
              <h1 style="margin:0 0 24px 0;font-size:22px;font-weight:700;color:#e2e2f0;line-height:1.25;">Hola ${firstName},</h1>

              <p style="margin:0 0 16px 0;font-size:14px;color:#7b7b99;line-height:1.75;">Vi que te registraste en Orkpad hace poco y quería hacer un seguimiento rápido.</p>

              <p style="margin:0 0 16px 0;font-size:14px;color:#7b7b99;line-height:1.75;">La idea de la plataforma es simple: que puedas <strong style="color:#e2e2f0;">organizar todo tu negocio freelance en un solo lugar</strong>, sin perder tiempo saltando entre herramientas o planillas.</p>

              <p style="margin:0 0 12px 0;font-size:14px;color:#7b7b99;line-height:1.75;">Si todavía no empezaste a usarlo a fondo, te recomiendo arrancar por:</p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px 0;background:#0d0d16;border:1px solid #1d1d2e;padding:20px 24px;">
                <tr>
                  <td>
                    <p style="margin:0 0 10px 0;font-size:13px;color:#e2e2f0;line-height:1.75;">
                      <span style="color:#5b4eff;font-family:'Courier New',monospace;margin-right:10px;">&rarr;</span>Crear tus primeros proyectos o clientes
                    </p>
                    <p style="margin:0 0 10px 0;font-size:13px;color:#e2e2f0;line-height:1.75;">
                      <span style="color:#5b4eff;font-family:'Courier New',monospace;margin-right:10px;">&rarr;</span>Registrar tareas o pendientes reales de tu día a día
                    </p>
                    <p style="margin:0;font-size:13px;color:#e2e2f0;line-height:1.75;">
                      <span style="color:#5b4eff;font-family:'Courier New',monospace;margin-right:10px;">&rarr;</span>Probar cómo centralizar tu flujo de trabajo
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 12px 0;font-size:14px;color:#7b7b99;line-height:1.75;">Si ya lo estuviste usando, me encantaría saber:</p>
              <p style="margin:0 0 6px 0;font-size:14px;color:#e2e2f0;line-height:1.75;">&#128073; ¿Qué te resultó útil?</p>
              <p style="margin:0 0 24px 0;font-size:14px;color:#e2e2f0;line-height:1.75;">&#128073; ¿Qué te faltó o te generó fricción?</p>

              <p style="margin:0 0 24px 0;font-size:14px;color:#7b7b99;line-height:1.75;">Estoy construyendo Orkpad muy cerca de los usuarios, así que tu feedback realmente influye en lo que viene.</p>

              <p style="margin:0 0 32px 0;font-size:14px;color:#7b7b99;line-height:1.75;">Si tenés alguna duda o querés que te dé una mano para sacarle más provecho, <strong style="color:#e2e2f0;">respondé este mail y lo vemos</strong>.</p>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="border-top:1px solid #1d1d2e;padding-top:24px;">
                  <p style="margin:0 0 4px 0;font-size:13px;color:#e2e2f0;line-height:1.65;">Abrazo,</p>
                  
                  <p style="margin:0;font-size:12px;color:#5b4eff;font-family:'Courier New',monospace;">Orkpad</p>
                </td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 0 0 0;">
              <p style="margin:0;font-size:10px;color:#2e2e42;font-family:'Courier New',monospace;text-transform:uppercase;letter-spacing:0.06em;">© Orkpad</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  async sendAnnouncementEmail(
    to: string,
    name: string,
    subject: string,
    bodyMessage: string,
    link?: string,
  ): Promise<void> {
    if (!this.isEnabled()) return;
    const firstName = name.split(' ')[0];
    this.logger.log(`Sending announcement email to ${to}`);
    const { data, error } = await this.resend!.emails.send({
      from: `Orkpad <${this.fromEmail}>`,
      to,
      subject,
      html: this.buildAnnouncementTemplate(
        firstName,
        subject,
        bodyMessage,
        link,
      ),
    });
    if (error) {
      this.logger.error(
        `Resend error sending announcement to ${to}: ${JSON.stringify(error)}`,
      );
    } else {
      this.logger.log(`Announcement email sent — id: ${data?.id}`);
    }
  }

  private buildAnnouncementTemplate(
    firstName: string,
    subject: string,
    bodyMessage: string,
    link?: string,
  ): string {
    const ctaUrl = link
      ? link.startsWith('http')
        ? link
        : `${this.frontendUrl}${link}`
      : null;
    const ctaBlock = ctaUrl
      ? `<table cellpadding="0" cellspacing="0" style="margin:0 0 4px 0;">
                <tr>
                  <td>
                    <a href="${ctaUrl}" style="display:inline-block;background:#5b4eff;color:#ffffff;text-decoration:none;padding:13px 30px;font-size:11px;font-family:'Courier New',monospace;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">VER EN ORKPAD &rarr;</a>
                  </td>
                </tr>
              </table>`
      : '';

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${subject} — Orkpad</title>
</head>
<body style="margin:0;padding:0;background-color:#09090f;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#09090f;padding:48px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
          <tr>
            <td style="padding:0 0 28px 0;">
              <span style="font-size:18px;font-weight:700;color:#e2e2f0;letter-spacing:-0.04em;">Orkpad</span><span style="display:inline-block;width:7px;height:7px;background:#5b4eff;margin-left:5px;vertical-align:middle;"></span>
            </td>
          </tr>
          <tr>
            <td style="background:#11111a;border:1px solid #1d1d2e;padding:40px;">
              <p style="margin:0 0 6px 0;font-size:10px;color:#5b4eff;text-transform:uppercase;letter-spacing:0.14em;font-family:'Courier New',monospace;">NOVEDAD</p>
              <h1 style="margin:0 0 18px 0;font-size:22px;font-weight:700;color:#e2e2f0;line-height:1.25;">Hola ${firstName},</h1>
              <p style="margin:0 0 28px 0;font-size:14px;color:#7b7b99;line-height:1.75;white-space:pre-line;">${bodyMessage}</p>
              ${ctaBlock}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 0 0 0;">
              <p style="margin:0;font-size:10px;color:#2e2e42;font-family:'Courier New',monospace;text-transform:uppercase;letter-spacing:0.06em;">© Orkpad</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  private buildPasswordResetTemplate(name: string, url: string): string {
    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Restablecé tu contraseña — Orkpad</title>
</head>
<body style="margin:0;padding:0;background-color:#09090f;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#09090f;padding:48px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
          <tr>
            <td style="padding:0 0 28px 0;">
              <span style="font-size:18px;font-weight:700;color:#e2e2f0;letter-spacing:-0.04em;">Orkpad</span><span style="display:inline-block;width:7px;height:7px;background:#5b4eff;margin-left:5px;vertical-align:middle;"></span>
            </td>
          </tr>
          <tr>
            <td style="background:#11111a;border:1px solid #1d1d2e;padding:40px;">
              <p style="margin:0 0 6px 0;font-size:10px;color:#5b4eff;text-transform:uppercase;letter-spacing:0.14em;font-family:'Courier New',monospace;">RESTABLECIMIENTO DE CONTRASEÑA</p>
              <h1 style="margin:0 0 18px 0;font-size:22px;font-weight:700;color:#e2e2f0;line-height:1.25;">Hola ${name}, recibimos tu solicitud</h1>
              <p style="margin:0 0 28px 0;font-size:14px;color:#7b7b99;line-height:1.75;">Se solicitó un restablecimiento de contraseña para tu cuenta de Orkpad. Si fuiste vos, hacé clic en el botón para crear una nueva contraseña.</p>
              <table cellpadding="0" cellspacing="0" style="margin:0 0 28px 0;">
                <tr>
                  <td>
                    <a href="${url}" style="display:inline-block;background:#5b4eff;color:#ffffff;text-decoration:none;padding:13px 30px;font-size:11px;font-family:'Courier New',monospace;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">RESTABLECER CONTRASEÑA &rarr;</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px 0;font-size:12px;color:#555570;line-height:1.6;">Si el botón no funciona, copiá este enlace en tu navegador:</p>
              <p style="margin:0 0 32px 0;font-size:12px;color:#5b4eff;word-break:break-all;line-height:1.6;">${url}</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="border-top:1px solid #1d1d2e;padding-top:24px;">
                  <p style="margin:0;font-size:12px;color:#3d3d55;line-height:1.65;">Este enlace vence en <strong style="color:#555570;">1 hora</strong>. Si no solicitaste este cambio, no es necesario que hagas nada — tu contraseña actual sigue siendo válida.</p>
                </td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 0 0 0;">
              <p style="margin:0;font-size:10px;color:#2e2e42;font-family:'Courier New',monospace;text-transform:uppercase;letter-spacing:0.06em;">© Orkpad</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }
}
