interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends an email.
 * This is a MOCK email service for development. In a real application, this
 * would be replaced with a proper email provider like Resend, SendGrid, or Nodemailer.
 */
export const sendEmail = async (options: EmailOptions) => {
  console.log('====================================');
  console.log('  📧 MOCK EMAIL SERVICE: SENDING EMAIL');
  console.log('====================================');
  console.log(`  TO: ${options.to}`);
  console.log(`  SUBJECT: ${options.subject}`);
  console.log('------------------------------------');
  console.log('  BODY (HTML):');
  console.log(options.html);
  console.log('====================================');
  console.log('  ✅ EMAIL SENT SUCCESSFULLY (MOCKED)');
  console.log('====================================');

  // In a real service, you would get a response from the provider's API.
  // For this mock, we'll just simulate a success response.
  return { success: true, messageId: `mock_${Date.now()}` };
};
