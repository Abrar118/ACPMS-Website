"use client";

import { useState, useEffect } from "react";
import { X, Megaphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type SerializedAnnouncement = {
  id: string;
  title: string;
  body: string;
  priority: string;
  is_pinned: boolean;
  is_active: boolean;
  expires_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

const priorityStyles: Record<string, string> = {
  urgent: "bg-red-600 text-white",
  normal: "bg-primary text-primary-foreground",
  low: "bg-secondary text-secondary-foreground",
};

export default function AnnouncementBanner({
  announcement,
}: {
  announcement: SerializedAnnouncement | null;
}) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (!announcement) return;
    const key = `announcement-dismissed-${announcement.id}`;
    const wasDismissed = sessionStorage.getItem(key);
    setDismissed(!!wasDismissed);
  }, [announcement]);

  if (!announcement || dismissed) return null;

  const handleDismiss = () => {
    sessionStorage.setItem(`announcement-dismissed-${announcement.id}`, "true");
    setDismissed(true);
  };

  const style = priorityStyles[announcement.priority] || priorityStyles.normal;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={`${style} relative z-40`}
      >
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center gap-3">
          {announcement.priority === "urgent" && (
            <Megaphone className="h-4 w-4 shrink-0" />
          )}
          <p className="text-sm font-medium text-center">
            {announcement.title}
          </p>
          <button
            onClick={handleDismiss}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Dismiss announcement"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
