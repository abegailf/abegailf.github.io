import { createContext, useContext, useEffect, useState } from 'react';
import Papa from 'papaparse';

export interface SiteContent {
  hero_greeting: string;
  hero_headline_1: string;
  hero_headline_2: string;
  hero_top_label: string;
  hero_subhead: string;
  projects_subhead: string;
  webapps_subhead: string;
  contact_email: string;
  resume_link: string;
  footer_text: string;
  social_linkedin: string;
  social_github: string;
  social_medium: string;
  [key: string]: string; // Fallback for any extra keys
}

const emptyContent: SiteContent = {
  hero_greeting: "",
  hero_headline_1: "",
  hero_headline_2: "",
  hero_top_label: "",
  hero_subhead: "",
  projects_subhead: "",
  webapps_subhead: "",
  contact_email: "",
  resume_link: "",
  footer_text: "",
  social_linkedin: "",
  social_github: "",
  social_medium: "",
};

const ContentContext = createContext<SiteContent>(emptyContent);

export const useContent = () => useContext(ContentContext);

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<SiteContent>(emptyContent);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSOGAVK5grvuyC8eegeF4BwkJ8qhjTid9zS1cvMVMDyFOiAqGfTnTvzOkHHI5Y5cP1KnJ485TJ2PiV3/pub?gid=216478782&single=true&output=csv";
        const cacheBuster = new Date().getTime();
        const response = await fetch(`${csvUrl}&t=${cacheBuster}`);
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const newContent: SiteContent = { ...emptyContent };
            results.data.forEach((row: any) => {
              if (row.Key && row.Value) {
                let value = row.Value.trim();

                // Automatically ensure protocols on external URLs
                if ((row.Key.startsWith('social_') || row.Key === 'resume_link') && 
                    value !== '#' && 
                    !value.startsWith('http') && 
                    !value.startsWith('mailto:') &&
                    !value.startsWith('/')) {
                  value = `https://${value}`;
                }
                
                newContent[row.Key as keyof SiteContent] = value;
              }
            });
            setContent(newContent);
          },
          error: (error) => {
            console.error("Error parsing content CSV:", error);
          }
        });
      } catch (error) {
        console.error("Error fetching content:", error);
      }
    };
    
    fetchContent();
  }, []);

  return (
    <ContentContext.Provider value={content}>
      {children}
    </ContentContext.Provider>
  );
}
