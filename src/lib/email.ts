// src/lib/email.ts

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends an email.
 * In a real application, this would use an email provider like
 * Resend, SendGrid, or Nodemailer.
 */
export const sendEmail = async (options: EmailOptions) => {
  // Placeholder implementation
  console.log('Sending email...');
  console.log(`  To: ${options.to}`);
  console.log(`  Subject: ${options.subject}`);
  console.log(`  Body: ${options.html.substring(0, 100)}...`);

  // For now, simulate a successful email send
  return { success: true };
};
