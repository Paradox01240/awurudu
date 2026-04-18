'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import VotingSystem from '../components/VotingSystem';
import { Candidate } from '@/lib/database-schema';
import { useLanguage } from '../contexts/LanguageContext';
import { alert } from '../components/AlertProvider';

export default function VotingPage() {
  const { t, language } = useLanguage();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [votingDeadline] = useState(new Date('2026-04-18T18:00:00')); // 6 PM on event day

  useEffect(() => {
    fetchCandidates();
    checkVotingStatus();
    checkIPVotingStatus(); // Check server-side IP voting status
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await fetch('/api/candidates');
      const result = await response.json();

      if (result.success) {
        setCandidates(result.data);
      } else {
        console.error('Failed to fetch candidates:', result.error);
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkVotingStatus = () => {
    // Check if user has already voted in each category
    const kumaraVoted = localStorage.getItem('awurudu_voted_kumara');
    const kumariVoted = localStorage.getItem('awurudu_voted_kumari');
    const sigithiKumaraVoted = localStorage.getItem('awurudu_voted_sigithi-kumara');
    const sigithiKumariyaVoted = localStorage.getItem('awurudu_voted_sigithi-kumariya');
    
    // Set voting status based on all categories
    const votedStatus = {
      kumara: kumaraVoted === 'true',
      kumari: kumariVoted === 'true',
      'sigithi-kumara': sigithiKumaraVoted === 'true',
      'sigithi-kumariya': sigithiKumariyaVoted === 'true'
    };
    
    // Only mark as fully voted if all categories are voted
    if (votedStatus.kumara && votedStatus.kumari && votedStatus['sigithi-kumara'] && votedStatus['sigithi-kumariya']) {
      setHasVoted(true);
    }
  };

  // Function to check IP voting status from server
  const checkIPVotingStatus = async () => {
    try {
      const response = await fetch('/api/check-voting-status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        // Update localStorage with server-side voting status
        if (data.kumaraVoted) {
          localStorage.setItem('awurudu_voted_kumara', 'true');
        }
        if (data.kumariVoted) {
          localStorage.setItem('awurudu_voted_kumari', 'true');
        }
        if (data.sigithiKumaraVoted) {
          localStorage.setItem('awurudu_voted_sigithi-kumara', 'true');
        }
        if (data.sigithiKumariyaVoted) {
          localStorage.setItem('awurudu_voted_sigithi-kumariya', 'true');
        }
        checkVotingStatus();
      }
    } catch (error) {
      console.error('Error checking IP voting status:', error);
    }
  };

  const handleVote = async (voterInfo: any, candidateId: string, category: 'kumara' | 'kumari' | 'sigithi-kumara' | 'sigithi-kumariya') => {
    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voterInfo,
          candidateId,
          category
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Mark as voted for specific category
        localStorage.setItem(`awurudu_voted_${category}`, 'true');
        
        // Check if all categories are now voted
        const kumaraVoted = localStorage.getItem('awurudu_voted_kumara') === 'true';
        const kumariVoted = localStorage.getItem('awurudu_voted_kumari') === 'true';
        const sigithiKumaraVoted = localStorage.getItem('awurudu_voted_sigithi-kumara') === 'true';
        const sigithiKumariyaVoted = localStorage.getItem('awurudu_voted_sigithi-kumariya') === 'true';
        
        if (kumaraVoted && kumariVoted && sigithiKumaraVoted && sigithiKumariyaVoted) {
          setHasVoted(true);
        }
        
        // Refresh candidates to update vote counts
        await fetchCandidates();
        
        // Show category-specific success message
        const categoryName = category === 'kumara' 
          ? (language === 'si' ? 'Awurudu Kumara' : 'Awurudu Kumara')
          : (language === 'si' ? 'Awurudu Kumari' : 'Awurudu Kumari');
        
        const remainingCategory = category === 'kumara' 
          ? (language === 'si' ? 'Awurudu Kumari' : 'Awurudu Kumari')
          : (language === 'si' ? 'Awurudu Kumara' : 'Awurudu Kumara');
        
        const message = result.data?.isSecondVote
          ? (language === 'si' 
              ? `Your vote for ${categoryName} has been cast successfully! You have now voted for both categories.` 
              : `Your vote for ${categoryName} has been cast successfully! You have now voted for both categories.`)
          : result.data?.isFirstVote
            ? (language === 'si' 
                ? `Your vote for ${categoryName} has been cast successfully! You can now vote for ${remainingCategory}.` 
                : `Your vote for ${categoryName} has been cast successfully! You can now vote for ${remainingCategory}.`)
            : (kumaraVoted && kumariVoted
              ? (language === 'si' 
                  ? `You have successfully voted for both ${categoryName} and ${remainingCategory}!` 
                  : `You have successfully voted for both ${categoryName} and ${remainingCategory}!`)
              : (language === 'si' 
                  ? `Your vote for ${categoryName} has been cast successfully! You can now vote for ${remainingCategory}.` 
                  : `Your vote for ${categoryName} has been cast successfully! You can now vote for ${remainingCategory}.`));
        
        alert.success(message);
      } else {
        // Handle specific error types with user-friendly messages
        let errorMessage = result.error || (language === 'si' ? 'Voting failed' : 'Voting failed');
        
        // Specific IP blocking messages
        if (result.error?.includes('already voted for') && result.error?.includes('category')) {
          errorMessage = language === 'si' 
            ? 'This device has already voted in this category. You can vote in the other category.'
            : 'This device has already voted in this category. You can vote in the other category.';
        } else if (result.error?.includes('already voted for both categories')) {
          errorMessage = language === 'si' 
            ? 'This device has already voted for both Awurudu Kumara and Awurudu Kumari.'
            : 'This device has already voted for both Awurudu Kumara and Awurudu Kumari.';
        } else if (result.error?.includes('already voted for') && result.error?.includes('using your identity details')) {
          errorMessage = language === 'si' 
            ? 'Your identity details (NIC/Phone/Email) have already been used to vote in this category. Each person can vote once per category.'
            : 'Your identity details (NIC/Phone/Email) have already been used to vote in this category. Each person can vote once per category.';
        } else if (result.error?.includes('You have already voted in this category')) {
          errorMessage = language === 'si' 
            ? 'You have already voted in this category with your identity details.'
            : 'You have already voted in this category with your identity details.';
        }
        
        alert.error(errorMessage);
      }
    } catch (error) {
      console.error('Voting error:', error);
      alert.error(language === 'si' ? 'An error occurred. Please try again.' : 'An error occurred. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-600">
            {language === 'si' ? 'Loading voting system...' : 'Loading voting system...'}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <VotingSystem
      candidates={candidates}
      onVote={handleVote}
      hasVoted={hasVoted}
      votingDeadline={votingDeadline}
    />
  );
}
