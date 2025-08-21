import { NextResponse } from 'next/server';
import { fetchHeadlines } from '@/lib/scraper';
import prisma from '@/lib/db';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

// This cron job is designed to be run frequently (e.g., every minute).
// It will check which users are due for a digest and send it.
export async function GET() {
  console.log("Cron job started: checking for users due for a digest.");

  try {
    const usersWithPrefs = await prisma.user.findMany({
      where: {
        preference: {
          digestsEnabled: true,
        },
      },
      include: {
        preference: true,
      },
    });

    if (usersWithPrefs.length === 0) {
      console.log("Cron job finished: No users are subscribed to digests.");
      return NextResponse.json({ ok: true, message: 'No users subscribed to digests.' });
    }

    // Fetch headlines once for all users due in this run
    const headlines = await fetchHeadlines();
    if (headlines.length === 0) {
      console.log("Cron job finished: No new headlines found on the site.");
      return NextResponse.json({ ok: true, message: 'No new headlines found on the site.' });
    }

    const htmlBody = `
      <h1>Your IndiBrief Digest</h1>
      <p>Here are the latest headlines:</p>
      <ul>
        ${headlines.map(h => `<li><a href="${h.url}" target="_blank" rel="noopener noreferrer">${h.title}</a></li>`).join('')}
      </ul>
    `;

    let emailsSent = 0;
    const now = new Date();

    for (const user of usersWithPrefs) {
      // The preference object will exist due to the where clause, but we check to satisfy TypeScript
      if (user.preference) {
        const { lastDigestSentAt, intervalSeconds, recipientEmail } = user.preference;
        const recipient = recipientEmail || user.email;

        // Check if it's time to send the digest
        const shouldSend = !lastDigestSentAt || (now.getTime() > lastDigestSentAt.getTime() + intervalSeconds * 1000);

        if (shouldSend && recipient) {
          console.log(`Sending digest to ${recipient} for user ${user.id}`);

          await sendEmail({
            to: recipient,
            subject: 'Your IndiBrief Digest',
            html: htmlBody,
          });

          // Update the last sent timestamp
          await prisma.preference.update({
            where: { id: user.preference.id },
            data: { lastDigestSentAt: now },
          });

          emailsSent++;
        }
      }
    }

    const message = `Checked ${usersWithPrefs.length} subscribed users, sent ${emailsSent} digests.`;
    console.log(`Cron job finished: ${message}`);
    return NextResponse.json({ ok: true, message });

  } catch (error) {
    console.error('Error in cron job:', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to execute cron job.' },
      { status: 500 }
    );
  }
}
