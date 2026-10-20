import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { useContent } from '../contexts/ContentContext';

const MENU_ITEMS = ['Projects', 'Work', 'Contact'];

export default function Header() {
  const [isHidden, setIsHidden] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const content = useContent();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    // Hide header if scrolling down and past 150px. Show if scrolling up.
    if (latest > previous && latest > 150 && !isMobileMenuOpen) {
      setIsHidden(true);
    } else {
      setIsHidden(false);
    }
  });

  return (
    <>
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: isHidden ? -100 : 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 w-full z-50 glass"
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <a href="#" className="font-display font-bold text-xl tracking-tighter text-white hover-target group relative z-50 uppercase">
            {content.hero_headline_1}<span className="text-orange-500">.</span>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {MENU_ITEMS.map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium text-white/70 hover:text-white transition-colors relative group hover-target"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-orange-500 group-hover:w-full transition-all duration-300 ease-out" />
              </a>
            ))}
          </nav>

          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden relative z-50 flex flex-col gap-1.5 hover-target p-2 w-10 h-10 items-center justify-center"
          >
            <span className={`w-6 h-[2px] bg-white block transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-[4px]' : ''}`} />
            <span className={`w-6 h-[2px] bg-white block transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-[4px]' : ''}`} />
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 bg-darker/95 backdrop-blur-xl flex flex-col items-center justify-center"
          >
            <nav className="flex flex-col items-center gap-8">
              {MENU_ITEMS.map((item, index) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-3xl sm:text-4xl font-display font-bold uppercase tracking-widest text-white hover:text-orange-500 transition-colors"
                >
                  {item}
                </motion.a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
