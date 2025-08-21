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

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log("Cron job started: fetching headlines...");
    const headlines = await fetchHeadlines();
    console.log(`Cron job: found ${headlines.length} headlines.`);

    let newHeadlinesCount = 0;
    if (headlines.length > 0) {
      for (const headline of headlines) {
        try {
          await prisma.headline.create({
            data: {
              title: headline.title,
              url: headline.url,
            },
          });
          newHeadlinesCount++;
        } catch (error) {
          // @ts-expect-error - Prisma's error type includes a 'code' property for known errors.
          if (error.code === 'P2002') {
            // This is a unique constraint violation, meaning the headline is a duplicate.
            // We can safely ignore this error.
          } else {
            // For any other errors, we should log them.
            console.error(`Error saving headline "${headline.title}":`, error);
          }
        }
      }
      console.log(`Cron job: saved ${newHeadlinesCount} new headlines to the database.`);
    }

    // In the future, this is where we would also trigger emails to users who are subscribed.

    return NextResponse.json({
      ok: true,
      message: `Successfully fetched ${headlines.length} headlines and saved ${newHeadlinesCount} new ones.`,
    });

  } catch (error) {
    console.error('Error in cron job:', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to execute cron job.' },
      {
        ok: false,
        message: 'Failed to execute cron job.',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
