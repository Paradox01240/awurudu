'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Vote, Crown, Star, Heart, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface VoteStatistics {
  statistics: Array<{
    category: string;
    vote_count: number;
    unique_voters: number;
    category_name: string;
  }>;
  topCandidates: Array<{
    id: string;
    name: string;
    category: string;
    image: string;
    votes: number;
  }>;
  votingTrends: Array<{
    hour: string;
    votes_per_hour: number;
  }>;
  totalStats: {
    total_votes: number;
    unique_voters: number;
    total_candidates: number;
    categories: number;
  };
}

interface VoteChartsProps {
  showNumbers?: boolean;
  adminMode?: boolean;
}

export default function VoteCharts({ showNumbers = false, adminMode = false }: VoteChartsProps) {
  const { t, language } = useLanguage();
  const [statistics, setStatistics] = useState<VoteStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCharts, setShowCharts] = useState(true);
  const [visibilitySettings, setVisibilitySettings] = useState({
    showVoteCharts: true,
    showVoteNumbers: false
  });

  useEffect(() => {
    fetchStatistics();
    fetchVisibilitySettings(); // Always fetch visibility settings

    // Listen for visibility changes from settings tab
    const handleVisibilityChange = () => {
      fetchStatistics();
      fetchVisibilitySettings();
    };

    window.addEventListener('visibilityChanged', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('visibilityChanged', handleVisibilityChange);
    };
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/vote-statistics');
      const result = await response.json();
      
      if (result.success) {
        setStatistics(result.data);
      }
    } catch (error) {
      console.error('Error fetching vote statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVisibilitySettings = async () => {
    try {
      const response = await fetch('/api/vote-visibility?dev_token=awurudu_admin_2024');
      const result = await response.json();
      
      if (result.success) {
        setVisibilitySettings(result.data);
        setShowCharts(result.data.showVoteCharts);
        console.log('VoteCharts visibility setting:', result.data.showVoteCharts);
      } else {
        // Default to showing charts if API fails
        console.log('API failed, defaulting to show charts');
        setShowCharts(true);
      }
    } catch (error) {
      console.error('Error fetching visibility settings:', error);
      // Default to showing charts if fetch fails
      setShowCharts(true);
    }
  };

  const updateVisibilitySettings = async (settings: typeof visibilitySettings) => {
    try {
      const response = await fetch('/api/vote-visibility?dev_token=awurudu_admin_2024', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const result = await response.json();
      
      if (result.success) {
        setVisibilitySettings(settings);
        setShowCharts(settings.showVoteCharts);
      }
    } catch (error) {
      console.error('Error updating visibility settings:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'kumara': return <Crown className="w-5 h-5 text-blue-500" />;
      case 'kumari': return <Star className="w-5 h-5 text-pink-500" />;
      case 'sigithi-kumara': return <Users className="w-5 h-5 text-green-500" />;
      case 'sigithi-kumariya': return <Heart className="w-5 h-5 text-purple-500" />;
      default: return <Vote className="w-5 h-5 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'kumara': return 'bg-blue-500';
      case 'kumari': return 'bg-pink-500';
      case 'sigithi-kumara': return 'bg-green-500';
      case 'sigithi-kumariya': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getMaxVotes = () => {
    if (!statistics?.statistics.length) return 1;
    return Math.max(...statistics.statistics.map(s => s.vote_count));
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!showCharts) {
    console.log('VoteCharts: Charts are hidden, adminMode:', adminMode);
    // Show a message only for non-admin users when charts are hidden
    if (!adminMode) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="space-y-4">
            <EyeOff className="w-12 h-12 text-gray-400 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-600">
              {language === 'si' ? 'Vote Charts Temporarily Hidden' : 'Vote Charts Temporarily Hidden'}
            </h3>
            <p className="text-gray-500">
              {language === 'si' ? 'Voting charts will be available soon. Please check back later.' : 'Voting charts will be available soon. Please check back later.'}
            </p>
          </div>
        </div>
      );
    }
    return null; // Admin mode: hide completely
  }

  console.log('VoteCharts: Showing charts, adminMode:', adminMode);

  if (!statistics) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6" />
            <h2 className="text-xl font-bold">
              {language === 'si' ? 'Awurudu Voting Progress' : 'Awurudu Voting Progress'}
            </h2>
          </div>
          
          {adminMode && (
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={visibilitySettings.showVoteCharts}
                  onChange={(e) => updateVisibilitySettings({
                    ...visibilitySettings,
                    showVoteCharts: e.target.checked
                  })}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm">
                  {language === 'si' ? 'Show Charts' : 'Show Charts'}
                </span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={visibilitySettings.showVoteNumbers}
                  onChange={(e) => updateVisibilitySettings({
                    ...visibilitySettings,
                    showVoteNumbers: e.target.checked
                  })}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm">
                  {language === 'si' ? 'Show Numbers' : 'Show Numbers'}
                </span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-8">
        {/* Overall Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            className="bg-blue-50 rounded-lg p-4 text-center"
            whileHover={{ scale: 1.02 }}
          >
            <Vote className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">
              {statistics.totalStats.total_votes}
            </div>
            <div className="text-sm text-blue-600">
              {language === 'si' ? 'Total Votes' : 'Total Votes'}
            </div>
          </motion.div>

          <motion.div
            className="bg-green-50 rounded-lg p-4 text-center"
            whileHover={{ scale: 1.02 }}
          >
            <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">
              {statistics.totalStats.unique_voters}
            </div>
            <div className="text-sm text-green-600">
              {language === 'si' ? 'Unique Voters' : 'Unique Voters'}
            </div>
          </motion.div>

          <motion.div
            className="bg-purple-50 rounded-lg p-4 text-center"
            whileHover={{ scale: 1.02 }}
          >
            <Crown className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">
              {statistics.totalStats.total_candidates}
            </div>
            <div className="text-sm text-purple-600">
              {language === 'si' ? 'Candidates' : 'Candidates'}
            </div>
          </motion.div>

          <motion.div
            className="bg-orange-50 rounded-lg p-4 text-center"
            whileHover={{ scale: 1.02 }}
          >
            <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">
              {statistics.totalStats.categories}
            </div>
            <div className="text-sm text-orange-600">
              {language === 'si' ? 'Categories' : 'Categories'}
            </div>
          </motion.div>
        </div>

        {/* Category Progress Bars */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            {language === 'si' ? 'Category Progress' : 'Category Progress'}
          </h3>
          
          <div className="space-y-3">
            {statistics.statistics.map((stat, index) => {
              const maxVotes = getMaxVotes();
              const percentage = maxVotes > 0 ? (stat.vote_count / maxVotes) * 100 : 0;
              
              return (
                <motion.div
                  key={stat.category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(stat.category)}
                      <span className="font-medium text-gray-700">
                        {stat.category_name}
                      </span>
                    </div>
                    {(showNumbers || visibilitySettings.showVoteNumbers) && (
                      <span className="text-sm text-gray-600">
                        {stat.vote_count} {language === 'si' ? 'votes' : 'votes'}
                      </span>
                    )}
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                    <motion.div
                      className={`h-full ${getCategoryColor(stat.category)} flex items-center justify-end pr-3`}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    >
                      {percentage > 10 && (
                        <span className="text-white text-xs font-medium">
                          {percentage.toFixed(0)}%
                        </span>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Top Candidates */}
        {statistics.topCandidates.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Crown className="w-5 h-5" />
              {language === 'si' ? 'Leading Candidates' : 'Leading Candidates'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {statistics.topCandidates.map((candidate, index) => (
                <motion.div
                  key={candidate.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 rounded-lg p-4 text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden bg-gray-200 border-2 border-blue-300">
                    {candidate.image ? (
                      <img
                        src={candidate.image}
                        alt={candidate.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
                        {candidate.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  <div className="font-medium text-gray-800 text-sm mb-1">
                    {candidate.name}
                  </div>
                  
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {getCategoryIcon(candidate.category)}
                  </div>
                  
                  {(showNumbers || visibilitySettings.showVoteNumbers) && (
                    <div className="text-lg font-bold text-blue-600">
                      {candidate.votes}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
