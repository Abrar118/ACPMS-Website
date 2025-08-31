'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ViewerModalProps {
  state: boolean;
  setState: (state: boolean) => void;
  link: string;
}

export default function ViewerModal({ state, setState, link }: ViewerModalProps) {
  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setState(false);
      }
    };

    if (state) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [state, setState]);

  if (!state) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => setState(false)}
      />
      
      {/* Modal Content */}
      <div className="relative z-50 w-[95vw] h-[95vh] sm:w-[90vw] sm:h-[90vh] md:w-[85vw] md:h-[85vh] lg:w-[80vw] lg:h-[80vh] max-w-7xl max-h-[90vh] bg-card border border-border rounded-lg shadow-2xl">
        {/* Close Button */}
        <button
          onClick={() => setState(false)}
          className="absolute top-4 right-4 z-10 p-2 rounded-md hover:bg-accent transition-colors duration-200 group"
          aria-label="Close modal"
        >
          <X className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
        </button>

        {/* Iframe Container */}
        <div className="w-full h-full p-6 pt-16">
          <iframe
            src={link}
            title="Content Viewer"
            className="w-full h-full rounded-md border border-border"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
