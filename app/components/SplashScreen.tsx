'use client';

import React, {useState, useEffect} from 'react';
import Image from 'next/image';
import {motion} from 'framer-motion';

const SplashScreen = () => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 3000); // Splash screen will be visible for 3 seconds

        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) {
        return null;
    }

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-orange-100 via-amber-50 to-white"
            initial={{opacity: 1}}
            animate={{opacity: 0}}
            transition={{duration: 1, delay: 2.5}}
            onAnimationComplete={() => setIsVisible(false)}
        >
            <motion.div
                initial={{scale: 0.8, opacity: 0}}
                animate={{scale: 1, opacity: 1}}
                transition={{duration: 1.5}}
            >
                <Image
                    src="/images/popup.png"
                    alt="Splash Screen"
                    width={500}
                    height={500}
                    className="object-contain"
                />
            </motion.div>
        </motion.div>
    );
};

export default SplashScreen;
