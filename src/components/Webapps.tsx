import { motion, useScroll, useTransform, useMotionValue, useSpring, MotionValue, AnimatePresence } from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import Papa from 'papaparse';
import { useContent } from '../contexts/ContentContext';
import { unescapeText } from '../lib/utils';

export interface Webapp {
  id: string;
  title: string;
  category: string;
  desc: string;
  url: string;
  image: string;
  isFeatured: boolean;
}

function WebappCard({ 
  webapp, 
  index, 
  progress, 
  total 
}: { 
  webapp: Webapp; 
  index: number; 
  progress: MotionValue<number>; 
  total: number; 
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Motion values for the mouse position (normalized from 0 to 1)
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  // Map normalized mouse position to rotation angles
  const rotateX = useTransform(mouseY, [0, 1], [10, -10]);
  const rotateY = useTransform(mouseX, [0, 1], [-10, 10]);

  // Spring physics for smooth tilt
  const springConfig = { damping: 30, stiffness: 400, mass: 0.5 };
  const smoothRotateX = useSpring(rotateX, springConfig);
  const smoothRotateY = useSpring(rotateY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  // Step duration per card transition
  const step = total > 1 ? 1 / total : 1;

  // Stacking horizontal motion:
  // Card 0 stays anchored at "0%" (center) across the entire scroll.
  // Subsequent cards slide in from the right ("100%" -> "0%") during their assigned scroll step.
  const xRange = index === 0 
    ? [0, 1] 
    : [(index - 1) * step, index * step];
  const xOutput = index === 0 
    ? ["0%", "0%"] 
    : ["100%", "0%"];
  const x = useTransform(progress, xRange, xOutput, { clamp: true });

  // When next card slides in over this card, this card scales down slightly and dims
  const scaleRange = [index * step, (index + 1) * step];
  const targetScale = index === total - 1 ? 1 : 0.94;
  const targetOpacity = index === total - 1 ? 1 : 0.35;

  const scale = useTransform(progress, scaleRange, [1, targetScale], { clamp: true });
  const opacity = useTransform(progress, scaleRange, [1, targetOpacity], { clamp: true });

  return (
    <motion.div
      style={{ x, scale, opacity, perspective: 1200, zIndex: index + 1 }}
      className="absolute top-0 left-0 bottom-0 right-0 m-auto w-[92vw] md:w-[80vw] lg:w-[70vw] max-w-6xl h-full origin-center"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX: smoothRotateX,
          rotateY: smoothRotateY,
          transformStyle: "preserve-3d"
        }}
        className="w-full h-full relative rounded-2xl overflow-hidden border border-white/10 bg-dark-surface shadow-2xl flex flex-col md:flex-row group"
      >
        {/* Left Side: Metadata, Title, Description & CTA */}
        <div 
          className="flex-1 p-6 md:p-10 lg:p-12 flex flex-col justify-between z-10"
          style={{ transform: "translateZ(50px)" }}
        >
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-orange-500 font-mono text-xs md:text-sm uppercase tracking-widest">
                {webapp.id} // {webapp.category}
              </span>
            </div>

            <h3 className="text-2xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-4 leading-tight group-hover:text-orange-400 transition-colors">
              {webapp.title}
            </h3>

            <p className="text-white/70 font-light text-sm md:text-base leading-relaxed line-clamp-3 md:line-clamp-4 mb-6">
              {unescapeText(webapp.desc)}
            </p>
          </div>

          <div className="pt-2">
            <a 
              href={webapp.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 px-6 md:px-8 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm md:text-base rounded-full overflow-hidden relative group/btn transition-transform hover:scale-105 shadow-lg shadow-orange-500/25"
            >
              <span className="relative z-10 flex items-center gap-2">
                Launch Live App
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 transition-transform">
                  <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </a>
          </div>
        </div>

        {/* Right Side: Interactive Image Preview with hover zoom & subtle gradient */}
        <div 
          className="flex-1 relative min-h-[220px] md:min-h-full overflow-hidden bg-darker/60"
          style={{ transform: "translateZ(30px)" }}
        >
          <img 
            src={webapp.image} 
            alt={webapp.title} 
            className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out" 
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-dark-surface via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Corner Ambient Glow Accent */}
        <div 
          className="absolute top-0 right-0 w-32 h-32 bg-orange-500/15 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" 
          style={{ transform: "translateZ(40px)" }}
        />
      </motion.div>
    </motion.div>
  );
}

