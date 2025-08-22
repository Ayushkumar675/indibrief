"use client";

"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Mail, FileText, Loader2 } from 'lucide-react';
import type { User } from '@prisma/client';

interface DashboardProps {
  user: User;
  hasHeadlines: boolean;
}

export default function Dashboard({ user, hasHeadlines }: DashboardProps) {
  const [isLoading, setIsLoading] = useState({ sendNews: false });
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSendNews = async () => {
    setIsLoading(prev => ({ ...prev, sendNews: true }));
    setAlert(null);
    try {
      const response = await fetch('/api/test-email', { method: 'POST' });
      const data = await response.json();
      if (response.ok) {
        setAlert({ type: 'success', message: 'Email sent successfully! Check your inbox (and console log).' });
      } else {
        setAlert({ type: 'error', message: data.message || 'Failed to send email.' });
      }
    } catch (error) {
      console.error("Failed to send email:", error);
      setAlert({ type: 'error', message: 'An unexpected error occurred.' });
    }
    setIsLoading(prev => ({ ...prev, sendNews: false }));
  };

  return (
    <div className="w-full max-w-lg mx-auto animate-fade-in">
      <header className="text-center mb-10">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-800">
          IndiBrief
        </h1>
        <p className="text-gray-500 mt-3 text-lg">
          Your daily headlines from India Today, simplified and on-demand.
        </p>
      </header>

      {alert && (
        <div
          className={`rounded-xl p-4 mb-8 text-center border-2 ${alert.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'} animate-fade-in-down`}
          role="alert"
        >
          <strong className="font-bold">{alert.type === 'success' ? 'Success!' : 'Error!'}</strong> {alert.message}
        </div>
      )}

      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <button
            onClick={handleSendNews}
            disabled={isLoading.sendNews || !hasHeadlines}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
          >
            {isLoading.sendNews ? <Loader2 className="animate-spin" size={24} /> : <Mail size={24} />}
            <span className="text-lg">Send News</span>
          </button>
          <Link
            href={hasHeadlines ? "/preview" : "#"}
            aria-disabled={!hasHeadlines}
            onClick={(e) => !hasHeadlines && e.preventDefault()}
            className={`w-full bg-gray-700 hover:bg-gray-800 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-300 ${!hasHeadlines ? 'opacity-60 cursor-not-allowed scale-100' : ''}`}
          >
            <FileText size={24} />
            <span className="text-lg">Preview Latest</span>
          </Link>
        </div>
        {!hasHeadlines && (
          <p className="text-center text-sm text-gray-500 mt-2 animate-fade-in-up">
            The cron job needs to run at least once to fetch headlines.
          </p>
        )}
      </div>
    </div>
  );
}
