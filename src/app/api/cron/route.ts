import { NextResponse } from 'next/server';
import { fetchHeadlines } from '@/lib/scraper';
import prisma from '@/lib/db';

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
      {
        ok: false,
        message: 'Failed to execute cron job.',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
