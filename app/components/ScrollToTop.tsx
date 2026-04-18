'use client';

import React, {useState, useEffect} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {ChevronUp} from 'lucide-react';

const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 hover:from-red-700 hover:via-orange-700 hover:to-yellow-700 text-white p-4 rounded-full shadow-lg hover:shadow-red-500/50 transform hover:scale-110 transition-all duration-300"
                    initial={{opacity: 0, scale: 0, y: 20}}
                    animate={{opacity: 1, scale: 1, y: 0}}
                    exit={{opacity: 0, scale: 0, y: 20}}
                    transition={{duration: 0.3}}
                    whileHover={{scale: 1.1}}
                    whileTap={{scale: 0.9}}
                >
                    <motion.div
                        animate={{y: [0, -3, 0]}}
                        transition={{duration: 1, repeat: Infinity}}
                    >
                        <ChevronUp className="w-6 h-6"/>
                    </motion.div>
                </motion.button>
            )}
        </AnimatePresence>
    );
};

export default ScrollToTop;
