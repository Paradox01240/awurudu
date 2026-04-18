'use client';

import React, {useState, useEffect} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {Vote, Users, CheckCircle, AlertCircle, Crown, Star, Heart, Shield, Clock, User, Home} from 'lucide-react';
import {useLanguage} from '../contexts/LanguageContext';
import {NIC} from '@sri-lanka/nic';

interface Candidate {
    id: string;
    name: string;
    category: 'kumara' | 'kumari' | 'sigithi-kumara' | 'sigithi-kumariya';
    age: number;
    description: string;
    image: string;
    voteCount: number;
}

interface VoterInfo {
    name: string;
    phone: string;
    email: string;
    nic: string;
}

interface VotingSystemProps {
    candidates: Candidate[];
    onVote: (voterInfo: VoterInfo, candidateId: string, category: 'kumara' | 'kumari' | 'sigithi-kumara' | 'sigithi-kumariya') => Promise<void>;
    hasVoted?: boolean;
    votingDeadline?: Date;
}

export default function VotingSystem({
                                         candidates,
                                         onVote,
                                         hasVoted = false,
                                         votingDeadline
                                     }: VotingSystemProps) {
    const {t, language} = useLanguage();
    const [selectedCategory, setSelectedCategory] = useState<'kumara' | 'kumari' | 'sigithi-kumara' | 'sigithi-kumariya'>('kumara');
    const [selectedCandidate, setSelectedCandidate] = useState<string>('');
    const [voterInfo, setVoterInfo] = useState<VoterInfo>({
        name: '',
        phone: '',
        email: '',
        nic: ''
    });
    const [showVoterForm, setShowVoterForm] = useState(false);
    const [isVoting, setIsVoting] = useState(false);
    const [errors, setErrors] = useState<Partial<VoterInfo>>({});
    const [visibilitySettings, setVisibilitySettings] = useState({
        showvotecharts: true,
        showvotenumbers: false
    });
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [shuffledCandidates, setShuffledCandidates] = useState<{
        kumara: Candidate[];
        kumari: Candidate[];
        'sigithi-kumara': Candidate[];
        'sigithi-kumariya': Candidate[];
    }>({
        kumara: [],
        kumari: [],
        'sigithi-kumara': [],
        'sigithi-kumariya': []
    });

    const kumaraCandidates = candidates.filter(c => c.category === 'kumara');
    const kumariCandidates = candidates.filter(c => c.category === 'kumari');
    const sigithiKumaraCandidates = candidates.filter(c => c.category === 'sigithi-kumara');
    const sigithiKumariyaCandidates = candidates.filter(c => c.category === 'sigithi-kumariya');

    // Helper function to shuffle array randomly
    const shuffleArray = (array: Candidate[]) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    // Shuffle candidates only on first load when candidates change
    useEffect(() => {
        if (candidates.length > 0) {
            setShuffledCandidates({
                kumara: shuffleArray(kumaraCandidates),
                kumari: shuffleArray(kumariCandidates),
                'sigithi-kumara': shuffleArray(sigithiKumaraCandidates),
                'sigithi-kumariya': shuffleArray(sigithiKumariyaCandidates)
            });
        }
    }, [candidates]); // Only re-shuffle when candidates array changes

    // Create separate arrays for correct ranking based on vote counts
    const rankedKumaraCandidates = [...kumaraCandidates].sort((a, b) => b.voteCount - a.voteCount);
    const rankedKumariCandidates = [...kumariCandidates].sort((a, b) => b.voteCount - a.voteCount);
    const rankedSigithiKumaraCandidates = [...sigithiKumaraCandidates].sort((a, b) => b.voteCount - a.voteCount);
    const rankedSigithiKumariyaCandidates = [...sigithiKumariyaCandidates].sort((a, b) => b.voteCount - a.voteCount);


    // Use the stored shuffled candidates for display
    const sortedKumaraCandidates = shuffledCandidates.kumara;
    const sortedKumariCandidates = shuffledCandidates.kumari;
    const sortedSigithiKumaraCandidates = shuffledCandidates['sigithi-kumara'];
    const sortedSigithiKumariyaCandidates = shuffledCandidates['sigithi-kumariya'];

    const currentCandidates  = selectedCategory === 'kumara' ? sortedKumaraCandidates :
        selectedCategory === 'kumari' ? sortedKumariCandidates :
            selectedCategory === 'sigithi-kumara' ? sortedSigithiKumaraCandidates :
                sortedSigithiKumariyaCandidates;

    // Helper function to get rank suffix (1st, 2nd, 3rd, 4th, etc.)
    const getRankSuffix = (rank: number): string => {
        if (rank === 1) return language === 'si' ? '1' : '1st';
        if (rank === 2) return language === 'si' ? '2' : '2nd';
        if (rank === 3) return language === 'si' ? '3' : '3rd';
        return language === 'si' ? rank.toString() : `${rank}th`;
    };

    // Helper function to get rank text label
    const getRankLabel = (rank: number): string => {
        if (rank === 1) return language === 'si' ? '1' : '1st';
        if (rank === 2) return language === 'si' ? '2' : '2nd';
        if (rank === 3) return language === 'si' ? '3' : '3rd';
        return language === 'si' ? rank.toString() : `${rank}th`;
    };

    // Helper function to get rank badge color
    const getRankBadgeColor = (rank: number): string => {
        if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-yellow-600'; // Gold
        if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white border-gray-500';   // Silver
        if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white border-orange-600'; // Bronze
        return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white border-blue-600';                    // Blue for others
    };

    // Helper function to get rank icon
    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Crown className="w-3 h-3"/>;
        if (rank === 2) return <Star className="w-3 h-3"/>;
        if (rank === 3) return <Heart className="w-3 h-3"/>;
        return <Shield className="w-3 h-3"/>;
    };

    // Helper function to get correct rank for a candidate based on vote counts
    const getCorrectRank = (candidateId: string, category: string): number => {
        let rankedCandidates;
        switch (category) {
            case 'kumara':
                rankedCandidates = rankedKumaraCandidates;
                break;
            case 'kumari':
                rankedCandidates = rankedKumariCandidates;
                break;
            case 'sigithi-kumara':
                rankedCandidates = rankedSigithiKumaraCandidates;
                break;
            case 'sigithi-kumariya':
                rankedCandidates = rankedSigithiKumariyaCandidates;
                break;
            default:
                return 0;
        }
        return rankedCandidates.findIndex(c => c.id === candidateId) + 1;
    };

    // Countdown timer
    useEffect(() => {
        if (!votingDeadline) return;

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const deadline = new Date(votingDeadline).getTime();
            const distance = deadline - now;

            if (distance < 0) {
                setTimeLeft(language === 'si' ? 'Voting Ended' : 'Voting Ended');
                clearInterval(timer);
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        }, 1000);

        return () => clearInterval(timer);
    }, [votingDeadline, language]);

    // Fetch visibility settings
    useEffect(() => {
        const fetchVisibilitySettings = async () => {
            try {
                const response = await fetch('/api/vote-visibility');
                const result = await response.json();
                if (result.success) {
                    setVisibilitySettings({
                        showvotecharts: result.data.showvotecharts,
                        showvotenumbers: result.data.showvotenumbers
                    });
                }
            } catch (error) {
                console.error('Failed to fetch visibility settings:', error);
            }
        };

        fetchVisibilitySettings();
    }, []);

    const validateVoterForm = (): boolean => {
        const newErrors: Partial<VoterInfo> = {};

        // Validate Name (required)
        if (!voterInfo.name.trim()) {
            newErrors.name = language === 'si' ? 'Name is required' : 'Name is required';
        }

        // Validate Phone (required)
        if (!voterInfo.phone.trim() || !/^(\+94|0)?[1-9]\d{8}$/.test(voterInfo.phone.replace(/\s/g, ''))) {
            newErrors.phone = language === 'si' ? 'Valid phone number required' : 'Valid phone number required';
        }

        // Validate Email (optional - only if provided)
        if (voterInfo.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(voterInfo.email)) {
            newErrors.email = language === 'si' ? 'Valid email format required' : 'Valid email format required';
        }

        // Validate NIC (optional - only if provided)
        if (voterInfo.nic.trim()) {
            const cleanNIC = voterInfo.nic.replace(/\s/g, '').toUpperCase();
            if (!NIC.validate(cleanNIC)) {
                newErrors.nic = language === 'si'
                    ? 'වලදාත්ම හැඳුනුත්කමයින් අංකය වලංගු අංකයක් එකක් වැරැදීමට පිළිපත් විය යුතුවා'
                    : 'Please enter a valid Sri Lankan NIC number (old: 123456789V or new: 200112345678)';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleVoterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setVoterInfo(prev => ({...prev, [name]: value}));
        if (errors[name as keyof VoterInfo]) {
            setErrors(prev => ({...prev, [name]: undefined}));
        }
    };

    const handleCandidateSelect = (candidateId: string) => {
        // Check if user has already voted in this specific category
        const categoryVoted = localStorage.getItem(`awurudu_voted_${selectedCategory}`);
        if (categoryVoted === 'true') {
            return;
        }
        setSelectedCandidate(candidateId);
        setShowVoterForm(true);
    };

    const handleVote = async () => {
        if (!validateVoterForm() || !selectedCandidate) return;

        setIsVoting(true);
        try {
            await onVote(voterInfo, selectedCandidate, selectedCategory);
            setShowVoterForm(false);
            setVoterInfo({name: '', phone: '', email: '', nic: ''});
        } catch (error) {
            console.error('Voting error:', error);
        } finally {
            setIsVoting(false);
        }
    };

    if (hasVoted) {
        return (
            <motion.div
                className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50 flex items-center justify-center px-4"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
            >
                <motion.div
                    className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-12 max-w-md w-full text-center border border-green-200"
                    initial={{scale: 0.9, opacity: 0}}
                    animate={{scale: 1, opacity: 1}}
                    transition={{duration: 0.5}}
                >
                    <motion.div
                        className="w-20 h-20 bg-green-500 rounded-full mx-auto mb-6 flex items-center justify-center"
                        initial={{scale: 0}}
                        animate={{scale: 1}}
                        transition={{delay: 0.2, type: "spring"}}
                    >
                        <CheckCircle className="w-10 h-10 text-white"/>
                    </motion.div>
                    <h2 className="text-2xl font-bold text-green-700 mb-4">
                        {language === 'si' ? 'Thank You for Voting!' : 'Thank You for Voting!'}
                    </h2>
                    <p className="text-gray-600 mb-8">
                        {language === 'si'
                            ? 'You have successfully voted for both Awurudu Kumara and Awurudu Kumari! Your votes have been recorded.'
                            : 'You have successfully voted for both Awurudu Kumara and Awurudu Kumari! Your votes have been recorded.'
                        }
                    </p>

                    {/* Back to Home Button */}
                    <motion.button
                        onClick={() => window.location.href = '/'}
                        className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-orange-500/50 transition-all duration-300"
                        whileHover={{scale: 1.05}}
                        whileTap={{scale: 0.95}}
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{delay: 0.5}}
                    >
                        <div className="flex items-center gap-2">
                            <Home className="w-5 h-5"/>
                            {language === 'si' ? 'මුල් පිටුව' : 'Back to Home'}
                        </div>
                    </motion.button>
                </motion.div>
            </motion.div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-red-50 via-orange-50 to-yellow-50 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    className="text-center mb-12"
                    initial={{opacity: 0, y: -50}}
                    animate={{opacity: 1, y: 0}}
                >
                    {/* Back to Home Button */}
                    <div className="flex justify-start mb-6">
                        <motion.button
                            onClick={() => window.location.href = '/'}
                            className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-orange-300 rounded-xl shadow-md hover:shadow-orange-500/50 transition-all duration-300 text-gray-700 hover:text-orange-600"
                            whileHover={{scale: 1.05}}
                            whileTap={{scale: 0.95}}
                        >
                            <Home className="w-4 h-4"/>
                            {language === 'si' ? 'මුල් පිටුව' : 'Back to Home'}
                        </motion.button>
                    </div>
                    <motion.div
                        className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center"
                        animate={{rotate: 360}}
                        transition={{duration: 2, repeat: Infinity, ease: "linear"}}
                    >
                        <Vote className="w-8 h-8 text-white"/>
                    </motion.div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-4">
                        {language === 'si' ? 'Vote for Awurudu Kumara & Kumari' : 'Vote for Awurudu Kumara & Kumari'}
                    </h1>
                    <p className="text-gray-600 mb-6">
                        {language === 'si'
                            ? 'Choose your favorite candidate for the New Year Prince and Princess'
                            : 'Choose your favorite candidate for the New Year Prince and Princess'
                        }
                    </p>

                    {/* Voting Timer */}
                    {timeLeft && (
                        <motion.div
                            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 border border-orange-300"
                            initial={{opacity: 0, scale: 0.9}}
                            animate={{opacity: 1, scale: 1}}
                        >
                            <Clock className="w-5 h-5 text-orange-600"/>
                            <span className="font-semibold text-orange-700">
                {language === 'si' ? 'Voting ends in:' : 'Voting ends in:'} {timeLeft}
              </span>
                        </motion.div>
                    )}
                </motion.div>

                {/* Voting Status Indicator */}
                <motion.div
                    className="flex justify-center mb-6"
                    initial={{opacity: 0, y: -20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.3}}
                >
                    <div
                        className="bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg border border-orange-200">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <Crown
                                    className={`w-5 h-5 ${localStorage.getItem('awurudu_voted_kumara') === 'true' ? 'text-blue-500' : 'text-gray-400'}`}/>
                                <span
                                    className={`text-sm font-medium ${localStorage.getItem('awurudu_voted_kumara') === 'true' ? 'text-blue-600' : 'text-gray-500'}`}>
                  {language === 'si' ? 'Awurudu Kumara' : 'Awurudu Kumara'}
                </span>
                                {localStorage.getItem('awurudu_voted_kumara') === 'true' && (
                                    <CheckCircle className="w-4 h-4 text-green-500"/>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Star
                                    className={`w-5 h-5 ${localStorage.getItem('awurudu_voted_kumari') === 'true' ? 'text-pink-500' : 'text-gray-400'}`}/>
                                <span
                                    className={`text-sm font-medium ${localStorage.getItem('awurudu_voted_kumari') === 'true' ? 'text-pink-600' : 'text-gray-500'}`}>
                  {language === 'si' ? 'Awurudu Kumari' : 'Awurudu Kumari'}
                </span>
                                {localStorage.getItem('awurudu_voted_kumari') === 'true' && (
                                    <CheckCircle className="w-4 h-4 text-green-500"/>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Users
                                    className={`w-5 h-5 ${localStorage.getItem('awurudu_voted_sigithi-kumara') === 'true' ? 'text-green-500' : 'text-gray-400'}`}/>
                                <span
                                    className={`text-sm font-medium ${localStorage.getItem('awurudu_voted_sigithi-kumara') === 'true' ? 'text-green-600' : 'text-gray-500'}`}>
                  {language === 'si' ? 'Sigithi Kumara' : 'Sigithi Kumara'}
                </span>
                                {localStorage.getItem('awurudu_voted_sigithi-kumara') === 'true' && (
                                    <CheckCircle className="w-4 h-4 text-green-500"/>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Heart
                                    className={`w-5 h-5 ${localStorage.getItem('awurudu_voted_sigithi-kumariya') === 'true' ? 'text-purple-500' : 'text-gray-400'}`}/>
                                <span
                                    className={`text-sm font-medium ${localStorage.getItem('awurudu_voted_sigithi-kumariya') === 'true' ? 'text-purple-600' : 'text-gray-500'}`}>
                  {language === 'si' ? 'Sigithi Kumariya' : 'Sigithi Kumariya'}
                </span>
                                {localStorage.getItem('awurudu_voted_sigithi-kumariya') === 'true' && (
                                    <CheckCircle className="w-4 h-4 text-green-500"/>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Category Tabs */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-1 shadow-lg border border-orange-200">
                        <div className="grid grid-cols-2 gap-1">
                            <motion.button
                                className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                                    selectedCategory === 'kumara'
                                        ? 'bg-blue-500 text-white shadow-lg'
                                        : 'text-gray-600 hover:text-blue-600'
                                }`}
                                whileHover={{scale: 1.05}}
                                whileTap={{scale: 0.95}}
                                onClick={() => setSelectedCategory('kumara')}
                            >
                                <div className="flex items-center gap-2">
                                    <Crown className="w-5 h-5"/>
                                    {language === 'si' ? 'Kumara' : 'Kumara'}
                                </div>
                            </motion.button>
                            <motion.button
                                className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                                    selectedCategory === 'kumari'
                                        ? 'bg-pink-500 text-white shadow-lg'
                                        : 'text-gray-600 hover:text-pink-600'
                                }`}
                                whileHover={{scale: 1.05}}
                                whileTap={{scale: 0.95}}
                                onClick={() => setSelectedCategory('kumari')}
                            >
                                <div className="flex items-center gap-2">
                                    <Star className="w-5 h-5"/>
                                    {language === 'si' ? 'Kumari' : 'Kumari'}
                                </div>
                            </motion.button>
                            <motion.button
                                className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                                    selectedCategory === 'sigithi-kumara'
                                        ? 'bg-green-500 text-white shadow-lg'
                                        : 'text-gray-600 hover:text-green-600'
                                }`}
                                whileHover={{scale: 1.05}}
                                whileTap={{scale: 0.95}}
                                onClick={() => setSelectedCategory('sigithi-kumara')}
                            >
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5"/>
                                    {language === 'si' ? 'Sigithi Kumara' : 'Sigithi Kumara'}
                                </div>
                            </motion.button>
                            <motion.button
                                className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                                    selectedCategory === 'sigithi-kumariya'
                                        ? 'bg-purple-500 text-white shadow-lg'
                                        : 'text-gray-600 hover:text-purple-600'
                                }`}
                                whileHover={{scale: 1.05}}
                                whileTap={{scale: 0.95}}
                                onClick={() => setSelectedCategory('sigithi-kumariya')}
                            >
                                <div className="flex items-center gap-2">
                                    <Heart className="w-5 h-5"/>
                                    {language === 'si' ? 'Sigithi Kumariya' : 'Sigithi Kumariya'}
                                </div>
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Ranking Title - Only show when admin enables ranking display */}
                {visibilitySettings.showvotecharts && (
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{opacity: 0, y: -20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.6}}
                            className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-lg"
                        >
                            <Crown className="w-6 h-6 text-white"/>
                            <h2 className="text-xl font-bold text-white">
                                {language === 'si' ? 'Vote Rankings' : 'Vote Rankings'}
                            </h2>
                            <Crown className="w-6 h-6 text-white"/>
                        </motion.div>
                        <p className="text-gray-600 mt-3 text-sm">
                            {language === 'si'
                                ? `${selectedCategory === 'kumara' ? 'Kumara' : selectedCategory === 'kumari' ? 'Kumari' : selectedCategory === 'sigithi-kumara' ? 'Sigithi Kumara' : 'Sigithi Kumariya'} Category Rankings`
                                : `${selectedCategory === 'kumara' ? 'Kumara' : selectedCategory === 'kumari' ? 'Kumari' : selectedCategory === 'sigithi-kumara' ? 'Sigithi Kumara' : 'Sigithi Kumariya'} Category Rankings`
                            }
                        </p>
                    </div>
                )}

                {/* Candidates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {currentCandidates.map((candidate, index) => {
                        // Check if user has already voted in this category
                        const categoryVoted = localStorage.getItem(`awurudu_voted_${selectedCategory}`) === 'true';
                        const isVotedInCategory = categoryVoted;

                        return (
                            <motion.div
                                key={candidate.id}
                                className={`relative group ${isVotedInCategory ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
                                initial={{opacity: 0, y: 50}}
                                animate={{opacity: 1, y: 0}}
                                transition={{delay: index * 0.1}}
                                whileHover={!isVotedInCategory ? {scale: 1.03} : {}}
                                onClick={() => !isVotedInCategory && handleCandidateSelect(candidate.id)}
                            >
                                <div
                                    className={`bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border-2 transition-all duration-300 ${
                                        selectedCandidate === candidate.id
                                            ? selectedCategory === 'kumara' ? 'border-blue-500 ring-4 ring-blue-200' :
                                                selectedCategory === 'kumari' ? 'border-pink-500 ring-4 ring-pink-200' :
                                                    selectedCategory === 'sigithi-kumara' ? 'border-green-500 ring-4 ring-green-200' :
                                                        'border-purple-500 ring-4 ring-purple-200'
                                            : isVotedInCategory
                                                ? 'border-gray-300'
                                                : 'border-gray-200 hover:border-orange-400'
                                    }`}>
                                    {/* Ranking Badge - Only show when admin enables ranking display */}
                                    {visibilitySettings.showvotecharts && (
                                        <div className="absolute top-4 left-4 z-10">
                                            <div
                                                className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg border-2 ${getRankBadgeColor(getCorrectRank(candidate.id, selectedCategory))}`}>
                                                {getRankIcon(getCorrectRank(candidate.id, selectedCategory))}
                                                <span
                                                    className="font-black">{getRankLabel(getCorrectRank(candidate.id, selectedCategory))}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Voting Status Badge */}
                                    {isVotedInCategory && (
                                        <div className="absolute top-4 left-4 z-10" style={{top: '3.5rem'}}>
                                            <div
                                                className="px-3 py-1 rounded-full bg-green-500 text-white text-sm font-semibold flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3"/>
                                                {language === 'si' ? 'Voted' : 'Voted'}
                                            </div>
                                        </div>
                                    )}

                                    {/* Vote Count Badge */}
                                    <div
                                        className={`absolute top-4 right-4 z-10 ${isVotedInCategory ? 'opacity-50' : ''}`}>
                                        <div
                                            className={`px-3 py-1 rounded-full text-white text-sm font-semibold flex items-center gap-1 ${
                                                selectedCategory === 'kumara' ? 'bg-blue-500' :
                                                    selectedCategory === 'kumari' ? 'bg-pink-500' :
                                                        selectedCategory === 'sigithi-kumara' ? 'bg-green-500' :
                                                            'bg-purple-500'
                                            }`}>
                                            <Heart className="w-3 h-3"/>
                                            {candidate.voteCount}
                                        </div>
                                    </div>

                                    {/* Candidate Image */}
                                    <div className="relative h-96 rounded-t-2xl overflow-hidden">
                                        <img
                                            src={candidate.image}
                                            alt={candidate.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div
                                            className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                                        {/* Selected Indicator */}
                                        {selectedCandidate === candidate.id && (
                                            <motion.div
                                                className="absolute top-4 left-4 w-8 h-8 bg-white rounded-full flex items-center justify-center"
                                                initial={{scale: 0}}
                                                animate={{scale: 1}}
                                                transition={{type: "spring"}}
                                            >
                                                <CheckCircle className={`w-5 h-5 ${
                                                    selectedCategory === 'kumara' ? 'text-blue-500' :
                                                        selectedCategory === 'kumari' ? 'text-pink-500' :
                                                            selectedCategory === 'sigithi-kumara' ? 'text-green-500' :
                                                                'text-purple-500'
                                                }`}/>
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Candidate Info */}
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-xl font-bold text-gray-800">{candidate.name}</h3>
                                            {visibilitySettings.showvotecharts && (
                                                <div
                                                    className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 border-2 ${getRankBadgeColor(getCorrectRank(candidate.id, selectedCategory))}`}>
                                                    {getRankIcon(getCorrectRank(candidate.id, selectedCategory))}
                                                    <span
                                                        className="font-black">{getRankLabel(getCorrectRank(candidate.id, selectedCategory))}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4"/>
                                                <span>{candidate.age} years</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Heart className="w-4 h-4"/>
                                                <span>{candidate.voteCount} votes</span>
                                            </div>
                                        </div>
                                        <p className="text-gray-600 text-sm line-clamp-3">{candidate.description}</p>

                                        <motion.button
                                            className={`w-full mt-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                                                selectedCandidate === candidate.id
                                                    ? selectedCategory === 'kumara'
                                                        ? 'bg-blue-500 text-white shadow-lg'
                                                        : selectedCategory === 'kumari'
                                                            ? 'bg-pink-500 text-white shadow-lg'
                                                            : selectedCategory === 'sigithi-kumara'
                                                                ? 'bg-green-500 text-white shadow-lg'
                                                                : 'bg-purple-500 text-white shadow-lg'
                                                    : isVotedInCategory
                                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-orange-100'
                                            }`}
                                            whileHover={!isVotedInCategory ? {scale: 1.02} : {}}
                                            whileTap={!isVotedInCategory ? {scale: 0.98} : {}}
                                            disabled={isVotedInCategory}
                                        >
                                            {isVotedInCategory
                                                ? (language === 'si' ? 'Already Voted' : 'Already Voted')
                                                : selectedCandidate === candidate.id
                                                    ? (language === 'si' ? 'Selected' : 'Selected')
                                                    : (language === 'si' ? 'Select to Vote' : 'Select to Vote')
                                            }
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Voter Information Modal */}
                <AnimatePresence>
                    {showVoterForm && selectedCandidate && (
                        <motion.div
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 z-50"
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            exit={{opacity: 0}}
                            onClick={() => setShowVoterForm(false)}
                        >
                            <motion.div
                                className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
                                initial={{scale: 0.9, opacity: 0}}
                                animate={{scale: 1, opacity: 1}}
                                exit={{scale: 0.9, opacity: 0}}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="text-center mb-6">
                                    <div
                                        className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                                            selectedCategory === 'kumara' ? 'bg-blue-100' :
                                                selectedCategory === 'kumari' ? 'bg-pink-100' :
                                                    selectedCategory === 'sigithi-kumara' ? 'bg-green-100' :
                                                        'bg-purple-100'
                                        }`}>
                                        <Shield className={`w-8 h-8 ${
                                            selectedCategory === 'kumara' ? 'text-blue-600' :
                                                selectedCategory === 'kumari' ? 'text-pink-600' :
                                                    selectedCategory === 'sigithi-kumara' ? 'text-green-600' :
                                                        'text-purple-600'
                                        }`}/>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                        {language === 'si' ? 'Verify Your Identity' : 'Verify Your Identity'}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-2">
                                        {language === 'si'
                                            ? 'Please provide your information to cast your vote. One vote per person only.'
                                            : 'Please provide your information to cast your vote. One vote per person only.'
                                        }
                                    </p>
                                    <p className="text-blue-600 text-xs">
                                        Only Name and Phone are required. Email and NIC are optional.
                                        <span className="block text-xs text-blue-600 mt-1">
                      කේවල නම සහ දුරකථන අංකය පමණක් අවශ්ය වේ. විද්යුත් තැපැල් ලිපිනය සහ ජාතික හැඳුනුම්පත් අංකය අනිවාර්ය නොවේ.
                    </span>
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Full Name *
                                            <span className="block text-xs text-gray-500 mt-1">
                        පූර්ණ නම
                      </span>
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={voterInfo.name}
                                            onChange={handleVoterInputChange}
                                            className={`w-full px-4 py-3 text-gray-900 rounded-xl border ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-500`}
                                            placeholder="Enter your full name"
                                        />
                                        {errors.name && (
                                            <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                                                <AlertCircle className="w-3 h-3"/>
                                                {errors.name}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone Number *
                                            <span className="block text-xs text-gray-500 mt-1">
                        දුරකථන අංකය
                      </span>
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={voterInfo.phone}
                                            onChange={handleVoterInputChange}
                                            className={`w-full px-4 py-3 text-gray-900 rounded-xl border ${errors.phone ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-500`}
                                            placeholder="+94 XX XXX XXXX"
                                        />
                                        {errors.phone && (
                                            <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                                                <AlertCircle className="w-3 h-3"/>
                                                {errors.phone}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email Address (Optional)
                                            <span className="block text-xs text-gray-500 mt-1">
                        විද්යුත් තැපැල් ලිපිනය (අනිවාර්ය නොවේ)
                      </span>
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={voterInfo.email}
                                            onChange={handleVoterInputChange}
                                            className={`w-full px-4 py-3 text-gray-900 rounded-xl border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-500`}
                                            placeholder="Enter email if available"
                                        />
                                        {errors.email && (
                                            <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                                                <AlertCircle className="w-3 h-3"/>
                                                {errors.email}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            NIC Number (Optional)
                                            <span className="block text-xs text-gray-500 mt-1">
                        ජාතික හැඳුනුම්පත් අංකය (අනිවාර්ය නොවේ)
                      </span>
                                        </label>
                                        <input
                                            type="text"
                                            name="nic"
                                            value={voterInfo.nic}
                                            onChange={handleVoterInputChange}
                                            className={`w-full px-4 py-3 text-gray-900 rounded-xl border ${errors.nic ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-500`}
                                            placeholder="Enter NIC if available"
                                        />
                                        {errors.nic && (
                                            <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                                                <AlertCircle className="w-3 h-3"/>
                                                {errors.nic}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-8">
                                    <motion.button
                                        type="button"
                                        className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors duration-200"
                                        whileHover={{scale: 1.02}}
                                        whileTap={{scale: 0.98}}
                                        onClick={() => setShowVoterForm(false)}
                                    >
                                        {language === 'si' ? 'Cancel' : 'Cancel'}
                                    </motion.button>
                                    <motion.button
                                        type="button"
                                        className={`flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 ${
                                            selectedCategory === 'kumara'
                                                ? 'bg-blue-500 hover:bg-blue-600 shadow-lg hover:shadow-blue-500/50'
                                                : selectedCategory === 'kumari'
                                                    ? 'bg-pink-500 hover:bg-pink-600 shadow-lg hover:shadow-pink-500/50'
                                                    : selectedCategory === 'sigithi-kumara'
                                                        ? 'bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-green-500/50'
                                                        : 'bg-purple-500 hover:bg-purple-600 shadow-lg hover:shadow-purple-500/50'
                                        }`}
                                        whileHover={{scale: 1.02}}
                                        whileTap={{scale: 0.98}}
                                        onClick={handleVote}
                                        disabled={isVoting}
                                    >
                                        {isVoting ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <motion.div
                                                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                                    animate={{rotate: 360}}
                                                    transition={{duration: 1, repeat: Infinity, ease: "linear"}}
                                                />
                                                {language === 'si' ? 'Voting...' : 'Voting...'}
                                            </div>
                                        ) : (
                                            language === 'si' ? 'Cast Vote' : 'Cast Vote'
                                        )}
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
