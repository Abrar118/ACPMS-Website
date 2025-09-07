"use client";

import { useState, useMemo } from "react";
import useSupabaseBrowser from "@/utils/supabase/supabase-browser";
import { useQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { getEventsQuery } from "@/queries/events";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export default function EventsClient() {
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

  const supabase = useSupabaseBrowser();

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

  // Get all published events
  const {
    data: allEvents,
    isLoading: eventsLoading,
    isError: eventsError,
  } = useQuery(getEventsQuery(supabase));

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
  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "PPP");
  };

  const formatTime = (dateString: string) => {
    return format(parseISO(dateString), "p");
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

  if (eventsLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading events...</span>
      </div>
    );
  }

  if (eventsError) {
    console.log("Error loading events:", eventsError);
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">
          Error loading events. Please try again later.
        </p>
      </div>
    );
  }

  // Create dynamic categories from event enum
  const dynamicCategories = ["All Events", ...Object.values(EEventType)];

  const EventCard = ({
    event,
    isUpcomingEvent = false,
  }: {
    event: EventWithType;
    isUpcomingEvent?: boolean;
  }) => (
    <Card
      className={`hover:shadow-lg transition-all duration-300 overflow-hidden group ${
        isUpcomingEvent ? "ring-2 ring-primary/50 scale-[1.02]" : ""
      }`}
    >
      {/* Event Image */}
      <div
        className={`${
          isUpcomingEvent ? "h-56" : "h-48"
        } bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden`}
      >
        {event.poster_url ? (
          <img
            src={event.poster_url}
            alt={event.title}
            className={`w-full h-full object-cover transition-transform group-hover:scale-105 ${
              !isUpcomingEvent &&
              !isAfter(parseISO(event.event_date || ""), new Date())
                ? "grayscale opacity-75"
                : ""
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
            <div className="text-center text-white">
              {getCategoryIcon(event.event_type || "")}
              <div className="mt-2 text-sm opacity-75">
                {event.event_type || "Event"}
              </div>
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge
            variant={getBadgeVariant(event.event_type || "")}
            className="bg-white/90 text-slate-800 hover:bg-white"
          >
            {event.event_type || "Event"}
          </Badge>
          {isUpcomingEvent && (
            <Badge variant="destructive" className="animate-pulse">
              <Star className="w-3 h-3 mr-1" />
              Soon
            </Badge>
          )}
        </div>

        {/* Event Mode */}
        <div className="absolute top-3 right-3">
          <Badge
            variant="outline"
            className="bg-black/50 text-white border-white/20"
          >
            {event.event_mode}
          </Badge>
        </div>

        {/* Past Event Overlay */}
        {!isAfter(parseISO(event.event_date || ""), new Date()) && (
          <div className="absolute bottom-3 left-3">
            <Badge
              variant="outline"
              className="bg-black/50 text-white border-white/20"
            >
              Completed
            </Badge>
          </div>
        )}
      </div>

      {/* Event Content */}
      <CardHeader className={`${isUpcomingEvent ? "pt-6" : ""}`}>
        <CardTitle
          className={`${
            isUpcomingEvent ? "text-xl" : "text-lg"
          } line-clamp-2 group-hover:text-primary transition-colors`}
        >
          {event.title}
        </CardTitle>
        {/* {event.description && (
                    <CardDescription className="text-sm text-muted-foreground">
                        <div className="line-clamp-2">
                            <MinimalTiptapEditor
                                value={event.description as JSONContent}
                                className="w-full border-0 p-0 m-0"
                                output="text"
                                autofocus={false}
                                editable={false}
                                editorClassName="focus:outline-none text-sm max-h-22 overflow-hidden"
                                hideToolbar={true}
                            />
                        </div>
                    </CardDescription>
                )} */}
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Event Details */}
        <div className="space-y-2 text-sm text-muted-foreground">
          {event.event_date && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(event.event_date)}</span>
              {event.event_date && (
                <>
                  <Clock className="w-4 h-4 ml-2" />
                  <span>{formatTime(event.event_date)}</span>
                </>
              )}
            </div>
          )}
          {event.venue && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="line-clamp-1">{event.venue}</span>
            </div>
          )}
          {event.registration_deadline &&
            isAfter(parseISO(event.event_date || ""), new Date()) && (
              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                <Clock className="w-4 h-4" />
                <span className="text-xs">
                  Registration closes: {formatDate(event.registration_deadline)}
                </span>
              </div>
            )}
        </div>

        {/* Tags */}
        {/* {event.tags && event.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {event.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                            </Badge>
                        ))}
                        {event.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                                +{event.tags.length - 3}
                            </Badge>
                        )}
                    </div>
                )} */}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => window.open(`/events/${event.id}`, "_blank")}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-12">
      {/* Search and Filter Section */}
      <section className="px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search events by title, venue, or tags..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Tabs */}
          <Tabs
            value={activeCategory}
            onValueChange={handleCategoryChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-1">
              {dynamicCategories.slice(0, 6).map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="text-sm font-medium"
                >
                  {category === "All Events" ? "All" : category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </section>

      {/* Upcoming Events */}
      {filteredAndSortedEvents.upcoming.length > 0 && (
        <section className="px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
              <Star className="h-8 w-8 text-primary" />
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
        <section className="px-4 bg-muted/30 py-12">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">
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
                <Button variant="outline">View More Past Events</Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* No Events Found */}
      {filteredAndSortedEvents.upcoming.length === 0 &&
        filteredAndSortedEvents.past.length === 0 && (
          <section className="px-4">
            <div className="max-w-6xl mx-auto">
              <Card className="p-12 text-center">
                <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Events Found</h3>
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
              </Card>
            </div>
          </section>
        )}
    </div>
  );
}
