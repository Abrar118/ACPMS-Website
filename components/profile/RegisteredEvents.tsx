"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Clock, Users } from "lucide-react";
import Image from "next/image";
import type { EventRegistrationWithEvent } from "@/queries/profile";

interface RegisteredEventsProps {
    events: EventRegistrationWithEvent[];
    isLoading: boolean;
    error: any;
}

export default function RegisteredEvents({ events, isLoading, error }: RegisteredEventsProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                            <div className="w-16 h-16 bg-muted rounded-lg mr-4" />
                            <div className="space-y-2 flex-1">
                                <div className="h-4 bg-muted rounded w-3/4" />
                                <div className="h-3 bg-muted rounded w-1/2" />
                            </div>
                        </CardHeader>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-destructive">Failed to load registered events</p>
            </div>
        );
    }

    if (!events || events.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <CalendarDays className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Registered Events</h3>
                <p className="text-muted-foreground">
                    You haven't registered for any upcoming events yet.
                </p>
            </div>
        );
    }

    return (
        <ScrollArea className="h-[500px] w-full">
            <div className="space-y-4">
                {events.map((registration) => {
                    const event = registration.event;
                    if (!event) return null;

                    return (
                        <Card key={registration.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center space-y-0 pb-4">
                                {event.poster_url && (
                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden mr-4 flex-shrink-0">
                                        <Image
                                            src={event.poster_url}
                                            alt={event.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg font-semibold leading-tight mb-2">
                                                {event.title}
                                            </CardTitle>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                                <div className="flex items-center gap-1">
                                                    <CalendarDays className="h-4 w-4" />
                                                    <span>{event.event_date ? formatDate(event.event_date) : "Date TBA"}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-4 w-4" />
                                                    <span>{event.location || "Location TBA"}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            {event.event_type && (
                                                <Badge variant="secondary" className="text-xs">
                                                    {event.event_type.event_type_name}
                                                </Badge>
                                            )}
                                            <Badge 
                                                variant={registration.registration_status === "confirmed" ? "default" : "outline"}
                                                className="text-xs"
                                            >
                                                {registration.registration_status || "Pending"}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            {event.description && (
                                <CardContent className="pt-0">
                                    <CardDescription className="text-sm leading-relaxed">
                                        {event.description.length > 150 
                                            ? `${event.description.substring(0, 150)}...`
                                            : event.description
                                        }
                                    </CardDescription>
                                </CardContent>
                            )}
                        </Card>
                    );
                })}
            </div>
        </ScrollArea>
    );
}
