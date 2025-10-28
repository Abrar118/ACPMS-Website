"use client";

import { cn } from "@/utils/cn";
import React from "react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import {
  IconArrowWaveRightUp,
  IconBoxAlignRightFilled,
  IconBoxAlignTopLeft,
  IconClipboardCopy,
  IconFileBroken,
  IconSignature,
  IconTableColumn,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import useSupabaseBrowser from "@/utils/supabase/supabase-browser";
import { getHighlights } from "@/queries/events";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { MinimalTiptapEditor } from "../ui/minimal-tiptap";
import { JSONContent } from "@tiptap/react";
import dynamic from "next/dynamic";
import { EResourceType } from "../shared/enums";
import { Calendar, BookOpen, FileText } from "lucide-react";

export default function BentoGridDemo() {
  const supabase = useSupabaseBrowser();
  const PdfThumbnail = dynamic(
    () => import("@/components/client-only/PdfThumbnail"),
    { ssr: false }
  );

  const {
    data: highlights,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["highlights"],
    queryFn: () => getHighlights(supabase),
  });

  if (isLoading) {
    return (
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            From the Club
          </h2>
          <BentoGrid className="max-w-4xl mx-auto">
            {[...Array(3)].map((_, i) => (
              <BentoGridItem
                key={i}
                title=""
                description=""
                header={<Skeleton />}
                className={i === 0 || i === 1 || i === 2 ? "md:col-span-1" : ""}
              />
            ))}
          </BentoGrid>
        </div>
      </section>
    );
  }

  if (error || !highlights) {
    return (
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            From the Club
          </h2>
          <div className="text-center">
            <p className="text-gray-400">
              Unable to load highlights at the moment.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const items = [];

  if (highlights.event) {
    items.push({
      title: "Latest Event",
      description: (
        <>
          <h3 className="text-xl font-bold mb-2">
            {highlights.event.title}
          </h3>
          <div className="text-gray-600 line-clamp-2">
            <MinimalTiptapEditor
              value={highlights.event.description as JSONContent}
              output="text"
              editable={false}
              hideToolbar={true}
            />
          </div>
          <Button asChild className="mt-4">
            <Link href={`/events/${highlights.event.id}`}>Learn More</Link>
          </Button>
        </>
      ),
      header: (
        <div className="relative h-full w-full overflow-hidden rounded-lg">
          {highlights.event.poster_url ? (
            <Image
              src={highlights.event.poster_url}
              alt={highlights.event.title}
              fill
              className="object-cover transition-transform duration-300 hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
              <Calendar className="w-16 h-16 text-primary opacity-50" />
            </div>
          )}
        </div>
      ),
      className: "md:col-span-1",
    });
  }

  if (highlights.resource) {
    items.push({
      title: "Most Popular Resource",
      description: (
        <>
          <h3 className="text-xl font-bold mb-2">
            {highlights.resource.title}
          </h3>
          <p className="text-gray-600 line-clamp-2">
            {highlights.resource.description}
          </p>
          <Button asChild className="mt-4">
            <Link href={`/resources/${highlights.resource.id}`}>Learn More</Link>
          </Button>
        </>
      ),
      header: (
        <div className="relative h-full w-full overflow-hidden rounded-lg">
          {highlights.resource.resource_url ? (
            (() => {
              const url = highlights.resource.resource_url;
              const isYoutube =
                url.includes("youtube.com") || url.includes("youtu.be");
              const isPdf =
                highlights.resource.resource_type === EResourceType.Pdf;
              const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);

              if (isYoutube) {
                let videoId = "";
                if (url.includes("youtu.be/")) {
                  videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
                } else if (url.includes("youtube.com/embed/")) {
                  videoId = url.split("embed/")[1]?.split("?")[0] || "";
                }
                const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                return (
                  <div className="relative w-full h-full">
                    <Image
                      src={thumbnailUrl}
                      alt={highlights.resource.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                );
              } else if (isPdf) {
                return <PdfThumbnail url={url} className="w-full h-full" />;
              } else if (isImage) {
                return (
                  <Image
                    src={url}
                    alt={highlights.resource.title}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-110"
                  />
                );
              } else {
                return (
                  <Image
                    src={url}
                    alt={highlights.resource.title}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                );
              }
            })()
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-accent/20 to-accent/40 flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-accent-foreground opacity-50" />
            </div>
          )}
        </div>
      ),
      className: "md:col-span-1",
    });
  }

  if (highlights.magazine) {
    items.push({
      title: "Latest Magazine",
      description: (
        <>
          <h3 className="text-xl font-bold mb-2">
            {highlights.magazine.title}
          </h3>
          <p className="text-gray-600 line-clamp-2">
            {highlights.magazine.summary}
          </p>
          <Button asChild className="mt-4">
            <Link href={`/magazine/${highlights.magazine.id}`}>Learn More</Link>
          </Button>
        </>
      ),
      header: (
        <div className="relative h-full w-full overflow-hidden rounded-lg">
          {highlights.magazine.cover_image ? (
            <Image
              src={highlights.magazine.cover_image}
              alt={highlights.magazine.title}
              fill
              className="object-cover transition-transform duration-300 hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-secondary/20 to-secondary/40 flex items-center justify-center">
              <FileText className="w-16 h-16 text-secondary-foreground opacity-50" />
            </div>
          )}
        </div>
      ),
      className: "md:col-span-1",
    });
  }

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">
          From the Club
        </h2>
        <BentoGrid className="max-w-4xl mx-auto">
          {items.map((item, i) => (
            <BentoGridItem
              key={i}
              title={item.title}
              description={item.description}
              header={item.header}
              className={item.className}
            />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}
