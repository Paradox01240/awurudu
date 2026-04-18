'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, BarChart3, Hash, Settings, Shield, Lock, Unlock, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VoteVisibilityAdmin() {
  const [settings, setSettings] = useState({
    showvotecharts: true,
    showvotenumbers: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const router = useRouter();

  // Check authentication on load
  useEffect(() => {
    const auth = localStorage.getItem('admin_authenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
      fetchSettings();
    }
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/vote-visibility');
      const result = await response.json();
      
      if (result.success) {
        setSettings({
          showvotecharts: result.data.showvotecharts,
          showvotenumbers: result.data.showvotenumbers
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setMessage('Failed to fetch settings');
    }
  };

  const authenticate = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple password check (in production, use proper authentication)
    if (password === 'awurudu_admin_2024') {
      setIsAuthenticated(true);
      localStorage.setItem('admin_authenticated', 'true');
      fetchSettings();
    } else {
      setMessage('Invalid password');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const updateSettings = async (newSettings: typeof settings) => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/vote-visibility', {
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
        setMessage('Settings updated successfully!');
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

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_authenticated');
    setPassword('');
  };

  const refreshData = () => {
    fetchSettings();
    setMessage('Data refreshed!');
    setTimeout(() => setMessage(''), 2000);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Admin Access</h1>
            <p className="text-gray-600">Vote Visibility Control Panel</p>
          </div>

          <form onSubmit={authenticate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter admin password"
                required
              />
            </div>

            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.includes('success') 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-3 px-4 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200"
            >
              Access Admin Panel
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-orange-600 hover:text-orange-700 text-sm"
            >
              ← Back to Main Page
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-4">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-orange-500" />
              <h1 className="text-xl font-bold text-gray-800">
                Vote Visibility Admin
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={refreshData}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Lock className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Status Overview */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-3">
              <Settings className="w-5 h-5 text-orange-500" />
              Current Visibility Settings
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-800">Charts Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    settings.showvotecharts 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {settings.showvotecharts ? 'Visible' : 'Hidden'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Voting charts are {settings.showvotecharts ? 'visible to all users' : 'hidden from users'} on the main page.
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-800">Numbers Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    settings.showvotenumbers 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {settings.showvotenumbers ? 'Visible' : 'Hidden'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Vote numbers are {settings.showvotenumbers ? 'displayed' : 'hidden'} - only percentages will show.
                </p>
              </div>
            </div>
          </div>

          {/* Control Panel */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              Visibility Controls
            </h2>

            <div className="space-y-6">
              {/* Charts Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="font-medium text-gray-800">Show Charts</div>
                    <div className="text-sm text-gray-600">Display voting charts on main page</div>
                  </div>
                </div>
                <button
                  onClick={toggleCharts}
                  disabled={isLoading}
                  className={`p-3 rounded-lg transition-colors ${
                    settings.showvotecharts 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {settings.showvotecharts ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>

              {/* Numbers Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Hash className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="font-medium text-gray-800">Show Vote Numbers</div>
                    <div className="text-sm text-gray-600">Display actual vote counts</div>
                  </div>
                </div>
                <button
                  onClick={toggleNumbers}
                  disabled={isLoading}
                  className={`p-3 rounded-lg transition-colors ${
                    settings.showvotenumbers 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {settings.showvotenumbers ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>

              {/* Status Message */}
              {message && (
                <div className={`p-4 rounded-lg text-sm ${
                  message.includes('success') 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {message}
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => window.open('/', '_blank')}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  View Main Page
                </button>
                <button
                  onClick={() => router.push('/vote')}
                  className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Go to Voting
                </button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-3">
              <Unlock className="w-5 h-5 text-green-500" />
              How to Access
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div>
                <strong>Admin Page:</strong> /admin/vote-visibility
              </div>
              <div>
                <strong>Main Page Control:</strong> Available on main page (for testing)
              </div>
              <div>
                <strong>API Access:</strong> POST /api/vote-visibility
              </div>
              <div>
                <strong>Default Password:</strong> awurudu_admin_2024
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
