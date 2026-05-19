"use client";

import { ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/ui/section-header";
import AlbumCard, { type SerializedAlbum } from "./AlbumCard";

export default function GalleryClient({ albums }: { albums: SerializedAlbum[] }) {
  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          title="Gallery"
          subtitle="Moments from our events & activities"
          align="center"
        />

        {albums.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <ImageIcon className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No galleries yet</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            {albums.map((album, i) => (
              <AlbumCard key={album.id} album={album} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
