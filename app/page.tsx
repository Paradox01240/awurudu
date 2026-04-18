'use client';

import React from 'react';
import Image from 'next/image';
import {motion} from 'framer-motion';
import {
    ChevronRight,
    MapPin,
    Calendar,
    Users,
    Star,
    Heart,
    Trophy,
    Sparkles,
    Clock,
    Music,
    Gamepad2,
    Mic,
    Flame,
    Phone,
    MessageSquare
} from 'lucide-react';
import {useLanguage} from './contexts/LanguageContext';
import LanguageSwitcher from './components/LanguageSwitcher';
import ErabaduFlower from './components/ErabaduFlower';
import FestiveScroll from './components/FestiveScroll';
import ScrollToTop from './components/ScrollToTop';
import VotingStatistics from './components/VotingStatistics';

const LandingPage = () => {
    const {t, language} = useLanguage();
    const [formData, setFormData] = React.useState({
        name: '',
        phone: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    // Generate random values once to maintain purity
    const flowerAnimations = React.useMemo(() => {
        const seed = 12345; // Use a stable seed
        return Array.from({length: 12}, (_, i) => {
            // Simple pseudo-random generator based on seed and index
            const random = (index: number) => {
                const x = Math.sin(seed + index) * 10000;
                return x - Math.floor(x);
            };

            const randIndex = i * 3; // Use different offsets for different random values
            return {
                id: `flower-${i}`,
                left: `${5 + (i * 8)}%`,
                top: `-50px`,
                xMove: random(randIndex) * 50 - 25,
                rotation: random(randIndex + 1) * 360,
                duration: 8 + random(randIndex + 2) * 6,
                delay: i * 0.8
            };
        });
    }, []);

    const bgAnimations = React.useMemo(() => {
        const seed = 12346; // Different seed to vary from flower animations
        return Array.from({length: 6}, (_, i) => {
            // Simple pseudo-random generator based on seed and index
            const random = (index: number) => {
                const x = Math.sin(seed + index) * 10000;
                return x - Math.floor(x);
            };

            const randIndex = i * 4; // Use different offsets for different random values
            return {
                id: `bg-${i}`,
                xMove: random(randIndex) * 200 - 100,
                yMove: random(randIndex + 1) * 200 - 100,
                duration: 10 + i * 2,
                left: `${random(randIndex + 2) * 100}%`,
                top: `${random(randIndex + 3) * 100}%`
            };
        });
    }, []);

    const floatingFlames = React.useMemo(() => {
        const seed = 12347; // Different seed
        const random = (index: number) => {
            const x = Math.sin(seed + index) * 10000;
            return x - Math.floor(x);
        };

        return Array.from({length: 6}, (_, i) => ({
            id: `flame-${i}`,
            left: `${10 + (i * 15)}%`,
            top: `${random(i) * 100}%`,
            duration: 3 + i * 0.5,
        }));
    }, []);

    const sparklingStars = React.useMemo(() => {
        const seed = 12348; // Different seed
        const random = (index: number) => {
            const x = Math.sin(seed + index) * 10000;
            return x - Math.floor(x);
        };

        return Array.from({length: 10}, (_, i) => ({
            id: `star-${i}`,
            left: `${random(i) * 100}%`,
            top: `${random(i + 10) * 100}%`,
            duration: 2 + random(i + 20) * 2,
            delay: random(i + 30) * 2,
        }));
    }, []);

    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate form submission
        setTimeout(() => {
            setFormData({name: '', phone: '', message: ''});
            setIsSubmitting(false);
            alert(language === 'si' ? 'ඔබේ පණිවිඩය සාර්ථකව යවන ලදී!' : 'Your message has been successfully sent!');
        }, 1000);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div
            className="min-h-screen bg-gradient-to-b from-red-50 via-orange-50 to-yellow-50 text-gray-800 overflow-hidden relative">
            <LanguageSwitcher/>

            {/* Animated background elements */}
            <div className="fixed inset-0 pointer-events-none">
                {/* Erabadu Tree Branches */}
                <div className="absolute top-5 right-10 lg:right-5 opacity-30">
                    <motion.div
                        animate={{
                            rotate: [-5, 5, -5],
                            scale: [1, 1.05, 1]
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <Image
                            src="/images/erabadu2.png"
                            alt="Erabadu Tree Branch 1"
                            width={150}
                            height={120}
                            className="object-contain"
                        />
                    </motion.div>
                </div>
                <div className="absolute top-20 right-0 lg:left-5 opacity-30">
                    <motion.div
                        animate={{
                            rotate: [5, -5, 5],
                            scale: [1, 1.08, 1]
                        }}
                        transition={{
                            duration: 5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <Image
                            src="/images/erabadu2.png"
                            alt="Erabadu Tree Branch 2"
                            width={180}
                            height={140}
                            className="object-contain"
                        />
                    </motion.div>
                </div>
                <div className="absolute bottom-40 right-0 lg:right-10 opacity-25">
                    <motion.div
                        animate={{
                            y: [0, -10, 0],
                            opacity: [0.3, 0.5, 0.3]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <Image
                            src="/images/erabadu2.png"
                            alt="Erabadu Tree Branch 3"
                            width={120}
                            height={100}
                            className="object-contain"
                        />
                    </motion.div>
                </div>
                <div className="absolute bottom-60 right-0 lg:left-10 opacity-25">
                    <motion.div
                        animate={{
                            rotate: [-3, 3, -3],
                            scale: [1, 1.06, 1]
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <Image
                            src="/images/erabadu2.png"
                            alt="Erabadu Tree Branch 4"
                            width={140}
                            height={110}
                            className="object-contain"
                        />
                    </motion.div>
                </div>

                {/* Floating Erabadu Flowers - Rain Effect */}
                {flowerAnimations.map((anim) => (
                    <motion.div
                        key={anim.id}
                        className="absolute"
                        style={{
                            left: anim.left,
                            top: anim.top,
                        }}
                        animate={{
                            y: [0, 1000],
                            x: [0, anim.xMove],
                            rotate: [0, anim.rotation],
                            opacity: [1, 0.8, 1, 0],
                        }}
                        transition={{
                            duration: anim.duration,
                            repeat: Infinity,
                            ease: "linear",
                            delay: anim.delay
                        }}
                    >
                        <ErabaduFlower size="small" animated={false}/>
                    </motion.div>
                ))}

                {/* Original animated elements */}
                {bgAnimations.map((anim) => (
                    <motion.div
                        key={anim.id}
                        className="absolute w-32 h-32 rounded-full bg-gradient-to-r from-red-200 via-orange-200 to-yellow-200 opacity-30"
                        animate={{
                            x: [0, anim.xMove],
                            y: [0, anim.yMove],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: anim.duration,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut"
                        }}
                        style={{
                            left: anim.left,
                            top: anim.top,
                        }}
                    />
                ))}
            </div>

            {/* Hero Section */}
            <section
                className="relative h-screen flex flex-col lg:flex-row items-center justify-center overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/images/reload.png"
                        alt="Beach Sunset"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div
                        className="absolute inset-0 bg-linear-to-b from-orange-100/100 via-amber-50/80 to-amber-50/100"></div>
                </div>

                {/* Mobile: Sun + Logo at Top */}
                <div
                    className="lg:hidden relative z-10 w-full flex flex-col items-center justify-center pt-8 pb-4 -mt-12">
                    {/* Sun Illustration */}
                    <div className="relative mb-6">
                        <motion.div
                            className="relative"
                            animate={{
                                rotate: [0, 360],
                                scale: [1, 1.1, 1]
                            }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                        >
                            <Image
                                src="/images/2.png"
                                alt="Decorative Sun Illustration"
                                width={280}
                                height={280}
                                className="object-contain opacity-80"
                                style={{
                                    filter: 'blur(1px) drop-shadow(0 0 30px rgba(255, 204, 0, 0.5))'
                                }}
                            />
                        </motion.div>

                        {/* Logo in Front of Sun */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-28">
                            <Image
                                src="/images/logo.png"
                                alt="Smart Awurudu Logo"
                                fill
                                className="object-contain filter drop-shadow-lg opacity-90"
                                style={{filter: 'drop-shadow(0 0 20px rgba(251, 146, 60, 0.4))'}}
                            />
                        </div>
                    </div>
                </div>

                {/* Desktop: Logo on Left */}
                <div className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                    <div className="relative w-80 h-80">
                        <Image
                            src="/images/logo.png"
                            alt="Smart Awurudu Logo"
                            fill
                            className="object-contain filter drop-shadow-lg opacity-70"
                            style={{filter: 'drop-shadow(0 0 20px rgba(251, 146, 60, 0.4))'}}
                        />
                    </div>
                </div>

                {/* Desktop: Sun Background */}
                <div className="hidden lg:block absolute -left-8 top-1/2 -translate-y-1/2 z-5 pointer-events-none">
                    <motion.div
                        className="relative"
                        animate={{
                            rotate: [0, 360],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    >
                        <Image
                            src="/images/2.png"
                            alt="Decorative Sun Illustration"
                            width={600}
                            height={600}
                            className="object-contain opacity-80"
                            style={{
                                filter: 'blur(1px) drop-shadow(0 0 30px rgba(255, 204, 0, 0.5))'
                            }}
                        />
                    </motion.div>
                </div>

                {/* Decorative Erabadu Branch */}
                <div className="absolute bottom-0 -right-8 lg:bottom-0 lg:-right-8 z-25 pointer-events-none">
                    <motion.div
                        className="relative w-80 h-40 lg:w-[750px] lg:h-[420px]"
                        animate={{
                            y: [0, -10, 0],
                            rotate: [-2, 2, -2]
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <Image
                            src="/images/erabadu1.png"
                            alt="Decorative Erabadu Branch"
                            fill
                            className="object-contain drop-shadow-lg opacity-80"
                            style={{
                                filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))'
                            }}
                        />
                    </motion.div>
                </div>

                {/* Main Content */}
                <motion.div
                    className="relative z-20 text-center px-4 max-w-6xl mx-auto lg:absolute lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 mt-0 lg:mt-0 order-3 lg:order-none -mt-48 lg:-mt-0"
                    initial={{opacity: 0, y: 50}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 1}}
                >
                    <motion.h1
                        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-4 sm:mb-6 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent"
                        initial={{opacity: 0, scale: 0.9}}
                        animate={{opacity: 1, scale: 1}}
                        transition={{duration: 1.2, delay: 0.3}}
                    >
                        <div className="flex flex-col items-center gap-2 sm:gap-4">
              <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-orange-600">
                {t('smart.youth')}
              </span>
                        </div>
                        <motion.span
                            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl"
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            transition={{delay: 0.8}}
                        >
                            {language === 'si' ? 'වසන්ත උදානය 2026' : t('vasanth.udanaya')}
                        </motion.span>
                    </motion.h1>

                    {/* Frosted Glass Card */}
                    <motion.div
                        className="backdrop-blur-md bg-white/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 sm:max-w-lg lg:max-w-2xl mx-auto border border-white/50 shadow-2xl"
                        initial={{opacity: 0, y: 30}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 1, delay: 0.6}}
                    >
                        <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4 text-orange-700">
                            <motion.div
                                animate={{rotate: 360}}
                                transition={{duration: 2, repeat: Infinity, ease: "linear"}}
                            >
                                <Calendar className="w-4 h-4 sm:w-5 sm:h-5"/>
                            </motion.div>
                            <span className="text-sm sm:text-lg font-semibold">{t('april.18.2026')}</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6 text-blue-700">
                            <motion.div
                                animate={{y: [0, -5, 0]}}
                                transition={{duration: 1, repeat: Infinity}}
                            >
                                <MapPin className="w-4 h-4 sm:w-5 sm:h-5"/>
                            </motion.div>
                            <span className="text-sm sm:text-lg font-semibold">{t('panadura.beach')}</span>
                        </div>
                        <motion.button
                            className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 hover:from-red-700 hover:via-orange-700 hover:to-yellow-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-full text-sm sm:text-lg shadow-lg hover:shadow-red-500/50 transform hover:scale-105 transition-all duration-300 relative overflow-hidden"
                            whileHover={{scale: 1.05}}
                            whileTap={{scale: 0.95}}
                            onClick={() => window.location.href = '/vote'}
                        >
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-red-700 via-orange-700 to-yellow-700"
                                initial={{x: "-100%"}}
                                whileHover={{x: "0%"}}
                                transition={{duration: 0.3}}
                            />
                            <span className="relative flex items-center">
                {t('vote.for.kumara')}
                                <ChevronRight className="inline-block ml-2 w-5 h-5"/>
              </span>
                        </motion.button>
                    </motion.div>
                </motion.div>
            </section>

            {/* Organizers Strip */}
            <section className="py-16 px-4 bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50">
                <motion.div
                    className="max-w-7xl mx-auto"
                    initial={{opacity: 0}}
                    whileInView={{opacity: 1}}
                    transition={{duration: 0.8}}
                >
                    <h2 className="text-3xl font-bold text-center mb-12 text-red-700">{t('organized.by')}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            {name: 'DFYC Panadura', img: '/images/11.png'},
                            {name: 'Narampitiya Sadnada Youth', img: '/images/12.png'},
                            {name: 'Dibbedda Hiru Kirana and Sada Kirana', img: '/images/Dibbessa.png'},
                            {name: 'Pinwatta Youn Sawiya', img: '/images/14.png'}
                        ].map((org, index) => (
                            <motion.div
                                key={index}
                                className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:border-red-500 transition-all duration-300"
                                whileHover={{scale: 1.05}}
                                initial={{opacity: 0, y: 30}}
                                whileInView={{opacity: 1, y: 0}}
                                transition={{delay: index * 0.1}}
                            >
                                <div className="relative w-full aspect-square mb-4 rounded-xl overflow-hidden">
                                    <Image
                                        src={org.img}
                                        alt={org.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <p className="text-center text-sm font-medium text-gray-600">{org.name}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* Festive Scroll Section */}
            <FestiveScroll/>

            {/* Voting Statistics Section */}
            <VotingStatistics language={language}/>

            {/* Visual Event Agenda */}
            <section className="py-20 px-4 bg-gradient-to-b from-yellow-50 via-orange-50 to-red-50">
                <motion.div
                    className="max-w-7xl mx-auto"
                    initial={{opacity: 0}}
                    whileInView={{opacity: 1}}
                    transition={{duration: 0.8}}
                >
                    <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
                        {t('festival.events')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {name: t('tug.of.war'), time: '9:00 AM', img: '/images/event-1.webp', icon: Users},
                            {name: t('kotta.pora'), time: '10:30 AM', img: '/images/event-7.jpg', icon: Gamepad2},
                            {name: t('blind.pot.breaking'), time: '2:00 PM', img: '/images/event-12.jpg', icon: Trophy},
                            {name: t('traditional.games'), time: '3:30 PM', img: '/images/event-9.jpg', icon: Gamepad2},
                            {
                                name: t('cultural.performances'),
                                time: '5:00 PM',
                                img: '/images/event-10.jpeg',
                                icon: Mic
                            },
                            {name: t('musical.evening'), time: '7:00 PM', img: '/images/event-11.jpeg', icon: Music}
                        ].map((event, index) => (
                            <motion.div
                                key={index}
                                className="relative group cursor-pointer rounded-2xl overflow-hidden shadow-2xl"
                                whileHover={{scale: 1.03}}
                                initial={{opacity: 0, y: 50}}
                                whileInView={{opacity: 1, y: 0}}
                                transition={{delay: index * 0.1}}
                            >
                                <div className="relative h-64">
                                    <Image
                                        src={event.img}
                                        alt={event.name}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div
                                        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                    <div className="absolute bottom-0 left-0 right-0 p-6">
                                        <h3 className="text-2xl font-bold text-white">{event.name}</h3>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* Sponsor Showcase */}
            <section className="py-20 px-4 bg-gradient-to-b from-amber-50 to-white">
                <motion.div
                    className="max-w-7xl mx-auto"
                    initial={{opacity: 0}}
                    whileInView={{opacity: 1}}
                    transition={{duration: 0.8}}
                >
                    <h2 className="text-4xl font-bold text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-500">
                        {t('powered.by')}
                    </h2>

                    {/* Diamond Sponsor */}
                    <motion.div
                        className="mb-16"
                        initial={{opacity: 0, scale: 0.9}}
                        whileInView={{opacity: 1, scale: 1}}
                        transition={{duration: 0.8}}
                    >
                        <div className="text-center mb-6">
                            <div
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-full">
                                <Star className="w-5 h-5"/>
                                <span className="font-bold">{t('diamond.sponsor')}</span>
                            </div>
                        </div>
                        <motion.div
                            className="relative bg-gradient-to-r from-gray-100 to-white rounded-3xl p-8 border-2 border-orange-500 shadow-2xl max-w-md mx-auto"
                            whileHover={{boxShadow: "0 0 30px rgba(251, 146, 60, 0.5)"}}
                        >
                            <div className="text-center">
                                <div className="w-full mb-6 flex items-center justify-center">
                                    <img
                                        src="/images/di.jpeg"
                                        alt="Diamond Sponsor Logo"
                                        className="w-full h-auto object-contain"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Ruby Sponsors */}
                    <div className="mb-16">
                        <div className="text-center mb-8">
                            <div
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-2 rounded-full">
                                <Heart className="w-5 h-5"/>
                                <span className="font-bold">{t('ruby.sponsors')}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <motion.div
                                className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 hover:border-red-500 transition-all duration-300"
                                whileHover={{scale: 1.05}}
                                initial={{opacity: 0, y: 30}}
                                whileInView={{opacity: 1, y: 0}}
                                transition={{delay: 0.2}}
                            >
                                <div
                                    className="w-[60%] h-[2px] bg-gradient-to-r from-transparent via-[#8c6a25] to-transparent mx-5 my-10"></div>
                                <div className="text-center mb-8">
                                    <div className="flex justify-center items-center gap-8 mb-6">
                                        <div className="text-center">
                                            <img
                                                src="/images/blackhole.jpeg"
                                                alt="Blackhole Ruby Sponsor"
                                                className="w-32 h-32 object-contain rounded-lg shadow-lg hover:scale-105 transition-transform duration-300"
                                            />
                                            <p className="text-[1.1rem] text-[#8c6a25] mt-3 font-bold">Blackhole</p>
                                        </div>
                                    </div>
                                    <p className="text-[0.9rem] text-gray-700 max-w-md mx-auto">
                                        {language === 'si'
                                            ? 'අපගේ  ස්තූතිය සහ සහාය ගැන Blackhole සමාගම ස්තූතිය සපයනු ලැබු.'
                                            : 'Special thanks to our Ruby Sponsor Blackhole for their generous support in making this celebration possible.'}
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Golden Sponsors */}
                    <div className="mb-16">
                        <div className="text-center mb-8">
                            <div
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-2 rounded-full">
                                <Star className="w-5 h-5"/>
                                <span className="font-bold">{t('golden.sponsor')}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Multilac Sponsor */}
                            <motion.div
                                className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:border-yellow-500 transition-all duration-300"
                                whileHover={{scale: 1.05}}
                                initial={{opacity: 0, y: 30}}
                                whileInView={{opacity: 1, y: 0}}
                                transition={{delay: 0.1}}
                            >
                                <div className="text-center">
                                    <div className="w-full h-24 mb-4 flex items-center justify-center">
                                        <img
                                            src="/images/multilac.png"
                                            alt="Multilac Golden Sponsor"
                                            className="h-full w-auto object-contain"
                                        />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-2">Multilac</h3>
                                    <p className="text-gray-600 text-sm">Golden Sponsor</p>
                                </div>
                            </motion.div>

                            {/* Esoft Ruby Sponsor */}
                            <motion.div
                                className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:border-red-500 transition-all duration-300"
                                whileHover={{scale: 1.05}}
                                initial={{opacity: 0, y: 30}}
                                whileInView={{opacity: 1, y: 0}}
                                transition={{delay: 0.2}}
                            >
                                <div className="text-center">
                                    <div className="w-full h-24 mb-4 flex items-center justify-center">
                                        <img
                                            src="/images/Esoft.PNG"
                                            alt="Esoft Ruby Sponsor"
                                            className="h-full w-auto object-contain"
                                        />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-2">Esoft</h3>
                                    <p className="text-gray-600 text-sm">Ruby Sponsor</p>
                                </div>
                            </motion.div>

                            {/* Additional Golden Sponsor Slots */}
                            {[2, 3].map((item) => (
                                <motion.div
                                    key={item}
                                    className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:border-yellow-500 transition-all duration-300"
                                    whileHover={{scale: 1.05}}
                                    initial={{opacity: 0, y: 30}}
                                    whileInView={{opacity: 1, y: 0}}
                                    transition={{delay: item * 0.1}}
                                >
                                    <div className="text-center">
                                        <div
                                            className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                            <Star className="w-8 h-8 text-white"/>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-2">{t('supporting.partners')} {item}</h3>
                                        <p className="text-gray-600 text-sm">Valued Support</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Silver Sponsors */}
                    <div className="mb-16">
                        <div className="text-center mb-8">
                            <div
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-400 to-gray-600 text-white px-6 py-2 rounded-full">
                                <Star className="w-5 h-5"/>
                                <span className="font-bold">{t('silver.sponsors')}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map((item) => (
                                <motion.div
                                    key={item}
                                    className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:border-gray-500 transition-all duration-300"
                                    whileHover={{scale: 1.05}}
                                    initial={{opacity: 0, y: 30}}
                                    whileInView={{opacity: 1, y: 0}}
                                    transition={{delay: item * 0.1}}
                                >
                                    <div className="text-center">
                                        <div
                                            className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                                            <Star className="w-8 h-8 text-white"/>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-2">Silver Sponsor {item}</h3>
                                        <p className="text-gray-600 text-sm">Valued Partner</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* New Year Prince & Princess Sponsors */}
                    <div className="mb-16">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* New Year Prince Sponsor */}
                            <motion.div
                                initial={{opacity: 0, x: -50}}
                                whileInView={{opacity: 1, x: 0}}
                                transition={{duration: 0.8}}
                            >
                                <div className="text-center mb-6">
                                    <div
                                        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full">
                                        <Star className="w-5 h-5"/>
                                        <span className="font-bold">{t('new.year.prince.sponsor')}</span>
                                    </div>
                                </div>
                                <motion.div
                                    className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 hover:border-blue-500 transition-all duration-300"
                                    whileHover={{scale: 1.05}}
                                >
                                    <div className="text-center">
                                        <div
                                            className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                                            <Star className="w-10 h-10 text-white"/>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">Prince Sponsor</h3>
                                        <p className="text-gray-600">Exclusive Partner</p>
                                    </div>
                                </motion.div>
                            </motion.div>

                            {/* New Year Princess Sponsor */}
                            <motion.div
                                initial={{opacity: 0, y: 50}}
                                whileInView={{opacity: 1, y: 0}}
                                transition={{duration: 0.8}}
                            >
                                <div className="text-center mb-6">
                                    <div
                                        className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-full">
                                        <Star className="w-5 h-5"/>
                                        <span className="font-bold">{t('new.year.princess.sponsor')}</span>
                                    </div>
                                </div>
                                <motion.div
                                    className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 hover:border-pink-500 transition-all duration-300"
                                    whileHover={{scale: 1.05}}
                                >
                                    <div className="text-center">
                                        <div
                                            className="w-56 h-56 mx-auto mb-6 flex items-center justify-center bg-white rounded-lg p-4 shadow-md">
                                            <img
                                                src="/images/saumya.jpeg"
                                                alt="New Year Princess Sponsor Logo"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">Saumya Saloon</h3>
                                        <p className="text-gray-600">{language === 'si' ? 'New Year Princess Sponsor' : 'New Year Princess Sponsor'}</p>
                                    </div>
                                </motion.div>
                            </motion.div>

                            {/* New Year Sigithi Kumara & Kumariya Sponsor */}
                            <motion.div
                                initial={{opacity: 0, x: 50}}
                                whileInView={{opacity: 1, x: 0}}
                                transition={{duration: 0.8}}
                            >
                                <div className="text-center mb-6">
                                    <div
                                        className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-purple-600 text-white px-6 py-2 rounded-full">
                                        <Star className="w-5 h-5"/>
                                        <span
                                            className="font-bold">{language === 'si' ? 'Sigithi Kumara & Kumariya Sponsor' : 'Sigithi Kumara & Kumariya Sponsor'}</span>
                                    </div>
                                </div>
                                <motion.div
                                    className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 hover:border-green-500 transition-all duration-300"
                                    whileHover={{scale: 1.05}}
                                >
                                    <div className="text-center">
                                        <div
                                            className="w-56 h-56 mx-auto mb-6 flex items-center justify-center bg-white rounded-lg p-4 shadow-md">
                                            <img
                                                src="/images/moxy.png"
                                                alt="Sigithi Kumara & Kumariya Sponsor Logo"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">Moxy</h3>
                                        <p className="text-gray-600">{language === 'si' ? 'Sigithi Awurudu Sponsor' : 'Sigithi Awurudu Sponsor'}</p>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>

                </motion.div>
            </section>

            {/* Technology Partner Section */}
            <section className="py-12 px-4 bg-gradient-to-b from-amber-50 to-white">
                <motion.div
                    className="max-w-4xl mx-auto text-center"
                    initial={{opacity: 0, y: 30}}
                    whileInView={{opacity: 1, y: 0}}
                    transition={{duration: 0.8}}
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
                        {language === 'si' ? 'අපගේ තාක්ෂණ හවුල්කරු' : 'Our Technology Partner'}
                    </h2>

                    <a href="https://astrea.lk" target="_blank" rel="noopener noreferrer" className="block">
                        <motion.div
                            className="relative bg-gradient-to-r from-gray-100 to-white rounded-3xl p-12 border-2 border-orange-500 shadow-2xl cursor-pointer"
                            whileHover={{boxShadow: "0 0 30px rgba(251, 146, 60, 0.5)"}}
                            transition={{duration: 0.3}}
                        >
                            <div className="text-center">
                                <div className="relative w-full h-48 mx-auto mb-6 rounded-xl overflow-hidden">
                                    <Image
                                        src="/images/full_logo_bgrw.png"
                                        alt="ASTREA SOLUTIONS"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                    ASTREA SOLUTIONS (PVT) LTD
                                </h3>
                                <p className="text-gray-600">Innovative Technology Solutions</p>
                            </div>
                        </motion.div>
                    </a>
                </motion.div>
            </section>

            {/* Kumara & Kumari Pageant 2026 */}
            <section className="py-20 px-4 bg-gradient-to-b from-white to-amber-50 relative">
                <motion.div
                    className="max-w-7xl mx-auto"
                    initial={{opacity: 0}}
                    whileInView={{opacity: 1}}
                    transition={{duration: 0.8}}
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-600">
                        {language === 'si' ? 'Kumara & Kumari Pageant 2026' : 'Kumara & Kumari Pageant 2026'}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Kumara */}
                        <motion.div
                            className="relative group"
                            whileHover={{scale: 1.02}}
                            initial={{opacity: 0, x: -50}}
                            whileInView={{opacity: 1, x: 0}}
                        >
                            <div
                                className="relative h-96 rounded-3xl overflow-hidden shadow-2xl border-2 border-blue-500/30">
                                <Image
                                    src="/images/kumara.jpg"
                                    alt="Kumara Contestant"
                                    fill
                                    className="object-cover object-top"
                                />
                                <div
                                    className="absolute inset-0 bg-gradient-to-t from-blue-100/80 via-blue-100/20 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 right-0 p-8">
                                    <h3 className="text-3xl font-bold text-gray-800 mb-2">{t('kumara.2026')}</h3>
                                    <p className="text-blue-800">{t('rising.star')}</p>
                                </div>
                            </div>
                            {/* Vote Button */}
                            <motion.button
                                onClick={() => window.location.href = '/vote'}
                                className="w-full mt-4 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 hover:from-red-700 hover:via-orange-700 hover:to-yellow-700 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-red-500/50 transform hover:scale-105 transition-all duration-300"
                                whileHover={{scale: 1.05}}
                                whileTap={{scale: 0.95}}
                            >
                <span className="flex items-center justify-center">
                  Vote
                  <ChevronRight className="inline-block ml-2 w-4 h-4"/>
                </span>
                            </motion.button>

                            {/* Register Button */}
                            <motion.button
                                onClick={() => window.location.href = '/register'}
                                className="w-full mt-4 bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 hover:from-green-700 hover:via-teal-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-green-500/50 transform hover:scale-105 transition-all duration-300"
                                whileHover={{scale: 1.05}}
                                whileTap={{scale: 0.95}}
                            >
                <span className="flex items-center justify-center">
                  Register to Contest
                  <ChevronRight className="inline-block ml-2 w-4 h-4"/>
                </span>
                            </motion.button>
                        </motion.div>

                        {/* Kumari */}
                        <motion.div
                            className="relative group"
                            whileHover={{scale: 1.02}}
                            initial={{opacity: 0, x: 50}}
                            whileInView={{opacity: 1, x: 0}}
                        >
                            <div
                                className="relative h-96 rounded-3xl overflow-hidden shadow-2xl border-2 border-pink-500/30">
                                <Image
                                    src="/images/kumari.jpg"
                                    alt="Kumari Contestant"
                                    fill
                                    className="object-cover"
                                />
                                <div
                                    className="absolute inset-0 bg-gradient-to-t from-pink-100/80 via-pink-100/20 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 right-0 p-8">
                                    <h3 className="text-3xl font-bold text-gray-800 mb-2">{t('kumari.2026')}</h3>
                                    <p className="text-pink-800">{t('beauty.tradition')}</p>
                                </div>
                            </div>
                            {/* Vote Button */}
                            <motion.button
                                onClick={() => window.location.href = '/vote'}
                                className="w-full mt-6 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 hover:from-red-700 hover:via-orange-700 hover:to-yellow-700 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-red-500/50 transform hover:scale-105 transition-all duration-300"
                                whileHover={{scale: 1.05}}
                                whileTap={{scale: 0.95}}
                            >
                <span className="flex items-center justify-center">
                  Vote
                  <ChevronRight className="inline-block ml-2 w-4 h-4"/>
                </span>
                            </motion.button>

                            {/* Register Button */}
                            <motion.button
                                onClick={() => window.location.href = '/register'}
                                className="w-full mt-4 bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 hover:from-green-700 hover:via-teal-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-green-500/50 transform hover:scale-105 transition-all duration-300"
                                whileHover={{scale: 1.05}}
                                whileTap={{scale: 0.95}}
                            >
                <span className="flex items-center justify-center">
                  Register to Contest
                  <ChevronRight className="inline-block ml-2 w-4 h-4"/>
                </span>
                            </motion.button>
                        </motion.div>
                    </div>
                </motion.div>
            </section>

            {/* Sigithi Awurudu Section */}
            <section className="py-20 px-4 bg-gradient-to-b from-amber-50 to-green-50 relative">
                <motion.div
                    className="max-w-7xl mx-auto"
                    initial={{opacity: 0}}
                    whileInView={{opacity: 1}}
                    transition={{duration: 0.8}}
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-purple-500 to-green-600">
                        {language === 'si' ? 'Sigithi Awurudu' : 'Sigithi Awurudu'}
                    </h2>

                    <div className="text-center mb-12">
                        <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                            {language === 'si'
                                ? 'Our little stars shine bright! Sigithi Awurudu Kumara and Kumariya competitions showcase the amazing talents of our young participants.'
                                : 'Our little stars shine bright! Sigithi Awurudu Kumara and Kumariya competitions showcase the amazing talents of our young participants.'
                            }
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Sigithi Kumara */}
                        <motion.div
                            className="relative group"
                            whileHover={{scale: 1.02}}
                            initial={{opacity: 0, x: -50}}
                            whileInView={{opacity: 1, x: 0}}
                        >
                            <div
                                className="relative h-80 rounded-3xl overflow-hidden shadow-2xl border-2 border-green-500/30">
                                <Image
                                    src="/images/sigithi-awurudu-kumara.jpg"
                                    alt="Sigithi Awurudu Kumara"
                                    fill
                                    className="object-cover"
                                />
                                <div
                                    className="absolute inset-0 bg-gradient-to-t from-green-100/80 via-green-100/20 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 right-0 p-8">
                                    <h3 className="text-3xl font-bold text-gray-800 mb-2">
                                        {language === 'si' ? 'Sigithi Awurudu Kumara' : 'Sigithi Awurudu Kumara'}
                                    </h3>
                                    <p className="text-green-800">{language === 'si' ? 'Little Prince' : 'Little Prince'}</p>
                                </div>
                            </div>
                            {/* Vote Button */}
                            <motion.button
                                onClick={() => window.location.href = '/vote'}
                                className="w-full mt-4 bg-gradient-to-r from-green-600 via-teal-600 to-green-700 hover:from-green-700 hover:via-teal-700 hover:to-green-800 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-green-500/50 transform hover:scale-105 transition-all duration-300"
                                whileHover={{scale: 1.05}}
                                whileTap={{scale: 0.95}}
                            >
                <span className="flex items-center justify-center">
                  {language === 'si' ? 'Vote' : 'Vote'}
                    <ChevronRight className="inline-block ml-2 w-4 h-4"/>
                </span>
                            </motion.button>

                            {/* Register Button */}
                            <motion.button
                                onClick={() => window.location.href = '/register'}
                                className="w-full mt-4 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 hover:from-blue-700 hover:via-purple-700 hover:to-green-700 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-blue-500/50 transform hover:scale-105 transition-all duration-300"
                                whileHover={{scale: 1.05}}
                                whileTap={{scale: 0.95}}
                            >
                <span className="flex items-center justify-center">
                  {language === 'si' ? 'Register to Contest' : 'Register to Contest'}
                    <ChevronRight className="inline-block ml-2 w-4 h-4"/>
                </span>
                            </motion.button>
                        </motion.div>

                        {/* Sigithi Kumariya */}
                        <motion.div
                            className="relative group"
                            whileHover={{scale: 1.02}}
                            initial={{opacity: 0, x: 50}}
                            whileInView={{opacity: 1, x: 0}}
                        >
                            <div
                                className="relative h-80 rounded-3xl overflow-hidden shadow-2xl border-2 border-purple-500/30">
                                <Image
                                    src="/images/sigithi-awurudu-kumari-hero.jpg"
                                    alt="Sigithi Awurudu Kumariya"
                                    fill
                                    className="object-cover"
                                />
                                <div
                                    className="absolute inset-0 bg-gradient-to-t from-purple-100/80 via-purple-100/20 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 right-0 p-8">
                                    <h3 className="text-3xl font-bold text-gray-800 mb-2">
                                        {language === 'si' ? 'Sigithi Awurudu Kumariya' : 'Sigithi Awurudu Kumariya'}
                                    </h3>
                                    <p className="text-purple-800">{language === 'si' ? 'Little Princess' : 'Little Princess'}</p>
                                </div>
                            </div>
                            {/* Vote Button */}
                            <motion.button
                                onClick={() => window.location.href = '/vote'}
                                className="w-full mt-6 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 hover:from-purple-700 hover:via-pink-700 hover:to-purple-800 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-300"
                                whileHover={{scale: 1.05}}
                                whileTap={{scale: 0.95}}
                            >
                <span className="flex items-center justify-center">
                  {language === 'si' ? 'Vote' : 'Vote'}
                    <ChevronRight className="inline-block ml-2 w-4 h-4"/>
                </span>
                            </motion.button>

                            {/* Register Button */}
                            <motion.button
                                onClick={() => window.location.href = '/register'}
                                className="w-full mt-4 bg-gradient-to-r from-pink-600 via-purple-600 to-purple-700 hover:from-pink-700 hover:via-purple-700 hover:to-purple-800 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-pink-500/50 transform hover:scale-105 transition-all duration-300"
                                whileHover={{scale: 1.05}}
                                whileTap={{scale: 0.95}}
                            >
                <span className="flex items-center justify-center">
                  {language === 'si' ? 'Register to Contest' : 'Register to Contest'}
                    <ChevronRight className="inline-block ml-2 w-4 h-4"/>
                </span>
                            </motion.button>
                        </motion.div>
                    </div>


                </motion.div>
            </section>

            {/* Compact Sinhala Hindu New Year Footer */}
            <footer
                className="relative bg-gradient-to-br from-red-800 via-orange-800 to-yellow-800 text-white overflow-hidden py-12">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* Erabadu Tree Branches in Footer */}
                    <div className="absolute top-5 right-8 opacity-20">
                        <motion.div
                            animate={{
                                rotate: [-3, 3, -3],
                                scale: [1, 1.04, 1]
                            }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <Image
                                src="/images/erabadu2.png"
                                alt="Erabadu Tree Branch Footer 1"
                                width={100}
                                height={80}
                                className="object-contain"
                            />
                        </motion.div>
                    </div>
                    <div className="absolute top-10 left-8 opacity-20">
                        <motion.div
                            animate={{
                                rotate: [3, -3, 3],
                                scale: [1, 1.06, 1]
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <Image
                                src="/images/erabadu2.png"
                                alt="Erabadu Tree Branch Footer 2"
                                width={120}
                                height={90}
                                className="object-contain"
                            />
                        </motion.div>
                    </div>

                    {/* Floating Flames */}
                    {floatingFlames.map((flame) => (
                        <motion.div
                            key={flame.id}
                            className="absolute"
                            style={{
                                left: flame.left,
                                top: flame.top,
                            }}
                            animate={{
                                y: [0, -15, 0],
                                rotate: [-5, 5, -5],
                            }}
                            transition={{
                                duration: flame.duration,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <Flame className="w-6 h-6 text-orange-300 opacity-60"/>
                        </motion.div>
                    ))}

                    {/* Sparkling Stars */}
                    {sparklingStars.map((star) => (
                        <motion.div
                            key={star.id}
                            className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                            style={{
                                left: star.left,
                                top: star.top,
                            }}
                            animate={{
                                opacity: [0, 1, 0],
                                scale: [0, 1, 0],
                            }}
                            transition={{
                                duration: star.duration,
                                repeat: Infinity,
                                delay: star.delay,
                            }}
                        />
                    ))}

                    {/* Falling Erabadu Petals - Using Main Background Rain Effect */}
                </div>

                <div className="relative z-10 px-4">
                    <div className="max-w-7xl mx-auto">

                        {/* Main Footer Content */}
                        <motion.div
                            className="text-center relative"
                            initial={{opacity: 0, y: 30}}
                            whileInView={{opacity: 1, y: 0}}
                            transition={{duration: 0.8}}
                        >
                            {/* Left Side Info - Partners, Bank, Contact */}
                            <motion.div
                                className="absolute left-0 top-0 z-20 hidden lg:block text-left"
                                initial={{opacity: 0, x: -50}}
                                whileInView={{opacity: 1, x: 0}}
                                transition={{duration: 0.8, delay: 0.6}}
                            >
                                <motion.div
                                    className="bg-gradient-to-br from-red-900/90 via-orange-900/90 to-yellow-900/90 backdrop-blur-lg rounded-r-2xl p-6 shadow-2xl border-r border-t border-b border-orange-500/30 w-80"
                                    whileHover={{x: 5}}
                                    transition={{duration: 0.3}}
                                >
                                    {/* Our Partners */}
                                    <div className="mb-6">
                                        <h3 className="text-lg font-bold text-yellow-300 mb-3 flex items-center gap-2">
                                            <Users className="w-5 h-5"/>
                                            {language === 'si' ? 'අපගේ හවුල්කරුවන් වන්න' : 'Be our partners'}
                                        </h3>
                                    </div>

                                    {/* Bank Details */}
                                    <div className="mb-6">
                                        <h3 className="text-lg font-bold text-yellow-300 mb-3 flex items-center gap-2">
                                            <Star className="w-5 h-5"/>
                                            {language === 'si' ? 'බැංකු විස්තර' : 'Bank Details'}
                                        </h3>
                                        <div className="space-y-1 text-sm text-orange-200">
                                            <p className="font-semibold">Bank: Commercial Bank</p>
                                            <p>Account Name: Smart Youth</p>
                                            <p>Account No: *********</p>
                                            <p>Branch: Panadura</p>
                                        </div>
                                    </div>

                                    {/* Contact Us */}
                                    <div>
                                        <h3 className="text-lg font-bold text-yellow-300 mb-3 flex items-center gap-2">
                                            <Phone className="w-5 h-5"/>
                                            {language === 'si' ? 'සම්බන්ධ වන්න' : 'Contact Us'}
                                        </h3>
                                        <div className="flex items-center gap-2 text-orange-200">
                                            <Phone className="w-4 h-4"/>
                                            <span className="text-lg font-bold">076 982 5873</span>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>

                            {/* Contact Form - Right Side Inside Footer */}
                            <motion.div
                                className="absolute right-0 -top-5 z-20 hidden lg:block"
                                initial={{opacity: 0, x: 50}}
                                whileInView={{opacity: 1, x: 0}}
                                transition={{duration: 0.8, delay: 0.6}}
                            >
                                <motion.div
                                    className="bg-gradient-to-br from-red-900/90 via-orange-900/90 to-yellow-900/90 backdrop-blur-lg rounded-l-2xl p-6 shadow-2xl border-l border-t border-b border-orange-500/30 w-80"
                                    whileHover={{x: -5}}
                                    transition={{duration: 0.3}}
                                >
                                    <h3 className="text-xl font-bold text-yellow-300 mb-4 flex items-center gap-2">
                                        <MessageSquare className="w-6 h-6"/>
                                        {language === 'si' ? 'අප සමඟ සම්බන්ධ වන්න' : 'Contact Us'}
                                    </h3>

                                    <form onSubmit={handleContactSubmit} className="space-y-4">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                placeholder={language === 'si' ? 'නම' : 'Name'}
                                                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-orange-400/30 rounded-lg text-white placeholder-orange-300/70 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-transparent transition-all duration-300"
                                                required
                                            />
                                        </div>

                                        <div className="relative">
                                            <div
                                                className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Phone className="h-5 w-5 text-orange-300"/>
                                            </div>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                placeholder={language === 'si' ? 'දුරකථන අංකය' : 'Phone Number'}
                                                className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-orange-400/30 rounded-lg text-white placeholder-orange-300/70 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-transparent transition-all duration-300"
                                                required
                                            />
                                        </div>

                                        <div className="relative">
                      <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder={language === 'si' ? 'පණිවිඩය' : 'Message'}
                          rows={3}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-orange-400/30 rounded-lg text-white placeholder-orange-300/70 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-transparent transition-all duration-300 resize-none"
                          required
                      />
                                        </div>

                                        <motion.button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-orange-500/50 transform hover:scale-105 transition-all duration-300 disabled:scale-100 disabled:cursor-not-allowed"
                                            whileHover={{scale: isSubmitting ? 1 : 1.05}}
                                            whileTap={{scale: isSubmitting ? 1 : 0.95}}
                                        >
                                            {isSubmitting ? (
                                                <span className="flex items-center justify-center">
                          <motion.div
                              animate={{rotate: 360}}
                              transition={{duration: 1, repeat: Infinity, ease: "linear"}}
                              className="mr-2"
                          >
                            <MessageSquare className="w-4 h-4"/>
                          </motion.div>
                                                    {language === 'si' ? 'යවමින්...' : 'Sending...'}
                        </span>
                                            ) : (
                                                <span className="flex items-center justify-center">
                          {language === 'si' ? 'යවන්න' : 'Send'}
                                                    <ChevronRight className="inline-block ml-2 w-4 h-4"/>
                        </span>
                                            )}
                                        </motion.button>
                                    </form>
                                </motion.div>
                            </motion.div>

                            {/* Logo and Title */}
                            <motion.div
                                className="flex items-center justify-center mb-6"
                                whileHover={{scale: 1.05}}
                            >
                                <div className="relative w-64 h-24">
                                    <Image
                                        src="/images/logo.png"
                                        alt="Smart Awurudu Logo"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            </motion.div>

                            {/* Traditional Greeting */}
                            <motion.div
                                className="mb-6"
                                animate={{
                                    textShadow: [
                                        "0 0 10px rgba(251, 191, 36, 0.5)",
                                        "0 0 20px rgba(251, 191, 36, 0.8)",
                                        "0 0 10px rgba(251, 191, 36, 0.5)"
                                    ]
                                }}
                                transition={{duration: 2, repeat: Infinity}}
                            >
                                <p className="text-2xl md:text-3xl font-bold text-yellow-300 mb-1">
                                    {language === 'si' ? 'සුභ අලුත් අවුරුද්දක් වේවා!' : 'Happy New Year!'}
                                </p>
                                <p className="text-sm md:text-base text-orange-200">
                                    {language === 'si' ? 'සියලු දෙනාටම සාමය සුභ සිතුම් පිරිපිරීම වේවා!' : 'Peace and Prosperity to All!'}
                                </p>
                            </motion.div>

                            {/* Erabadu Flower Showcase */}
                            <div className="flex justify-center items-center gap-4 mb-6">
                                <motion.div
                                    animate={{rotate: 360}}
                                    transition={{duration: 8, repeat: Infinity, ease: "linear"}}
                                >
                                    <ErabaduFlower size="medium" animated={true}/>
                                </motion.div>
                                <div className="flex gap-2">
                                    {[1, 2].map((i) => (
                                        <motion.div
                                            key={i}
                                            animate={{
                                                y: [0, -8, 0],
                                                scale: [1, 1.1, 1]
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                delay: i * 0.3,
                                                ease: "easeInOut"
                                            }}
                                        >
                                            <ErabaduFlower size="small" animated={true}/>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Event Details */}
                            <div className="flex justify-center items-center gap-6 text-sm">
                                <motion.div
                                    whileHover={{scale: 1.05}}
                                    className="flex items-center gap-2"
                                >
                                    <motion.div
                                        className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-300"
                                        animate={{rotate: 360}}
                                        transition={{duration: 3, repeat: Infinity, ease: "linear"}}
                                    >
                                        <Calendar className="w-4 h-4"/>
                                    </motion.div>
                                    <span className="text-orange-200">April 18, 2026</span>
                                </motion.div>

                                <motion.div
                                    whileHover={{scale: 1.05}}
                                    className="flex items-center gap-2"
                                >
                                    <motion.div
                                        className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300"
                                        animate={{y: [0, -3, 0]}}
                                        transition={{duration: 1, repeat: Infinity}}
                                    >
                                        <MapPin className="w-4 h-4"/>
                                    </motion.div>
                                    <span
                                        className="text-blue-200">{language === 'si' ? 'පානදුර වෙරළ' : 'Panadura Beach'}</span>
                                </motion.div>
                            </div>

                            {/* Bottom Message */}
                            <motion.div
                                className="mt-4"
                                initial={{opacity: 0}}
                                whileInView={{opacity: 1}}
                                transition={{delay: 0.3}}
                            >
                                <div
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 rounded-full">
                                    <Sparkles className="w-4 h-4 text-yellow-300"/>
                                    <p className="text-sm font-bold">
                                        {language === 'si' ? 'සම්ප්‍රදාය උත්සවයක් නවීන තාක්ෂණයෙන්' : 'Traditional Festival with Modern Technology'}
                                    </p>
                                    <Sparkles className="w-4 h-4 text-yellow-300"/>
                                </div>
                            </motion.div>
                        </motion.div>
                        <div className="text-center text-gray-400 mt-5">
                            <p>&copy; 2023 Astrea. All rights reserved. <a href="https://astrea.lk" target="_blank"
                                                                           rel="noreferrer"
                                                                           className="text-orange-300 hover:text-amber-300 transition-colors duration-300">astrea.lk</a>
                            </p>
                        </div>
                    </div>
                </div>
            </footer>

            <ScrollToTop/>
        </div>
    );
};

export default LandingPage;
