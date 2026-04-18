'use client';

import React from 'react';
import {motion} from 'framer-motion';

interface ErabaduFlowerProps {
    className?: string;
    size?: 'small' | 'medium' | 'large';
    animated?: boolean;
}

const ErabaduFlower: React.FC<ErabaduFlowerProps> = ({
                                                         className = '',
                                                         size = 'medium',
                                                         animated = true
                                                     }) => {
    const sizeClasses = {
        small: 'w-8 h-8',
        medium: 'w-12 h-12',
        large: 'w-16 h-16'
    };

    return (
        <motion.div
            className={`relative ${sizeClasses[size]} ${className}`}
            animate={animated ? {
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1],
            } : {}}
            transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
            }}
        >
            {/* Erabadu Flower SVG - Red Rhododendron */}
            <svg
                viewBox="0 0 100 100"
                className="w-full h-full"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Flower petals - red/orange color */}
                <motion.g
                    animate={animated ? {
                        opacity: [0.8, 1, 0.8],
                    } : {}}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    {/* Center petals */}
                    <ellipse cx="50" cy="35" rx="8" ry="15" fill="#DC143C" transform="rotate(0 50 50)"/>
                    <ellipse cx="50" cy="35" rx="8" ry="15" fill="#DC143C" transform="rotate(72 50 50)"/>
                    <ellipse cx="50" cy="35" rx="8" ry="15" fill="#DC143C" transform="rotate(144 50 50)"/>
                    <ellipse cx="50" cy="35" rx="8" ry="15" fill="#DC143C" transform="rotate(216 50 50)"/>
                    <ellipse cx="50" cy="35" rx="8" ry="15" fill="#DC143C" transform="rotate(288 50 50)"/>

                    {/* Outer petals */}
                    <ellipse cx="50" cy="30" rx="6" ry="12" fill="#FF6B6B" transform="rotate(36 50 50)"/>
                    <ellipse cx="50" cy="30" rx="6" ry="12" fill="#FF6B6B" transform="rotate(108 50 50)"/>
                    <ellipse cx="50" cy="30" rx="6" ry="12" fill="#FF6B6B" transform="rotate(180 50 50)"/>
                    <ellipse cx="50" cy="30" rx="6" ry="12" fill="#FF6B6B" transform="rotate(252 50 50)"/>
                    <ellipse cx="50" cy="30" rx="6" ry="12" fill="#FF6B6B" transform="rotate(324 50 50)"/>

                    {/* Flower center */}
                    <circle cx="50" cy="50" r="8" fill="#FFD700"/>
                    <circle cx="50" cy="50" r="4" fill="#FFA500"/>
                </motion.g>

                {/* Stem */}
                <rect x="48" y="50" width="4" height="30" fill="#228B22"/>

                {/* Leaves */}
                <ellipse cx="40" cy="65" rx="8" ry="4" fill="#228B22" transform="rotate(-30 40 65)"/>
                <ellipse cx="60" cy="70" rx="8" ry="4" fill="#228B22" transform="rotate(30 60 70)"/>
            </svg>
        </motion.div>
    );
};

export default ErabaduFlower;
