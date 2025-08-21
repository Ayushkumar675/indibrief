"use client";

import { useState, useEffect } from 'react';
import type { Preference } from '@prisma/client';
import { Loader2, X } from 'lucide-react';

interface SettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  preference: Preference | null;
  onSave: (newPreference: Preference) => void;
}

export default function SettingsSheet({ isOpen, onClose, preference, onSave }: SettingsSheetProps) {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setRecipientEmail(preference?.recipientEmail || '');
    }
  }, [preference, isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: recipientEmail || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save settings.');
      }

      const updatedPreference = await response.json();
      onSave(updatedPreference);
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white" aria-label="Close settings">
          <X size={24} />
        </button>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Settings</h2>

          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
            <div>
              <label htmlFor="recipientEmail" className="block text-sm font-medium text-gray-300 mb-1">Test Email Recipient</label>
              <input
                type="email"
                id="recipientEmail"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="Defaults to your sign-in email"
                className="w-full bg-gray-700 border-gray-600 text-white rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
               <p className="text-xs text-gray-400 mt-2">
                This email will be used for the &quot;Send Test Email&quot; feature.
              </p>
            </div>

            {error && <p className="text-sm text-red-400 text-center">{error}</p>}

            <div className="flex justify-end gap-4 pt-4">
              <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md">
                Cancel
              </button>
              <button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50 flex items-center justify-center min-w-[80px]">
                {isLoading ? <Loader2 className="animate-spin" /> : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
