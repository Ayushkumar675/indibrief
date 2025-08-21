import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const preference = await prisma.preference.findUnique({
      where: { userId },
    });

    let updatedPreference;

    if (preference) {
      updatedPreference = await prisma.preference.update({
        where: { userId },
        data: { digestsEnabled: !preference.digestsEnabled },
      });
    } else {
      // If no preference exists, create one. The default in the schema is true,
      // so the first toggle action should set it to false.
      updatedPreference = await prisma.preference.create({
        data: {
          userId,
          digestsEnabled: false,
        },
      });
    }

    return NextResponse.json({
      ok: true,
      digestsEnabled: updatedPreference.digestsEnabled,
    });

  } catch (error) {
    console.error('Error toggling digest preference:', error);
    return NextResponse.json(
      { message: 'Failed to update preference.' },
      { status: 500 }
    );
  }
}