export default function Webapps() {
  const containerRef = useRef(null);
  const content = useContent();
  const [webapps, setWebapps] = useState<Webapp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  
  // Track scroll progress of this entire section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  useEffect(() => {
    const fetchWebapps = async () => {
      try {
        const cacheBuster = new Date().getTime();
        const response = await fetch(`https://docs.google.com/spreadsheets/d/e/2PACX-1vSOGAVK5grvuyC8eegeF4BwkJ8qhjTid9zS1cvMVMDyFOiAqGfTnTvzOkHHI5Y5cP1KnJ485TJ2PiV3/pub?gid=549861143&single=true&output=csv&t=${cacheBuster}`);
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header: string) => header.trim(),
          complete: (results) => {
            const validRows = (results.data || []).filter((row: any) => row && (row.Title || row.title));
            const parsedWebapps: Webapp[] = validRows.map((row: any, index: number) => {
              const isFeaturedVal = row.Is_Featured ?? row.is_featured ?? row.Featured ?? row.isFeatured ?? '';
              const isFeatured = String(isFeaturedVal).trim().toLowerCase() === 'true';

              return {
                id: String(index + 1).padStart(2, '0'),
                title: row.Title || row.title || '',
                category: row.Category || row.category || '',
                desc: row.Description || row.description || '',
                url: row.Link_URL || row.link_url || row.URL || row.url || '',
                image: row.Image_URL || row.image_url || row.Image || row.image || '',
                isFeatured
              };
            });
            setWebapps(parsedWebapps);
            setIsLoading(false);
          },
          error: (error) => {
            console.error("Error parsing CSV:", error);
            setIsLoading(false);
          }
        });
      } catch (error) {
        console.error("Error fetching webapps:", error);
        setIsLoading(false);
      }
    };
    
    fetchWebapps();
  }, []);

  // Prevent scrolling on body when modal is open
  useEffect(() => {
    if (isArchiveOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isArchiveOpen]);

  const featuredWebapps = webapps.filter(w => w.isFeatured);
  const displayWebapps = featuredWebapps.length > 0 ? featuredWebapps : webapps;

  return (
    <section id="webapps" ref={containerRef} className="relative h-[400vh] bg-darker z-10">
      <div className="sticky top-0 h-[100dvh] flex flex-col justify-center overflow-hidden py-10 md:py-20">
        {/* Sticky Header */}
        <div className="max-w-7xl mx-auto px-6 w-full mb-6 md:mb-12 flex-shrink-0">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8"
          >
            <div>
              <h2 className="text-4xl md:text-7xl font-display font-bold uppercase tracking-tighter text-white leading-none">
                Live <span className="text-orange-500 block md:inline">Webapps</span>
              </h2>
              <div className="w-full h-[1px] bg-white/10 mt-6 md:hidden" />
            </div>
            
            <div className="flex flex-col md:items-end gap-4 md:gap-6">
              <p className="text-white/50 max-w-sm font-light text-sm md:text-base md:text-right hidden lg:block">
                {unescapeText(content.webapps_subhead)}
              </p>
              <button 
                onClick={() => setIsArchiveOpen(true)} 
                className="hover-target inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white/5 hover:bg-orange-500 text-orange-500 hover:text-white text-sm font-medium rounded-full transition-colors duration-300 border border-white/10 hover:border-orange-500 group"
              >
                <span>View All Webapps</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </motion.div>
          <div className="hidden md:block w-full h-[1px] bg-white/10 mt-8" />
        </div>

        {/* Stacking Cards Container */}
        <div className="relative w-full h-[55vh] max-h-[450px] md:max-h-[700px] md:h-[65vh] mt-8 px-6 lg:px-[10vw]">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : displayWebapps.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 border border-white/10 rounded-2xl bg-white/5">
              <p className="text-white/60 text-lg mb-2">No webapps found in spreadsheet.</p>
              <p className="text-white/40 text-sm">Please verify your published Google Sheet webapps tab.</p>
            </div>
          ) : (
            displayWebapps.map((webapp, i) => (
              <WebappCard 
                key={webapp.id} 
                webapp={webapp} 
                index={i} 
                progress={scrollYProgress} 
                total={displayWebapps.length} 
              />
            ))
          )}
        </div>

        {/* Scroll Progress Indicator */}
        <div className="absolute bottom-6 md:bottom-10 left-6 right-6 lg:left-[10vw] lg:right-[10vw] h-[2px] bg-white/10 max-w-7xl mx-auto">
          <motion.div 
            className="h-full bg-orange-500 origin-left"
            style={{ scaleX: scrollYProgress }}
          />
        </div>
      </div>

      {/* Full-Screen Webapp Archive Overlay */}
      <AnimatePresence>
        {isArchiveOpen && (
          <motion.div 
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[110] bg-darker overflow-y-auto"
          >
            <div className="min-h-screen p-6 md:p-12 lg:p-20 max-w-[1600px] mx-auto">
              <div className="flex items-center justify-between mb-16 md:mb-24">
                <div>
                  <h2 className="text-4xl md:text-7xl font-display font-bold uppercase tracking-tighter text-white leading-none">
                    Webapp <span className="text-orange-500">Archive</span>
                  </h2>
                  <p className="text-white/50 mt-4 max-w-xl font-light">
                    A comprehensive catalog of my deployed applications and experiments.
                  </p>
                </div>
                <button 
                  onClick={() => setIsArchiveOpen(false)}
                  className="hover-target w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-orange-500 hover:border-orange-500 transition-colors shrink-0"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-12">
                {isLoading ? (
                  <div className="col-span-full py-20 flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                  </div>
                ) : (
                  webapps.map((webapp, idx) => (
                    <a 
                      key={`${webapp.id}-${idx}`} 
                      href={webapp.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group block"
                    >
                      <div className="aspect-[4/3] rounded-xl overflow-hidden mb-6 relative border border-white/5 bg-dark-surface">
                        <img src={webapp.image} alt={webapp.title} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-surface/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <div className="w-16 h-16 rounded-full bg-orange-500 text-white flex items-center justify-center translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-orange-500 font-mono text-xs uppercase tracking-widest">{webapp.category}</span>
                      </div>
                      <h3 className="text-2xl font-display font-bold text-white mb-3 group-hover:text-orange-400 transition-colors">{webapp.title}</h3>
                      <p className="text-white/50 font-light text-sm line-clamp-2">{unescapeText(webapp.desc)}</p>
                    </a>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
