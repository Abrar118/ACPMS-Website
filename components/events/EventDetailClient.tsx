"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
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
import { JSONContent } from "@tiptap/react";
import type { EventRow } from "@/queries/events";
import type { CompetitionRow } from "@/queries/competitions";
import { EEventMode, EEventType } from "@/components/shared/enums";
import { useRouter } from "next/navigation";
import Footer from "@/components/home/Footer";

interface EventDetailClientProps {
  event: EventRow;
  competitions: CompetitionRow[];
}

export default function EventDetailClient({
  event,
  competitions,
}: EventDetailClientProps) {
  const router = useRouter();
  const [isImageLoading, setIsImageLoading] = useState(true);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "TBA";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getEventModeColor = (mode: string) => {
    switch (mode) {
      case EEventMode.Online:
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
      case EEventMode.InPerson:
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case EEventMode.Hybrid:
        return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getEventTypeColor = (type: string | null) => {
    if (!type)
      return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";

    switch (type) {
      case EEventType.Workshop:
        return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300";
      case EEventType.Seminar:
        return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300";
      case EEventType.Session:
        return "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300";
      case EEventType.Fest:
        return "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300";
      case EEventType.InterCanttOlympiad:
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
      case EEventType.Meet:
        return "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const isEventPast = event.event_date
    ? new Date(event.event_date) < new Date()
    : false;
  const isRegistrationOpen = event.registration_deadline
    ? new Date(event.registration_deadline) > new Date()
    : false;

  return (
    <div className="min-h-screen">
      {/* Header with back button */}
      <div className="pt-20 sm:pt-24 pb-6 sm:pb-8">
        {/* <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 sm:mb-6 hover:bg-muted/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </div> */}
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Event Poster */}
        {event.poster_url && (
          <div className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96 mb-8 rounded-lg overflow-hidden shadow-lg">
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
            {isImageLoading && (
              <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
                <div className="text-muted-foreground">Loading poster...</div>
              </div>
            )}
          </div>
        )}

        {/* Event Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
          {event.title}
        </h1>

        {/* Event Meta Information */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-8">
          {event.event_type && (
            <Badge className={getEventTypeColor(event.event_type)}>
              <Tag className="h-3 w-3 mr-1" />
              {event.event_type}
            </Badge>
          )}
          <Badge className={getEventModeColor(event.event_mode)}>
            {event.event_mode === EEventMode.Online ? (
              <ExternalLink className="h-3 w-3 mr-1" />
            ) : event.event_mode === EEventMode.InPerson ? (
              <MapPin className="h-3 w-3 mr-1" />
            ) : (
              <Users className="h-3 w-3 mr-1" />
            )}
            {event.event_mode}
          </Badge>
          {isEventPast && (
            <Badge variant="secondary">
              <Clock className="h-3 w-3 mr-1" />
              Past Event
            </Badge>
          )}
          {!isEventPast && isRegistrationOpen && (
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              <Users className="h-3 w-3 mr-1" />
              Registration Open
            </Badge>
          )}
        </div>

        {/* Event Details Grid */}
        <div className="grid mb-12">
          <Card className="py-0">
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-3 text-muted-foreground flex-shrink-0" />
                  <div>
                    <div className="font-medium">
                      {formatDate(event.event_date)}
                    </div>
                    {event.event_date && (
                      <div className="text-muted-foreground">
                        {formatTime(event.event_date)}
                      </div>
                    )}
                  </div>
                </div>

                {event.end_date && event.end_date !== event.event_date && (
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-3 text-muted-foreground flex-shrink-0" />
                    <div>
                      <div className="font-medium">
                        Ends: {formatDate(event.end_date)}
                      </div>
                      <div className="text-muted-foreground">
                        {formatTime(event.end_date)}
                      </div>
                    </div>
                  </div>
                )}

                {event.venue && (
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium">Venue</div>
                      <div className="text-muted-foreground">
                        <div className="font-medium">{event.venue}</div>
                      </div>
                    </div>
                  </div>
                )}

                {event.registration_deadline && (
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-3 text-muted-foreground flex-shrink-0" />
                    <div>
                      <div className="font-medium">Registration Deadline</div>
                      <div className="text-muted-foreground">
                        {formatDate(event.registration_deadline)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* {event.tags && event.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )} */}
        </div>

        {/* Event Description */}
        {event.description && (
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">
                About The Event
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <MinimalTiptapEditor
                value={event.description as JSONContent}
                className="w-full border-0 p-0 m-0"
                output="text"
                autofocus={false}
                editable={false}
                editorClassName="focus:outline-none text-sm sm:text-base leading-relaxed"
                hideToolbar={true}
              />
            </CardContent>
          </Card>
        )}

        {/* Competitions Section */}
        {competitions.length > 0 && (
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl flex items-center">
                <Trophy className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                Competitions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {competitions.map((competition, index) => (
                <div key={competition.id}>
                  {index > 0 && <Separator className="my-6" />}

                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-semibold mb-2">
                          {index + 1}. {competition.title}
                        </h3>

                        {competition.fee > 0 && (
                          <div className="flex items-center text-sm text-muted-foreground mb-3">
                            <DollarSign className="h-4 w-4 mr-1 flex-shrink-0" />
                            <span>Registration Fee: ${competition.fee}</span>
                          </div>
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
                          editorClassName="focus:outline-none text-sm leading-relaxed"
                          hideToolbar={true}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
        {!isEventPast && isRegistrationOpen && (
          <Card className="mt-12 bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardContent className="p-6 sm:p-8 text-center">
              <h3 className="text-xl sm:text-2xl font-bold mb-4">
                Ready to Join?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Registration is open for this event. Don't miss out on this
                exciting opportunity!
              </p>
              <Button size="lg" className="px-6 sm:px-8">
                Register Now
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
}
