'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Calendar, MapPin, Clock, User, Tag, FileText } from "lucide-react";
import { type EventRow } from "@/queries/events";
import { type CompetitionRow } from "@/queries/competitions";
import AddCompetitionDialog from "./AddCompetitionDialog";
import CompetitionsList from "./CompetitionsList";
import { format } from "date-fns";
import { MinimalTiptapEditor } from "@/components/ui/minimal-tiptap";
import { JSONContent } from "@tiptap/react";

interface AdminEventDetailClientProps {
  event: EventRow;
  competitions: CompetitionRow[];
  error?: string;
}

function formatRichTextToPlainText(richText: any): string {
  if (!richText) return "No description available";
  
  try {
    if (typeof richText === 'string') {
      return richText;
    }
    
    if (typeof richText === 'object' && richText.type === 'doc') {
      let text = '';
      
      function extractText(node: any): void {
        if (node.type === 'text') {
          text += node.text;
        } else if (node.content) {
          node.content.forEach(extractText);
        }
      }
      
      richText.content?.forEach(extractText);
      return text || "No description available";
    }
    
    return JSON.stringify(richText);
  } catch {
    return "No description available";
  }
}

export default function AdminEventDetailClient({ 
  event, 
  competitions, 
  error 
}: AdminEventDetailClientProps) {
  const router = useRouter();
  const [isAddCompetitionOpen, setIsAddCompetitionOpen] = useState(false);

  const getStatusBadge = (isPublished: boolean) => {
    return isPublished ? (
      <Badge variant="default" className="bg-green-500">
        Published
      </Badge>
    ) : (
      <Badge variant="secondary">Unpublished</Badge>
    );
  };

  const getModeBadge = (eventMode: string) => {
    switch (eventMode) {
      case "Online":
        return <Badge variant="default" className="bg-blue-500">Online</Badge>;
      case "In Person":
        return <Badge variant="default" className="bg-green-500">In Person</Badge>;
      case "Hybrid":
        return <Badge variant="default" className="bg-purple-500">Hybrid</Badge>;
      default:
        return <Badge variant="outline">{eventMode}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Event Details Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{event.title}</CardTitle>
              <div className="flex items-center gap-2">
                {getStatusBadge(event.is_published)}
                {getModeBadge(event.event_mode)}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
              className="flex items-center gap-2"
              onClick={() => router.push(`/admin/events/${event.id}/participants`)}
            >
              View Participants
            </Button>
            <Button
              onClick={() => setIsAddCompetitionOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Competition
            </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Event Description */}
          {event.description && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium">Description</h3>
              </div>
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                <MinimalTiptapEditor
                value={event.description as JSONContent}
                className="w-full border-0 p-0 m-0"
                output="json"
                autofocus={false}
                editable={false}
                editorClassName="focus:outline-hidden"
                hideToolbar={true}
              />
              </div>
            </div>
          )}

          <Separator />

          {/* Event Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Event Date */}
            {event.event_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Event Date</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.event_date), "PPP")}
                  </p>
                </div>
              </div>
            )}

            {/* End Date */}
            {event.end_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">End Date</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.end_date), "PPP")}
                  </p>
                </div>
              </div>
            )}

            {/* Registration Deadline */}
            {event.registration_deadline && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Registration Deadline</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.registration_deadline), "PPP")}
                  </p>
                </div>
              </div>
            )}

            {/* Venue */}
            {event.venue && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Venue</p>
                  <p className="text-sm text-muted-foreground">{event.venue}</p>
                </div>
              </div>
            )}

            {/* Created Date */}
            {event.created_at && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.created_at), "PPP")}
                  </p>
                </div>
              </div>
            )}

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="flex items-start gap-2 md:col-span-2 lg:col-span-3">
                <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Tags</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {event.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Competitions Section */}
      <Card>
        <CardHeader>
          <CardTitle>Competitions</CardTitle>
          <CardDescription>
            Manage competitions for this event. You can drag and drop to reorder them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8 text-destructive">
              Error loading competitions: {error}
            </div>
          ) : (
            <CompetitionsList 
              competitions={competitions} 
              eventId={event.id}
            />
          )}
        </CardContent>
      </Card>

      {/* Add Competition Dialog */}
      <AddCompetitionDialog
        open={isAddCompetitionOpen}
        onOpenChange={setIsAddCompetitionOpen}
        eventId={event.id}
      />
    </div>
  );
}
