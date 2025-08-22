import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { sendEmail } from '@/lib/email';

export async function POST() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const headlines = await prisma.headline.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (headlines.length === 0) {
      return NextResponse.json(
        { message: 'No headlines found to generate a digest. Please run the cron job first.' },
        { status: 400 }
      );
    }

    const htmlBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h1 style="font-size: 24px; text-align: center; color: #333;">IndiBrief — Your Daily News Summary</h1>
        <p style="text-align: center; color: #555;">Here are the latest headlines, summarized for you:</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        ${headlines.map(h => `
          <div style="margin-bottom: 20px;">
            <h2 style="font-size: 18px; margin-bottom: 5px;">${h.title}</h2>
            <p style="font-size: 14px; color: #555; line-height: 1.6;">${h.summary || 'Summary not available.'}</p>
            <a href="${h.url}" target="_blank" rel="noopener noreferrer" style="font-size: 14px; color: #1a73e8; text-decoration: none;">Read full article &rarr;</a>
          </div>
        `).join('<hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">')}
        <p style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">
          Thank you for using IndiBrief!
        </p>
      </div>
    `;

    await sendEmail({
      to: session.user.email,
      subject: 'IndiBrief — Get Latest News EveryDay',
      html: htmlBody,
    });

    return NextResponse.json({ ok: true, message: 'Test email sent.' });

  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { message: 'Failed to send test email.' },
      { status: 500 }
    );
  }
}
