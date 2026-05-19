"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Competition } from "@/lib/db/competitions";
import type { ParticipantWithRegistrations } from "@/lib/db/participants";

interface TeamsTabProps {
  competitions: Competition[];
  eventId: string;
  participants: ParticipantWithRegistrations[];
}

export default function TeamsTab({ competitions, eventId, participants }: TeamsTabProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Teams</CardTitle></CardHeader>
      <CardContent><p className="text-muted-foreground">Team management — create teams and manage members.</p></CardContent>
    </Card>
  );
}
