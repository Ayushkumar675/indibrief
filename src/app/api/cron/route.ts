import { NextResponse } from 'next/server';
import { fetchHeadlines } from '@/lib/scraper';
import { summarizeArticle } from '@/lib/gemini';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

// This cron job fetches new headlines, summarizes them, and saves them.
export async function GET() {
  console.log("Cron job started: fetching and summarizing new headlines.");

  try {
    const headlines = await fetchHeadlines();
    let newHeadlinesCount = 0;

    if (headlines.length > 0) {
      for (const headline of headlines) {
        try {
          // Get the summary from Gemini
          const summary = await summarizeArticle(headline.content || "");

          await prisma.headline.create({
            data: {
              title: headline.title,
              url: headline.url,
              summary: summary,
            },
          });
          newHeadlinesCount++;
        } catch (error) {
          // @ts-expect-error - Prisma's error type includes a 'code' property.
          if (error.code !== 'P2002') {
            console.error(`Failed to create headline "${headline.title}":`, error);
          }
        }
      }
      const message = `Cron job finished: Saved and summarized ${newHeadlinesCount} new headlines.`;
      console.log(message);
      return NextResponse.json({ ok: true, message });
    } else {
      const message = "Cron job finished: No new headlines found on the site.";
      console.log(message);
      return NextResponse.json({ ok: true, message });
    }
  } catch (error) {
    console.error('Error in cron job:', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to execute cron job.' },
      { status: 500 }
    );
  }
}
