import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { useContent } from '../contexts/ContentContext';

export default function Contact() {
  const containerRef = useRef(null);
  const content = useContent();
  const isInView = useInView(containerRef, { once: true, margin: "-20%" });

  return (
    <section id="contact" className="py-32 md:py-48 relative z-10 bg-darker overflow-hidden" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center text-center relative z-10"
        >
          <h2 className="text-xs md:text-sm text-orange-500 font-mono uppercase tracking-[0.3em] mb-8 md:mb-12">
            Ready to automate your workflows?
          </h2>
          
          <a href={`mailto:${content.contact_email}`} className="group inline-block relative hover-target">
            <h3 className="text-[11vw] sm:text-[9vw] md:text-[8vw] lg:text-[7vw] font-display font-black uppercase tracking-tighter text-white leading-tight md:leading-none transition-transform duration-500 group-hover:scale-105 flex flex-col md:block items-center text-center">
              <span>LET'S</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">CONNECT</span>
            </h3>
            <div className="absolute -bottom-2 md:-bottom-8 left-0 w-full h-[2px] md:h-[4px] bg-white/10 origin-left">
              <div className="w-full h-full bg-orange-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out origin-left" />
            </div>
          </a>
          
          <div className="mt-24 md:mt-32 w-full grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 border-t border-white/10 pt-16">
            <div className="flex flex-col items-center md:items-start gap-4">
              <span className="text-white/40 uppercase tracking-widest text-[10px] md:text-xs font-bold">Email</span>
              <a href={`mailto:${content.contact_email}`} className="text-lg md:text-2xl font-medium text-white hover:text-orange-500 transition-colors hover-target relative group">
                {content.contact_email}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-orange-500 group-hover:w-full transition-all duration-300 ease-out" />
              </a>
            </div>
            
            <div className="flex flex-col items-center md:items-start gap-4">
              <span className="text-white/40 uppercase tracking-widest text-[10px] md:text-xs font-bold">Location</span>
              <p className="text-lg md:text-2xl font-medium text-white">
                Available Worldwide
              </p>
            </div>
            
            <div className="flex flex-col items-center md:items-start gap-4">
              <span className="text-white/40 uppercase tracking-widest text-[10px] md:text-xs font-bold">Socials</span>
              <div className="flex gap-6">
                {[
                  { name: 'LinkedIn', url: content.social_linkedin },
                  { name: 'GitHub', url: content.social_github },
                  { name: 'Medium', url: content.social_medium }
                ].map((social) => (
                  <a key={social.name} href={social.url} target="_blank" rel="noreferrer" className="text-lg md:text-2xl font-medium text-white hover:text-orange-500 transition-colors hover-target relative group">
                    {social.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-orange-500 group-hover:w-full transition-all duration-300 ease-out" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Massive background text for visual depth */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.02 } : { opacity: 0 }}
        transition={{ duration: 1.5, delay: 0.3 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex justify-center pointer-events-none z-0 select-none overflow-hidden"
      >
         <h1 className="text-[16vw] md:text-[15vw] lg:text-[14vw] font-display font-black text-white whitespace-nowrap tracking-tighter">
           HELLO
         </h1>
      </motion.div>
    </section>
  );
}
