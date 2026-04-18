'use client';

import React, {useState, useEffect} from 'react';
import {motion} from 'framer-motion';
import {
    Users,
    Vote,
    CheckCircle,
    XCircle,
    Clock,
    TrendingUp,
    Eye,
    Download,
    RefreshCw,
    Search,
    Filter,
    BarChart3,
    UserCheck,
    UserX,
    Settings,
    LogOut,
    Crown,
    Star,
    Activity,
    PieChart,
    TrendingDown,
    Calendar,
    Heart
} from 'lucide-react';
import {useLanguage} from '../contexts/LanguageContext';
import {Candidate} from '@/lib/database-schema';

interface AdminDashboardProps {
    candidates: Candidate[];
    onApproveCandidate: (candidateId: string) => Promise<void>;
    onRejectCandidate: (candidateId: string) => Promise<void>;
    onRefreshData: () => Promise<void>;
}

export default function AdminDashboard({
                                           candidates,
                                           onApproveCandidate,
                                           onRejectCandidate,
                                           onRefreshData
                                       }: AdminDashboardProps) {
    const {t, language} = useLanguage();
    const [activeTab, setActiveTab] = useState<'overview' | 'candidates' | 'votes' | 'voting-data' | 'chart-control'>('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

    // Reset pagination when filters changes
    useEffect(() => {
        setCandidatesCurrentPage(1);
    }, [searchTerm, filterStatus]);
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [voteStats, setVoteStats] = useState<any>(null);
    const [overviewStats, setOverviewStats] = useState<any>(null);
    const [votingData, setVotingData] = useState<any>(null);
    const [visibilitySettings, setVisibilitySettings] = useState<any>({
        showvotecharts: true,
        showvotenumbers: false
    });
    const [isLoadingStats, setIsLoadingStats] = useState(false);
    const [isLoadingVotingData, setIsLoadingVotingData] = useState(false);

    // Pagination states
    const [candidatesCurrentPage, setCandidatesCurrentPage] = useState(1);
    const [candidatesItemsPerPage] = useState(10);
    const [votingDataCurrentPage, setVotingDataCurrentPage] = useState(1);
    const [votingDataItemsPerPage] = useState(10);
    const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);

    // Debug: Log candidates' data
    console.log('AdminDashboard - Candidates received:', candidates);
    console.log('AdminDashboard - Candidates length:', candidates?.length);

    // Fetch vote statistics
    const fetchVoteStats = async () => {
        try {
            const response = await fetch('/api/voting-session');
            const result = await response.json();
            if (result.success) {
                setVoteStats(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch vote stats:', error);
        }
    };

    // Fetch comprehensive overview statistics
    const fetchOverviewStats = async () => {
        setIsLoadingStats(true);
        try {
            const [voteResponse, sessionResponse] = await Promise.all([
                fetch('/api/voting-session'),
                fetch('/api/voting-session')
            ]);

            const voteData = await voteResponse.json();
            const sessionData = await sessionResponse.json();

            if (voteData.success && sessionData.success) {
                setOverviewStats({
                    ...voteData.data,
                    ...sessionData.data,
                    lastUpdated: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('Failed to fetch overview stats:', error);
        } finally {
            setIsLoadingStats(false);
        }
    };

    // Fetch detailed voting data
    const fetchVotingData = async () => {
        setIsLoadingVotingData(true);
        try {
            const response = await fetch('/api/voting-data');
            const result = await response.json();
            if (result.success) {
                setVotingData(result.data);
                // Debug: Log the voting data to check age field
                console.log('AdminDashboard - Voting data received:', result.data);
                if (result.data.votingData && result.data.votingData.length > 0) {
                    console.log('AdminDashboard - First voting record:', result.data.votingData[0]);
                    console.log('AdminDashboard - Age check:', result.data.votingData.map((vote: any) => ({
                        candidate_name: vote.candidate_name,
                        candidate_age: vote.candidate_age,
                        age_type: typeof vote.candidate_age
                    })));
                }
            }
        } catch (error) {
            console.error('Failed to fetch voting data:', error);
        } finally {
            setIsLoadingVotingData(false);
        }
    };

    // Fetch visibility settings
    const fetchVisibilitySettings = async () => {
        try {
            const response = await fetch('/api/vote-visibility');
            const result = await response.json();
            console.log('Visibility settings response:', result);
            if (result.success) {
                setVisibilitySettings(result.data);
                console.log('Visibility settings updated in state:', result.data);
            } else {
                console.error('Failed to fetch visibility settings:', result.error);
            }
        } catch (error) {
            console.error('Failed to fetch visibility settings:', error);
        }
    };

    // Update visibility settings
    const updateVisibilitySettings = async (settings: { showVoteCharts: boolean; showVoteNumbers: boolean }) => {
        console.log('Updating visibility settings with:', settings);
        console.log('Current visibility state before update:', visibilitySettings);
        setIsUpdatingVisibility(true);
        try {
            const response = await fetch('/api/vote-visibility', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(settings),
            });
            const result = await response.json();
            console.log('Update response:', result);
            if (result.success) {
                // Refetch settings from database to ensure consistency
                await fetchVisibilitySettings();
            } else {
                console.error('Update failed:', result.error);
            }
        } catch (error) {
            console.error('Failed to update visibility settings:', error);
        } finally {
            setIsUpdatingVisibility(false);
        }
    };

    // Fetch vote stats when votes tab is active
    useEffect(() => {
        if (activeTab === 'votes') {
            fetchVoteStats();
        }
    }, [activeTab]);

    // Fetch overview stats when overview tab is active
    useEffect(() => {
        if (activeTab === 'overview') {
            fetchOverviewStats();
        }
    }, [activeTab]);

    // Fetch voting data when voting-data tab is active
    useEffect(() => {
        if (activeTab === 'voting-data') {
            fetchVotingData();
        }
    }, [activeTab]);

    // Fetch visibility settings on component mount
    useEffect(() => {
        fetchVisibilitySettings();
    }, []);

    const pendingCandidates = candidates.filter(c => c.status === 'pending');
    const approvedCandidates = candidates.filter(c => c.status === 'approved');
    const rejectedCandidates = candidates.filter(c => c.status === 'rejected');

    const kumaraCandidates = approvedCandidates.filter(c => c.category === 'kumara');
    const kumariCandidates = approvedCandidates.filter(c => c.category === 'kumari');
    const sigithiKumaraCandidates = approvedCandidates.filter(c => c.category === 'sigithi-kumara');
    const sigithiKumariyaCandidates = approvedCandidates.filter(c => c.category === 'sigithi-kumariya');

    // Debug: Log filtered candidates
    console.log('AdminDashboard - Approved candidates:', approvedCandidates);
    console.log('AdminDashboard - Kumara candidates:', kumaraCandidates);
    console.log('AdminDashboard - Kumari candidates:', kumariCandidates);
    console.log('AdminDashboard - Sigithi Kumara candidates:', sigithiKumaraCandidates);
    console.log('AdminDashboard - Sigithi Kumariya candidates:', sigithiKumariyaCandidates);

    const totalVotes = candidates?.reduce((sum, c) => sum + (c?.votecount || c?.voteCount || 0), 0) || 0;
    const kumaraVotes = kumaraCandidates?.reduce((sum, c) => sum + (c?.votecount || c?.voteCount || 0), 0) || 0;
    const kumariVotes = kumariCandidates?.reduce((sum, c) => sum + (c?.votecount || c?.voteCount || 0), 0) || 0;
    const sigithiKumaraVotes = sigithiKumaraCandidates?.reduce((sum, c) => sum + (c?.votecount || c?.voteCount || 0), 0) || 0;
    const sigithiKumariyaVotes = sigithiKumariyaCandidates?.reduce((sum, c) => sum + (c?.votecount || c?.voteCount || 0), 0) || 0;

    const filteredCandidates = candidates.filter(candidate => {
        const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidate.phone.includes(searchTerm);
        const matchesFilter = filterStatus === 'all' || candidate.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    // Pagination logic for candidates
    const candidatesTotalPages = Math.ceil(filteredCandidates.length / candidatesItemsPerPage);
    const candidatesStartIndex = (candidatesCurrentPage - 1) * candidatesItemsPerPage;
    const candidatesEndIndex = candidatesStartIndex + candidatesItemsPerPage;
    const paginatedCandidates = filteredCandidates.slice(candidatesStartIndex, candidatesEndIndex);

    // Pagination logic for voting data
    const votingDataArray = votingData?.votingData || [];
    const votingDataTotalPages = Math.ceil(votingDataArray.length / votingDataItemsPerPage);
    const votingDataStartIndex = (votingDataCurrentPage - 1) * votingDataItemsPerPage;
    const votingDataEndIndex = votingDataStartIndex + votingDataItemsPerPage;
    const paginatedVotingData = votingDataArray.slice(votingDataStartIndex, votingDataEndIndex);

    const handleApprove = async (candidateId: string) => {
        setIsLoading(true);
        try {
            await onApproveCandidate(candidateId);
            await onRefreshData();
        } catch (error) {
            console.error('Error approving candidate:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReject = async (candidateId: string) => {
        setIsLoading(true);
        try {
            await onRejectCandidate(candidateId);
            await onRefreshData();
        } catch (error) {
            console.error('Error rejecting candidate:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'text-green-600 bg-green-100';
            case 'rejected':
                return 'text-red-600 bg-red-100';
            case 'pending':
                return 'text-yellow-600 bg-yellow-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="w-4 h-4"/>;
            case 'rejected':
                return <XCircle className="w-4 h-4"/>;
            case 'pending':
                return <Clock className="w-4 h-4"/>;
            default:
                return null;
        }
    };

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/auth', {
                method: 'DELETE',
            });

            if (response.ok) {
                // Redirect to login page or reload
                window.location.href = '/admin';
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <motion.div
                                className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center"
                            >
                                <Settings className="w-6 h-6 text-white"/>
                            </motion.div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">
                                    {language === 'si' ? 'Admin Dashboard' : 'Admin Dashboard'}
                                </h1>
                                <p className="text-sm text-gray-600">
                                    {language === 'si' ? 'Manage Awurudu Kumari, Kumari, Sigithi Kumara & Sigithi Kumariya Voting' : 'Manage Awurudu Kumari, Kumari, Sigithi Kumara & Sigithi Kumariya Voting'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <motion.button
                                onClick={onRefreshData}
                                disabled={isLoading}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                whileHover={{scale: 1.05}}
                                whileTap={{scale: 0.95}}
                                title={language === 'si' ? 'Refresh Data' : 'Refresh Data'}
                            >
                                <RefreshCw className="w-4 h-4"/>
                                <span className="text-sm font-medium">
                  {language === 'si' ? 'Refresh' : 'Refresh'}
                </span>
                            </motion.button>
                            <motion.button
                                onClick={handleLogout}
                                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                                whileHover={{scale: 1.05}}
                                whileTap={{scale: 0.95}}
                                title={language === 'si' ? 'Logout' : 'Logout'}
                            >
                                <LogOut className="w-5 h-5"/>
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Navigation Tabs */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
                    <div className="flex border-b border-gray-200">
                        {[
                            {id: 'overview', label: language === 'si' ? 'Overview' : 'Overview', icon: BarChart3},
                            {id: 'candidates', label: language === 'si' ? 'Candidates' : 'Candidates', icon: Users},
                            {id: 'votes', label: language === 'si' ? 'Votes' : 'Votes', icon: Vote},
                            {id: 'voting-data', label: language === 'si' ? 'Voting Data' : 'Voting Data', icon: Eye},
                            {
                                id: 'chart-control',
                                label: language === 'si' ? 'Chart Control' : 'Chart Control',
                                icon: Settings
                            }
                        ].map((tab) => (
                            <motion.button
                                key={tab.id}
                                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                                    activeTab === tab.id
                                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                                }`}
                                whileHover={{scale: 1.02}}
                                whileTap={{scale: 0.98}}
                                onClick={() => setActiveTab(tab.id as any)}
                            >
                                <tab.icon className="w-4 h-4"/>
                                {tab.label}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        className="space-y-8"
                    >
                        {/* Statistics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {/* Total Candidates */}
                            <motion.div
                                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                                whileHover={{scale: 1.02}}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Users className="w-6 h-6 text-blue-600"/>
                                    </div>
                                    <span className="text-sm text-gray-500">
                    {language === 'si' ? 'Total' : 'Total'}
                  </span>
                                </div>
                                <div className="text-2xl font-bold text-gray-800">{candidates.length}</div>
                                <div className="text-sm text-gray-600">
                                    {language === 'si' ? 'Candidates' : 'Candidates'}
                                </div>
                            </motion.div>

                            {/* Pending Approval */}
                            <motion.div
                                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                                whileHover={{scale: 1.02}}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div
                                        className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                        <Clock className="w-6 h-6 text-yellow-600"/>
                                    </div>
                                    <span className="text-sm text-gray-500">
                    {language === 'si' ? 'Pending' : 'Pending'}
                  </span>
                                </div>
                                <div className="text-2xl font-bold text-gray-800">{pendingCandidates.length}</div>
                                <div className="text-sm text-gray-600">
                                    {language === 'si' ? 'For Approval' : 'For Approval'}
                                </div>
                            </motion.div>

                            {/* Total Votes */}
                            <motion.div
                                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                                whileHover={{scale: 1.02}}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <Vote className="w-6 h-6 text-green-600"/>
                                    </div>
                                    <span className="text-sm text-gray-500">
                    {language === 'si' ? 'Total' : 'Total'}
                  </span>
                                </div>
                                <div
                                    className="text-2xl font-bold text-gray-800">{typeof totalVotes === 'number' && !isNaN(totalVotes) ? totalVotes : 0}</div>
                                <div className="text-sm text-gray-600">
                                    {language === 'si' ? 'Votes Cast' : 'Votes Cast'}
                                </div>
                            </motion.div>

                            {/* Active Categories */}
                            <motion.div
                                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                                whileHover={{scale: 1.02}}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div
                                        className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <Activity className="w-6 h-6 text-purple-600"/>
                                    </div>
                                    <span className="text-sm text-gray-500">
                    {language === 'si' ? 'Active' : 'Active'}
                  </span>
                                </div>
                                <div className="text-2xl font-bold text-gray-800">2</div>
                                <div className="text-sm text-gray-600">
                                    {language === 'si' ? 'Categories' : 'Categories'}
                                </div>
                            </motion.div>
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                            {/* Voting Progress Chart */}
                            <motion.div
                                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                                initial={{opacity: 0, scale: 0.95}}
                                animate={{opacity: 1, scale: 1}}
                                transition={{delay: 0.2}}
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <BarChart3 className="w-6 h-6 text-blue-500"/>
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        {language === 'si' ? 'Voting Progress' : 'Voting Progress'}
                                    </h3>
                                    {isLoadingStats && (
                                        <RefreshCw className="w-4 h-4 text-blue-500 animate-spin"/>
                                    )}
                                </div>

                                {/* Advanced Bar Chart */}
                                <div className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm font-medium text-gray-700">Kumara</span>
                                                <span
                                                    className="text-sm font-bold text-blue-600">{kumaraVotes} votes</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-4 relative">
                                                <motion.div
                                                    className="bg-gradient-to-r from-blue-400 to-blue-600 h-4 rounded-full shadow-sm"
                                                    initial={{width: 0}}
                                                    animate={{width: totalVotes > 0 ? `${(kumaraVotes / totalVotes) * 100}%` : '0%'}}
                                                    transition={{duration: 1.2, delay: 0.3}}
                                                />
                                                <span
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white font-medium">
                          {totalVotes > 0 ? Math.round((kumaraVotes / totalVotes) * 100) : 0}%
                        </span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm font-medium text-gray-700">Kumari</span>
                                                <span
                                                    className="text-sm font-bold text-pink-600">{kumariVotes} votes</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-4 relative">
                                                <motion.div
                                                    className="bg-gradient-to-r from-pink-400 to-pink-600 h-4 rounded-full shadow-sm"
                                                    initial={{width: 0}}
                                                    animate={{width: totalVotes > 0 ? `${(kumariVotes / totalVotes) * 100}%` : '0%'}}
                                                    transition={{duration: 1.2, delay: 0.4}}
                                                />
                                                <span
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white font-medium">
                          {totalVotes > 0 ? Math.round((kumariVotes / totalVotes) * 100) : 0}%
                        </span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center mb-1">
                                                <span
                                                    className="text-sm font-medium text-gray-700">Sigithi Kumara</span>
                                                <span
                                                    className="text-sm font-bold text-green-600">{sigithiKumaraVotes} votes</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-4 relative">
                                                <motion.div
                                                    className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full shadow-sm"
                                                    initial={{width: 0}}
                                                    animate={{width: totalVotes > 0 ? `${(sigithiKumaraVotes / totalVotes) * 100}%` : '0%'}}
                                                    transition={{duration: 1.2, delay: 0.5}}
                                                />
                                                <span
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white font-medium">
                          {totalVotes > 0 ? Math.round((sigithiKumaraVotes / totalVotes) * 100) : 0}%
                        </span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center mb-1">
                                                <span
                                                    className="text-sm font-medium text-gray-700">Sigithi Kumariya</span>
                                                <span
                                                    className="text-sm font-bold text-purple-600">{sigithiKumariyaVotes} votes</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-4 relative">
                                                <motion.div
                                                    className="bg-gradient-to-r from-purple-400 to-purple-600 h-4 rounded-full shadow-sm"
                                                    initial={{width: 0}}
                                                    animate={{width: totalVotes > 0 ? `${(sigithiKumariyaVotes / totalVotes) * 100}%` : '0%'}}
                                                    transition={{duration: 1.2, delay: 0.6}}
                                                />
                                                <span
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white font-medium">
                          {totalVotes > 0 ? Math.round((sigithiKumariyaVotes / totalVotes) * 100) : 0}%
                        </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Candidate Performance Chart */}
                            <motion.div
                                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                                initial={{opacity: 0, scale: 0.95}}
                                animate={{opacity: 1, scale: 1}}
                                transition={{delay: 0.3}}
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <TrendingUp className="w-6 h-6 text-green-500"/>
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        {language === 'si' ? 'Top Candidates' : 'Top Candidates'}
                                    </h3>
                                </div>

                                {/* Horizontal Bar Chart */}
                                <div className="space-y-3">
                                    {kumaraCandidates.slice(0, 3).map((candidate, index) => {
                                        const maxVotes = Math.max(...kumaraCandidates.map(c => c?.votecount || c?.voteCount || 0), 1);
                                        const candidateVotes = candidate?.votecount || candidate?.voteCount || 0;
                                        const percentage = maxVotes > 0 ? (candidateVotes / maxVotes) * 100 : 0;

                                        return (
                                            <div key={candidate.id} className="space-y-1">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        {/* Candidate Circle Image */}
                                                        <div
                                                            className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200 border-2 border-blue-300">
                                                            {candidate.image ? (
                                                                <img
                                                                    src={candidate.image}
                                                                    alt={candidate.name}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        const target = e.target as HTMLImageElement;
                                                                        target.style.display = 'none';
                                                                        target.nextElementSibling?.classList.remove('hidden');
                                                                    }}
                                                                />
                                                            ) : null}
                                                            {/* Fallback avatar */}
                                                            <div
                                                                className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                                                                {candidate.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        </div>
                                                        <span
                                                            className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
                              {candidate.name}
                            </span>
                                                    </div>
                                                    <span
                                                        className="text-sm font-bold text-blue-600">{candidateVotes}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-3">
                                                    <motion.div
                                                        className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full"
                                                        initial={{width: 0}}
                                                        animate={{width: `${percentage}%`}}
                                                        transition={{duration: 1, delay: 0.5 + index * 0.1}}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>

                            {/* Status Distribution Chart */}
                            <motion.div
                                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                                initial={{opacity: 0, scale: 0.95}}
                                animate={{opacity: 1, scale: 1}}
                                transition={{delay: 0.4}}
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <PieChart className="w-6 h-6 text-purple-500"/>
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        {language === 'si' ? 'Status Distribution' : 'Status Distribution'}
                                    </h3>
                                </div>

                                {/* Donut Chart Representation */}
                                <div className="space-y-4">
                                    <div className="relative w-32 h-32 mx-auto">
                                        {/* SVG Donut Chart */}
                                        <svg viewBox="0 0 42 42" className="w-32 h-32 transform -rotate-90">
                                            {(() => {
                                                const total = candidates.length;
                                                const approved = approvedCandidates.length;
                                                const pending = pendingCandidates.length;
                                                const rejected = rejectedCandidates.length;

                                                const approvedAngle = (approved / total) * 360;
                                                const pendingAngle = (pending / total) * 360;
                                                const rejectedAngle = (rejected / total) * 360;

                                                let currentAngle = 0;

                                                return (
                                                    <g>
                                                        {/* Approved */}
                                                        <path
                                                            d={`M 21 21 L 21 0 A 21 21 0 0 1 ${21 + 21 * Math.sin((currentAngle * Math.PI) / 180)} ${21 - 21 * Math.cos((currentAngle * Math.PI) / 180)} Z`}
                                                            fill="#10b981"
                                                            stroke="white"
                                                            strokeWidth="2"
                                                        />
                                                        {currentAngle += approvedAngle}

                                                        {/* Pending */}
                                                        <path
                                                            d={`M 21 21 L 21 0 A 21 21 0 0 1 ${21 + 21 * Math.sin((currentAngle * Math.PI) / 180)} ${21 - 21 * Math.cos((currentAngle * Math.PI) / 180)} Z`}
                                                            fill="#f59e0b"
                                                            stroke="white"
                                                            strokeWidth="2"
                                                        />
                                                        {currentAngle += pendingAngle}

                                                        {/* Rejected */}
                                                        <path
                                                            d={`M 21 21 L 21 0 A 21 21 0 0 1 ${21 + 21 * Math.sin((currentAngle * Math.PI) / 180)} ${21 - 21 * Math.cos((currentAngle * Math.PI) / 180)} Z`}
                                                            fill="#ef4444"
                                                            stroke="white"
                                                            strokeWidth="2"
                                                        />
                                                    </g>
                                                );
                                            })()}
                                        </svg>

                                        {/* Center circle for donut effect */}
                                        <div
                                            className="absolute inset-8 bg-white rounded-full flex items-center justify-center">
                                            <span className="text-lg font-bold text-gray-800">{candidates.length}</span>
                                        </div>
                                    </div>

                                    {/* Legend */}
                                    <div className="grid grid-cols-2 gap-2 mt-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                            <span
                                                className="text-xs text-gray-600">Approved ({approvedCandidates.length})</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                            <span
                                                className="text-xs text-gray-600">Pending ({pendingCandidates.length})</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                            <span
                                                className="text-xs text-gray-600">Rejected ({rejectedCandidates.length})</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>


                        {/* Vote Visibility Controls */}
                        <motion.div
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{delay: 0.35}}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <Eye className="w-6 h-6 text-indigo-500"/>
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {language === 'si' ? 'Vote Visibility Settings' : 'Vote Visibility Settings'}
                                </h3>
                                <div className="ml-auto">
                                    {isUpdatingVisibility && (
                                        <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin"/>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                            <BarChart3 className="w-5 h-5 text-indigo-600"/>
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {language === 'si' ? 'Show Vote Charts' : 'Show Vote Charts'}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {language === 'si' ? 'Display voting charts and graphs on home page' : 'Display voting charts and graphs on home page'}
                                            </div>
                                        </div>
                                    </div>
                                    <motion.button
                                        onClick={() => updateVisibilitySettings({
                                            showVoteCharts: !visibilitySettings?.showVoteCharts,
                                            showVoteNumbers: visibilitySettings?.showVoteNumbers || false
                                        })}
                                        disabled={isUpdatingVisibility}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                            visibilitySettings?.showVoteCharts ? 'bg-indigo-600' : 'bg-gray-300'
                                        } disabled:opacity-50`}
                                        whileHover={{scale: 1.05}}
                                        whileTap={{scale: 0.95}}
                                    >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            visibilitySettings?.showVoteCharts ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                                    </motion.button>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                            <Vote className="w-5 h-5 text-green-600"/>
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {language === 'si' ? 'Show Vote Numbers' : 'Show Vote Numbers'}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {language === 'si' ? 'Display exact vote counts on home page' : 'Display exact vote counts on home page'}
                                            </div>
                                        </div>
                                    </div>
                                    <motion.button
                                        onClick={() => updateVisibilitySettings({
                                            showVoteCharts: visibilitySettings?.showVoteCharts || false,
                                            showVoteNumbers: !visibilitySettings?.showVoteNumbers
                                        })}
                                        disabled={isUpdatingVisibility}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                            visibilitySettings?.showVoteNumbers ? 'bg-green-600' : 'bg-gray-300'
                                        } disabled:opacity-50`}
                                        whileHover={{scale: 1.05}}
                                        whileTap={{scale: 0.95}}
                                    >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            visibilitySettings?.showVoteNumbers ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                                    </motion.button>
                                </div>
                            </div>

                            {visibilitySettings?.lastUpdated && (
                                <div className="mt-4 text-xs text-gray-500 text-center">
                                    {language === 'si' ? 'Last updated' : 'Last updated'}: {new Date(visibilitySettings.lastUpdated).toLocaleString()}
                                </div>
                            )}
                        </motion.div>

                        {/* Real-time Status */}
                        <motion.div
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{delay: 0.4}}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <Activity className="w-6 h-6 text-green-500"/>
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {language === 'si' ? 'Live Status' : 'Live Status'}
                                </h3>
                                <div className="ml-auto">
                                    <motion.button
                                        onClick={fetchOverviewStats}
                                        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                                        whileHover={{scale: 1.05}}
                                        whileTap={{scale: 0.95}}
                                    >
                                        <RefreshCw className="w-4 h-4"/>
                                    </motion.button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-green-600">
                                        {overviewStats?.statistics?.totalVoters || 0}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {language === 'si' ? 'Total Voters' : 'Total Voters'}
                                    </div>
                                </div>

                                <div className="text-center">
                                    <div className="text-3xl font-bold text-blue-600">
                                        {overviewStats?.statistics?.totalVotes || totalVotes}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {language === 'si' ? 'Total Votes' : 'Total Votes'}
                                    </div>
                                </div>

                                <div className="text-center">
                                    <div className="text-3xl font-bold text-purple-600">
                                        {overviewStats?.session?.isActive ? (
                                            <span className="text-green-600">Active</span>
                                        ) : (
                                            <span className="text-red-600">Inactive</span>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {language === 'si' ? 'Session Status' : 'Session Status'}
                                    </div>
                                </div>
                            </div>

                            {overviewStats?.lastUpdated && (
                                <div className="mt-4 text-center text-xs text-gray-500">
                                    {language === 'si' ? 'Updated' : 'Last updated'}: {new Date(overviewStats.lastUpdated).toLocaleString()}
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}

                {/* Candidates Tab */}
                {activeTab === 'candidates' && (
                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                    >
                        {/* Search and Filter */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                                    <input
                                        type="text"
                                        placeholder={language === 'si' ? 'Search candidates...' : 'Search candidates...'}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                                        <motion.button
                                            key={status}
                                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                                filterStatus === status
                                                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                                            }`}
                                            whileHover={{scale: 1.05}}
                                            whileTap={{scale: 0.95}}
                                            onClick={() => setFilterStatus(status)}
                                        >
                                            {language === 'si' ? status.charAt(0).toUpperCase() + status.slice(1) : status.charAt(0).toUpperCase() + status.slice(1)}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Candidates List */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {language === 'si' ? 'Candidate' : 'Candidate'}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {language === 'si' ? 'Category' : 'Category'}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {language === 'si' ? 'Contact' : 'Contact'}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {language === 'si' ? 'Status' : 'Status'}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {language === 'si' ? 'Votes' : 'Votes'}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {language === 'si' ? 'Actions' : 'Actions'}
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedCandidates.map((candidate) => (
                                        <motion.tr
                                            key={candidate.id}
                                            className="hover:bg-gray-50"
                                            initial={{opacity: 0}}
                                            animate={{opacity: 1}}
                                            whileHover={{scale: 1.01}}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div
                                                        className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300 mr-3">
                                                        {candidate.image ? (
                                                            <img
                                                                src={candidate.image}
                                                                alt={candidate.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.style.display = 'none';
                                                                    target.nextElementSibling?.classList.remove('hidden');
                                                                }}
                                                            />
                                                        ) : null}
                                                        {/* Fallback avatar */}
                                                        <div
                                                            className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-bold">
                                                            {candidate.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div
                                                            className="text-sm font-medium text-gray-900">{candidate.name}</div>
                                                        <div className="text-sm text-gray-500">{candidate.age} years
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1">
                                                    {candidate.category === 'kumara' ? (
                                                        <Crown className="w-4 h-4 text-blue-500"/>
                                                    ) : candidate.category === 'kumari' ? (
                                                        <Star className="w-4 h-4 text-pink-500"/>
                                                    ) : candidate.category === 'sigithi-kumara' ? (
                                                        <Users className="w-4 h-4 text-green-500"/>
                                                    ) : (
                                                        <Heart className="w-4 h-4 text-purple-500"/>
                                                    )}
                                                    <span className="text-sm text-gray-900">
                              {candidate.category === 'kumara' ? 'Kumara' :
                                  candidate.category === 'kumari' ? 'Kumari' :
                                      candidate.category === 'sigithi-kumara' ? 'Sigithi Kumara' :
                                          'Sigithi Kumariya'}
                            </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{candidate.email}</div>
                                                <div className="text-sm text-gray-500">{candidate.phone}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div
                                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}>
                                                    {getStatusIcon(candidate.status)}
                                                    {candidate.status}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {candidate.voteCount}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    {candidate.status === 'pending' && (
                                                        <>
                                                            <motion.button
                                                                className="text-green-600 hover:text-green-900"
                                                                whileHover={{scale: 1.1}}
                                                                whileTap={{scale: 0.9}}
                                                                onClick={() => handleApprove(candidate.id)}
                                                                disabled={isLoading}
                                                            >
                                                                <UserCheck className="w-5 h-5"/>
                                                            </motion.button>
                                                            <motion.button
                                                                className="text-red-600 hover:text-red-900"
                                                                whileHover={{scale: 1.1}}
                                                                whileTap={{scale: 0.9}}
                                                                onClick={() => handleReject(candidate.id)}
                                                                disabled={isLoading}
                                                            >
                                                                <UserX className="w-5 h-5"/>
                                                            </motion.button>
                                                        </>
                                                    )}
                                                    <motion.button
                                                        className="text-blue-600 hover:text-blue-900"
                                                        whileHover={{scale: 1.1}}
                                                        whileTap={{scale: 0.9}}
                                                        onClick={() => setSelectedCandidate(candidate)}
                                                    >
                                                        <Eye className="w-5 h-5"/>
                                                    </motion.button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Controls */}
                            {candidatesTotalPages > 1 && (
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="text-sm text-gray-700 font-medium">
                                            {language === 'si'
                                                ? `Showing ${candidatesStartIndex + 1}-${Math.min(candidatesEndIndex, filteredCandidates.length)} of ${filteredCandidates.length} candidates`
                                                : `Showing ${candidatesStartIndex + 1}-${Math.min(candidatesEndIndex, filteredCandidates.length)} of ${filteredCandidates.length} candidates`
                                            }
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <motion.button
                                                onClick={() => setCandidatesCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={candidatesCurrentPage === 1}
                                                className="px-3 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-400 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                                                whileHover={{scale: candidatesCurrentPage === 1 ? 1 : 1.05}}
                                                whileTap={{scale: candidatesCurrentPage === 1 ? 1 : 0.95}}
                                            >
                                                {language === 'si' ? 'Previous' : 'Previous'}
                                            </motion.button>

                                            <div className="flex items-center gap-1">
                                                {/* Show first page */}
                                                {candidatesCurrentPage > 3 && (
                                                    <>
                                                        <motion.button
                                                            onClick={() => setCandidatesCurrentPage(1)}
                                                            className="px-3 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-400 rounded-md hover:bg-gray-100 transition-colors shadow-sm"
                                                            whileHover={{scale: 1.05}}
                                                            whileTap={{scale: 0.95}}
                                                        >
                                                            1
                                                        </motion.button>
                                                        {candidatesCurrentPage > 4 && (
                                                            <span className="px-2 text-gray-500">...</span>
                                                        )}
                                                    </>
                                                )}

                                                {/* Show page numbers around current page */}
                                                {Array.from({length: Math.min(candidatesTotalPages, 5)}, (_, i) => {
                                                    let pageNum;
                                                    if (candidatesTotalPages <= 5) {
                                                        pageNum = i + 1;
                                                    } else if (candidatesCurrentPage <= 3) {
                                                        pageNum = i + 1;
                                                    } else if (candidatesCurrentPage >= candidatesTotalPages - 2) {
                                                        pageNum = candidatesTotalPages - 4 + i;
                                                    } else {
                                                        pageNum = candidatesCurrentPage - 2 + i;
                                                    }

                                                    // Skip if this page is already shown as first page
                                                    if (candidatesCurrentPage > 3 && pageNum === 1) return null;
                                                    // Skip if this page is already shown as last page
                                                    if (candidatesCurrentPage < candidatesTotalPages - 2 && pageNum === candidatesTotalPages) return null;

                                                    return (
                                                        <motion.button
                                                            key={pageNum}
                                                            onClick={() => setCandidatesCurrentPage(pageNum)}
                                                            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors shadow-sm ${
                                                                candidatesCurrentPage === pageNum
                                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                                    : 'text-gray-800 bg-white border border-gray-400 hover:bg-gray-100'
                                                            }`}
                                                            whileHover={{scale: 1.05}}
                                                            whileTap={{scale: 0.95}}
                                                        >
                                                            {pageNum}
                                                        </motion.button>
                                                    );
                                                })}

                                                {/* Show last page */}
                                                {candidatesCurrentPage < candidatesTotalPages - 2 && (
                                                    <>
                                                        {candidatesCurrentPage < candidatesTotalPages - 3 && (
                                                            <span className="px-2 text-gray-500">...</span>
                                                        )}
                                                        <motion.button
                                                            onClick={() => setCandidatesCurrentPage(candidatesTotalPages)}
                                                            className="px-3 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-400 rounded-md hover:bg-gray-100 transition-colors shadow-sm"
                                                            whileHover={{scale: 1.05}}
                                                            whileTap={{scale: 0.95}}
                                                        >
                                                            {candidatesTotalPages}
                                                        </motion.button>
                                                    </>
                                                )}
                                            </div>

                                            <motion.button
                                                onClick={() => setCandidatesCurrentPage(prev => Math.min(prev + 1, candidatesTotalPages))}
                                                disabled={candidatesCurrentPage === candidatesTotalPages}
                                                className="px-3 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-400 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                                                whileHover={{scale: candidatesCurrentPage === candidatesTotalPages ? 1 : 1.05}}
                                                whileTap={{scale: candidatesCurrentPage === candidatesTotalPages ? 1 : 0.95}}
                                            >
                                                {language === 'si' ? 'Next' : 'Next'}
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Votes Tab */}
                {activeTab === 'votes' && (
                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        className="space-y-8"
                    >
                        {/* Vote Statistics */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <BarChart3 className="w-6 h-6 text-purple-500"/>
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {language === 'si' ? 'Voting Statistics' : 'Voting Statistics'}
                                </h3>
                                <motion.button
                                    onClick={fetchVoteStats}
                                    className="ml-auto p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors"
                                    whileHover={{scale: 1.05}}
                                    whileTap={{scale: 0.95}}
                                    title={language === 'si' ? 'Refresh Statistics' : 'Refresh Statistics'}
                                >
                                    <RefreshCw className="w-4 h-4"/>
                                </motion.button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <div className="text-center">
                                    <div
                                        className="text-3xl font-bold text-blue-600">{voteStats?.statistics?.totalVoters || 0}</div>
                                    <div
                                        className="text-sm text-gray-600">{language === 'si' ? 'Total Voters' : 'Total Voters'}</div>
                                </div>
                                <div className="text-center">
                                    <div
                                        className="text-3xl font-bold text-green-600">{voteStats?.statistics?.totalVotes || (typeof totalVotes === 'number' && !isNaN(totalVotes) ? totalVotes : 0)}</div>
                                    <div
                                        className="text-sm text-gray-600">{language === 'si' ? 'Total Votes' : 'Total Votes'}</div>
                                </div>
                                <div className="text-center">
                                    <div
                                        className="text-3xl font-bold text-purple-600">{voteStats?.statistics?.kumaraVotes || (typeof kumaraVotes === 'number' && !isNaN(kumaraVotes) ? kumaraVotes : 0)}</div>
                                    <div
                                        className="text-sm text-gray-600">{language === 'si' ? 'Kumara Votes' : 'Kumara Votes'}</div>
                                </div>
                                <div className="text-center">
                                    <div
                                        className="text-3xl font-bold text-pink-600">{voteStats?.statistics?.kumariVotes || (typeof kumariVotes === 'number' && !isNaN(kumariVotes) ? kumariVotes : 0)}</div>
                                    <div
                                        className="text-sm text-gray-600">{language === 'si' ? 'Kumari Votes' : 'Kumari Votes'}</div>
                                </div>
                                <div className="text-center">
                                    <div
                                        className="text-3xl font-bold text-green-600">{voteStats?.statistics?.sigithiKumaraVotes || (typeof sigithiKumaraVotes === 'number' && !isNaN(sigithiKumaraVotes) ? sigithiKumaraVotes : 0)}</div>
                                    <div
                                        className="text-sm text-gray-600">{language === 'si' ? 'Sigithi Kumara' : 'Sigithi Kumara'}</div>
                                </div>
                                <div className="text-center">
                                    <div
                                        className="text-3xl font-bold text-purple-600">{voteStats?.statistics?.sigithiKumariyaVotes || (typeof sigithiKumariyaVotes === 'number' && !isNaN(sigithiKumariyaVotes) ? sigithiKumariyaVotes : 0)}</div>
                                    <div
                                        className="text-sm text-gray-600">{language === 'si' ? 'Sigithi Kumariya' : 'Sigithi Kumariya'}</div>
                                </div>
                            </div>

                            {/* Session Info */}
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                    {language === 'si' ? 'Session Information' : 'Session Information'}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span
                                            className="text-gray-600">{language === 'si' ? 'Session ID' : 'Session ID'}:</span>
                                        <span className="font-medium ml-1">{voteStats?.session?.id || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span
                                            className="text-gray-600">{language === 'si' ? 'Status' : 'Status'}:</span>
                                        <span
                                            className={`ml-1 font-medium ${voteStats?.session?.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {voteStats?.session?.isActive ? (language === 'si' ? 'Active' : 'Active') : (language === 'si' ? 'Inactive' : 'Inactive')}
                    </span>
                                    </div>
                                    <div>
                                        <span
                                            className="text-gray-600">{language === 'si' ? 'Session Votes' : 'Session Votes'}:</span>
                                        <span className="font-medium ml-1">{voteStats?.session?.totalVotes || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Kumara Votes */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <Crown className="w-6 h-6 text-blue-500"/>
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        {language === 'si' ? 'Kumara Voting Results' : 'Kumara Voting Results'}
                                    </h3>
                                </div>
                                <div className="space-y-4">
                                    {kumaraCandidates && kumaraCandidates.length > 0 ? (
                                        kumaraCandidates
                                            .sort((a, b) => (b?.votecount || b?.voteCount || 0) - (a?.votecount || a?.voteCount || 0))
                                            .map((candidate, index) => {
                                                const candidateVotes = candidate?.votecount || candidate?.voteCount || 0;
                                                const maxVotes = Math.max(...kumaraCandidates.map(c => c?.votecount || c?.voteCount || 0), 1);
                                                const percentage = maxVotes > 0 ? (candidateVotes / maxVotes) * 100 : 0;

                                                return (
                                                    <motion.div
                                                        key={candidate?.id || `kumara-${index}`}
                                                        className="flex items-center gap-4"
                                                        initial={{opacity: 0, x: -20}}
                                                        animate={{opacity: 1, x: 0}}
                                                        transition={{delay: index * 0.1}}
                                                    >
                                                        <div
                                                            className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 border-2 border-blue-300">
                                                            {candidate?.image ? (
                                                                <img
                                                                    src={candidate.image}
                                                                    alt={candidate?.name || 'Unknown'}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        const target = e.target as HTMLImageElement;
                                                                        target.style.display = 'none';
                                                                        target.nextElementSibling?.classList.remove('hidden');
                                                                    }}
                                                                />
                                                            ) : null}
                                                            {/* Fallback avatar with rank number */}
                                                            <div
                                                                className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                                                                {index + 1}
                                                            </div>
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span
                                                                    className="text-sm font-medium text-gray-900">{candidate?.name || 'Unknown'}</span>
                                                                <div className="flex items-center gap-2">
                                                                    <span
                                                                        className="text-lg font-bold text-blue-600">{candidateVotes}</span>
                                                                    <span className="text-sm text-gray-600">votes</span>
                                                                </div>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
                                                                    style={{
                                                                        width: `${percentage}%`,
                                                                        minWidth: percentage > 0 ? '2px' : '0px'
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <p className="text-sm">No Kumara candidates available</p>
                                            <p className="text-xs mt-1">Please register and approve candidates first</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Kumari Votes */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <Star className="w-6 h-6 text-pink-500"/>
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        {language === 'si' ? 'Kumari Voting Results' : 'Kumari Voting Results'}
                                    </h3>
                                </div>
                                <div className="space-y-4">
                                    {kumariCandidates && kumariCandidates.length > 0 ? (
                                        kumariCandidates
                                            .sort((a, b) => (b?.votecount || b?.voteCount || 0) - (a?.votecount || a?.voteCount || 0))
                                            .map((candidate, index) => {
                                                const candidateVotes = candidate?.votecount || candidate?.voteCount || 0;
                                                const maxVotes = Math.max(...kumariCandidates.map(c => c?.votecount || c?.voteCount || 0), 1);
                                                const percentage = maxVotes > 0 ? (candidateVotes / maxVotes) * 100 : 0;

                                                return (
                                                    <motion.div
                                                        key={candidate?.id || `kumari-${index}`}
                                                        className="flex items-center gap-4"
                                                        initial={{opacity: 0, x: -20}}
                                                        animate={{opacity: 1, x: 0}}
                                                        transition={{delay: index * 0.1}}
                                                    >
                                                        <div
                                                            className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 border-2 border-pink-300">
                                                            {candidate?.image ? (
                                                                <img
                                                                    src={candidate.image}
                                                                    alt={candidate?.name || 'Unknown'}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        const target = e.target as HTMLImageElement;
                                                                        target.style.display = 'none';
                                                                        target.nextElementSibling?.classList.remove('hidden');
                                                                    }}
                                                                />
                                                            ) : null}
                                                            {/* Fallback avatar with rank number */}
                                                            <div
                                                                className="w-full h-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-sm">
                                                                {index + 1}
                                                            </div>
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span
                                                                    className="text-sm font-medium text-gray-900">{candidate?.name || 'Unknown'}</span>
                                                                <div className="flex items-center gap-2">
                                                                    <span
                                                                        className="text-lg font-bold text-pink-600">{candidateVotes}</span>
                                                                    <span className="text-sm text-gray-600">votes</span>
                                                                </div>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className="bg-pink-500 h-2 rounded-full transition-all duration-1000 ease-out"
                                                                    style={{
                                                                        width: `${percentage}%`,
                                                                        minWidth: percentage > 0 ? '2px' : '0px'
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <p className="text-sm">No Kumari candidates available</p>
                                            <p className="text-xs mt-1">Please register and approve candidates first</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sigithi Kumara Votes */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Users className="w-6 h-6 text-green-500"/>
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {language === 'si' ? 'Sigithi Kumara Voting Results' : 'Sigithi Kumara Voting Results'}
                                </h3>
                            </div>
                            <div className="space-y-4">
                                {sigithiKumaraCandidates && sigithiKumaraCandidates.length > 0 ? (
                                    sigithiKumaraCandidates
                                        .sort((a, b) => (b?.votecount || b?.voteCount || 0) - (a?.votecount || a?.voteCount || 0))
                                        .map((candidate, index) => {
                                            const candidateVotes = candidate?.votecount || candidate?.voteCount || 0;
                                            const maxVotes = Math.max(...sigithiKumaraCandidates.map(c => c?.votecount || c?.voteCount || 0), 1);
                                            const percentage = maxVotes > 0 ? (candidateVotes / maxVotes) * 100 : 0;

                                            return (
                                                <motion.div
                                                    key={candidate?.id || `sigithi-kumara-${index}`}
                                                    className="flex items-center gap-4"
                                                    initial={{opacity: 0, x: -20}}
                                                    animate={{opacity: 1, x: 0}}
                                                    transition={{delay: index * 0.1}}
                                                >
                                                    <div
                                                        className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 border-2 border-green-300">
                                                        {candidate?.image ? (
                                                            <img
                                                                src={candidate.image}
                                                                alt={candidate?.name || 'Unknown'}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.style.display = 'none';
                                                                    target.nextElementSibling?.classList.remove('hidden');
                                                                }}
                                                            />
                                                        ) : null}
                                                        {/* Fallback avatar with rank number */}
                                                        <div
                                                            className="w-full h-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-sm">
                                                            {index + 1}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span
                                                                className="text-sm font-medium text-gray-900">{candidate?.name || 'Unknown'}</span>
                                                            <div className="flex items-center gap-2">
                                                                <span
                                                                    className="text-lg font-bold text-green-600">{candidateVotes}</span>
                                                                <span className="text-sm text-gray-600">votes</span>
                                                            </div>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="bg-green-500 h-2 rounded-full transition-all duration-1000 ease-out"
                                                                style={{
                                                                    width: `${percentage}%`,
                                                                    minWidth: percentage > 0 ? '2px' : '0px'
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <p className="text-sm">No Sigithi Kumara candidates available</p>
                                        <p className="text-xs mt-1">Please register and approve candidates first</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sigithi Kumariya Votes */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Heart className="w-6 h-6 text-purple-500"/>
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {language === 'si' ? 'Sigithi Kumariya Voting Results' : 'Sigithi Kumariya Voting Results'}
                                </h3>
                            </div>
                            <div className="space-y-4">
                                {sigithiKumariyaCandidates && sigithiKumariyaCandidates.length > 0 ? (
                                    sigithiKumariyaCandidates
                                        .sort((a, b) => (b?.votecount || b?.voteCount || 0) - (a?.votecount || a?.voteCount || 0))
                                        .map((candidate, index) => {
                                            const candidateVotes = candidate?.votecount || candidate?.voteCount || 0;
                                            const maxVotes = Math.max(...sigithiKumariyaCandidates.map(c => c?.votecount || c?.voteCount || 0), 1);
                                            const percentage = maxVotes > 0 ? (candidateVotes / maxVotes) * 100 : 0;

                                            return (
                                                <motion.div
                                                    key={candidate?.id || `sigithi-kumariya-${index}`}
                                                    className="flex items-center gap-4"
                                                    initial={{opacity: 0, x: -20}}
                                                    animate={{opacity: 1, x: 0}}
                                                    transition={{delay: index * 0.1}}
                                                >
                                                    <div
                                                        className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 border-2 border-purple-300">
                                                        {candidate?.image ? (
                                                            <img
                                                                src={candidate.image}
                                                                alt={candidate?.name || 'Unknown'}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.style.display = 'none';
                                                                    target.nextElementSibling?.classList.remove('hidden');
                                                                }}
                                                            />
                                                        ) : null}
                                                        {/* Fallback avatar with rank number */}
                                                        <div
                                                            className="w-full h-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm">
                                                            {index + 1}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span
                                                                className="text-sm font-medium text-gray-900">{candidate?.name || 'Unknown'}</span>
                                                            <div className="flex items-center gap-2">
                                                                <span
                                                                    className="text-lg font-bold text-purple-600">{candidateVotes}</span>
                                                                <span className="text-sm text-gray-600">votes</span>
                                                            </div>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="bg-purple-500 h-2 rounded-full transition-all duration-1000 ease-out"
                                                                style={{
                                                                    width: `${percentage}%`,
                                                                    minWidth: percentage > 0 ? '2px' : '0px'
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <p className="text-sm">No Sigithi Kumariya candidates available</p>
                                        <p className="text-xs mt-1">Please register and approve candidates first</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Voting Data Tab */}
                {activeTab === 'voting-data' && (
                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        className="space-y-8"
                    >
                        {/* Summary Statistics */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Eye className="w-6 h-6 text-indigo-500"/>
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {language === 'si' ? 'Voting Data Summary' : 'Voting Data Summary'}
                                </h3>
                                <motion.button
                                    onClick={fetchVotingData}
                                    className="ml-auto p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                                    whileHover={{scale: 1.05}}
                                    whileTap={{scale: 0.95}}
                                    title={language === 'si' ? 'Refresh Data' : 'Refresh Data'}
                                >
                                    <RefreshCw className={`w-4 h-4 ${isLoadingVotingData ? 'animate-spin' : ''}`}/>
                                </motion.button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <div
                                        className="text-3xl font-bold text-indigo-600">{votingData?.summaryStats?.total_votes || 0}</div>
                                    <div
                                        className="text-sm text-gray-600">{language === 'si' ? 'Total Votes' : 'Total Votes'}</div>
                                </div>
                                <div className="text-center">
                                    <div
                                        className="text-3xl font-bold text-green-600">{votingData?.summaryStats?.unique_voters || 0}</div>
                                    <div
                                        className="text-sm text-gray-600">{language === 'si' ? 'Unique Voters' : 'Unique Voters'}</div>
                                </div>
                                <div className="text-center">
                                    <div
                                        className="text-3xl font-bold text-blue-600">{votingData?.summaryStats?.candidates_voted_for || 0}</div>
                                    <div
                                        className="text-sm text-gray-600">{language === 'si' ? 'Candidates Voted' : 'Candidates Voted'}</div>
                                </div>
                                <div className="text-center">
                                    <div
                                        className="text-3xl font-bold text-purple-600">{votingData?.summaryStats?.categories_voted || 0}</div>
                                    <div
                                        className="text-sm text-gray-600">{language === 'si' ? 'Categories Voted' : 'Categories Voted'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Voting Data Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Who Voted for Which Candidate
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Detailed voting records showing voter information and their chosen candidates
                                </p>
                            </div>

                            <div className="overflow-x-auto">
                                {isLoadingVotingData ? (
                                    <div className="flex items-center justify-center py-12">
                                        <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mr-3"/>
                                        <span className="text-gray-600">Loading voting data...</span>
                                    </div>
                                ) : votingData?.votingData?.length > 0 ? (
                                    <>
                                        {/* TABLE */}
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vote
                                                    Time
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Voter</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Voted
                                                    For
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP
                                                    Address
                                                </th>
                                            </tr>
                                            </thead>

                                            <tbody className="bg-white divide-y divide-gray-200">
                                            {paginatedVotingData.map((vote: any, index: number) => (
                                                <motion.tr
                                                    key={vote.vote_id}
                                                    className="hover:bg-gray-50"
                                                    initial={{opacity: 0}}
                                                    animate={{opacity: 1}}
                                                    transition={{delay: index * 0.05}}
                                                >
                                                    {/* TIME */}
                                                    <td className="px-6 py-4 text-gray-900">
                                                        {new Date(vote.vote_timestamp).toLocaleString()}
                                                    </td>

                                                    {/* VOTER */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center">
                                                            <div
                                                                className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-bold text-gray-700 mr-3">
                                                                {vote.voter_name?.charAt(0)?.toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div
                                                                    className="text-sm font-medium text-gray-900">{vote.voter_name}</div>
                                                                <div
                                                                    className="text-xs text-gray-500">NIC: {vote.voter_nic}</div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* CONTACT */}
                                                    <td className="px-6 py-4">
                                                        <div className="text-gray-900">{vote.voter_email}</div>
                                                        <div className="text-gray-500 text-sm">{vote.voter_phone}</div>
                                                    </td>

                                                    {/* CANDIDATE */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center">
                                                            <div
                                                                className="w-8 h-8 bg-gray-200 rounded-full mr-3 overflow-hidden">
                                                                {vote.candidate_image ? (
                                                                    <img
                                                                        src={vote.candidate_image}
                                                                        alt={vote.candidate_name}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div
                                                                        className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-700">
                                                                        {vote.candidate_name?.charAt(0)?.toUpperCase()}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div>
                                                                <div
                                                                    className="text-sm font-medium text-gray-900">{vote.candidate_name}</div>
                                                                <div
                                                                    className="text-xs text-gray-500">Age: {vote.candidate_age && vote.candidate_age > 0 ? vote.candidate_age : 'N/A'}</div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* CATEGORY */}
                                                    <td className="px-6 py-4">
                  <span className="text-sm capitalize text-gray-900">
                    {vote.candidate_category.replace('-', ' ')}
                  </span>
                                                    </td>

                                                    {/* IP */}
                                                    <td className="px-6 py-4">
                                                        <div
                                                            className="font-mono text-xs text-gray-900">{vote.ipaddress}</div>
                                                        <div
                                                            className={`inline-flex px-2 py-1 rounded-full text-xs ${
                                                                vote.verified
                                                                    ? 'bg-green-100 text-green-600'
                                                                    : 'bg-red-100 text-red-600'
                                                            }`}
                                                        >
                                                            {vote.verified ? 'Verified' : 'Unverified'}
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                            </tbody>
                                        </table>

                                        {/* PAGINATION */}
                                        {votingDataTotalPages > 1 && (
                                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                                <div
                                                    className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                                    <div className="text-sm text-gray-700 font-medium">
                                                        {language === 'si'
                                                            ? `Showing ${votingDataStartIndex + 1}-${Math.min(votingDataEndIndex, votingDataArray.length)} of ${votingDataArray.length} votes`
                                                            : `Showing ${votingDataStartIndex + 1}-${Math.min(votingDataEndIndex, votingDataArray.length)} of ${votingDataArray.length} votes`
                                                        }
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        <motion.button
                                                            onClick={() => setVotingDataCurrentPage(p => Math.max(p - 1, 1))}
                                                            disabled={votingDataCurrentPage === 1}
                                                            className="px-3 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-400 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                                                            whileHover={{scale: votingDataCurrentPage === 1 ? 1 : 1.05}}
                                                            whileTap={{scale: votingDataCurrentPage === 1 ? 1 : 0.95}}
                                                        >
                                                            {language === 'si' ? 'Previous' : 'Previous'}
                                                        </motion.button>

                                                        <div className="flex items-center gap-1">
                                                            {/* Show first page */}
                                                            {votingDataCurrentPage > 3 && (
                                                                <>
                                                                    <motion.button
                                                                        onClick={() => setVotingDataCurrentPage(1)}
                                                                        className="px-3 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-400 rounded-md hover:bg-gray-100 transition-colors shadow-sm"
                                                                        whileHover={{scale: 1.05}}
                                                                        whileTap={{scale: 0.95}}
                                                                    >
                                                                        1
                                                                    </motion.button>
                                                                    {votingDataCurrentPage > 4 && (
                                                                        <span className="px-2 text-gray-500">...</span>
                                                                    )}
                                                                </>
                                                            )}

                                                            {/* Show page numbers around current page */}
                                                            {Array.from({length: Math.min(votingDataTotalPages, 5)}, (_, i) => {
                                                                let pageNum;
                                                                if (votingDataTotalPages <= 5) {
                                                                    pageNum = i + 1;
                                                                } else if (votingDataCurrentPage <= 3) {
                                                                    pageNum = i + 1;
                                                                } else if (votingDataCurrentPage >= votingDataTotalPages - 2) {
                                                                    pageNum = votingDataTotalPages - 4 + i;
                                                                } else {
                                                                    pageNum = votingDataCurrentPage - 2 + i;
                                                                }

                                                                // Skip if this page is already shown as first page
                                                                if (votingDataCurrentPage > 3 && pageNum === 1) return null;
                                                                // Skip if this page is already shown as last page
                                                                if (votingDataCurrentPage < votingDataTotalPages - 2 && pageNum === votingDataTotalPages) return null;

                                                                return (
                                                                    <motion.button
                                                                        key={pageNum}
                                                                        onClick={() => setVotingDataCurrentPage(pageNum)}
                                                                        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors shadow-sm ${
                                                                            votingDataCurrentPage === pageNum
                                                                                ? 'bg-blue-600 text-white border-blue-600'
                                                                                : 'text-gray-800 bg-white border border-gray-400 hover:bg-gray-100'
                                                                        }`}
                                                                        whileHover={{scale: 1.05}}
                                                                        whileTap={{scale: 0.95}}
                                                                    >
                                                                        {pageNum}
                                                                    </motion.button>
                                                                );
                                                            })}

                                                            {/* Show last page */}
                                                            {votingDataCurrentPage < votingDataTotalPages - 2 && (
                                                                <>
                                                                    {votingDataCurrentPage < votingDataTotalPages - 3 && (
                                                                        <span className="px-2 text-gray-500">...</span>
                                                                    )}
                                                                    <motion.button
                                                                        onClick={() => setVotingDataCurrentPage(votingDataTotalPages)}
                                                                        className="px-3 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-400 rounded-md hover:bg-gray-100 transition-colors shadow-sm"
                                                                        whileHover={{scale: 1.05}}
                                                                        whileTap={{scale: 0.95}}
                                                                    >
                                                                        {votingDataTotalPages}
                                                                    </motion.button>
                                                                </>
                                                            )}
                                                        </div>

                                                        <motion.button
                                                            onClick={() => setVotingDataCurrentPage(p => Math.min(p + 1, votingDataTotalPages))}
                                                            disabled={votingDataCurrentPage === votingDataTotalPages}
                                                            className="px-3 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-400 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                                                            whileHover={{scale: votingDataCurrentPage === votingDataTotalPages ? 1 : 1.05}}
                                                            whileTap={{scale: votingDataCurrentPage === votingDataTotalPages ? 1 : 0.95}}
                                                        >
                                                            {language === 'si' ? 'Next' : 'Next'}
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        <Eye className="w-12 h-12 mx-auto mb-4"/>
                                        <p className="text-lg font-medium">No voting data available</p>
                                        <p className="text-sm mt-2">Voting records will appear here once votes are
                                            cast</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Chart Control Tab */}
                {activeTab === 'chart-control' && (
                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        className="space-y-8"
                    >
                        {/* Chart Visibility Controls */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Eye className="w-6 h-6 text-indigo-500"/>
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {language === 'si' ? 'Chart Visibility Control' : 'Chart Visibility Control'}
                                </h3>
                                <div className="ml-auto">
                                    {isUpdatingVisibility && (
                                        <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin"/>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Show Charts Toggle */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                            <BarChart3 className="w-5 h-5 text-indigo-600"/>
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {language === 'si' ? 'Show Charts' : 'Show Charts'}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {language === 'si' ? 'Display voting charts on main page' : 'Display voting charts on main page'}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                            visibilitySettings.showvotecharts
                                                ? 'bg-indigo-600'
                                                : 'bg-gray-200'
                                        }`}
                                        onClick={() => updateVisibilitySettings({
                                            showVoteCharts: !visibilitySettings.showvotecharts,
                                            showVoteNumbers: visibilitySettings.showvotenumbers
                                        })}
                                        disabled={isUpdatingVisibility}
                                    >
                    <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                        visibilitySettings.showvotecharts ? 'translate-x-6' : 'translate-x-1'
                    }`}/>
                                    </button>
                                </div>

                                {/* Show Vote Numbers Toggle */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                            <Vote className="w-5 h-5 text-green-600"/>
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {language === 'si' ? 'Show Vote Numbers' : 'Show Vote Numbers'}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {language === 'si' ? 'Display actual vote counts' : 'Display actual vote counts'}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                            visibilitySettings.showvotenumbers
                                                ? 'bg-green-600'
                                                : 'bg-gray-200'
                                        }`}
                                        onClick={() => updateVisibilitySettings({
                                            showVoteCharts: visibilitySettings.showvotecharts,
                                            showVoteNumbers: !visibilitySettings.showvotenumbers
                                        })}
                                        disabled={isUpdatingVisibility}
                                    >
                    <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                        visibilitySettings.showvotenumbers ? 'translate-x-6' : 'translate-x-1'
                    }`}/>
                                    </button>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                <button
                                    onClick={() => updateVisibilitySettings({
                                        showVoteCharts: true,
                                        showVoteNumbers: true
                                    })}
                                    disabled={isUpdatingVisibility}
                                    className="flex items-center justify-center gap-2 p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Eye className="w-5 h-5"/>
                                    <span className="font-medium">
                    {language === 'si' ? 'Activate All' : 'Activate All'}
                  </span>
                                </button>
                                <button
                                    onClick={() => updateVisibilitySettings({
                                        showVoteCharts: false,
                                        showVoteNumbers: false
                                    })}
                                    disabled={isUpdatingVisibility}
                                    className="flex items-center justify-center gap-2 p-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Eye className="w-5 h-5"/>
                                    <span className="font-medium">
                    {language === 'si' ? 'Deactivate All' : 'Deactivate All'}
                  </span>
                                </button>
                            </div>

                            {/* Status Display */}
                            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-medium text-blue-800">
                                        {language === 'si' ? 'Current Status' : 'Current Status'}
                                    </div>
                                    <div className="text-sm text-blue-600">
                                        {visibilitySettings.showvotecharts && visibilitySettings.showvotenumbers ? (
                                            <span className="text-green-600">
                        {language === 'si' ? 'All Features Active' : 'All Features Active'}
                      </span>
                                        ) : visibilitySettings.showvotecharts ? (
                                            <span className="text-yellow-600">
                        {language === 'si' ? 'Charts Only' : 'Charts Only'}
                      </span>
                                        ) : (
                                            <span className="text-red-600">
                        {language === 'si' ? 'All Hidden' : 'All Hidden'}
                      </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Candidate Details Modal */}
            {selectedCandidate && (
                <motion.div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 z-50"
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    onClick={() => setSelectedCandidate(null)}
                >
                    <motion.div
                        className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        initial={{scale: 0.9, opacity: 0}}
                        animate={{scale: 1, opacity: 1}}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-800">
                                {language === 'si' ? 'Candidate Details' : 'Candidate Details'}
                            </h3>
                            <button
                                className="text-gray-400 hover:text-gray-600"
                                onClick={() => setSelectedCandidate(null)}
                            >
                                <XCircle className="w-6 h-6"/>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <img
                                    src={selectedCandidate.image}
                                    alt={selectedCandidate.name}
                                    className="w-full h-48 object-cover rounded-xl"
                                />
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        {language === 'si' ? 'Name' : 'Name'}
                                    </label>
                                    <p className="text-gray-900">{selectedCandidate.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        {language === 'si' ? 'Category' : 'Category'}
                                    </label>
                                    <p className="text-gray-900 capitalize">{selectedCandidate.category}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        {language === 'si' ? 'Age' : 'Age'}
                                    </label>
                                    <p className="text-gray-900">{selectedCandidate.age}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        {language === 'si' ? 'Email' : 'Email'}
                                    </label>
                                    <p className="text-gray-900">{selectedCandidate.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        {language === 'si' ? 'Phone' : 'Phone'}
                                    </label>
                                    <p className="text-gray-900">{selectedCandidate.phone}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="text-sm font-medium text-gray-500">
                                {language === 'si' ? 'Description' : 'Description'}
                            </label>
                            <p className="text-gray-900 mt-1">{selectedCandidate.description}</p>
                        </div>

                        <div className="mt-6">
                            <label className="text-sm font-medium text-gray-500">
                                {language === 'si' ? 'Address' : 'Address'}
                            </label>
                            <p className="text-gray-900 mt-1">{selectedCandidate.address}</p>
                        </div>

                        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500">
                  {language === 'si' ? 'Status' : 'Status'}
                </span>
                                <div
                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedCandidate.status)}`}>
                                    {getStatusIcon(selectedCandidate.status)}
                                    {selectedCandidate.status}
                                </div>
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                                {language === 'si' ? 'Votes' : 'Votes'}: {selectedCandidate.voteCount}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}
