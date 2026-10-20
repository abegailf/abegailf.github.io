import { motion, useMotionValue, useSpring, useTransform, useScroll, MotionValue, AnimatePresence } from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import Papa from 'papaparse';
import { useContent } from '../contexts/ContentContext';
import { unescapeText } from '../lib/utils';

export interface ProjectLinks {
  tableau?: string;
  video?: string;
  pdf?: string;
  github?: string;
}

export interface Project {
  id: number;
  title: string;
  category: string;
  desc: string;
  longDesc?: string;
  image: string;
  links?: ProjectLinks;
  tech: string[];
  isFeatured: boolean;
}

// Vertical Full-Bleed Cinematic Card
function ProjectCard({ 
  project, 
  index, 
  progress, 
  total, 
  onClick 
}: { 
  project: Project; 
  index: number; 
  progress: MotionValue<number>; 
  total: number; 
  onClick: () => void; 
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const step = 1 / total;
  // Vertical sliding motion: card 0 starts at center; subsequent cards slide in from bottom (100vh -> 0vh)
  const yRange = index === 0 ? [0, 1] : [(index - 1) * step, index * step];
  const yOutput = index === 0 ? ["0vh", "0vh"] : ["100vh", "0vh"];
  const y = useTransform(progress, yRange, yOutput, { clamp: true });

  // When covered by the next card, scale down slightly and smoothly fade to 0 opacity
  const coverRange = [index * step, (index + 0.85) * step];
  const scale = useTransform(progress, coverRange, [1, 0.94], { clamp: true });
  const opacity = useTransform(progress, coverRange, [1, 0], { clamp: true });

  // 3D Tilt Effect
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const rotateX = useTransform(mouseY, [0, 1], [8, -8]);
  const rotateY = useTransform(mouseX, [0, 1], [-8, 8]);
  const smoothRotateX = useSpring(rotateX, { damping: 30, stiffness: 400, mass: 0.5 });
  const smoothRotateY = useSpring(rotateY, { damping: 30, stiffness: 400, mass: 0.5 });

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

  return (
    <motion.div
      style={{ y, scale, opacity, perspective: 1200, zIndex: index + 1 }}
      className="absolute inset-0 flex items-center justify-center origin-center pointer-events-none"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        style={{
          rotateX: smoothRotateX,
          rotateY: smoothRotateY,
          transformStyle: "preserve-3d"
        }}
        className="w-full h-full max-w-6xl max-h-[620px] relative rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 bg-[#080808] shadow-2xl cursor-pointer group pointer-events-auto flex flex-col justify-end"
      >
        {/* Solid Opaque Base to completely block any underlying elements */}
        <div className="absolute inset-0 bg-[#080808] z-0" />

        {/* 3D Background Layer with strong legibility overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105 z-0"
          style={{ 
            backgroundImage: `url(${project.image})`,
            transform: "translateZ(-50px) scale(1.1)" 
          }}
        >
          {/* Deep dark gradient so bright background text never clashes with typography */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/95 to-[#080808]/80 group-hover:via-[#080808]/90 transition-colors duration-500" />
        </div>

        {/* 3D Content Layer */}
        <div 
          className="relative z-10 p-6 sm:p-8 md:p-12 lg:p-14 flex flex-col justify-end" 
          style={{ transform: "translateZ(60px)" }}
        >
          <div className="max-w-3xl">
            <p className="text-orange-500 font-mono text-xs sm:text-sm uppercase tracking-widest mb-2.5 drop-shadow-md">
              {String(index + 1).padStart(2, '0')} // {project.category}
            </p>
            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-3 sm:mb-4 leading-tight drop-shadow-xl group-hover:text-orange-400 transition-colors">
              {project.title}
            </h3>
            
            <p className="text-white/80 font-light text-xs sm:text-sm md:text-base mb-4 sm:mb-5 line-clamp-2 sm:line-clamp-3 leading-relaxed drop-shadow-sm max-w-2xl">
              {unescapeText(project.desc)}
            </p>

            {project.tech && project.tech.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-5 sm:mb-6">
                {project.tech.slice(0, 5).map((tech) => (
                  <span key={tech} className="px-2.5 sm:px-3 py-0.5 sm:py-1 bg-white/10 border border-white/15 rounded-full text-[11px] sm:text-xs text-white/85 font-mono backdrop-blur-xs">
                    {tech}
                  </span>
                ))}
              </div>
            )}

            <div className="inline-flex items-center gap-2.5 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-full transition-all group-hover:scale-105 shadow-lg shadow-orange-500/25 whitespace-nowrap">
              <span>View Project Details</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" />
              </svg>
            </div>
          </div>
        </div>

        {/* Ambient Corner Accent */}
        <div 
          className="absolute top-0 right-0 w-32 h-32 bg-orange-500/15 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" 
          style={{ transform: "translateZ(40px)" }}
        />
      </motion.div>
    </motion.div>
  );
}

// Dedicated Final "Archive Deck" Slide
function ArchiveCard({
  totalProjects,
  index,
  progress,
  total,
  onOpenArchive
}: {
  totalProjects: number;
  index: number;
  progress: MotionValue<number>;
  total: number;
  onOpenArchive: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const step = 1 / total;
  const enterStart = (index - 1) * step;
  const enterEnd = index * step;

  // Vertical sliding motion: slides up as user finishes the featured projects
  const y = useTransform(progress, [enterStart, enterEnd], ["100vh", "0vh"], { clamp: true });

  // It is the final card, so it scales up to 1 and stays fully opaque
  const scale = useTransform(progress, [enterStart, enterEnd], [0.94, 1], { clamp: true });
  const opacity = useTransform(progress, [enterStart, enterEnd], [0, 1], { clamp: true });

  // 3D Tilt Effect
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const rotateX = useTransform(mouseY, [0, 1], [8, -8]);
  const rotateY = useTransform(mouseX, [0, 1], [-8, 8]);
  const smoothRotateX = useSpring(rotateX, { damping: 30, stiffness: 400, mass: 0.5 });
  const smoothRotateY = useSpring(rotateY, { damping: 30, stiffness: 400, mass: 0.5 });

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

  return (
    <motion.div
      style={{ y, scale, opacity, perspective: 1200, zIndex: index + 1 }}
      className="absolute inset-0 flex items-center justify-center origin-center pointer-events-none"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onOpenArchive}
        style={{
          rotateX: smoothRotateX,
          rotateY: smoothRotateY,
          transformStyle: "preserve-3d"
        }}
        className="w-full h-full max-w-6xl max-h-[620px] relative rounded-2xl md:rounded-3xl overflow-hidden border border-orange-500/30 bg-[#080808] shadow-2xl shadow-orange-500/10 cursor-pointer group pointer-events-auto flex flex-col justify-between p-8 sm:p-12 md:p-16"
      >
        {/* Solid Opaque Base to completely block previous cards */}
        <div className="absolute inset-0 bg-[#080808] z-0" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#141414] via-[#080808] to-[#141414] z-0" />

        {/* Ambient Glowing Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-500/15 via-transparent to-transparent pointer-events-none z-0" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-orange-500/10 blur-3xl rounded-full pointer-events-none z-0" />

        {/* Top Metadata */}
        <div 
          className="relative z-10 flex items-center justify-between"
          style={{ transform: "translateZ(40px)" }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-orange-400 font-mono text-xs uppercase tracking-widest font-semibold">
              Complete Catalog // {totalProjects} Projects
            </span>
          </div>

          <span className="text-white/40 font-mono text-xs hidden sm:block">
            ARCHIVE // 0{index + 1}
          </span>
        </div>

        {/* Central Content */}
        <div 
          className="relative z-10 max-w-3xl my-auto py-4"
          style={{ transform: "translateZ(60px)" }}
        >
          <h3 className="text-3xl sm:text-5xl md:text-6xl font-display font-bold text-white mb-4 leading-tight">
            Explore All <span className="text-orange-500">{totalProjects} Projects</span> in the Full Archive
          </h3>

          <p className="text-white/70 font-light text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mb-8">
            Filter, search, and inspect the complete catalog of workflow automations, agentic frameworks, and quantitative systems.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={onOpenArchive}
              className="inline-flex items-center gap-3 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm sm:text-base uppercase tracking-wider rounded-full shadow-lg shadow-orange-500/30 transition-all duration-300 group-hover:scale-105 cursor-pointer"
            >
              <span>Open Project Archive Drawer</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" />
              </svg>
            </button>
          </div>
        </div>

        {/* Bottom Categories Preview */}
        <div 
          className="relative z-10 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-white/50"
          style={{ transform: "translateZ(30px)" }}
        >
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">Workflow & Process Automation</span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">AI Agent Workflows</span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">Quantitative Analytics & Modeling</span>
          </div>

          <span className="text-orange-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
            Click to view all →
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Helper function to parse and render inline markdown links [Label](URL)
function renderTextWithLinks(text: string) {
  const regex = /\[(.*?)\]\((https?:\/\/[^\s)]+)\)/g;
  const elements: (string | React.ReactNode)[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(text.substring(lastIndex, match.index));
    }

    const label = match[1];
    const url = match[2];

    elements.push(
      <a
        key={match.index}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-0.5 my-0.5 mx-1 rounded-full bg-orange-500/10 hover:bg-orange-500 text-orange-400 hover:text-white border border-orange-500/30 hover:border-orange-500 text-xs font-semibold tracking-wide transition-all duration-200 align-middle shadow-xs hover:shadow-orange-500/20 hover:scale-105"
      >
        <span>{label}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </a>
    );

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    elements.push(text.substring(lastIndex));
  }

  return elements;
}

export default function Projects() {
  const content = useContent();
  const targetRef = useRef<HTMLDivElement>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSOGAVK5grvuyC8eegeF4BwkJ8qhjTid9zS1cvMVMDyFOiAqGfTnTvzOkHHI5Y5cP1KnJ485TJ2PiV3/pub?gid=0&single=true&output=csv";
        const cacheBuster = new Date().getTime();
        const response = await fetch(`${csvUrl}&t=${cacheBuster}`);
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header: string) => header.trim(),
          complete: (results) => {
            const validRows = (results.data || []).filter((row: any) => row && (row.Title || row.title));
            const parsedProjects: Project[] = validRows.map((row: any, index: number) => {
              const rawTech = row.Tech_Stack || row.tech_stack || row.Tech || row.tech || '';
              const techList = rawTech 
                ? String(rawTech).split(',').map((t: string) => t.trim()).filter(Boolean)
                : [];

              const isFeaturedVal = row.Is_Featured ?? row.is_featured ?? row.Featured ?? row.isFeatured ?? '';
              const isFeatured = String(isFeaturedVal).trim().toLowerCase() === 'true';

              const links: ProjectLinks = {
                tableau: row.Tableau_URL || row.tableau_url || row.Tableau || row.tableau || undefined,
                video: row.Video_URL || row.video_url || row.Video || row.video || undefined,
                pdf: row.PDF_URL || row.pdf_url || row.PDF || row.pdf || undefined,
                github: row.GitHub_URL || row.github_url || row.GitHub || row.github || undefined,
              };

              return {
                id: index + 1,
                title: row.Title || row.title || '',
                category: row.Category || row.category || '',
                desc: row.Description || row.description || '',
                longDesc: row.Long_Description || row.long_description || '',
                image: row.Image_URL || row.image_url || row.Image || row.image || '',
                links,
                tech: techList,
                isFeatured
              };
            });
            setProjects(parsedProjects);
            setIsLoading(false);
          },
          error: (error) => {
            console.error("Error parsing CSV:", error);
            setIsLoading(false);
          }
        });
      } catch (error) {
        console.error("Error fetching projects:", error);
        setIsLoading(false);
      }
    };
    
    fetchProjects();
  }, []);

  const featuredProjects = projects.filter(p => p.isFeatured);
  const displayProjects = featuredProjects.length > 0 ? featuredProjects : projects;
  const totalSlides = displayProjects.length + 1;
  
  // Prevent scrolling on body when modal is open
  useEffect(() => {
    if (selectedProject || isArchiveOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedProject, isArchiveOpen]);
  
  // Track scroll progress of the container
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"]
  });

  return (
    <>
      <section id="projects" ref={targetRef} className="relative h-[400vh] bg-darker z-10">
        <div className="sticky top-0 h-[100dvh] overflow-hidden flex flex-col justify-between py-6 md:py-8 bg-darker">
          {/* Header */}
          <div className="max-w-7xl mx-auto px-6 w-full flex-shrink-0 z-20 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold uppercase tracking-tight text-white leading-none">
                Featured <span className="text-orange-500">Projects</span>
              </h2>

              <p className="text-white/50 mt-2.5 max-w-2xl font-light text-xs sm:text-sm md:text-base leading-relaxed">
                {unescapeText(content.projects_subhead)}
              </p>
            </div>
            
            <div className="flex items-center gap-4 flex-shrink-0">
              <button 
                onClick={() => setIsArchiveOpen(true)}
                className="pointer-events-auto inline-flex items-center gap-2.5 px-5 sm:px-6 py-2.5 sm:py-3 bg-orange-500/10 hover:bg-orange-500 text-orange-400 hover:text-white border border-orange-500/30 hover:border-orange-500 rounded-full transition-all duration-300 shadow-md shadow-orange-500/10 group cursor-pointer whitespace-nowrap hover:scale-105"
              >
                <span className="text-xs sm:text-sm font-semibold tracking-wide">View All Projects ({projects.length})</span>
                <div className="w-6 h-6 rounded-full bg-orange-500/20 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" />
                  </svg>
                </div>
              </button>
            </div>
          </div>

          {/* Stacking Cards Container */}
          <div className="relative w-full flex-1 min-h-0 my-2 px-4 sm:px-6 md:px-12 flex items-center justify-center">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
              </div>
            ) : displayProjects.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 border border-white/10 rounded-2xl bg-white/5">
                <p className="text-white/60 text-lg mb-2">No projects found in spreadsheet.</p>
                <p className="text-white/40 text-sm">Please verify your published Google Sheet projects tab.</p>
              </div>
            ) : (
              <>
                {displayProjects.map((project, index) => (
                  <ProjectCard 
                    key={project.id} 
                    project={project} 
                    index={index} 
                    progress={scrollYProgress}
                    total={totalSlides}
                    onClick={() => setSelectedProject(project)}
                  />
                ))}
                <ArchiveCard 
                  totalProjects={projects.length}
                  index={displayProjects.length}
                  progress={scrollYProgress}
                  total={totalSlides}
                  onOpenArchive={() => setIsArchiveOpen(true)}
                />
              </>
            )}
          </div>
          
          {/* Scroll Progress Indicator */}
          <div className="w-full max-w-7xl mx-auto px-6 flex-shrink-0 z-20">
            <div className="h-[2px] bg-white/10 w-full rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-orange-500 origin-left"
                style={{ scaleX: scrollYProgress }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Project Detail Modal Overlay */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-darker/90 backdrop-blur-md p-4 md:p-12"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div 
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl bg-dark-surface border border-white/10 rounded-2xl overflow-y-auto md:overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
            >
              <button 
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/50 hover:bg-orange-500 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-md border border-white/10"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              {/* Left Side: Image */}
              <div className="w-full md:w-1/2 h-64 md:h-auto relative shrink-0">
                <img src={selectedProject.image} alt={selectedProject.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-surface to-transparent md:hidden" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-dark-surface hidden md:block" />
              </div>
              
              {/* Right Side: Content */}
              <div className="w-full md:w-1/2 p-6 md:p-10 pt-10 md:pt-12 flex flex-col justify-start md:overflow-y-auto">
                <span className="text-orange-500 font-mono text-sm uppercase tracking-widest mb-4 block mt-4 md:mt-0">
                  {selectedProject.category}
                </span>
                <h3 className="text-3xl md:text-5xl font-display font-bold text-white mb-6 leading-tight">
                  {selectedProject.title}
                </h3>
                
                <div className="space-y-3 text-white/80 font-light text-sm md:text-base leading-relaxed mb-8">
                  {unescapeText(selectedProject.longDesc || selectedProject.desc)
                    .split('\n')
                    .map((line) => line.trim())
                    .filter(Boolean)
                    .map((line, idx) => {
                      const isBullet = /^[•\-\*]\s*/.test(line);
                      const isHeader = line.endsWith(':') && line.length < 60;

                      if (isHeader) {
                        return (
                          <h4 key={idx} className="font-semibold text-orange-400 font-mono text-xs md:text-sm tracking-wider uppercase pt-4 pb-1">
                            {line}
                          </h4>
                        );
                      }

                      if (isBullet) {
                        const cleanLine = line.replace(/^[•\-\*]\s*/, '');
                        return (
                          <div key={idx} className="flex items-start gap-3 pl-2 py-0.5">
                            <span className="text-orange-500 mt-1.5 shrink-0 text-xs font-bold">•</span>
                            <span className="text-white/80 leading-relaxed">{renderTextWithLinks(cleanLine)}</span>
                          </div>
                        );
                      }

                      return (
                        <p key={idx} className="leading-relaxed text-white/70 mb-2">
                          {renderTextWithLinks(line)}
                        </p>
                      );
                    })}
                </div>
                
                <div className="flex flex-wrap gap-2 mb-8">
                  {(selectedProject.tech || []).map((tech) => (
                    <span key={tech} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/70 font-mono">
                      {tech}
                    </span>
                  ))}
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                  {/* Primary Live App / Dashboard / Demo Link */}
                  {selectedProject.links?.video ? (
                    <a href={selectedProject.links.video} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold uppercase tracking-widest rounded-full transition-colors w-max group hover-target">
                      <span>{selectedProject.links.video.includes('watch') || selectedProject.links.video.includes('canva') || selectedProject.links.video.includes('youtube') ? 'Watch Video Demo' : 'View Live Demo'}</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="group-hover:translate-x-1 transition-transform">
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </a>
                  ) : selectedProject.links?.tableau ? (
                    <a href={selectedProject.links.tableau} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold uppercase tracking-widest rounded-full transition-colors w-max group hover-target">
                      <span>View Dashboard</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="group-hover:translate-x-1 transition-transform">
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </a>
                  ) : selectedProject.links?.pdf ? (
                    <a href={selectedProject.links.pdf} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold uppercase tracking-widest rounded-full transition-colors w-max group hover-target">
                      <span>Read Report</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="group-hover:translate-x-1 transition-transform">
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </a>
                  ) : (
                    <a 
                      href={`mailto:abbeyfontanilla@gmail.com?subject=Architecture Walkthrough Request: ${encodeURIComponent(selectedProject.title)}`} 
                      className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold uppercase tracking-widest rounded-full transition-colors w-max group hover-target"
                    >
                      <span>Request Architecture Walkthrough</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="group-hover:translate-x-1 transition-transform">
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </a>
                  )}

                  {selectedProject.links?.github && (
                    <a href={selectedProject.links.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 text-white text-sm font-bold uppercase tracking-widest rounded-full border border-white/10 transition-colors w-max group hover-target">
                      <span>GitHub</span>
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-Screen Project Archive Overlay */}
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
                    Project <span className="text-orange-500">Archive</span>
                  </h2>
                  <p className="text-white/50 mt-4 max-w-xl font-light">
                    A comprehensive index of all operations automations, agentic workflows, and quantitative analytics projects.
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
                  projects.map((project) => (
                    <div 
                      key={project.id} 
                      onClick={() => {
                        setIsArchiveOpen(false);
                        setSelectedProject(project);
                      }}
                      className="group cursor-pointer"
                    >
                      <div className="aspect-[16/10] rounded-xl overflow-hidden mb-6 relative border border-white/5 bg-dark-surface">
                        <img src={project.image} alt={project.title} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-surface/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <div className="w-16 h-16 rounded-full bg-orange-500 text-white flex items-center justify-center translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-orange-500 font-mono text-xs uppercase tracking-widest">{project.category}</span>
                      </div>
                      <h3 className="text-2xl font-display font-bold text-white mb-3 group-hover:text-orange-400 transition-colors">{project.title}</h3>
                      <p className="text-white/50 font-light text-sm line-clamp-2">{unescapeText(project.desc)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
