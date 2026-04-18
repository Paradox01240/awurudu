'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminDashboard from '../components/AdminDashboard';
import { Candidate } from '@/lib/database-schema';
import { verifyAdminAuth } from '@/lib/security';
import { useLanguage } from '../contexts/LanguageContext';
import { alert } from '../components/AlertProvider';

export default function AdminPage() {
  const { t, language } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check if admin token exists in cookies
      const response = await fetch('/api/auth');
      if (response.ok) {
        setIsAuthenticated(true);
        await fetchCandidates();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCandidates = async () => {
    try {
      const response = await fetch('/api/candidates?admin=true');
      const result = await response.json();

      if (result.success) {
        setCandidates(result.data);
      } else {
        console.error('Failed to fetch candidates:', result.error);
        // Show error message
        alert.error(language === 'si' ? 'Failed to load candidates' : 'Failed to load candidates');
      }
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
      // Show error message
      alert.error(language === 'si' ? 'Failed to load candidates' : 'Failed to load candidates');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm),
      });

      const result = await response.json();

      if (result.success) {
        setIsAuthenticated(true);
        await fetchCandidates();
      } else {
        setLoginError(result.error || (language === 'si' ? 'Login failed' : 'Login failed'));
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(language === 'si' ? 'An error occurred' : 'An error occurred');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      setIsAuthenticated(false);
      setLoginForm({ username: '', password: '' });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleApproveCandidate = async (candidateId: string) => {
    try {
      const response = await fetch(`/api/candidates/${candidateId}/approve`, {
        method: 'PATCH',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      // Refresh candidates list after successful approval
      await fetchCandidates();
      
      // Show success message
      alert.success(language === 'si' ? 'Candidate approved successfully!' : 'Candidate approved successfully!');
      
    } catch (error) {
      console.error('Error approving candidate:', error);
      alert.error(language === 'si' ? 'Failed to approve candidate' : 'Failed to approve candidate');
    }
  };

  const handleRejectCandidate = async (candidateId: string) => {
    try {
      const response = await fetch(`/api/candidates/${candidateId}/reject`, {
        method: 'PATCH',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      // Refresh candidates list after successful rejection
      await fetchCandidates();
      
      // Show success message
      alert.success(language === 'si' ? 'Candidate rejected successfully!' : 'Candidate rejected successfully!');
      
    } catch (error) {
      console.error('Error rejecting candidate:', error);
      alert.error(language === 'si' ? 'Failed to reject candidate' : 'Failed to reject candidate');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-600">
            {language === 'si' ? 'Loading...' : 'Loading...'}
          </p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <motion.div
          className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <motion.div
              className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {language === 'si' ? 'Admin Login' : 'Admin Login'}
            </h1>
            <p className="text-gray-600 text-sm">
              {language === 'si' ? 'Access the voting system dashboard' : 'Access the voting system dashboard'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'si' ? 'Username' : 'Username'}
              </label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                placeholder={language === 'si' ? 'Enter username' : 'Enter username'}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'si' ? 'Password' : 'Password'}
              </label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                placeholder={language === 'si' ? 'Enter password' : 'Enter password'}
                required
              />
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {loginError}
              </div>
            )}

            <motion.button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-blue-500/50 transform hover:scale-105 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {language === 'si' ? 'Sign In' : 'Sign In'}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              {language === 'si' ? 'Demo: username: admin, password: admin123' : 'Demo: username: admin, password: admin123'}
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <AdminDashboard
      candidates={candidates}
      onApproveCandidate={handleApproveCandidate}
      onRejectCandidate={handleRejectCandidate}
      onRefreshData={fetchCandidates}
    />
  );
}
