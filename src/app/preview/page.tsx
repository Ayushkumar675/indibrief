import prisma from '@/lib/db';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DigestPreviewScreen() {
  const headlines = await prisma.headline.findMany({
    take: 10,
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-50 text-gray-800 p-4 sm:p-8 animate-fade-in">
      <div className="w-full max-w-3xl">
        <header className="relative flex items-center justify-center mb-10">
          <Link href="/" className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 transition-colors" aria-label="Back to Dashboard">
            <ArrowLeft size={28} />
          </Link>
          <h1 className="text-4xl font-extrabold tracking-tight">Latest News Preview</h1>
        </header>

        {headlines.length === 0 ? (
          <div className="text-center bg-white rounded-2xl shadow-lg p-10">
            <p className="text-gray-600 text-lg">No headlines found in the database.</p>
            <p className="text-sm text-gray-500 mt-3">Please run the cron job at `/api/cron` to fetch the latest news.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {headlines.map((headline, index) => (
              <article key={headline.id} className="bg-white rounded-2xl shadow-lg p-6 transition-transform duration-300 hover:scale-[1.02] animate-fade-in-up" style={{ animationDelay: `${index * 100}ms`}}>
                <h2 className="text-2xl font-bold mb-3">
                  {headline.title}
                </h2>
                <p className="text-gray-600 mb-4">
                  {headline.summary || 'Summary not available.'}
                </p>
                <a
                  href={headline.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-semibold transition-colors inline-flex items-center gap-2 group"
                >
                  <span>Read Full Article</span>
                  <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
                </a>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
