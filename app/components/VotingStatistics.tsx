'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface VotingStatisticsProps {
  language: string;
}

export default function VotingStatistics({ language }: VotingStatisticsProps) {
  const [statistics, setStatistics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [visibilitySettings, setVisibilitySettings] = useState({
    showvotecharts: true,
    showvotenumbers: false
  });

  // Fetch statistics and visibility settings
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch statistics
        const statsResponse = await fetch('/api/public-voting-stats');
        const statsData = await statsResponse.json();
        
        if (statsData.success) {
          setStatistics(statsData.data);
        }

        // Fetch visibility settings
        const visibilityResponse = await fetch('/api/vote-visibility');
        const visibilityData = await visibilityResponse.json();
        
        if (visibilityData.success) {
          setVisibilitySettings({
            showvotecharts: visibilityData.data.showvotecharts,
            showvotenumbers: visibilityData.data.showvotenumbers
          });
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalVotes = statistics?.statistics?.totalVotes || 0;
  const kumaraVotes = statistics?.statistics?.kumaraVotes || 0;
  const kumariVotes = statistics?.statistics?.kumariVotes || 0;
  const sigithiKumaraVotes = statistics?.statistics?.sigithiKumaraVotes || 0;
  const sigithiKumariyaVotes = statistics?.statistics?.sigithiKumariyaVotes || 0;

  // Helper function to shuffle array randomly
  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Category data for charts
  const categories = [
    { 
      name: language === 'si' ? 'කුමාර' : 'Kumara', 
      votes: kumaraVotes, 
      color: '#3B82F6', 
      gradient: 'from-blue-400 to-blue-600',
      key: 'kumara',
      candidates: visibilitySettings.showvotecharts 
        ? (statistics?.topCandidates?.kumara || [])
        : shuffleArray(statistics?.topCandidates?.kumara || [])
    },
    { 
      name: language === 'si' ? 'කුමාරි' : 'Kumari', 
      votes: kumariVotes, 
      color: '#EC4899', 
      gradient: 'from-pink-400 to-pink-600',
      key: 'kumari',
      candidates: visibilitySettings.showvotecharts 
        ? (statistics?.topCandidates?.kumari || [])
        : shuffleArray(statistics?.topCandidates?.kumari || [])
    },
    { 
      name: language === 'si' ? 'සිගිති කුමාර' : 'Sigithi Kumara', 
      votes: sigithiKumaraVotes, 
      color: '#10B981', 
      gradient: 'from-green-400 to-green-600',
      key: 'sigithi-kumara',
      candidates: visibilitySettings.showvotecharts 
        ? (statistics?.topCandidates?.sigithiKumara || [])
        : shuffleArray(statistics?.topCandidates?.sigithiKumara || [])
    },
    { 
      name: language === 'si' ? 'සිගිති කුමාරිය' : 'Sigithi Kumariya', 
      votes: sigithiKumariyaVotes, 
      color: '#8B5CF6', 
      gradient: 'from-purple-400 to-purple-600',
      key: 'sigithi-kumariya',
      candidates: visibilitySettings.showvotecharts 
        ? (statistics?.topCandidates?.sigithiKumariya || [])
        : shuffleArray(statistics?.topCandidates?.sigithiKumariya || [])
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-white via-gray-50 to-orange-50">
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          {language === 'si' ? 'වර්මන තත්වය' : 'Voting Ranking'}
        </h2>

        {/* Four Category Charts - Only show if enabled */}
        {visibilitySettings.showvotecharts && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: category.color + '20' }}>
                  <BarChart3 className="w-5 h-5" style={{ color: category.color }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {category.name}
                </h3>
              </div>

              {/* Chart */}
              <div className="hidden md:block h-64 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={category.candidates} margin={{ top: 20, right: 30, left: 20, bottom: 120 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      tick={(props) => {
                        const { x, y, payload } = props;
                        const candidate = category.candidates.find((c: any) => c.name === payload.value);
                        if (!candidate) return null;
                        
                        return (
                          <g transform={`translate(${x},${y})`}>
                            <foreignObject x={-20} y={-40} width={40} height={40}>
                              <div className="w-full h-full flex items-center justify-center relative">
                                {candidate?.image ? (
                                  <img 
                                    src={candidate.image} 
                                    alt={candidate.name}
                                    className="w-full h-full rounded-full object-cover border-2 border-white shadow-sm"
                                    style={{ display: 'block' }}
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      const fallback = target.parentElement?.querySelector('.fallback-circle') as HTMLElement;
                                      if (fallback) {
                                        fallback.style.display = 'flex';
                                      }
                                    }}
                                    onLoad={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      const fallback = target.parentElement?.querySelector('.fallback-circle') as HTMLElement;
                                      if (fallback) {
                                        fallback.style.display = 'none';
                                      }
                                    }}
                                  />
                                ) : null}
                                <div 
                                  className="fallback-circle w-full h-full rounded-full flex items-center justify-center text-xs font-bold shadow-sm border-2 border-white"
                                  style={{ 
                                    backgroundColor: category.color + '20',
                                    color: category.color,
                                    display: candidate?.image ? 'none' : 'flex'
                                  }}
                                >
                                  {candidate.name?.charAt(0) || '?'}
                                </div>
                                {/* Rank Badge */}
                                {visibilitySettings.showvotecharts && (
                                  <div 
                                    className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center border border-white ${
                                      category.candidates.findIndex((c: any) => c.name === candidate.name) === 0 ? 'bg-yellow-500' :
                                      category.candidates.findIndex((c: any) => c.name === candidate.name) === 1 ? 'bg-gray-400' :
                                      category.candidates.findIndex((c: any) => c.name === candidate.name) === 2 ? 'bg-orange-600' :
                                      'bg-blue-500'
                                    }`}
                                    style={{ fontSize: '10px' }}
                                  >
                                    {category.candidates.findIndex((c: any) => c.name === candidate.name) + 1}
                                  </div>
                                )}
                              </div>
                            </foreignObject>
                            <text 
                              x={0} 
                              y={55} 
                              textAnchor="middle" 
                              fill="#666" 
                              fontSize="9" 
                              className="hidden md:block"
                            >
                              {candidate.name?.length > 10 ? candidate.name.substring(0, 10) + '...' : candidate.name}
                            </text>
                            <foreignObject x={-15} y={-35} width={30} height={30}>
                              {candidate?.image ? (
                                <img 
                                  src={candidate.image} 
                                  alt={candidate.name}
                                  className="w-full h-full rounded-full object-cover border-2 border-white shadow-sm"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const fallback = target.parentElement?.querySelector('div');
                                    if (fallback) {
                                      fallback.style.display = 'flex';
                                    }
                                  }}
                                />
                              ) : null}
                              <div 
                                className="w-full h-full rounded-full flex items-center justify-center text-xs font-bold shadow-sm"
                                style={{ 
                                  backgroundColor: category.color + '20',
                                  color: category.color,
                                  display: candidate?.image ? 'none' : 'flex'
                                }}
                              >
                                {candidate.name?.charAt(0) || '?'}
                              </div>
                            </foreignObject>
                          </g>
                        );
                      }}
                      angle={0}
                      textAnchor="middle"
                      height={60}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      hide={true}
                    />
{/* Mobile: Show candidate names as labels */}
                    <XAxis 
                      dataKey="name" 
                      tick={false}
                      height={40}
                      tickLine={false}
                      axisLine={false}
                      label={{
                        value: 'Candidates',
                        position: 'insideBottom',
                        offset: -5,
                        style: { textAnchor: 'middle', fontSize: 12, fill: '#666' }
                      }}
                    />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload[0]) {
                          const candidate = payload[0].payload;
                          return (
<div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
                              <div className="flex items-center gap-3 mb-3">
                                {candidate?.image ? (
                                  <img 
                                    src={candidate.image} 
                                    alt={candidate.name}
className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      const fallback = target.parentElement?.querySelector('.fallback-avatar') as HTMLElement;
                                      if (fallback) {
                                        fallback.style.display = 'flex';
                                      }
                                    }}
                                  />
                                ) : null}
                                <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center fallback-avatar" 
                                     style={{ display: candidate?.image ? 'none' : 'flex' }}>
                                  <span className="text-sm font-bold text-gray-600">{candidate.name?.charAt(0) || '?'}</span>
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900 text-lg">{candidate.name}</p>
                                  <p className="text-sm text-gray-500">{language === 'si' ? 'අපේක්ෂකයා' : 'Candidate'}</p>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="votecount" 
                      fill={category.color}
                      radius={[8, 8, 0, 0]}
                      animationDuration={1000}
                      animationBegin={index * 200}
opacity={0.8}
                    >
                      {category.candidates.map((entry: any, idx: number) => (
                        <Cell key={`cell-${idx}`} fill={category.color} />
                      ))}
                    </Bar>
{/* Rank Labels on Bars */}
                    {category.candidates.map((candidate: any, idx: number) => {
                      const sortedCandidates = [...category.candidates].sort((a: any, b: any) => (b.votecount || 0) - (a.votecount || 0));
                      const rank = sortedCandidates.findIndex((c: any) => c.name === candidate.name) + 1;
                      const barPosition = category.candidates.findIndex((c: any) => c.name === candidate.name);
                      
                      return (
                        <text
                          key={`rank-${candidate.name}`}
                          x={barPosition * (100 / category.candidates.length) + (100 / category.candidates.length / 2)}
                          y={-5}
                          textAnchor="middle"
                          fill="white"
                          fontSize="12"
                          fontWeight="bold"
                        >
                          {rank}
                        </text>
                      );
                    })}
                    <defs>
                      <clipPath id="clip-circle">
                        <circle cx="15" cy="15" r="15" />
                      </clipPath>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Category Summary */}
              <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">
                  {language === 'si' ? 'අපේක්ෂකයින්' : 'Candidates'}: <span className="font-bold text-gray-800">{category.candidates.length}</span>
                </div>
              </div>
              
              {/* Desktop: Batch Layout */}
              <div className="hidden md:block mt-4">
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {category.candidates.map((candidate: any, idx: number) => {
                    const sortedCandidates = [...category.candidates].sort((a: any, b: any) => (b.votecount || 0) - (a.votecount || 0));
                    const rank = sortedCandidates.findIndex((c: any) => c.name === candidate.name) + 1;
                    
                    return (
                      <div key={idx} className="flex-shrink-0 w-80 bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <div className="flex flex-col items-center">
                          {/* Profile Image Section */}
                          <div className="flex-shrink-0">
                            <div className="relative w-24 h-24 rounded-full overflow-hidden border-3 border-gray-200 shadow-lg">
                              {candidate?.image ? (
                                <img 
                                  src={candidate.image} 
                                  alt={candidate.name}
                                  className="w-full h-full object-cover"
                                  style={{ display: 'block' }}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const fallback = target.parentElement?.querySelector('.desktop-fallback') as HTMLElement;
                                    if (fallback) {
                                      fallback.style.display = 'flex';
                                    }
                                  }}
                                />
                              ) : null}
                              <div 
                                className="desktop-fallback w-full h-full flex items-center justify-center text-lg font-bold"
                                style={{ 
                                  backgroundColor: category.color + '20',
                                  color: category.color,
                                  display: candidate?.image ? 'none' : 'flex'
                                }}
                              >
                                {candidate.name?.charAt(0) || '?'}
                              </div>
                              {/* Rank Badge */}
                              {visibilitySettings.showvotecharts && (
                                <div 
                                  className={`absolute -top-1 -right-1 w-10 h-10 rounded-full text-white text-xl font-bold flex items-center justify-center border-3 border-white shadow-lg ${
                                    rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                                    rank === 2 ? 'bg-gradient-to-r from-gray-300 to-gray-500' :
                                    rank === 3 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                                    'bg-gradient-to-r from-blue-400 to-blue-600'
                                  }`}
                                >
                                  {rank}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Candidate Info Section */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="text-xl font-bold text-gray-900 mb-1">{candidate.name}</h4>
                                <p className="text-sm text-gray-600">{language === 'si' ? 'අපේක්ෂකයා' : 'Candidate'}</p>
                              </div>
                              {visibilitySettings.showvotecharts && (
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-full text-white text-lg font-bold flex items-center justify-center shadow-lg ${
                                  rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                                  rank === 2 ? 'bg-gradient-to-r from-gray-300 to-gray-500' :
                                  rank === 3 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                                  'bg-gradient-to-r from-blue-400 to-blue-600'
                                }`}>
                                  {rank}
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-gray-500 uppercase tracking-wide">{language === 'si' ? 'පෙළුණු' : 'Rank'}</p>
                                </div>
                              </div>
                              )}
                            </div>
                            
                            {/* Additional Info */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color + '20', color: category.color }}>
                                  <span className="text-xs font-bold">{candidate.name?.charAt(0) || '?'}</span>
                                </div>
                                <span className="text-gray-600">{language === 'si' ? 'වර්ග' : 'Category'}:</span>
                                <span className="font-medium text-gray-900 capitalize">{category.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color + '20', color: category.color }}>
                                  <span className="text-xs font-bold">{candidate.name?.charAt(0) || '?'}</span>
                                </div>
                                <span className="text-gray-600">{language === 'si' ? 'වයම' : 'Age'}:</span>
                                <span className="font-medium text-gray-900">{candidate.age || 'N/A'}</span>
                              </div>
                            </div>
                            
                            {/* Status Badge */}
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <div className="flex items-center justify-center">
                                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                                <span className="text-sm text-green-600 font-medium">{language === 'si' ? 'සම්බන්ධත' : 'Active Candidate'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Mobile: Show candidate names list */}
              <div className="md:hidden mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {language === 'si' ? 'අපේක්ෂකයින්' : 'Candidates'}:
                </p>
                <div className="space-y-2">
                  {category.candidates.map((candidate: any, idx: number) => {
                    const sortedCandidates = [...category.candidates].sort((a: any, b: any) => (b.votecount || 0) - (a.votecount || 0));
                    const rank = sortedCandidates.findIndex((c: any) => c.name === candidate.name) + 1;
                    
                    return (
                      <div key={idx} className="flex items-center gap-3 p-2 bg-white rounded-lg">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200">
                          {candidate?.image ? (
                            <img 
                              src={candidate.image} 
                              alt={candidate.name}
                              className="w-full h-full object-cover"
                              style={{ display: 'block' }}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.parentElement?.querySelector('.mobile-fallback') as HTMLElement;
                                if (fallback) {
                                  fallback.style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <div 
                            className="mobile-fallback w-full h-full flex items-center justify-center text-xs font-bold"
                            style={{ 
                              backgroundColor: category.color + '20',
                              color: category.color,
                              display: candidate?.image ? 'none' : 'flex'
                            }}
                          >
                            {candidate.name?.charAt(0) || '?'}
                          </div>
                          {/* Rank Badge */}
                          {visibilitySettings.showvotecharts && (
                            <div 
                              className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-xs font-bold flex items-center justify-center border border-white ${
                                rank === 1 ? 'bg-yellow-500' :
                                rank === 2 ? 'bg-gray-400' :
                                rank === 3 ? 'bg-orange-600' :
                                'bg-blue-500'
                              }`}
                              style={{ fontSize: '8px' }}
                            >
                              {rank}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-800">{candidate.name}</p>
                            {visibilitySettings.showvotecharts && (
                              <div className={`w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center ${
                                rank === 1 ? 'bg-yellow-500' :
                                rank === 2 ? 'bg-gray-400' :
                                rank === 3 ? 'bg-orange-600' :
                                'bg-blue-500'
                              }`}>
                                {rank}
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{language === 'si' ? 'අපේක්ෂකයා' : 'Candidate'}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ))}
          </div>
        )}
      </motion.div>
    </section>
  );
}


