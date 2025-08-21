"use client";

import { useState, useEffect } from 'react';
import type { Preference } from '@prisma/client';
import { Loader2, X } from 'lucide-react';

interface SettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  // Passing the whole user preference object to populate the form
  preference: Preference | null;
  // A callback to update the dashboard's state after saving
  onSave: (newPreference: Preference) => void;
}

export default function SettingsSheet({ isOpen, onClose, preference, onSave }: SettingsSheetProps) {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [intervalValue, setIntervalValue] = useState(30);
  const [intervalUnit, setIntervalUnit] = useState<'seconds' | 'minutes'>('minutes');
  const [digestsEnabled, setDigestsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // When the component opens, populate the form with the current preference settings.
  useEffect(() => {
    if (isOpen && preference) {
      setRecipientEmail(preference.recipientEmail || '');
      setDigestsEnabled(preference.digestsEnabled);

      const seconds = preference.intervalSeconds;
      if (seconds >= 60 && seconds % 60 === 0) {
        setIntervalValue(seconds / 60);
        setIntervalUnit('minutes');
      } else {
        setIntervalValue(seconds);
        setIntervalUnit('seconds');
      }
    } else if (isOpen) {
      // Set defaults if no preference exists yet
      setRecipientEmail('');
      setDigestsEnabled(true);
      setIntervalValue(30);
      setIntervalUnit('minutes');
    }
  }, [preference, isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsLoading(true);
    setError('');

    let intervalInSeconds = intervalValue;
    if (intervalUnit === 'minutes') {
      intervalInSeconds = intervalValue * 60;
    }

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: recipientEmail || null, // Send null if empty
          digestsEnabled,
          intervalSeconds: intervalInSeconds,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save settings.');
      }

      const updatedPreference = await response.json();
      onSave(updatedPreference); // Pass the updated preference back to the parent
      onClose(); // Close the sheet on successful save
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
              <label htmlFor="recipientEmail" className="block text-sm font-medium text-gray-300 mb-1">Recipient Email</label>
              <input
                type="email"
                id="recipientEmail"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="Defaults to your sign-in email"
                className="w-full bg-gray-700 border-gray-600 text-white rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Digest Interval</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={intervalValue}
                  onChange={(e) => setIntervalValue(Number(e.target.value))}
                  min="1"
                  className="w-1/2 bg-gray-700 border-gray-600 text-white rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <select
                  value={intervalUnit}
                  onChange={(e) => setIntervalUnit(e.target.value as 'seconds' | 'minutes')}
                  className="w-1/2 bg-gray-700 border-gray-600 text-white rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="seconds">Seconds</option>
                  <option value="minutes">Minutes</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between bg-gray-700/50 p-3 rounded-md">
              <span className="text-sm font-medium text-gray-300">Enable Digests</span>
              <button
                type="button"
                onClick={() => setDigestsEnabled(!digestsEnabled)}
                className={`${digestsEnabled ? 'bg-indigo-600' : 'bg-gray-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                aria-pressed={digestsEnabled}
              >
                <span className={`${digestsEnabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}/>
              </button>
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
