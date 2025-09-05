'use client';

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Filter, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AddEventDialog from "@/components/events/admin/addEventForm/addEventDialog";
import { EEventMode } from "@/components/shared/enums";
import { type EventRow } from "@/queries/events";
import { EventActions } from "@/components/events/admin/EventActions";

interface AdminEventsClientProps {
  events: EventRow[];
  error?: string;
}

function getStatusBadge(isPublished: boolean) {
  if (isPublished) {
    return (
      <Badge variant="default" className="bg-green-500">
        Published
      </Badge>
    );
  } else {
    return <Badge variant="secondary">Unpublished</Badge>;
  }
}

function getTypeBadge(eventMode: string | undefined) {
  if (!eventMode) return <Badge variant="outline">Unknown</Badge>;

  switch (eventMode) {
    case EEventMode.Online:
      return (
        <Badge variant="default" className="bg-blue-500">
          Online
        </Badge>
      );
    case EEventMode.InPerson:
      return (
        <Badge variant="default" className="bg-green-500">
          In Person
        </Badge>
      );
    case EEventMode.Hybrid:
      return (
        <Badge variant="default" className="bg-purple-500">
          Hybrid
        </Badge>
      );
    default:
      return <Badge variant="outline">{eventMode}</Badge>;
  }
}

function EventRow({ event }: { event: EventRow }) {
  return (
    <TableRow>
      <TableCell className="font-medium max-w-[200px]">
        <div className="max-w-[300px] text-ellipsis overflow-hidden">
          <div className="font-medium">{event.title}</div>
          <div className="text-sm text-muted-foreground">
            {typeof event.description === 'string' ? event.description : 'No description'}
          </div>
        </div>
      </TableCell>
      <TableCell>
        {event.event_date &&
          new Date(event.event_date).toLocaleDateString()}
      </TableCell>
      <TableCell>{event.venue || "TBD"}</TableCell>
      <TableCell>{getStatusBadge(event.is_published)}</TableCell>
      <TableCell>{getTypeBadge(event.event_mode)}</TableCell>
      <TableCell>
        {event.created_at &&
          new Date(event.created_at).toLocaleDateString()}
      </TableCell>
      <TableCell className="text-right">
        <EventActions event={event} />
      </TableCell>
    </TableRow>
  );
}

export default function AdminEventsClient({ events, error }: AdminEventsClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedMode, setSelectedMode] = useState<string>("all");

  // Get unique statuses and modes
  const availableStatuses = useMemo(() => {
    return Array.from(new Set(events.map(e => e.is_published ? "Published" : "Unpublished"))).sort();
  }, [events]);

  const availableModes = useMemo(() => {
    return Array.from(new Set(events.map(e => e.event_mode).filter((m): m is string => Boolean(m)))).sort();
  }, [events]);

  // Filter events based on search term and filters
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (typeof event.description === 'string' && event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        event.venue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = selectedStatus === "all" || 
        (selectedStatus === "Published" && event.is_published) ||
        (selectedStatus === "Unpublished" && !event.is_published);
      
      const matchesMode = selectedMode === "all" || event.event_mode === selectedMode;

      return matchesSearch && matchesStatus && matchesMode;
    });
  }, [events, searchTerm, selectedStatus, selectedMode]);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading Events</CardTitle>
          <CardDescription className="text-destructive">
            {error}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              Failed to load events
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Please try refreshing the page or contact support if the issue
              persists.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>All Events</CardTitle>
            <CardDescription>
              Manage all events and their details ({filteredEvents.length} of {events.length} events)
            </CardDescription>
          </div>
          <AddEventDialog />
        </div>
        
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search events..." 
              className="pl-9" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Filters */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            
            {/* Status Filter */}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {availableStatuses.map(status => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Mode Filter */}
            <Select value={selectedMode} onValueChange={setSelectedMode}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                {availableModes.map(mode => (
                  <SelectItem key={mode} value={mode}>
                    {mode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Table className="overflow-x-scroll">
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Venue</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">
                      {searchTerm || selectedStatus !== "all" || selectedMode !== "all"
                        ? "No events match your filters"
                        : "No events found"
                      }
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {searchTerm || selectedStatus !== "all" || selectedMode !== "all"
                        ? "Try adjusting your search or filter criteria."
                        : "Get started by adding your first event."
                      }
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredEvents.map((event) => (
                <EventRow key={event.id} event={event} />
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
