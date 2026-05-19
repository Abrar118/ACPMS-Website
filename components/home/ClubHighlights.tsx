"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { SectionHeader } from "@/components/ui/section-header";
import Image from "next/image";
import { Calendar, BookOpen, FileText, ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";
import { EResourceType } from "../shared/enums";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { MinimalTiptapEditor } from "@/components/ui/minimal-tiptap";
import { JSONContent } from "@tiptap/react";
import { motion } from "framer-motion";

interface HighlightsData {
  event: any;
  resource: any;
  magazine: any;
}

interface ClubHighlightsProps {
  highlights: HighlightsData | null;
}

export default function ClubHighlights({ highlights }: ClubHighlightsProps) {
  const PdfThumbnail = dynamic(
    () => import("@/components/client-only/PdfThumbnail"),
    { ssr: false }
  );

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date: Date | string) => {
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, "p");
  };

  if (!highlights) {
    return (
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionHeader title="Club Highlights" />
          <div className="text-center mt-8">
            <p className="text-muted-foreground">
              Unable to load highlights at the moment.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionHeader title="Club Highlights" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
          {/* Latest Event */}
          {highlights.event && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: 0,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <GlassCard glow className="overflow-hidden h-full flex flex-col">
                <div className="relative h-48 w-full overflow-hidden rounded-t-2xl">
                  {highlights.event.poster_url ? (
                    <Image
                      src={highlights.event.poster_url}
                      alt={highlights.event.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <Calendar className="w-16 h-16 text-primary opacity-50" />
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <span className="inline-flex items-center rounded-full bg-primary/10 text-primary text-xs font-medium px-2.5 py-0.5 w-fit">
                    Event
                  </span>
                  <h3 className="text-lg font-semibold text-foreground mt-3">
                    {highlights.event.title}
                  </h3>
                  <div className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    <MinimalTiptapEditor
                      value={highlights.event.description as JSONContent}
                      output="text"
                      editable={false}
                      hideToolbar={true}
                    />
                  </div>
                  <Link
                    href={`/events/${highlights.event.id}`}
                    className="text-primary text-sm font-medium hover:underline mt-4 inline-flex items-center gap-1"
                  >
                    Learn More
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Most Popular Resource */}
          {highlights.resource && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <GlassCard className="overflow-hidden h-full flex flex-col">
                <div className="relative h-48 w-full overflow-hidden rounded-t-2xl">
                  {highlights.resource.resource_url ? (
                    (() => {
                      const url = highlights.resource.resource_url;
                      const isYoutube =
                        url.includes("youtube.com") || url.includes("youtu.be");
                      const isPdf =
                        highlights.resource.resource_type === EResourceType.Pdf;
                      const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(
                        url
                      );

                      if (isYoutube) {
                        let videoId = "";
                        if (url.includes("youtu.be/")) {
                          videoId =
                            url.split("youtu.be/")[1]?.split("?")[0] || "";
                        } else if (url.includes("youtube.com/embed/")) {
                          videoId =
                            url.split("embed/")[1]?.split("?")[0] || "";
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
                        return (
                          <PdfThumbnail url={url} className="w-full h-full" />
                        );
                      } else if (isImage) {
                        return (
                          <Image
                            src={url}
                            alt={highlights.resource.title}
                            fill
                            className="object-cover"
                          />
                        );
                      } else {
                        return (
                          <Image
                            src={url}
                            alt={highlights.resource.title}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        );
                      }
                    })()
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-muted-foreground opacity-50" />
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <span className="inline-flex items-center rounded-full bg-primary/10 text-primary text-xs font-medium px-2.5 py-0.5 w-fit">
                    Resource
                  </span>
                  <h3 className="text-lg font-semibold text-foreground mt-3">
                    {highlights.resource.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {highlights.resource.description}
                  </p>
                  <Link
                    href={`/resources/${highlights.resource.id}`}
                    className="text-primary text-sm font-medium hover:underline mt-4 inline-flex items-center gap-1"
                  >
                    Learn More
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Latest Magazine */}
          {highlights.magazine && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: 0.2,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <GlassCard className="overflow-hidden h-full flex flex-col">
                <div className="relative h-48 w-full overflow-hidden rounded-t-2xl">
                  {highlights.magazine.cover_image ? (
                    <Image
                      src={highlights.magazine.cover_image}
                      alt={highlights.magazine.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                      <FileText className="w-16 h-16 text-muted-foreground opacity-50" />
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <span className="inline-flex items-center rounded-full bg-primary/10 text-primary text-xs font-medium px-2.5 py-0.5 w-fit">
                    Magazine
                  </span>
                  <h3 className="text-lg font-semibold text-foreground mt-3">
                    {highlights.magazine.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {highlights.magazine.summary}
                  </p>
                  <Link
                    href={`/magazine/${highlights.magazine.id}`}
                    className="text-primary text-sm font-medium hover:underline mt-4 inline-flex items-center gap-1"
                  >
                    Learn More
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
