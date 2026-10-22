import CustomCursor from './components/CustomCursor';
import Background3D from './components/Background3D';
import Header from './components/Header';
import Hero from './components/Hero';
import Work from './components/Work';
import Projects from './components/Projects';
import Contact from './components/Contact';
import { useContent } from './contexts/ContentContext';
import { Analytics } from '@vercel/analytics/react';

export default function App() {
  const content = useContent();
  
  return (
    <main className="relative w-full min-h-screen bg-darker selection:bg-orange-500 selection:text-darker font-sans text-white">
      {/* Vercel Web Analytics */}
      <Analytics />

      {/* Global Noise Overlay */}
      <div className="noise" />
      
      {/* Custom Cursor */}
      <div className="hidden lg:block">
        <CustomCursor />
      </div>

      {/* 3D Background */}
      <Background3D />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <Hero />
        <Projects />
        <Work />
        <Contact />
        
        {/* Footer */}
        <footer className="py-12 border-t border-white/10 bg-darker relative z-10">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-white/50 text-sm">{content.footer_text || `© ${new Date().getFullYear()} Abbey Fontanilla. All rights reserved.`}</p>
            <div className="flex gap-6">
              <a href={content.social_linkedin} target="_blank" rel="noreferrer" className="text-white/50 hover:text-orange-500 transition-colors text-sm font-medium hover-target">LinkedIn</a>
              <a href={content.social_github} target="_blank" rel="noreferrer" className="text-white/50 hover:text-orange-500 transition-colors text-sm font-medium hover-target">GitHub</a>
              <a href={content.social_medium} target="_blank" rel="noreferrer" className="text-white/50 hover:text-orange-500 transition-colors text-sm font-medium hover-target">Medium</a>
              <a href={`mailto:${content.contact_email}`} className="text-white/50 hover:text-orange-500 transition-colors text-sm font-medium hover-target">Email</a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
