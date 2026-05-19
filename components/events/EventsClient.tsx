"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/ui/glass-card";
import { SectionHeader } from "@/components/ui/section-header";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Trophy,
  BookOpen,
  Loader2,
  Search,
  Star,
  ExternalLink,
  Eye,
} from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import EventRegistrationDialog from "./EventRegistrationDialog";
import { EEventType } from "../shared/enums";
import { MinimalTiptapEditor } from "@/components/ui/minimal-tiptap";
import { JSONContent } from "@tiptap/react";
import { format, isAfter, isBefore, addDays, parseISO } from "date-fns";

interface EventWithType {
  id: string;
  title: string;
  description: any;
  event_date: string | null;
  end_date: string | null;
  venue: string | null;
  registration_deadline: string | null;
  is_published: boolean;
  event_mode: string;
  event_type: string | null;
  created_at: string | null;
  updated_at: string | null;
  created_by: string | null;
  poster_url: string | null;
  tags: string[] | null;
}

interface EventsClientProps {
  events: EventWithType[];
}

export default function EventsClient({ events: allEvents }: EventsClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [activeCategory, setActiveCategory] = useState(
    searchParams.get("category") || "All Events"
  );
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );

  // Registration dialog state
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Function to update URL parameters
  const updateSearchParams = (params: {
    category?: string;
    search?: string;
  }) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    if (params.category !== undefined) {
      if (params.category === "All Events") {
        current.delete("category");
      } else {
        current.set("category", params.category);
      }
    }

    if (params.search !== undefined) {
      if (params.search === "") {
        current.delete("search");
      } else {
        current.set("search", params.search);
      }
    }

    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`${pathname}${query}`, { scroll: false });
  };

  // Filter and sort events
  const filteredAndSortedEvents = useMemo(() => {
    if (!allEvents) return { upcoming: [], past: [] };

    const today = new Date();
    let filtered = [...allEvents] as EventWithType[];

    // Filter by category
    if (activeCategory !== "All Events") {
      filtered = filtered.filter(
        (event) =>
          event.event_type?.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(search) ||
          event.venue?.toLowerCase().includes(search) ||
          event.event_type?.toLowerCase().includes(search) ||
          event.tags?.some((tag) => tag.toLowerCase().includes(search))
      );
    }

    // Separate upcoming and past events
    const upcoming = filtered
      .filter((event) => {
        if (!event.event_date) return false;
        return isAfter(parseISO(event.event_date), today);
      })
      .sort((a, b) => {
        if (!a.event_date || !b.event_date) return 0;
        return (
          new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
        );
      });

    const past = filtered
      .filter((event) => {
        if (!event.event_date) return false;
        return isBefore(parseISO(event.event_date), today);
      })
      .sort((a, b) => {
        if (!a.event_date || !b.event_date) return 0;
        return (
          new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
        );
      });

    return { upcoming, past };
  }, [allEvents, activeCategory, searchTerm]);

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    updateSearchParams({ category });
  };

  // Handle search
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    updateSearchParams({ search: value });
  };

  // Utility functions
  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, "PPP");
  };

  const formatTime = (date: Date | string) => {
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, "p");
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case EEventType.Workshop:
        return <BookOpen className="w-4 h-4" />;
      case EEventType.Session:
        return <Users className="w-4 h-4" />;
      case EEventType.Seminar:
        return <BookOpen className="w-4 h-4" />;
      case EEventType.Fest:
        return <Star className="w-4 h-4" />;
      case EEventType.InterCanttOlympiad:
        return <Trophy className="w-4 h-4" />;
      case EEventType.Meet:
        return <Users className="w-4 h-4" />;
      case EEventType.Other:
        return <Calendar className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getBadgeVariant = (category: string) => {
    switch (category) {
      case EEventType.Workshop:
        return "secondary" as const;
      case EEventType.Session:
        return "outline" as const;
      case EEventType.Seminar:
        return "destructive" as const;
      case EEventType.Fest:
        return "default" as const;
      case EEventType.InterCanttOlympiad:
        return "default" as const;
      case EEventType.Meet:
        return "secondary" as const;
      case EEventType.Other:
        return "outline" as const;
      default:
        return "outline" as const;
    }
  };

  const isUpcoming = (eventDate: string) => {
    const today = new Date();
    const eventDay = parseISO(eventDate);
    const nextWeek = addDays(today, 7);
    return isAfter(eventDay, today) && isBefore(eventDay, nextWeek);
  };

  // Create dynamic categories from event enum
  const dynamicCategories = ["All Events", ...Object.values(EEventType)];

  const EventCard = ({
    event,
    isUpcomingEvent = false,
  }: {
    event: EventWithType;
    isUpcomingEvent?: boolean;
  }) => (
    <GlassCard
      className={`overflow-hidden group ${
        isUpcomingEvent ? "ring-1 ring-primary/30" : ""
      }`}
    >
      {/* Event Image */}
      <div
        className={`${
          isUpcomingEvent ? "h-56" : "h-48"
        } relative overflow-hidden rounded-t-2xl`}
      >
        {event.poster_url ? (
          <img
            src={event.poster_url}
            alt={event.title}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              !isUpcomingEvent &&
              !isAfter(parseISO(event.event_date || ""), new Date())
                ? "grayscale opacity-60"
                : ""
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/[0.06] to-white/[0.02]">
            <div className="text-center text-muted-foreground">
              {getCategoryIcon(event.event_type || "")}
              <div className="mt-2 text-sm opacity-75">
                {event.event_type || "Event"}
              </div>
            </div>
          </div>
        )}

        {/* Date badge */}
        {event.event_date && (
          <div className="absolute top-4 right-4 bg-primary/90 text-white text-xs font-medium px-3 py-1 rounded-full">
            {format(parseISO(event.event_date), "MMM d")}
          </div>
        )}

        {/* Event type badge */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="bg-white/[0.12] backdrop-blur-md text-white text-xs font-medium px-3 py-1 rounded-full border border-white/[0.1]">
            {event.event_type || "Event"}
          </span>
          {isUpcomingEvent && (
            <span className="bg-primary/90 text-white text-xs font-medium px-3 py-1 rounded-full animate-pulse">
              <Star className="w-3 h-3 inline mr-1" />
              Soon
            </span>
          )}
        </div>

        {/* Event Mode */}
        <div className="absolute bottom-3 left-3">
          <span className="bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full border border-white/[0.1]">
            {event.event_mode}
          </span>
        </div>

        {/* Past Event Overlay */}
        {!isAfter(parseISO(event.event_date || ""), new Date()) && (
          <div className="absolute bottom-3 right-3">
            <span className="bg-black/60 backdrop-blur-sm text-white/70 text-xs px-2.5 py-1 rounded-full border border-white/[0.1]">
              Completed
            </span>
          </div>
        )}
      </div>

      {/* Event Content */}
      <div className="p-6">
        <h3
          className={`${
            isUpcomingEvent ? "text-xl" : "text-lg"
          } font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors`}
        >
          {event.title}
        </h3>

        {/* Event Details */}
        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          {event.event_date && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary/60" />
              <span>{formatDate(event.event_date)}</span>
              {event.event_date && (
                <>
                  <Clock className="w-4 h-4 ml-2 text-primary/60" />
                  <span>{formatTime(event.event_date)}</span>
                </>
              )}
            </div>
          )}
          {event.venue && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary/60" />
              <span className="line-clamp-1">{event.venue}</span>
            </div>
          )}
          {event.registration_deadline &&
            isAfter(parseISO(event.event_date || ""), new Date()) && (
              <div className="flex items-center gap-2 text-primary/80">
                <Clock className="w-4 h-4" />
                <span className="text-xs">
                  Registration closes: {formatDate(event.registration_deadline)}
                </span>
              </div>
            )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 mt-4 border-t border-white/[0.06]">
          <Button
            variant="outline"
            className="flex-1 bg-white/[0.04] border-white/[0.08] text-foreground hover:bg-white/[0.08] hover:border-white/[0.15] rounded-xl"
            onClick={() => window.open(`/events/${event.id}`, "_blank")}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </div>
    </GlassCard>
  );

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <SectionHeader
          title="Events"
          subtitle="Join our exciting mathematics competitions, workshops, and educational events designed to challenge and inspire young mathematical minds."
        />

        {/* Search and Filter Section */}
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search events by title, venue, or tags..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 bg-white/[0.04] border border-white/[0.08] rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-primary/50 focus:border-primary/50"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {dynamicCategories.slice(0, 8).map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                  activeCategory === category
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-white/[0.04] border border-white/[0.08] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground hover:border-white/[0.15]"
                }`}
              >
                {category === "All Events" ? "All" : category}
              </button>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        {filteredAndSortedEvents.upcoming.length > 0 && (
          <section>
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-2 text-foreground">
                <Star className="h-6 w-6 text-primary" />
                {activeCategory === "All Events"
                  ? "Upcoming Events"
                  : `Upcoming ${activeCategory}`}
              </h2>

              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredAndSortedEvents.upcoming.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isUpcomingEvent={
                      event.event_date ? isUpcoming(event.event_date) : false
                    }
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Past Events */}
        {filteredAndSortedEvents.past.length > 0 && (
          <section className="py-12 -mx-4 px-4 border-t border-white/[0.06]">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold mb-8 text-foreground">
                {activeCategory === "All Events"
                  ? "Past Events"
                  : `Past ${activeCategory}`}
              </h2>

              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredAndSortedEvents.past.slice(0, 9).map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>

              {filteredAndSortedEvents.past.length > 9 && (
                <div className="text-center mt-8">
                  <Button
                    variant="outline"
                    className="bg-white/[0.04] border-white/[0.08] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground rounded-full px-8"
                  >
                    View More Past Events
                  </Button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* No Events Found */}
        {filteredAndSortedEvents.upcoming.length === 0 &&
          filteredAndSortedEvents.past.length === 0 && (
            <section>
              <div className="max-w-6xl mx-auto">
                <GlassCard className="p-12 text-center">
                  <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-foreground">
                    No Events Found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm
                      ? `No events match your search "${searchTerm}"`
                      : activeCategory === "All Events"
                      ? "No events are currently available."
                      : `No ${activeCategory.toLowerCase()} events are currently available.`}
                  </p>
                  {(searchTerm || activeCategory !== "All Events") && (
                    <Button
                      variant="outline"
                      className="bg-white/[0.04] border-white/[0.08] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground rounded-full"
                      onClick={() => {
                        setSearchTerm("");
                        setActiveCategory("All Events");
                        updateSearchParams({
                          search: "",
                          category: "All Events",
                        });
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </GlassCard>
              </div>
            </section>
          )}
      </div>
    </div>
  );
}
