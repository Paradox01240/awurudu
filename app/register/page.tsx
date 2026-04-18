'use client';

import React from 'react';
import {motion} from 'framer-motion';
import {ArrowLeft, Home} from 'lucide-react';
import RegistrationForm from '../components/RegistrationForm';
import {useLanguage} from '../contexts/LanguageContext';
import {alert} from '../components/AlertProvider';

export default function RegistrationPage() {
    const {t, language} = useLanguage();

    const handleSubmit = async (formData: any) => {
        try {
            const response = await fetch('/api/candidates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (result.success) {
                alert.success(language === 'si'
                    ? 'Registration submitted successfully! Your application is pending approval.'
                    : 'Registration submitted successfully! Your application is pending approval.'
                );
                // Reset form or redirect
                window.location.href = '/';
            } else {
                alert.error(result.error || (language === 'si' ? 'Registration failed' : 'Registration failed'));
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert.error(language === 'si' ? 'An error occurred. Please try again.' : 'An error occurred. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 relative">
            {/* Back Button */}
            <motion.div
                className="absolute top-6 left-6 z-10"
                initial={{opacity: 0, x: -50}}
                animate={{opacity: 1, x: 0}}
                transition={{duration: 0.5}}
            >
                <motion.button
                    onClick={() => window.location.href = '/'}
                    className="group flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-md border border-orange-200 rounded-full shadow-lg hover:shadow-orange-500/30 transition-all duration-300"
                    whileHover={{scale: 1.05}}
                    whileTap={{scale: 0.95}}
                >
                    <ArrowLeft
                        className="w-4 h-4 text-orange-600 group-hover:-translate-x-1 transition-transform duration-300"/>
                    <span
                        className="text-sm font-medium text-gray-700 group-hover:text-orange-600 transition-colors duration-300">
            {language === 'si' ? 'Back' : 'Back'}
          </span>
                </motion.button>
            </motion.div>

            {/* Home Button */}
            <motion.div
                className="absolute top-6 right-6 z-10"
                initial={{opacity: 0, x: 50}}
                animate={{opacity: 1, x: 0}}
                transition={{duration: 0.5}}
            >
                <motion.button
                    onClick={() => window.location.href = '/'}
                    className="group flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-md border border-orange-200 rounded-full shadow-lg hover:shadow-orange-500/30 transition-all duration-300"
                    whileHover={{scale: 1.05}}
                    whileTap={{scale: 0.95}}
                >
                    <Home className="w-4 h-4 text-orange-600 group-hover:scale-110 transition-transform duration-300"/>
                    <span
                        className="text-sm font-medium text-gray-700 group-hover:text-orange-600 transition-colors duration-300">
            {language === 'si' ? 'Home' : 'Home'}
          </span>
                </motion.button>
            </motion.div>

            {/* Registration Form */}
            <div className="min-h-screen flex items-center justify-center p-4">
                <RegistrationForm onSubmit={handleSubmit}/>
            </div>
        </div>
    );
}
