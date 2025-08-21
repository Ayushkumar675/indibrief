import { NextResponse } from 'next/server';
import { fetchHeadlines } from '@/lib/scraper';
import prisma from '@/lib/db';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

// This cron job is designed to be run frequently (e.g., every minute).
export async function GET() {
  console.log("Cron job started.");

  try {
    // Step 1: Always fetch and save new headlines.
    const headlines = await fetchHeadlines();
    let newHeadlinesCount = 0;
    if (headlines.length > 0) {
      // Use a loop with try/catch to gracefully handle unique constraint violations,
      // as `skipDuplicates` is not supported on SQLite.
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
          // @ts-expect-error - Prisma's error type includes a 'code' property.
          if (error.code !== 'P2002') {
            // Log any error that is not a unique constraint violation
            console.error(`Failed to create headline "${headline.title}":`, error);
          }
        }
      }
      console.log(`Saved ${newHeadlinesCount} new headlines.`);
    } else {
      console.log("No new headlines found on the site.");
    }

    // Step 2: Check for users who are due for a digest.
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
      const message = `Saved ${newHeadlinesCount} headlines. No users are subscribed to digests.`;
      console.log(`Cron job finished: ${message}`);
      return NextResponse.json({ ok: true, message });
    }

    // If we are here, there are subscribed users. Let's get the latest headlines for them.
    const latestHeadlines = await prisma.headline.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
    });

    if (latestHeadlines.length === 0) {
      const message = `Saved ${newHeadlinesCount} headlines, but no headlines are available in DB to send.`;
      console.log(`Cron job finished: ${message}`);
      return NextResponse.json({ ok: true, message });
    }

    const htmlBody = `
      <h1>Your IndiBrief Digest</h1>
      <p>Here are the latest headlines:</p>
      <ul>
        ${latestHeadlines.map(h => `<li><a href="${h.url}" target="_blank" rel="noopener noreferrer">${h.title}</a></li>`).join('')}
      </ul>
    `;

    let emailsSent = 0;
    const now = new Date();

    for (const user of usersWithPrefs) {
      if (user.preference) {
        const { lastDigestSentAt, intervalSeconds, recipientEmail } = user.preference;
        const recipient = recipientEmail || user.email;

        const shouldSend = !lastDigestSentAt || (now.getTime() > lastDigestSentAt.getTime() + intervalSeconds * 1000);

        if (shouldSend && recipient) {
          console.log(`Sending digest to ${recipient} for user ${user.id}`);
          await sendEmail({ to: recipient, subject: 'Your IndiBrief Digest', html: htmlBody });
          await prisma.preference.update({
            where: { id: user.preference.id },
            data: { lastDigestSentAt: now },
          });
          emailsSent++;
        }
      }
    }

    const message = `Saved ${newHeadlinesCount} new headlines. Checked ${usersWithPrefs.length} subscribed users, sent ${emailsSent} digests.`;
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
