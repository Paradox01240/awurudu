'use client';

import React, {useEffect, useRef, useState} from 'react';
import {useLanguage} from '../contexts/LanguageContext';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const FestiveScroll = () => {
    const {t, language} = useLanguage();
    const paperRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [showHint, setShowHint] = useState(true);
    const [hasCompletedAnimation, setHasCompletedAnimation] = useState(false);
    const [currentHeight, setCurrentHeight] = useState(0);
    const [velocity, setVelocity] = useState(0);

    // GSAP ScrollTrigger with scrub animation
    useEffect(() => {
        const paper = paperRef.current;
        const container = containerRef.current;
        const scrollContainer = scrollContainerRef.current;
        const content = contentRef.current;

        if (!paper || !container || !scrollContainer || !content) return;

        const contentHeight = content.offsetHeight + 40;
        const closedHeight = 0;
        const openHeight = contentHeight;

        // Set initial state
        gsap.set(paper, {height: closedHeight});
        gsap.set(container, {height: '200px'});

        // Create timeline for scroll-scrubbed animation
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: container,
                start: 'top 60%', // Start when top reaches 60% of viewport.
                end: 'center 40%',   // End when center reaches 40% of viewport.
                scrub: true,      // Smooth scrub animation.
                onEnter: () => {
                    // Auto-open when section comes into view
                    gsap.to(paper, {height: openHeight, duration: 1.5, ease: 'power2.out'});
                    gsap.to(container, {height: contentHeight + 100, duration: 1.5, ease: 'power2.out'});
                    setHasCompletedAnimation(true);
                    setIsOpen(true);
                    setShowHint(false);
                },
                onLeave: () => {
                    // Keep open when scrolling past
                    setHasCompletedAnimation(true);
                    setIsOpen(true);
                    setShowHint(false);
                },
                onLeaveBack: () => {
                    // Don't reverse animation - keep it open
                }
            }
        });

        // Animate scroll opening
        tl.to(paper, {
            height: openHeight,
            duration: 1,
            ease: 'none' // Linear for smooth scrub
        }, 0);

        // Animate container height simultaneously
        tl.to(container, {
            height: contentHeight + 100,
            duration: 1,
            ease: 'none'
        }, 0);

        // Hide hint during animation
        tl.to({}, {
            onStart: () => setShowHint(false)
        }, 0.1);

        return () => {
            // Clean up ScrollTrigger
            ScrollTrigger.getAll().forEach((trigger: any) => trigger.kill());
        };
    }, []);

    // Spring physics configuration - maximum slow animation
    const tension = 0.001;  // Maximum slow animation
    const friction = 0.98;  // Maximum smooth, zero bounce


    // Spring physics animation (only for manual click interactions)
    useEffect(() => {
        // Only run spring physics for manual interactions after scroll animation completes
        if (!hasCompletedAnimation) return;

        let animationId: number;
        let h = currentHeight;
        let v = velocity;

        const animate = () => {
            const targetHeight = isOpen && contentRef.current
                ? contentRef.current.offsetHeight + 40
                : 0;

            const diff = targetHeight - h;
            v += diff * tension;
            v *= friction;
            h += v;

            if (Math.abs(v) > 0.01 || Math.abs(diff) > 0.01) {
                const appliedHeight = Math.max(0, h);
                if (paperRef.current) {
                    paperRef.current.style.height = `${appliedHeight}px`;
                }
                setCurrentHeight(h);
                setVelocity(v);
            }

            animationId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };
    }, [isOpen, hasCompletedAnimation]);

    const handleClick = () => {
        // Only allow manual control after scroll animation completes
        if (!hasCompletedAnimation) return;

        setIsOpen(!isOpen);
        setShowHint(false);

        // Use GSAP for manual click animations
        const paper = paperRef.current;
        const container = containerRef.current;
        const content = contentRef.current;

        if (!paper || !container || !content) return;

        const contentHeight = content.offsetHeight + 40;

        if (!isOpen) {
            // Opening manually
            gsap.to(paper, {height: contentHeight, duration: 1.5, ease: 'power2.out'});
            gsap.to(container, {height: contentHeight + 100, duration: 1.5, ease: 'power2.out'});
        } else {
            // Closing manually
            gsap.to(paper, {height: 0, duration: 1.5, ease: 'power2.inOut'});
            gsap.to(container, {height: '200px', duration: 1.5, ease: 'power2.inOut'});
        }
    };

    return (
        <div ref={containerRef} className="relative overflow-hidden">
            <style jsx>{`
                :root {
                    --scroll-gold: #cca550;
                    --scroll-gold-light: #f4d068;
                    --scroll-gold-dark: #8c6a25;
                    --parchment: #f5e6ce;
                    --parchment-dark: #d5b98a;
                    --text-dark: #4a2e15;
                    --text-red: #8b2512;
                }
            `}</style>

            {/* Scroll instruction */}
            <div
                className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 text-gray-600/80 font-sans tracking-wider text-sm uppercase transition-opacity duration-500 z-20 ${showHint ? 'opacity-100' : 'opacity-0'}`}
                style={{
                    animation: showHint ? 'pulse 2s infinite' : 'none'
                }}
            >
                Click to unroll
            </div>

            <style jsx>{`
                @keyframes pulse {
                    0%, 100% {
                        opacity: 0.4;
                        transform: translateX(-50%) translateY(0);
                    }
                    50% {
                        opacity: 1;
                        transform: translateX(-50%) translateY(5px);
                    }
                }
            `}</style>

            {/* Scroll container */}
            <div ref={scrollContainerRef}
                 className={`relative w-full flex items-center justify-center z-10 transition-all duration-1000 ease-in-out ${isOpen ? 'min-h-[800px] py-20' : 'h-full'}`}>
                <div
                    className="relative w-[90%] max-w-[650px] flex flex-col items-center cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
                    style={{filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.6))'}}
                    onClick={handleClick}
                >
                    {/* Top roller */}
                    <div
                        className="relative w-full h-[45px] bg-gradient-to-b from-[#8c6a25] via-[#f4d068] to-[#cca550] rounded-[25px] z-[3] shadow-[inset_0_2px_5px_rgba(255,255,255,0.4),inset_0_-3px_5px_rgba(0,0,0,0.5),0_5px_15px_rgba(0,0,0,0.5)]">
                        <div
                            className="absolute top-1/2 left-[-20px] transform -translate-y-1/2 w-[35px] h-[65px] bg-gradient-to-r from-[#8c6a25] via-[#f4d068] to-[#8c6a25] rounded-[8px] shadow-[inset_0_0_8px_rgba(0,0,0,0.8),0_5px_10px_rgba(0,0,0,0.5)] border-l-[5px] border-l-[#8c6a25]"></div>
                        <div
                            className="absolute top-1/2 right-[-20px] transform -translate-y-1/2 w-[35px] h-[65px] bg-gradient-to-r from-[#8c6a25] via-[#f4d068] to-[#8c6a25] rounded-[8px] shadow-[inset_0_0_8px_rgba(0,0,0,0.8),0_5px_10px_rgba(0,0,0,0.5)] border-r-[5px] border-r-[#8c6a25]"></div>
                        <div
                            className="absolute top-1/2 left-[-35px] transform -translate-y-1/2 w-[15px] h-[40px] bg-gradient-to-r from-[#6b4c1a] via-[#ffd700] to-[#6b4c1a] rounded-[5px] z-[4]"></div>
                        <div
                            className="absolute top-1/2 right-[-35px] transform -translate-y-1/2 w-[15px] h-[40px] bg-gradient-to-r from-[#6b4c1a] via-[#ffd700] to-[#6b4c1a] rounded-[5px] z-[4]"></div>
                    </div>

                    {/* Paper */}
                    <div
                        ref={paperRef}
                        className="relative w-[94%] bg-[#f5e6ce] overflow-hidden z-[2] -mt-[15px] -mb-[15px] origin-top"
                        style={{
                            backgroundImage: `
                radial-gradient(circle at center, transparent 30%, rgba(139, 69, 19, 0.05) 100%),
                linear-gradient(to right, rgba(140, 106, 37, 0.3) 0%, transparent 4%, transparent 96%, rgba(140, 106, 37, 0.3) 100%),
                linear-gradient(to bottom, rgba(140, 106, 37, 0.4) 0%, transparent 5%, transparent 95%, rgba(140, 106, 37, 0.4) 100%)
              `,
                            boxShadow: 'inset 0 0 50px rgba(107, 76, 26, 0.3)',
                            height: '0px'
                        }}
                    >
                        <div
                            ref={contentRef}
                            className="p-10 text-center h-max min-h-[700px] relative"
                        >
                            {/* Ornate border */}
                            <div
                                className="absolute top-5 bottom-5 left-5 right-5 border-2 border-[#8c6a25] outline outline-1 outline-[#8c6a25] outline-offset-[-6px] pointer-events-none">
                                <div
                                    className="absolute top-[-15px] left-[-15px] w-[30px] h-[30px] border-2 border-[#8c6a25] rounded-full border-b-0 border-r-0"></div>
                                <div
                                    className="absolute bottom-[-15px] right-[-15px] w-[30px] h-[30px] border-2 border-[#8c6a25] rounded-full border-t-0 border-l-0"></div>
                            </div>

                            <h1 className="text-[2.2rem] text-[#8b2512] mb-2.5 uppercase tracking-[2px] font-bold text-shadow-[1px_1px_0px_rgba(255,255,255,0.5)]">
                                {t('time.venue')}
                            </h1>
                            <h2 className="text-[1.2rem] text-[#8c6a25] mb-[30px] italic">
                                {t('aluth.avurudu.festival')}
                            </h2>

                            <div
                                className="w-[60%] h-[2px] bg-gradient-to-r from-transparent via-[#8c6a25] to-transparent mx-5 my-5"></div>

                            <div className="grid grid-cols-1 gap-5 mb-[30px] md:grid-cols-2">
                                <div className="detail-item">
                                    <h3 className="text-[1.1rem] text-[#8b2512] mb-1 uppercase tracking-[1px] font-bold">Date</h3>
                                    <p className="text-[1.2rem] font-bold">April 18, 2026</p>
                                </div>
                                <div className="detail-item">
                                    <h3 className="text-[1.1rem] text-[#8b2512] mb-1 uppercase tracking-[1px] font-bold">Duration</h3>
                                    <p className="text-[1.2rem] font-bold">8:00 AM - 8:00 PM</p>
                                </div>
                                <div className="detail-item">
                                    <h3 className="text-[1.1rem] text-[#8b2512] mb-1 uppercase tracking-[1px] font-bold">Venue</h3>
                                    <p className="text-[1.2rem] font-bold">Panadura Beach</p>
                                </div>
                                <div className="detail-item">
                                    <h3 className="text-[1.1rem] text-[#8b2512] mb-1 uppercase tracking-[1px] font-bold">Area</h3>
                                    <p className="text-[1.2rem] font-bold">Panadura</p>
                                </div>
                            </div>

                            <div className="text-left mt-[30px] px-5">
                                <h3 className="text-[#8b2512] text-center mb-6 text-[1.3rem] font-bold">{t('event.schedule')}</h3>
                                <div className="space-y-3">
                                    <div className="border-l-4 border-[#cca550] pl-4">
                                        <p className="font-bold text-[#8b2512]">{t('time.8.00.8.05')}</p>
                                        <p className="text-sm text-gray-700 mb-1">{t('desc.8.00.8.05')}</p>
                                    </div>

                                    <div className="border-l-4 border-[#cca550] pl-4">
                                        <p className="font-bold text-[#8b2512]">{t('time.8.05.8.15')}</p>
                                        <p className="text-sm text-gray-700 mb-1">{t('desc.8.05.8.15')}</p>
                                    </div>

                                    <div className="border-l-4 border-[#cca550] pl-4">
                                        <p className="font-bold text-[#8b2512]">{t('time.8.15.8.30')}</p>
                                        <p className="text-sm text-gray-700 mb-1">{t('desc.8.15.8.30')}</p>
                                    </div>

                                    <div className="border-l-4 border-[#cca550] pl-4">
                                        <p className="font-bold text-[#8b2512]">{t('time.8.30.8.40')}</p>
                                        <p className="text-sm text-gray-700 mb-1">{t('desc.8.30.8.40')}</p>
                                    </div>

                                    <div className="border-l-4 border-[#cca550] pl-4">
                                        <p className="font-bold text-[#8b2512]">{t('time.8.40.8.50')}</p>
                                        <p className="text-sm text-gray-700 mb-1">{t('desc.8.40.8.50')}</p>
                                    </div>

                                    <div className="border-l-4 border-[#cca550] pl-4">
                                        <p className="font-bold text-[#8b2512]">{t('time.8.50.9.00')}</p>
                                        <p className="text-sm text-gray-700 mb-1">{t('desc.8.50.9.00')}</p>
                                    </div>

                                    <div className="border-l-4 border-[#cca550] pl-4">
                                        <p className="font-bold text-[#8b2512]">{t('time.9.00.9.05')}</p>
                                        <p className="text-sm text-gray-700 mb-1">{t('desc.9.00.9.05')}</p>
                                    </div>

                                    <div className="border-l-4 border-[#cca550] pl-4">
                                        <p className="font-bold text-[#8b2512]">{t('time.9.05.9.40')}</p>
                                        <p className="text-sm text-gray-700 mb-1">{t('desc.9.05.9.40')}</p>
                                    </div>

                                    <div className="border-l-4 border-[#cca550] pl-4">
                                        <p className="font-bold text-[#8b2512]">{t('time.9.40.10.00')}</p>
                                        <p className="text-sm text-gray-700 mb-1">{t('desc.9.40.10.00')}</p>
                                    </div>

                                    <div className="border-l-4 border-[#cca550] pl-4">
                                        <p className="font-bold text-[#8b2512]">{t('time.10.00.10.15')}</p>
                                        <p className="text-sm text-gray-700 mb-1">{t('desc.10.00.10.15')}</p>
                                    </div>

                                    <div className="border-l-4 border-[#cca550] pl-4">
                                        <p className="font-bold text-[#8b2512]">{t('time.10.15.10.20')}</p>
                                        <p className="text-sm text-gray-700 mb-1">{t('desc.10.15.10.20')}</p>
                                    </div>

                                    <div className="border-l-4 border-[#cca550] pl-4">
                                        <p className="font-bold text-[#8b2512]">{t('time.10.20.10.35')}</p>
                                        <p className="text-sm text-gray-700 mb-1">{t('desc.10.20.10.35')}</p>
                                    </div>

                                    <div className="border-l-4 border-[#cca550] pl-4">
                                        <p className="font-bold text-[#8b2512]">{t('time.10.35.10.50')}</p>
                                        <p className="text-sm text-gray-700 mb-1">{t('desc.10.35.10.50')}</p>
                                    </div>

                                    <div className="border-l-4 border-[#cca550] pl-4">
                                        <p className="font-bold text-[#8b2512]">{t('time.10.50.11.10')}</p>
                                        <p className="text-sm text-gray-700 mb-1">{t('desc.10.50.11.10')}</p>
                                    </div>

                                    <div className="border-l-4 border-[#cca550] pl-4">
                                        <p className="font-bold text-[#8b2512]">{t('time.11.10.11.15')}</p>
                                        <p className="text-sm text-gray-700 mb-1">{t('desc.11.10.11.15')}</p>
                                    </div>

                                    <div className="border-l-4 border-[#cca550] pl-4">
                                        <p className="font-bold text-[#8b2512]">{t('time.11.15.11.30')}</p>
                                        <p className="text-sm text-gray-700 mb-1">{t('desc.11.15.11.30')}</p>
                                    </div>

                                    <div className="border-l-4 border-[#cca550] pl-4">
                                        <p className="font-bold text-[#8b2512]">{t('time.11.30.2.30')}</p>
                                        <p className="text-sm text-gray-700 mb-1">{t('desc.11.30.2.30')}</p>
                                    </div>

                                    <div className="border-l-4 border-[#cca550] pl-4">
                                        <p className="font-bold text-[#8b2512]">{t('time.2.30.2.45')}</p>
                                        <p className="text-sm text-gray-700 mb-1">{t('desc.2.30.2.45')}</p>
                                    </div>

                                    <div className="border-l-4 border-[#cca550] pl-4">
                                        <p className="font-bold text-[#8b2512]">{t('time.2.45.3.00')}</p>
                                        <p className="text-sm text-gray-700 mb-1">{t('desc.2.45.3.00')}</p>
                                    </div>

                                    <div className="border-l-4 border-[#cca550] pl-4">
                                        <p className="font-bold text-[#8b2512]">{t('time.3.00.3.20')}</p>
                                        <p className="text-sm text-gray-700 mb-1">{t('desc.3.00.3.20')}</p>
                                    </div>

                                    <div className="border-l-4 border-[#cca550] pl-4">
                                        <p className="font-bold text-[#8b2512]">{t('time.3.20.3.40')}</p>
                                        <p className="text-sm text-gray-700 mb-1">{t('desc.3.20.3.40')}</p>
                                    </div>

                                    <div className="border-l-4 border-[#cca550] pl-4">
                                        <p className="font-bold text-[#8b2512]">{t('time.3.40.4.00')}</p>
                                        <p className="text-sm text-gray-700 mb-1">{t('desc.3.40.4.00')}</p>
                                    </div>

                                    <div className="border-l-4 border-[#cca550] pl-4">
                                        <p className="font-bold text-[#8b2512]">{t('time.4.00.4.20')}</p>
                                        <p className="text-sm text-gray-700 mb-1">{t('desc.4.00.4.20')}</p>
                                    </div>

                                    <div className="border-l-4 border-[#cca550] pl-4">
                                        <p className="font-bold text-[#8b2512]">{t('time.4.20.5.00')}</p>
                                        <p className="text-sm text-gray-700 mb-1">{t('desc.4.20.5.00')}</p>
                                    </div>

                                    <div className="border-l-4 border-[#cca550] pl-4">
                                        <p className="font-bold text-[#8b2512]">{t('time.5.00.5.30')}</p>
                                        <p className="text-sm text-gray-700 mb-1">{t('desc.5.00.5.30')}</p>
                                    </div>

                                    <div className="border-l-4 border-[#cca550] pl-4">
                                        <p className="font-bold text-[#8b2512]">{t('time.5.30.5.50')}</p>
                                        <p className="text-sm text-gray-700 mb-1">{t('desc.5.30.5.50')}</p>
                                    </div>

                                    <div className="border-l-4 border-[#cca550] pl-4">
                                        <p className="font-bold text-[#8b2512]">{t('time.5.50.6.10')}</p>
                                        <p className="text-sm text-gray-700 mb-1">{t('desc.5.50.6.10')}</p>
                                    </div>

                                    <div className="border-l-4 border-[#cca550] pl-4">
                                        <p className="font-bold text-[#8b2512]">{t('time.6.10.6.30')}</p>
                                        <p className="text-sm text-gray-700 mb-1">{t('desc.6.10.6.30')}</p>
                                    </div>

                                    <div className="border-l-4 border-[#cca550] pl-4">
                                        <p className="font-bold text-[#8b2512]">{t('time.6.30.7.30')}</p>
                                        <p className="text-sm text-gray-700 mb-1">{t('desc.6.30.7.30')}</p>
                                    </div>

                                    <div className="border-l-4 border-[#cca550] pl-4">
                                        <p className="font-bold text-[#8b2512]">{t('time.7.30.onwards')}</p>
                                        <p className="text-sm text-gray-700 mb-1">{t('desc.7.30.onwards')}</p>
                                    </div>
                                </div>
                            </div>

                            <div
                                className="w-[60%] h-[2px] bg-gradient-to-r from-transparent via-[#8c6a25] to-transparent mx-5 my-10"></div>
                            <p className="italic text-[#8c6a25] text-[0.9rem] mt-10">
                                {t('join.celebration')}
                            </p>
                        </div>
                    </div>

                    {/* Bottom roller */}
                    <div
                        className="relative w-full h-[45px] bg-gradient-to-b from-[#8c6a25] via-[#f4d068] to-[#cca550] rounded-[25px] z-[3] shadow-[inset_0_2px_5px_rgba(255,255,255,0.4),inset_0_-3px_5px_rgba(0,0,0,0.5),0_5px_15px_rgba(0,0,0,0.5)]">
                        <div
                            className="absolute top-1/2 left-[-20px] transform -translate-y-1/2 w-[35px] h-[65px] bg-gradient-to-r from-[#8c6a25] via-[#f4d068] to-[#8c6a25] rounded-[8px] shadow-[inset_0_0_8px_rgba(0,0,0,0.8),0_5px_10px_rgba(0,0,0,0.5)] border-l-[5px] border-l-[#8c6a25]"></div>
                        <div
                            className="absolute top-1/2 right-[-20px] transform -translate-y-1/2 w-[35px] h-[65px] bg-gradient-to-r from-[#8c6a25] via-[#f4d068] to-[#8c6a25] rounded-[8px] shadow-[inset_0_0_8px_rgba(0,0,0,0.8),0_5px_10px_rgba(0,0,0,0.5)] border-r-[5px] border-r-[#8c6a25]"></div>
                        <div
                            className="absolute top-1/2 left-[-35px] transform -translate-y-1/2 w-[15px] h-[40px] bg-gradient-to-r from-[#6b4c1a] via-[#ffd700] to-[#6b4c1a] rounded-[5px] z-[4]"></div>
                        <div
                            className="absolute top-1/2 right-[-35px] transform -translate-y-1/2 w-[15px] h-[40px] bg-gradient-to-r from-[#6b4c1a] via-[#ffd700] to-[#6b4c1a] rounded-[5px] z-[4]"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FestiveScroll;
