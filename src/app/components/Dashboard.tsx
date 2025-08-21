"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Mail, FileText, Settings, Loader2 } from 'lucide-react';
import type { User, Preference } from '@prisma/client';
import SettingsSheet from './SettingsSheet';

interface DashboardProps {
  user: User & { preference: Preference | null };
  hasHeadlines: boolean;
}

export default function Dashboard({ user, hasHeadlines }: DashboardProps) {
  const [preference, setPreference] = useState(user.preference);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState({ testEmail: false });
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSendTest = async () => {
    setIsLoading(prev => ({ ...prev, testEmail: true }));
    setAlert(null);
    try {
      const response = await fetch('/api/test-email', { method: 'POST' });
      const data = await response.json();
      if (response.ok) {
        setAlert({ type: 'success', message: 'Test email sent successfully! Check the console log.' });
      } else {
        setAlert({ type: 'error', message: data.message || 'Failed to send test email.' });
      }
    } catch (error) {
      console.error("Failed to send test email:", error);
      setAlert({ type: 'error', message: 'An unexpected error occurred.' });
    }
    setIsLoading(prev => ({ ...prev, testEmail: false }));
  };

  const handleSaveSettings = (newPreference: Preference) => {
    setPreference(newPreference);
    setAlert({ type: 'success', message: 'Settings saved successfully!' });
  };

  return (
    <>
      <SettingsSheet
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        preference={preference}
        onSave={handleSaveSettings}
      />
      <div className="w-full max-w-md mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">IndiBrief</h1>
          <p className="text-gray-400 mt-2">
            Get the latest headlines from India Today, on demand.
          </p>
        </header>

        {alert && (
          <div
            className={`rounded-lg p-4 mb-8 text-center border ${alert.type === 'success' ? 'bg-green-500/20 border-green-500 text-green-300' : 'bg-red-500/20 border-red-500 text-red-300'}`}
            role="alert"
          >
            <strong>{alert.type === 'success' ? 'Success!' : 'Error!'}</strong> {alert.message}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleSendTest}
              disabled={isLoading.testEmail || !hasHeadlines}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading.testEmail ? <Loader2 className="animate-spin" size={20} /> : <Mail size={20} />}
              <span>Send Test Email</span>
            </button>
            <Link
              href={hasHeadlines ? "/preview" : "#"}
              aria-disabled={!hasHeadlines}
              onClick={(e) => !hasHeadlines && e.preventDefault()}
              className={`w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 ${!hasHeadlines ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FileText size={20} />
              <span>Preview Latest</span>
            </Link>
          </div>
          {!hasHeadlines && (
            <p className="text-center text-sm text-gray-500 mt-4">
              You must run the cron job at least once to fetch headlines before you can send a test or preview a digest.
            </p>
          )}
        </div>

        <footer className="text-center mt-12">
          <button onClick={() => setIsSettingsOpen(true)} className="text-gray-400 hover:text-white hover:underline flex items-center justify-center gap-2 transition-colors">
            <Settings size={16} />
            <span>Settings</span>
          </button>
        </footer>
      </div>
    </>
  );
}
