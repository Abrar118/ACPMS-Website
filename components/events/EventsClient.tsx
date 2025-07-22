"use client";

import { useState } from "react";
import useSupabaseBrowser from "@/utils/supabase/supabase-browser";
import { useQuery } from "@supabase-cache-helpers/postgrest-react-query";
import {
    getEventTypesQuery,
    getUpcomingEventsWithPaginationQuery,
    getPastEventsWithPaginationQuery,
} from "@/queries/events";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Calendar,
    MapPin,
    Users,
    Clock,
    Trophy,
    BookOpen,
    Loader2,
} from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import EventRegistrationDialog from "./EventRegistrationDialog";

type SearchParamsType = {
    pageNumber?: number;
    category?: string;
};

export default function EventsClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [activeCategory, setActiveCategory] = useState(
        searchParams.get("category") || "All Events"
    );
    const [upcomingPage, setUpcomingPage] = useState(
        Number(searchParams.get("pageNumber")) || 1
    );
    const [pastPage, setPastPage] = useState(
        Number(searchParams.get("pageNumber")) || 1
    );
    
    // Registration dialog state
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    const pageSize = 6; // Show 6 events per page
    const supabase = useSupabaseBrowser();

    // Function to update URL parameters
    const updateSearchParams = (params: {
        category?: string;
        pageNumber?: number;
    }) => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));

        if (params.category !== undefined) {
            if (params.category === "All Events") {
                current.delete("category");
            } else {
                current.set("category", params.category);
            }
        }

        if (params.pageNumber !== undefined) {
            if (params.pageNumber === 1) {
                current.delete("pageNumber");
            } else {
                current.set("pageNumber", params.pageNumber.toString());
            }
        }

        const search = current.toString();
        const query = search ? `?${search}` : "";
        router.push(`${pathname}${query}`, { scroll: false });
    };

    // Get event types for dynamic categories
    const { data: eventTypes, isLoading: typesLoading } = useQuery(
        getEventTypesQuery(supabase)
    );

    // Get upcoming events with pagination
    const {
        data: upcomingEvents,
        isLoading: upcomingLoading,
        isError: upcomingError,
    } = useQuery(
        getUpcomingEventsWithPaginationQuery(supabase, upcomingPage, pageSize)
    );

    // Get past events with pagination
    const {
        data: pastEvents,
        isLoading: pastLoading,
        isError: pastError,
    } = useQuery(
        getPastEventsWithPaginationQuery(supabase, pastPage, pageSize)
    );

    // For count, we'll use a simple approach - if we get the full pageSize, there might be more
    const hasMoreUpcoming =
        upcomingEvents && upcomingEvents.length === pageSize;
    const hasMorePast = pastEvents && pastEvents.length === pageSize;

    // Filter events based on active category
    const getFilteredEvents = (events: any[]) => {
        if (!events) return [];
        if (activeCategory === "All Events") return events;

        return events.filter(
            (event) =>
                event.event_type?.event_type_name?.toLowerCase() ===
                activeCategory.toLowerCase()
        );
    };

    const filteredUpcomingEvents = getFilteredEvents(upcomingEvents || []);
    const filteredPastEvents = getFilteredEvents(pastEvents || []);

    /// Reset pagination when category changes
    const handleCategoryChange = (category: string) => {
        setActiveCategory(category);
        setUpcomingPage(1);
        setPastPage(1);

        // Update URL parameters
        updateSearchParams({ category, pageNumber: 1 });
    };

    // Handle upcoming page change
    const handleUpcomingPageChange = (page: number) => {
        setUpcomingPage(page);
        updateSearchParams({ pageNumber: page });
    };

    // Handle past page change
    const handlePastPageChange = (page: number) => {
        setPastPage(page);
        updateSearchParams({ pageNumber: page });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };

    const getCategoryIcon = (category: string) => {
        const lowerCategory = category.toLowerCase();
        switch (lowerCategory) {
            case "competition":
            case "competitions":
                return <Trophy className="w-3 h-3 mr-1" />;
            case "workshop":
            case "workshops":
                return <BookOpen className="w-3 h-3 mr-1" />;
            case "session":
            case "sessions":
                return <Users className="w-3 h-3 mr-1" />;
            case "explore":
                return <Calendar className="w-3 h-3 mr-1" />;
            default:
                return <Calendar className="w-3 h-3 mr-1" />;
        }
    };

    // Handle event registration
    const handleRegister = (event: any) => {
        setSelectedEvent(event);
        setIsDialogOpen(true);
    };

    // Handle dialog close
    const handleDialogClose = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            setSelectedEvent(null);
        }
    };

    const getBadgeVariant = (category: string) => {
        const lowerCategory = category.toLowerCase();
        switch (lowerCategory) {
            case "competition":
            case "competitions":
                return "default" as const;
            case "workshop":
            case "workshops":
                return "secondary" as const;
            case "session":
            case "sessions":
                return "outline" as const;
            default:
                return "outline" as const;
        }
    };

    if (upcomingLoading || pastLoading || typesLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">
                    Loading events...
                </span>
            </div>
        );
    }

    if (upcomingError || pastError) {
        console.log("Error loading events:", upcomingError || pastError);
        return (
            <div className="text-center py-16">
                <p className="text-muted-foreground">
                    Error loading events. Please try again later.
                </p>
            </div>
        );
    }

    // Create dynamic categories from event types
    const dynamicCategories = [
        "All Events",
        ...(eventTypes?.map((type) => type.event_type_name) || []),
    ];

    return (
        <div className="space-y-16">
            {/* Event Categories Tabs */}
            <section className="px-4">
                <div className="max-w-6xl mx-auto">
                    <Tabs
                        value={activeCategory}
                        onValueChange={handleCategoryChange}
                        className="w-full"
                    >
                        <TabsList
                            className={`grid w-full mb-8`}
                            style={{
                                gridTemplateColumns: `repeat(${Math.min(
                                    dynamicCategories.length,
                                    6
                                )}, 1fr)`,
                            }}
                        >
                            {dynamicCategories.slice(0, 6).map((category) => (
                                <TabsTrigger
                                    key={category}
                                    value={category}
                                    className="text-sm font-medium"
                                >
                                    {category}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>
            </section>

            {/* Upcoming Events */}
            <section className="px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold mb-8">
                        {activeCategory === "All Events"
                            ? "Upcoming Events"
                            : `Upcoming ${activeCategory}`}
                    </h2>

                    {!filteredUpcomingEvents ||
                    filteredUpcomingEvents.length === 0 ? (
                        <Card className="p-8 text-center">
                            <p className="text-muted-foreground">
                                {activeCategory === "All Events"
                                    ? "No upcoming events at the moment."
                                    : `No upcoming ${activeCategory.toLowerCase()} events at the moment.`}
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Check back soon for new events!
                            </p>
                        </Card>
                    ) : (
                        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {filteredUpcomingEvents.map((event) => (
                                <Card
                                    key={event.id}
                                    className="hover:shadow-lg transition-shadow overflow-hidden"
                                >
                                    {/* Event Image */}
                                    <div className="h-48 bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
                                        {event.poster_url ? (
                                            <img
                                                src={event.poster_url}
                                                alt={event.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                                                <div className="text-center text-white">
                                                    {getCategoryIcon(
                                                        event.event_type
                                                            ?.event_type_name ||
                                                            ""
                                                    )}
                                                    <div className="mt-2 text-sm opacity-75">
                                                        {event.event_type
                                                            ?.event_type_name ||
                                                            "Event"}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {/* Event Type Badge */}
                                        <div className="absolute top-3 left-3">
                                            <Badge
                                                variant={getBadgeVariant(
                                                    event.event_type
                                                        ?.event_type_name || ""
                                                )}
                                                className="bg-white/90 text-slate-800 hover:bg-white"
                                            >
                                                {event.event_type
                                                    ?.event_type_name ||
                                                    "Event"}
                                            </Badge>
                                        </div>
                                        {/* This Week Badge */}
                                        {event.event_date &&
                                            new Date(event.event_date) <=
                                                new Date(
                                                    Date.now() +
                                                        7 * 24 * 60 * 60 * 1000
                                                ) && (
                                                <div className="absolute top-3 right-3">
                                                    <Badge
                                                        variant="destructive"
                                                        className="animate-pulse"
                                                    >
                                                        This Week
                                                    </Badge>
                                                </div>
                                            )}
                                    </div>

                                    {/* Event Content */}
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-xl mb-2 line-clamp-2">
                                            {event.title}
                                        </CardTitle>
                                        <CardDescription className="text-sm text-muted-foreground line-clamp-2">
                                            {event.description}
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="pt-0">
                                        {/* Event Details */}
                                        <div className="space-y-2 text-sm text-muted-foreground mb-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                <span>
                                                    {event.event_date
                                                        ? formatDate(
                                                              event.event_date
                                                          )
                                                        : "TBD"}
                                                </span>
                                                <Clock className="w-4 h-4 ml-4" />
                                                <span>
                                                    {event.event_date
                                                        ? `${formatTime(
                                                              event.event_date
                                                          )} - ${
                                                              event.end_date
                                                                  ? formatTime(
                                                                        event.end_date
                                                                    )
                                                                  : "TBD"
                                                          }`
                                                        : "TBD"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4" />
                                                <span>
                                                    {event.location || "TBD"}
                                                </span>
                                                <Users className="w-4 h-4 ml-4" />
                                                <span>
                                                    {event.is_online
                                                        ? "Online Event"
                                                        : "In-Person"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            <Button 
                                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                                                onClick={() => handleRegister(event)}
                                            >
                                                Register
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => handleRegister(event)}
                                            >
                                                View Details
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Upcoming Events Pagination */}
                    {filteredUpcomingEvents &&
                        filteredUpcomingEvents.length > 0 && (
                            <div className="mt-8 flex justify-center">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (upcomingPage > 1) {
                                                        handleUpcomingPageChange(
                                                            upcomingPage - 1
                                                        );
                                                    }
                                                }}
                                                className={
                                                    upcomingPage <= 1
                                                        ? "pointer-events-none opacity-50"
                                                        : "cursor-pointer"
                                                }
                                            />
                                        </PaginationItem>

                                        {/* Page Numbers */}
                                        {Array.from(
                                            {
                                                length: Math.min(
                                                    5,
                                                    Math.max(
                                                        3,
                                                        upcomingPage + 2
                                                    )
                                                ),
                                            },
                                            (_, i) => {
                                                const pageNum =
                                                    Math.max(
                                                        1,
                                                        upcomingPage - 2
                                                    ) + i;
                                                if (
                                                    pageNum <=
                                                    upcomingPage + 2
                                                ) {
                                                    return (
                                                        <PaginationItem
                                                            key={pageNum}
                                                        >
                                                            <PaginationLink
                                                                href="#"
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.preventDefault();
                                                                    handleUpcomingPageChange(
                                                                        pageNum
                                                                    );
                                                                }}
                                                                isActive={
                                                                    pageNum ===
                                                                    upcomingPage
                                                                }
                                                                className="cursor-pointer"
                                                            >
                                                                {pageNum}
                                                            </PaginationLink>
                                                        </PaginationItem>
                                                    );
                                                }
                                                return null;
                                            }
                                        )}

                                        <PaginationItem>
                                            <PaginationNext
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (hasMoreUpcoming) {
                                                        handleUpcomingPageChange(
                                                            upcomingPage + 1
                                                        );
                                                    }
                                                }}
                                                className={
                                                    !hasMoreUpcoming
                                                        ? "pointer-events-none opacity-50"
                                                        : "cursor-pointer"
                                                }
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                </div>
            </section>

            {/* Past Events */}
            {filteredPastEvents && filteredPastEvents.length > 0 && (
                <section className="px-4 bg-muted/50 py-16">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-3xl font-bold mb-8">
                            {activeCategory === "All Events"
                                ? "Recent Events"
                                : `Recent ${activeCategory}`}
                        </h2>

                        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
                            {filteredPastEvents.map((event) => (
                                <Card
                                    key={event.id}
                                    className="hover:shadow-lg transition-shadow overflow-hidden opacity-80"
                                >
                                    {/* Event Image */}
                                    <div className="h-48 bg-gradient-to-br from-slate-600 to-slate-700 relative overflow-hidden">
                                        {event.poster_url ? (
                                            <img
                                                src={event.poster_url}
                                                alt={event.title}
                                                className="w-full h-full object-cover grayscale"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-600 to-slate-700">
                                                <div className="text-center text-white">
                                                    {getCategoryIcon(
                                                        event.event_type
                                                            ?.event_type_name ||
                                                            ""
                                                    )}
                                                    <div className="mt-2 text-sm opacity-75">
                                                        {event.event_type
                                                            ?.event_type_name ||
                                                            "Event"}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {/* Completed Badge */}
                                        <div className="absolute top-3 left-3">
                                            <Badge
                                                variant="outline"
                                                className="bg-white/90 text-slate-800"
                                            >
                                                Completed
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Event Content */}
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-lg mb-2 line-clamp-2">
                                            {event.title}
                                        </CardTitle>
                                        <CardDescription className="text-sm text-muted-foreground line-clamp-2">
                                            {event.description}
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="pt-0">
                                        <div className="space-y-2 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                <span>
                                                    {event.event_date
                                                        ? formatDate(
                                                              event.event_date
                                                          )
                                                        : "TBD"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4" />
                                                <span>
                                                    {event.location || "TBD"}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Past Events Pagination */}
                        <div className="mt-8 flex justify-center">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (pastPage > 1) {
                                                    handlePastPageChange(
                                                        pastPage - 1
                                                    );
                                                }
                                            }}
                                            className={
                                                pastPage <= 1
                                                    ? "pointer-events-none opacity-50"
                                                    : "cursor-pointer"
                                            }
                                        />
                                    </PaginationItem>

                                    {/* Page Numbers */}
                                    {Array.from(
                                        {
                                            length: Math.min(
                                                5,
                                                Math.max(3, pastPage + 2)
                                            ),
                                        },
                                        (_, i) => {
                                            const pageNum =
                                                Math.max(1, pastPage - 2) + i;
                                            if (pageNum <= pastPage + 2) {
                                                return (
                                                    <PaginationItem
                                                        key={pageNum}
                                                    >
                                                        <PaginationLink
                                                            href="#"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handlePastPageChange(
                                                                    pageNum
                                                                );
                                                            }}
                                                            isActive={
                                                                pageNum ===
                                                                pastPage
                                                            }
                                                            className="cursor-pointer"
                                                        >
                                                            {pageNum}
                                                        </PaginationLink>
                                                    </PaginationItem>
                                                );
                                            }
                                            return null;
                                        }
                                    )}

                                    <PaginationItem>
                                        <PaginationNext
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (hasMorePast) {
                                                    handlePastPageChange(
                                                        pastPage + 1
                                                    );
                                                }
                                            }}
                                            className={
                                                !hasMorePast
                                                    ? "pointer-events-none opacity-50"
                                                    : "cursor-pointer"
                                            }
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    </div>
                </section>
            )}
            
            {/* Registration Dialog */}
            <EventRegistrationDialog
                event={selectedEvent}
                isOpen={isDialogOpen}
                onOpenChange={handleDialogClose}
            />
        </div>
    );
}
