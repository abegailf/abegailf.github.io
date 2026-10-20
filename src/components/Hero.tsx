import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { useContent } from '../contexts/ContentContext';
import { unescapeText } from '../lib/utils';

export default function Hero() {
  const containerRef = useRef(null);
  const content = useContent();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const globalY = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const x1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const x2 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Text reveal animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: "100%", opacity: 0 },
    visible: { 
      y: "0%", 
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }
    },
  };

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[100dvh] flex flex-col justify-between items-center px-4 sm:px-6 md:px-8 pt-24 sm:pt-28 md:pt-32 pb-8 sm:pb-10 overflow-hidden"
    >
      {/* Central Hero Content Container with Generous Breathing Room */}
      <motion.div 
        style={{ opacity, y: globalY }} 
        className="relative z-10 w-full max-w-4xl lg:max-w-5xl mx-auto flex-1 flex flex-col justify-center items-center text-center my-auto py-4 sm:py-6"
      >
        {/* Top Tagline Badge */}
        {content.hero_top_label && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-4 sm:mb-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 backdrop-blur-md shadow-sm shadow-orange-500/10">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              <span className="uppercase tracking-[0.22em] text-[10px] sm:text-xs text-orange-400 font-mono font-medium">
                {content.hero_top_label}
              </span>
            </div>
          </motion.div>
        )}

        {/* Hero Title & Greeting */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center justify-center font-display uppercase tracking-tight w-full"
        >
          {/* Greeting (HI, I'M) */}
          {content.hero_greeting && (
            <motion.div variants={itemVariants} className="overflow-hidden">
              <span className="block text-xs sm:text-sm md:text-base font-mono font-medium text-white/60 tracking-[0.25em] mb-2 sm:mb-3">
                {content.hero_greeting}
              </span>
            </motion.div>
          )}

          {/* Main Name Headline (ABEGAIL) */}
          <motion.div variants={itemVariants} className="overflow-hidden pb-1">
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400 tracking-tight leading-[1.08]">
              {content.hero_headline_1}
            </h1>
          </motion.div>

          {/* Sub-Headline / Focus Area */}
          {content.hero_headline_2 && (
            <motion.div variants={itemVariants} className="overflow-hidden mt-3 sm:mt-4">
              <h2 className="text-xs sm:text-sm md:text-base font-mono font-semibold tracking-[0.22em] text-orange-400/90 uppercase px-2">
                {content.hero_headline_2}
              </h2>
            </motion.div>
          )}
        </motion.div>

        {/* Subhead Description */}
        {content.hero_subhead && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="mt-5 sm:mt-6 max-w-xl sm:max-w-2xl mx-auto px-4"
          >
            <p className="text-xs sm:text-sm md:text-base text-white/70 font-light leading-relaxed max-w-xl mx-auto">
              {unescapeText(content.hero_subhead)}
            </p>
          </motion.div>
        )}

        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
          className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0"
        >
          <a 
            href="#projects" 
            className="hover-target inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-7 sm:px-8 py-3 sm:py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm md:text-base rounded-full shadow-lg shadow-orange-500/25 transition-all duration-300 hover:scale-105 group"
          >
            <span>Explore My Work</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:translate-x-1 transition-transform">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
          
          {content.resume_link && (
            <a 
              href={content.resume_link} 
              target="_blank" 
              rel="noreferrer" 
              className="hover-target inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-7 sm:px-8 py-3 sm:py-3.5 bg-white/5 hover:bg-white/10 text-white font-medium text-sm md:text-base rounded-full border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105"
            >
              <span>View Resume</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M12 19L19 12M12 19L5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
}
