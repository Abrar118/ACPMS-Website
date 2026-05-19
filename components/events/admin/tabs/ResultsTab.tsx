"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Competition } from "@/lib/db/competitions";
import type { ParticipantWithRegistrations } from "@/lib/db/participants";

interface ResultsTabProps {
  competitions: Competition[];
  eventId: string;
  participants: ParticipantWithRegistrations[];
}

export default function ResultsTab({ competitions, eventId, participants }: ResultsTabProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Competition Results</CardTitle></CardHeader>
      <CardContent><p className="text-muted-foreground">Results management — select a competition to enter scores.</p></CardContent>
    </Card>
  );
}
