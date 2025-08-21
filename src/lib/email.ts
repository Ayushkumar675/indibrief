import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// These variables are loaded from the .env file.
const smtpHost = process.env.EMAIL_SERVER_HOST;
const smtpPort = Number(process.env.EMAIL_SERVER_PORT);
const smtpUser = process.env.EMAIL_SERVER_USER;
const smtpPass = process.env.EMAIL_SERVER_PASSWORD;
const emailFrom = process.env.EMAIL_FROM;

const isEmailServiceConfigured = smtpHost && smtpPort && smtpUser && smtpPass && emailFrom;

// We only create the transporter if the service is fully configured.
const transporter = isEmailServiceConfigured ? nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465, // true for 465, false for other ports
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
}) : null;

if (!isEmailServiceConfigured) {
  const message = 'Email server environment variables are not fully set. Falling back to mock email service.';
  if (process.env.NODE_ENV === 'production') {
    // In production, this should be a critical failure.
    throw new Error(message);
  } else {
    console.warn(`⚠️ ${message}`);
  }
}

/**
 * Sends an email using the configured Nodemailer transport.
 * If the transport is not configured, it falls back to logging to the console.
 */
export const sendEmail = async (options: EmailOptions) => {
  if (!transporter) {
    console.log('====================================');
    console.log('  📧 MOCK EMAIL (service not configured)');
    console.log('====================================');
    console.log(`  TO: ${options.to}`);
    console.log(`  SUBJECT: ${options.subject}`);
    console.log('------------------------------------');
    console.log('  BODY (HTML):');
    console.log(options.html);
    console.log('====================================');
    return { success: true, messageId: `mock_${Date.now()}` };
  }

  try {
    const info = await transporter.sendMail({
      from: emailFrom,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    console.log('Message sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email with Nodemailer:', error);
    // Re-throwing the error or returning a structured error response is
    // better than swallowing it, so the caller knows the operation failed.
    throw new Error('Failed to send email.');
  }
};
