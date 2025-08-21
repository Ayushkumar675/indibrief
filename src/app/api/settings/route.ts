import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const body = await request.json();
    const { recipientEmail } = body;

    // A simple regex for email validation. Allows for an empty or null string.
    if (recipientEmail && !/^\S+@\S+\.\S+$/.test(recipientEmail)) {
      return NextResponse.json({ message: 'Invalid email format.' }, { status: 400 });
    }

    const updatedPreference = await prisma.preference.upsert({
      where: { userId },
      update: { recipientEmail: recipientEmail || null },
      create: {
        userId,
        recipientEmail: recipientEmail || session.user.email,
      },
    });

    return NextResponse.json(updatedPreference);

  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { message: 'Failed to update settings.' },
      { status: 500 }
    );
  }
}
