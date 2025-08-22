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
      <h1>IndiBrief — Get Latest News EveryDay</h1>
      <p>Here are the latest headlines:</p>
      <ul>
        ${headlines.map(h => `<li><a href="${h.url}" target="_blank" rel="noopener noreferrer">${h.title}</a></li>`).join('')}
      </ul>
      <p>Thank you for using IndiBrief!</p>
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
