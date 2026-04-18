'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, BarChart3, Hash, Settings } from 'lucide-react';

interface VoteVisibilityControlProps {
  language: string;
}

export default function VoteVisibilityControl({ language }: VoteVisibilityControlProps) {
  const [settings, setSettings] = useState({
    showvotecharts: true,
    showvotenumbers: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch current settings
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/vote-visibility?dev_token=awurudu_admin_2024');
      const result = await response.json();
      
      if (result.success) {
        setSettings({
          showvotecharts: result.data.showvotecharts,
          showvotenumbers: result.data.showvotenumbers
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const updateSettings = async (newSettings: typeof settings) => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/vote-visibility?dev_token=awurudu_admin_2024', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          showVoteCharts: newSettings.showvotecharts,
          showVoteNumbers: newSettings.showvotenumbers
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setSettings(newSettings);
        setMessage(language === 'si' ? 'Settings updated successfully!' : 'Settings updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(result.error || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
      setMessage('Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCharts = () => {
    const newSettings = { ...settings, showvotecharts: !settings.showvotecharts };
    updateSettings(newSettings);
  };

  const toggleNumbers = () => {
    const newSettings = { ...settings, showvotenumbers: !settings.showvotenumbers };
    updateSettings(newSettings);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6 text-orange-500" />
        <h3 className="text-lg font-semibold text-gray-800">
          {language === 'si' ? 'Voting Visibility Control' : 'Voting Visibility Control'}
        </h3>
      </div>

      <div className="space-y-4">
        {/* Show Charts Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <div>
              <div className="font-medium text-gray-800">
                {language === 'si' ? 'Show Charts' : 'Show Charts'}
              </div>
              <div className="text-sm text-gray-600">
                {language === 'si' ? 'Display voting charts' : 'Display voting charts'}
              </div>
            </div>
          </div>
          <button
            onClick={toggleCharts}
            disabled={isLoading}
            className={`p-2 rounded-lg transition-colors ${
              settings.showvotecharts 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {settings.showvotecharts ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>

        {/* Show Numbers Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Hash className="w-5 h-5 text-green-500" />
            <div>
              <div className="font-medium text-gray-800">
                {language === 'si' ? 'Show Vote Numbers' : 'Show Vote Numbers'}
              </div>
              <div className="text-sm text-gray-600">
                {language === 'si' ? 'Display actual vote counts' : 'Display actual vote counts'}
              </div>
            </div>
          </div>
          <button
            onClick={toggleNumbers}
            disabled={isLoading}
            className={`p-2 rounded-lg transition-colors ${
              settings.showvotenumbers 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {settings.showvotenumbers ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`p-3 rounded-lg text-sm ${
            message.includes('success') 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {/* Current Status */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-sm font-medium text-blue-800 mb-2">
            {language === 'si' ? 'Current Status' : 'Current Status'}
          </div>
          <div className="text-xs text-blue-600 space-y-1">
            <div>
              Charts: {settings.showvotecharts ? 
                <span className="text-green-600 font-medium">Visible</span> : 
                <span className="text-red-600 font-medium">Hidden</span>
              }
            </div>
            <div>
              Numbers: {settings.showvotenumbers ? 
                <span className="text-green-600 font-medium">Visible</span> : 
                <span className="text-red-600 font-medium">Hidden</span>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
