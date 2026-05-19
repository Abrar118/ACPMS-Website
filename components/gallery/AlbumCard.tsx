"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ImageIcon } from "lucide-react";
import { motion } from "framer-motion";

export type SerializedAlbum = {
  id: string;
  title: string;
  description: string | null;
  event_id: string | null;
  cover_image: string | null;
  is_published: boolean;
  display_order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  images: SerializedGalleryImage[];
};

export type SerializedGalleryImage = {
  id: string;
  album_id: string;
  image_url: string;
  caption: string | null;
  display_order: number;
  created_at: string;
};

export default function AlbumCard({
  album,
  index = 0,
}: {
  album: SerializedAlbum;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/gallery/${album.id}`}>
        <div className="group relative rounded-2xl overflow-hidden border border-border dark:border-white/[0.08] hover:border-white/[0.15] transition-all duration-300 cursor-pointer">
          <div className="relative h-56 md:h-64">
            {album.cover_image ? (
              <Image
                src={album.cover_image}
                alt={album.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : album.images.length > 0 ? (
              <Image
                src={album.images[0].image_url}
                alt={album.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h3 className="text-lg font-semibold text-white mb-1">{album.title}</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/70">
                {album.images.length} {album.images.length === 1 ? "photo" : "photos"}
              </span>
              {album.event_id && (
                <Badge className="bg-white/20 text-white/90 border-white/20 text-xs">
                  Event
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
