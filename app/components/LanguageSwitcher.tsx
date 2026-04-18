'use client';

import React from 'react';
import {motion} from 'framer-motion';
import {Globe, Languages} from 'lucide-react';
import {useLanguage} from '../contexts/LanguageContext';

const LanguageSwitcher = () => {
    const {language, setLanguage} = useLanguage();

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'si' : 'en');
    };

    // Generate deterministic random values for particles
    const particleAnimations = React.useMemo(() => {
        const random = (index: number, max: number) => {
            const seed = index * 9301 + 49297;
            return (seed * 233280) % max;
        };

        return [...Array(3)].map((_, i) => ({
            x: [0, random(i, 40) / 2 - 10]
        }));
    }, []);

    return (
        <motion.div
            className="fixed top-6 right-6 z-50"
            initial={{opacity: 0, x: 50}}
            animate={{opacity: 1, x: 0}}
            transition={{duration: 0.5}}
        >
            <motion.button
                onClick={toggleLanguage}
                className="group relative bg-white/90 backdrop-blur-md border border-orange-200 rounded-full px-4 py-2 shadow-lg hover:shadow-orange-500/30 transition-all duration-300"
                whileHover={{scale: 1.05}}
                whileTap={{scale: 0.95}}
            >
                <div className="flex items-center gap-2">
                    <motion.div
                        animate={{rotate: language === 'si' ? 360 : 0}}
                        transition={{duration: 0.5}}
                    >
                        <Globe className="w-5 h-5 text-orange-600"/>
                    </motion.div>
                    <span className="font-semibold text-gray-800">
            {language === 'en' ? 'සිං' : 'EN'}
          </span>
                    <Languages className="w-4 h-4 text-orange-500"/>
                </div>

                {/* Animated underline */}
                <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500"
                    initial={{scaleX: 0}}
                    whileHover={{scaleX: 1}}
                    transition={{duration: 0.3}}
                />
            </motion.button>

            {/* Floating particles animation */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{delay: 0.5}}
            >
                {particleAnimations.map((anim, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-orange-400 rounded-full"
                        animate={{
                            x: anim.x,
                            y: [0, -20],
                            opacity: [0, 1, 0],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.3,
                            ease: "easeOut"
                        }}
                        style={{
                            left: `${50 + (i - 1) * 15}px`,
                            top: '50%',
                        }}
                    />
                ))}
            </motion.div>
        </motion.div>
    );
};

export default LanguageSwitcher;
