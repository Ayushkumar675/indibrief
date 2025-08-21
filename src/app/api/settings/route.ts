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
    const { recipientEmail, digestsEnabled, intervalSeconds } = body;

    const dataToUpdate: {
      recipientEmail?: string | null;
      digestsEnabled?: boolean;
      intervalSeconds?: number;
    } = {};

    if (recipientEmail !== undefined) {
      // A simple regex for email validation. Allows for an empty or null string.
      if (recipientEmail && !/^\S+@\S+\.\S+$/.test(recipientEmail)) {
        return NextResponse.json({ message: 'Invalid email format.' }, { status: 400 });
      }
      dataToUpdate.recipientEmail = recipientEmail;
    }
    if (digestsEnabled !== undefined) {
      if (typeof digestsEnabled !== 'boolean') {
        return NextResponse.json({ message: 'Invalid input for digestsEnabled.' }, { status: 400 });
      }
      dataToUpdate.digestsEnabled = digestsEnabled;
    }
    if (intervalSeconds !== undefined) {
      if (typeof intervalSeconds !== 'number' || intervalSeconds < 1) {
        return NextResponse.json({ message: 'Interval must be a positive number.' }, { status: 400 });
      }
      dataToUpdate.intervalSeconds = intervalSeconds;
    }

    const updatedPreference = await prisma.preference.upsert({
      where: { userId },
      update: dataToUpdate,
      create: {
        userId,
        recipientEmail: recipientEmail || session.user.email,
        digestsEnabled: digestsEnabled ?? true,
        intervalSeconds: intervalSeconds ?? 1800,
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
