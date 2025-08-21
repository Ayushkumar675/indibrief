import prisma from '@/lib/db';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function DigestPreviewScreen() {
  const headlines = await prisma.headline.findMany({
    take: 10,
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-900 text-white p-4 sm:p-8">
      <div className="w-full max-w-2xl">
        <header className="relative flex items-center justify-center mb-8">
          <Link href="/" className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors" aria-label="Back to Dashboard">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Latest Digest Preview</h1>
        </header>

        {headlines.length === 0 ? (
          <div className="text-center bg-gray-800 rounded-lg p-8">
            <p className="text-gray-400">No headlines found in the database.</p>
            <p className="text-sm text-gray-500 mt-2">Please run the cron job at `/api/cron` to fetch the latest news.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {headlines.map((headline, index) => (
              <article key={headline.id} className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-2">
                  <span className="text-gray-500 mr-2">{index + 1}.</span>
                  {headline.title}
                </h2>
                <a
                  href={headline.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 transition-colors inline-block"
                >
                  Read full article &rarr;
                </a>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
