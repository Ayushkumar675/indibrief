import { NextResponse } from 'next/server';
import { fetchHeadlines } from '@/lib/scraper';

// This is a special Next.js variable to prevent caching of this route.
// We want the cron job to trigger a fresh execution every time.
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log("Cron job started: fetching headlines...");
    const headlines = await fetchHeadlines();
    console.log(`Cron job finished: found ${headlines.length} headlines.`);

    // In the future, this is where we would:
    // 1. Deduplicate headlines against a database.
    // 2. Save the new headlines.
    // 3. Trigger emails via the sendEmail utility.

    return NextResponse.json({
      ok: true,
      message: `Successfully fetched ${headlines.length} headlines.`,
      headlines: headlines, // Returning the headlines for easy debugging
    });

  } catch (error) {
    console.error('Error in cron job:', error);
    return NextResponse.json(
      {
        ok: false,
        message: 'Failed to fetch headlines.',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
