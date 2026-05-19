"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  ExternalLink,
  Tag,
  Trophy,
  DollarSign,
  ArrowLeft,
} from "lucide-react";
import { MinimalTiptapEditor } from "@/components/ui/minimal-tiptap";
import EventRegistrationDialog from "./EventRegistrationDialog";
import { JSONContent } from "@tiptap/react";
import type { Event } from "@/lib/db/events";
import type { Competition } from "@/lib/db/competitions";
import { EEventMode, EEventType } from "@/components/shared/enums";
import { useRouter } from "next/navigation";
import Footer from "@/components/home/Footer";

interface EventDetailClientProps {
  event: Event;
  competitions: Competition[];
}

export default function EventDetailClient({
  event,
  competitions,
}: EventDetailClientProps) {
  const router = useRouter();
  const [isImageLoading, setIsImageLoading] = useState(true);

  const formatDate = (date: Date | string | null) => {
    if (!date) return "TBA";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: Date | string | null) => {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isEventPast = event.event_date
    ? new Date(event.event_date) < new Date()
    : false;
  const isRegistrationOpen = event.registration_deadline
    ? new Date(event.registration_deadline) > new Date()
    : false;

  return (
    <div className="min-h-screen">
      {/* Back button */}
      <div className="pt-20 sm:pt-24 pb-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Event Poster */}
        {event.poster_url && (
          <div className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96 mb-8 rounded-2xl overflow-hidden">
            <Image
              src={event.poster_url}
              alt={`${event.title} poster`}
              fill
              className={`object-cover transition-opacity duration-300 ${
                isImageLoading ? "opacity-0" : "opacity-100"
              }`}
              onLoad={() => setIsImageLoading(false)}
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-transparent to-transparent" />
            {isImageLoading && (
              <div className="absolute inset-0 bg-white/[0.03] animate-pulse flex items-center justify-center rounded-2xl">
                <div className="text-muted-foreground">Loading poster...</div>
              </div>
            )}
          </div>
        )}

        {/* Event Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-foreground">
          {event.title}
        </h1>

        {/* Event Meta Information */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-8">
          {event.event_type && (
            <span className="inline-flex items-center bg-white/[0.06] border border-white/[0.1] text-foreground text-xs font-medium px-3 py-1.5 rounded-full">
              <Tag className="h-3 w-3 mr-1.5 text-primary/70" />
              {event.event_type}
            </span>
          )}
          <span className="inline-flex items-center bg-white/[0.06] border border-white/[0.1] text-foreground text-xs font-medium px-3 py-1.5 rounded-full">
            {event.event_mode === EEventMode.Online ? (
              <ExternalLink className="h-3 w-3 mr-1.5 text-primary/70" />
            ) : event.event_mode === EEventMode.InPerson ? (
              <MapPin className="h-3 w-3 mr-1.5 text-primary/70" />
            ) : (
              <Users className="h-3 w-3 mr-1.5 text-primary/70" />
            )}
            {event.event_mode}
          </span>
          {isEventPast && (
            <span className="inline-flex items-center bg-white/[0.06] border border-white/[0.1] text-muted-foreground text-xs font-medium px-3 py-1.5 rounded-full">
              <Clock className="h-3 w-3 mr-1.5" />
              Past Event
            </span>
          )}
          {!isEventPast && isRegistrationOpen && (
            <span className="inline-flex items-center bg-primary/15 border border-primary/20 text-primary text-xs font-medium px-3 py-1.5 rounded-full">
              <Users className="h-3 w-3 mr-1.5" />
              Registration Open
            </span>
          )}
        </div>

        {/* Event Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          <GlassCard className="p-5">
            <div className="flex items-center text-sm">
              <Calendar className="h-5 w-5 mr-3 text-primary/70 flex-shrink-0" />
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Date</div>
                <div className="font-medium text-foreground">
                  {formatDate(event.event_date)}
                </div>
                {event.event_date && (
                  <div className="text-muted-foreground text-xs mt-0.5">
                    {formatTime(event.event_date)}
                  </div>
                )}
              </div>
            </div>
          </GlassCard>

          {event.venue && (
            <GlassCard className="p-5">
              <div className="flex items-center text-sm">
                <MapPin className="h-5 w-5 mr-3 text-primary/70 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Venue</div>
                  <div className="font-medium text-foreground">{event.venue}</div>
                </div>
              </div>
            </GlassCard>
          )}

          {event.end_date && event.end_date !== event.event_date && (
            <GlassCard className="p-5">
              <div className="flex items-center text-sm">
                <Clock className="h-5 w-5 mr-3 text-primary/70 flex-shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Ends</div>
                  <div className="font-medium text-foreground">
                    {formatDate(event.end_date)}
                  </div>
                  <div className="text-muted-foreground text-xs mt-0.5">
                    {formatTime(event.end_date)}
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          {event.registration_deadline && (
            <GlassCard className="p-5">
              <div className="flex items-center text-sm">
                <Users className="h-5 w-5 mr-3 text-primary/70 flex-shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Registration Deadline</div>
                  <div className="font-medium text-foreground">
                    {formatDate(event.registration_deadline)}
                  </div>
                </div>
              </div>
            </GlassCard>
          )}
        </div>

        {/* Event Description */}
        {event.description && (
          <GlassCard className="mb-12 p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">
              About The Event
            </h2>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <MinimalTiptapEditor
                value={event.description as JSONContent}
                className="w-full border-0 p-0 m-0"
                output="text"
                autofocus={false}
                editable={false}
                editorClassName="focus:outline-none text-sm sm:text-base leading-relaxed text-muted-foreground"
                hideToolbar={true}
              />
            </div>
          </GlassCard>
        )}

        {/* Competitions Section */}
        {competitions.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6 flex items-center">
              <Trophy className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-primary" />
              Competitions
            </h2>
            <div className="space-y-4">
              {competitions.map((competition, index) => (
                <GlassCard key={competition.id} className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                          {index + 1}. {competition.title}
                        </h3>

                        {competition.fee > 0 && (
                          <span className="inline-flex items-center bg-primary/10 border border-primary/20 text-primary text-xs font-medium px-3 py-1 rounded-full">
                            <DollarSign className="h-3 w-3 mr-1" />
                            Fee: ${competition.fee}
                          </span>
                        )}
                      </div>
                    </div>

                    {competition.description && (
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <MinimalTiptapEditor
                          value={competition.description as JSONContent}
                          className="w-full border-0 p-0 m-0"
                          output="text"
                          autofocus={false}
                          editable={false}
                          editorClassName="focus:outline-none text-sm leading-relaxed text-muted-foreground"
                          hideToolbar={true}
                        />
                      </div>
                    )}
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        {!isEventPast && isRegistrationOpen && (
          <GlassCard glow className="mt-12 p-6 sm:p-8 text-center">
            <h3 className="text-xl sm:text-2xl font-bold mb-4 text-foreground">
              Ready to Join?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Registration is open for this event. Don't miss out on this
              exciting opportunity!
            </p>
            <EventRegistrationDialog event={event} competitions={competitions}>
              <Button className="bg-primary text-primary-foreground rounded-xl px-8 py-3 text-base font-medium hover:bg-primary/90 transition-colors">
                Register Now
              </Button>
            </EventRegistrationDialog>
          </GlassCard>
        )}
      </div>

      <Footer />
    </div>
  );
}
