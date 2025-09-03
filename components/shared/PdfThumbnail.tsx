"use client";

import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { FileText } from "lucide-react";

// Set up the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PdfThumbnailProps {
  url: string;
  className?: string;
}

export default function PdfThumbnail({ url, className = "" }: PdfThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const renderThumbnail = async () => {
      try {
        setIsLoading(true);
        setHasError(false);

        // Fetch the PDF as an ArrayBuffer to avoid CORS issues on some public links
        const response = await fetch(url, { mode: 'cors' });
        if (!response.ok) throw new Error('Failed to fetch PDF');
        const data = await response.arrayBuffer();

        const loadingTask = pdfjsLib.getDocument({ data });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);

        const viewport = page.getViewport({ scale: 0.8 });
        const canvas = canvasRef.current;

        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        };

        const renderTask = page.render(renderContext);
        await renderTask.promise;
        setIsLoading(false);
      } catch (error) {
        // console.error("Error rendering PDF thumbnail:", error);
        setHasError(true);
        setIsLoading(false);
      }
    };

    renderThumbnail();
  }, [url]);

  if (hasError) {
    return (
      <div className={`w-full h-full bg-gradient-to-br from-red-700 to-red-900 flex items-center justify-center ${className}`}>
        <FileText className="w-16 h-16 text-white opacity-80" />
        <div className="absolute bottom-4 left-4 text-white text-sm font-medium">PDF</div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
          <FileText className="w-16 h-16 text-white opacity-80" />
          <div className="absolute bottom-4 left-4 text-white text-sm font-medium">Loading PDF...</div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      />
      {!isLoading && !hasError && (
        <div className="absolute bottom-4 left-4 bg-black/70 text-white text-sm font-medium px-2 py-1 rounded">
          PDF
        </div>
      )}
    </div>
  );
}
