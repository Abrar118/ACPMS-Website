"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import useSupabaseBrowser from "@/utils/supabase/supabase-browser";
import { getHighlights } from "@/queries/events";
import { Calendar, BookOpen, FileText, Clock, MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import { EResourceType } from "../shared/enums";
import { format, isAfter, parseISO } from "date-fns";
import Link from "next/link";
import { MinimalTiptapEditor } from "@/components/ui/minimal-tiptap";
import { JSONContent } from "@tiptap/react";

export default function ClubHighlights() {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return format(parseISO(dateString), "p");
  };  

  if (isLoading) {
    return (
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-foreground mb-16">
            From the Club
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-card/50">
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !highlights) {
    return (
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-foreground mb-16">
            From the Club
          </h2>
          <div className="text-center">
            <p className="text-muted-foreground">
              Unable to load highlights at the moment.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-foreground mb-16">
          From the Club
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Latest Event */}
          {highlights.event && (
            <Card className="bg-transparent border-0 shadow-none">
              <div className="relative h-48 w-full overflow-hidden rounded-lg">
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
              <CardHeader className="px-0">
                <CardTitle className="text-xl text-foreground">
                  {highlights.event.title}
                </CardTitle>
                <CardDescription className="font-medium text-muted-foreground">
                  {highlights.event.event_date
                    ? formatDate(highlights.event.event_date)
                    : "Date TBD"}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <div className="text-muted-foreground line-clamp-2">
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
              </CardContent>
            </Card>
          )}

          {/* Most Popular Resource */}
          {highlights.resource && (
            <Card className="bg-transparent border-0 shadow-none">
              <div className="relative h-48 w-full overflow-hidden rounded-lg">
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
                        videoId =
                          url.split("youtu.be/")[1]?.split("?")[0] || "";
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
                      return (
                        <PdfThumbnail url={url} className="w-full h-full" />
                      );
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
                            (e.target as HTMLImageElement).style.display =
                              "none";
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
              <CardHeader className="px-0">
                <CardTitle className="text-xl text-foreground">
                  {highlights.resource.title}
                </CardTitle>
                <CardDescription className="font-medium text-muted-foreground">
                  {highlights.resource.view_count} views
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <p className="text-muted-foreground line-clamp-2">
                  {highlights.resource.description}
                </p>
                <Button asChild className="mt-4">
                  <Link href={`/resources/${highlights.resource.id}`}>
                    Learn More
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Latest Magazine */}
          {highlights.magazine && (
            <Card className="bg-transparent border-0 shadow-none">
              <div className="relative h-48 w-full overflow-hidden rounded-lg">
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
              <CardHeader className="px-0">
                <CardTitle className="text-xl text-foreground">
                  {highlights.magazine.title}
                </CardTitle>
                <CardDescription className="font-medium text-muted-foreground">
                  {highlights.magazine.published_date
                    ? formatDate(highlights.magazine.published_date)
                    : "Recently Published"}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <p className="text-muted-foreground line-clamp-2">
                  {highlights.magazine.summary}
                </p>
                <Button asChild className="mt-4">
                  <Link href={`/magazine/${highlights.magazine.id}`}>
                    Learn More
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
