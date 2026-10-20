import { motion, useInView, AnimatePresence } from 'motion/react';
import { useRef, useState, useEffect, Dispatch, SetStateAction } from 'react';
import Papa from 'papaparse';

export interface Blog {
  id: string;
  title: string;
  date: string;
  readTime: string;
  desc: string;
  link: string;
  image: string;
}

function BlogItem({ 
  blog, 
  index, 
  setActiveIndex 
}: { 
  blog: Blog; 
  index: number; 
  setActiveIndex: Dispatch<SetStateAction<number>> 
}) {
  const ref = useRef(null);
  
  // margin "-50%" triggers when the item crosses the exact vertical center of the screen
  const isInView = useInView(ref, { margin: "-50% 0px -50% 0px" });

  useEffect(() => {
    if (isInView) {
      setActiveIndex(index);
    }
  }, [isInView, index, setActiveIndex]);

  return (
    <div ref={ref} className="py-12 md:py-32 border-b border-white/10 group">
       {/* Mobile Image Layer */}
       <div className="md:hidden w-full aspect-[4/3] rounded-2xl overflow-hidden mb-8 relative border border-white/10">
          <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-darker/20" />
       </div>
       
       <div className="flex gap-4 items-center mb-6 text-orange-500 font-mono text-xs md:text-sm uppercase tracking-widest">
         <span>{blog.date}</span>
         <span className="text-white/30">//</span>
         <span>{blog.readTime}</span>
       </div>
       
       <h3 className="text-3xl md:text-5xl font-display font-bold text-white mb-6 md:mb-8 group-hover:text-orange-400 transition-colors duration-500 leading-tight">
         {blog.title}
       </h3>
       
       <p className="text-white/60 text-base md:text-lg font-light leading-relaxed mb-8 md:mb-10 max-w-xl">
         {blog.desc}
       </p>
       
       <a 
         href={blog.link} 
         target="_blank" 
         rel="noreferrer" 
         className="hover-target inline-flex items-center gap-3 text-white hover:text-orange-500 transition-colors uppercase tracking-widest text-xs md:text-sm font-bold group/btn"
        >
          Read on Medium
          <span className="relative flex items-center justify-center w-8 h-8 rounded-full border border-white/20 group-hover/btn:border-orange-500 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform">
               <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
       </a>
    </div>
  );
}

export default function Blogs() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const cacheBuster = new Date().getTime();
        const response = await fetch(`https://docs.google.com/spreadsheets/d/e/2PACX-1vSOGAVK5grvuyC8eegeF4BwkJ8qhjTid9zS1cvMVMDyFOiAqGfTnTvzOkHHI5Y5cP1KnJ485TJ2PiV3/pub?gid=665088375&single=true&output=csv&t=${cacheBuster}`);
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsedBlogs: Blog[] = results.data.map((row: any, index: number) => ({
              id: String(index).padStart(2, '0'),
              title: row.Title,
              date: row.Date,
              readTime: row.Read_Time,
              desc: row.Description,
              link: row.Link_URL,
              image: row.Image_URL
            }));
            
            setBlogs(parsedBlogs);
            setIsLoading(false);
          },
          error: (error) => {
            console.error("Error parsing CSV:", error);
            setIsLoading(false);
          }
        });
      } catch (error) {
        console.error("Error fetching blogs:", error);
        setIsLoading(false);
      }
    };
    
    fetchBlogs();
  }, []);

  return (
    <section id="blogs" className="relative z-10 bg-darker pb-20">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row gap-12 lg:gap-24">
        
        {/* Left Side: Sticky Visual Anchor (Desktop Only) */}
        <div className="w-full md:w-1/2 md:sticky md:top-0 md:h-screen pt-24 md:pt-0 flex flex-col justify-center relative">
           <motion.div 
             initial={{ opacity: 0, y: 50 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true, margin: "-20%" }}
             className="mb-12"
           >
             <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold uppercase tracking-tighter text-white mb-6 leading-none">
                Featured <span className="text-orange-500 block">Blogs</span>
             </h2>
           </motion.div>
           
           {/* Crossfading Image Frame */}
           <div className="hidden md:block w-full max-w-md aspect-[4/5] relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-dark-surface/50">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                </div>
              ) : blogs.length > 0 ? (
                <AnimatePresence mode="wait">
                   <motion.img 
                     key={activeIndex}
                     src={blogs[activeIndex]?.image}
                     initial={{ opacity: 0, scale: 1.05 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0 }}
                     transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                     className="absolute inset-0 w-full h-full object-cover"
                   />
                </AnimatePresence>
              ) : (
                <div className="absolute inset-0 bg-dark-surface/50" />
              )}
              <div className="absolute inset-0 bg-darker/20" />
           </div>
        </div>

        {/* Right Side: Scrolling Article List */}
        <div className="w-full md:w-1/2 md:pt-[25vh] md:pb-[30vh]">
           {isLoading ? (
              <div className="py-20 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
              </div>
           ) : (
             blogs.map((blog, i) => (
               <BlogItem 
                 key={blog.id} 
                 blog={blog} 
                 index={i} 
                 setActiveIndex={setActiveIndex} 
               />
             ))
           )}
        </div>

      </div>
    </section>
  );
}
