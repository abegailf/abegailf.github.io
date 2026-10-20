import { motion, useInView } from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import Papa from 'papaparse';
import { useContent } from '../contexts/ContentContext';
import { unescapeText } from '../lib/utils';

export interface WorkExperience {
  id: string;
  position: string;
  company: string;
  timeframe: string;
  employmentType?: string;
  workModel?: string;
  bullets: string[];
}

function WorkRow({ work, index }: { work: WorkExperience, index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="group border-t border-white/10 relative overflow-hidden"
    >
      {/* Animated background on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-out pointer-events-none" />
      
      <div className="py-12 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Column: Timeframe and Company */}
        <div className="md:col-span-4 flex flex-col md:pr-8 border-l-2 border-transparent group-hover:border-orange-500 transition-colors duration-300 pl-4 md:pl-6">
          <span className="text-orange-500 font-mono text-sm tracking-widest uppercase mb-2">
            {work.timeframe}
          </span>
          <h3 className="text-3xl md:text-4xl font-display font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-400 group-hover:to-orange-600 transition-all duration-300">
            {work.company}
          </h3>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {work.employmentType && (
              <span className="px-3 py-1 text-xs font-mono tracking-wider uppercase border border-white/20 rounded-full text-white/70 group-hover:border-orange-500/50 group-hover:text-orange-400 transition-colors duration-300">
                {work.employmentType}
              </span>
            )}
            {work.workModel && (
              <span className="px-3 py-1 text-xs font-mono tracking-wider uppercase border border-white/20 rounded-full text-white/70 group-hover:border-orange-500/50 group-hover:text-orange-400 transition-colors duration-300">
                {work.workModel}
              </span>
            )}
          </div>
        </div>
        
        {/* Right Column: Position and Details */}
        <div className="md:col-span-8 flex flex-col justify-center">
          <h4 className="text-2xl font-bold text-white mb-6 flex items-center gap-4">
            {work.position}
            <div className="h-[1px] flex-grow bg-white/10 group-hover:bg-orange-500/30 transition-colors duration-500" />
          </h4>
          <ul className="space-y-4">
            {work.bullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-4 text-white/70 font-light text-sm md:text-base leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                <span className="text-orange-500 mt-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

export default function Work() {
  const containerRef = useRef(null);
  const content = useContent();
  const isInView = useInView(containerRef, { once: true, margin: "-20%" });
  const [workExp, setWorkExp] = useState<WorkExperience[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWork = async () => {
      try {
        const cacheBuster = new Date().getTime();
        const response = await fetch(`https://docs.google.com/spreadsheets/d/e/2PACX-1vSOGAVK5grvuyC8eegeF4BwkJ8qhjTid9zS1cvMVMDyFOiAqGfTnTvzOkHHI5Y5cP1KnJ485TJ2PiV3/pub?gid=1014954912&single=true&output=csv&t=${cacheBuster}`);
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header: string) => header.trim(),
          complete: (results) => {
            const parsedWork: WorkExperience[] = results.data.map((row: any, index: number) => ({
              id: String(index + 1).padStart(2, '0'),
              position: row.Position || row.position || '',
              company: row.Company || row.company || '',
              timeframe: row.Timeframe || row.timeframe || '',
              employmentType: row.Employment_Type || row.EmploymentType || row['Employment Type'] || undefined,
              workModel: row.Work_Model || row.WorkModel || row['Work Model'] || undefined,
              bullets: row.Bullets 
                ? unescapeText(row.Bullets)
                    .split('\n')
                    .map((b: string) => b.trim())
                    .filter((b: string) => b.length > 0)
                    .map((b: string) => b.replace(/^[•\-\*]\s*/, ''))
                : []
            }));
            setWorkExp(parsedWork);
            setIsLoading(false);
          },
          error: (error) => {
            console.error("Error parsing CSV:", error);
            setIsLoading(false);
          }
        });
      } catch (error) {
        console.error("Error fetching work experience:", error);
        setIsLoading(false);
      }
    };
    
    fetchWork();
  }, []);

  return (
    <section id="work" className="py-32 relative z-10 bg-darker" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-20"
        >
          <h2 className="text-5xl md:text-7xl font-display font-bold uppercase tracking-tighter text-white">
            Work <span className="text-orange-500">Experience</span>
          </h2>
        </motion.div>

        <div className="flex flex-col border-b border-white/10 min-h-[300px]">
          {isLoading ? (
            <div className="w-full py-20 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            workExp.map((work, index) => (
              <WorkRow key={work.id} work={work} index={index} />
            ))
          )}
        </div>
        
        {content.resume_link && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-16 flex justify-center"
          >
            <a href={content.resume_link} target={content.resume_link !== '#' ? "_blank" : undefined} rel={content.resume_link !== '#' ? "noreferrer" : undefined} className="hover-target inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border border-white/20 hover:border-orange-500 text-white font-medium rounded-full overflow-hidden relative group transition-colors">
              <span className="absolute inset-0 bg-orange-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors">
                Download Resume
              </span>
            </a>
          </motion.div>
        )}
      </div>
    </section>
  );
}
