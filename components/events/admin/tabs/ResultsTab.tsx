"use client";

import { useState, useEffect, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, ArrowUpDown, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  getResultsForCompetitionAction,
  bulkCreateResultsAction,
  updateResultAction,
} from "@/actions/competition-results";
import type { Competition } from "@/lib/db/competitions";
import type { ParticipantWithRegistrations } from "@/lib/db/participants";

interface ResultsTabProps {
  competitions: Competition[];
  eventId: string;
  participants: ParticipantWithRegistrations[];
}

interface ResultRow {
  participantId: string;
  teamId?: string;
  name: string;
  institution: string;
  score: string;
  rank: string;
  remarks: string;
  certificateUrl: string;
  existingResultId?: string;
}

export default function ResultsTab({ competitions, eventId, participants }: ResultsTabProps) {
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string | null>(null);
  const [rows, setRows] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, startSaveTransition] = useTransition();

  useEffect(() => {
    if (!selectedCompetitionId) {
      setRows([]);
      return;
    }

    async function loadResults() {
      setLoading(true);
      try {
        const resultsRes = await getResultsForCompetitionAction(selectedCompetitionId!);

        // Filter approved participants for the selected competition
        const approvedParticipants = participants.filter((pw) =>
          pw.registrations.some(
            (r) =>
              r.competition_id === selectedCompetitionId && r.status === "approved"
          )
        );

        const existingResults: Record<string, any> = {};
        if (resultsRes.success && resultsRes.data) {
          for (const result of resultsRes.data) {
            if (result.participant_id) {
              existingResults[result.participant_id] = result;
            }
          }
        }

        const newRows: ResultRow[] = approvedParticipants.map((pw) => {
          const existing = existingResults[pw.participant.id];
          return {
            participantId: pw.participant.id,
            name: pw.participant.name,
            institution: pw.participant.institution,
            score: existing?.score != null ? String(existing.score) : "",
            rank: existing?.rank != null ? String(existing.rank) : "",
            remarks: existing?.remarks ?? "",
            certificateUrl: existing?.certificate_url ?? "",
            existingResultId: existing?.id,
          };
        });

        setRows(newRows);
      } catch (err) {
        toast.error("Failed to load results");
      } finally {
        setLoading(false);
      }
    }

    loadResults();
  }, [selectedCompetitionId, participants]);

  function handleRowChange(index: number, field: keyof ResultRow, value: string) {
    setRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function handleAutoRank() {
    setRows((prev) => {
      const withScores = prev
        .map((row, i) => ({ row, i, score: parseFloat(row.score) }))
        .filter((entry) => !isNaN(entry.score));

      withScores.sort((a, b) => b.score - a.score);

      const updated = [...prev];
      withScores.forEach((entry, rankIndex) => {
        updated[entry.i] = { ...updated[entry.i], rank: String(rankIndex + 1) };
      });
      return updated;
    });
  }

  function handleSave() {
    if (!selectedCompetitionId) return;

    startSaveTransition(async () => {
      const toUpdate = rows.filter((r) => r.existingResultId);
      const toCreate = rows.filter((r) => !r.existingResultId && r.score !== "");

      const errors: string[] = [];

      // Update existing results
      await Promise.all(
        toUpdate.map(async (row) => {
          const res = await updateResultAction(row.existingResultId!, {
            score: row.score !== "" ? parseFloat(row.score) : undefined,
            rank: row.rank !== "" ? parseInt(row.rank, 10) : undefined,
            remarks: row.remarks || undefined,
            certificate_url: row.certificateUrl || undefined,
          });
          if (!res.success) errors.push(`Update failed for ${row.name}: ${res.error}`);
        })
      );

      // Bulk-create new results
      if (toCreate.length > 0) {
        const res = await bulkCreateResultsAction(
          toCreate.map((row) => ({
            competition_id: selectedCompetitionId,
            participant_id: row.participantId,
            score: row.score !== "" ? parseFloat(row.score) : undefined,
            rank: row.rank !== "" ? parseInt(row.rank, 10) : undefined,
            remarks: row.remarks || undefined,
            certificate_url: row.certificateUrl || undefined,
          }))
        );
        if (!res.success) errors.push(`Bulk create failed: ${res.error}`);
      }

      if (errors.length > 0) {
        toast.error(errors.join("; "));
      } else {
        toast.success("Results saved successfully");
        // Re-fetch to sync existingResultId values
        const resultsRes = await getResultsForCompetitionAction(selectedCompetitionId);
        if (resultsRes.success && resultsRes.data) {
          const existingResults: Record<string, any> = {};
          for (const result of resultsRes.data) {
            if (result.participant_id) existingResults[result.participant_id] = result;
          }
          setRows((prev) =>
            prev.map((row) => {
              const existing = existingResults[row.participantId];
              return existing ? { ...row, existingResultId: existing.id } : row;
            })
          );
        }
      }
    });
  }

  const selectedCompetition = competitions.find((c) => c.id === selectedCompetitionId);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <div>
            <CardTitle>Competition Results</CardTitle>
            <CardDescription>
              Select a competition to enter or edit participant scores and ranks.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Competition Selector */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <Select
            value={selectedCompetitionId ?? ""}
            onValueChange={(val) => setSelectedCompetitionId(val || null)}
          >
            <SelectTrigger className="w-full sm:w-72">
              <SelectValue placeholder="Select a competition…" />
            </SelectTrigger>
            <SelectContent>
              {competitions.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {rows.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAutoRank}
                disabled={saving}
              >
                <ArrowUpDown className="h-4 w-4 mr-1.5" />
                Auto-rank by score
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-1.5" />
                )}
                Save Results
              </Button>
            </div>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading participants…
          </div>
        )}

        {/* No competition selected */}
        {!selectedCompetitionId && !loading && (
          <p className="text-muted-foreground text-sm py-4">
            Select a competition above to manage results.
          </p>
        )}

        {/* No approved participants */}
        {selectedCompetitionId && !loading && rows.length === 0 && (
          <p className="text-muted-foreground text-sm py-4">
            No approved participants found for{" "}
            <span className="font-medium">{selectedCompetition?.title}</span>.
          </p>
        )}

        {/* Results table */}
        {rows.length > 0 && !loading && (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[160px]">Participant</TableHead>
                  <TableHead className="min-w-[140px]">Institution</TableHead>
                  <TableHead className="w-24">Score</TableHead>
                  <TableHead className="w-20">Rank</TableHead>
                  <TableHead className="min-w-[160px]">Remarks</TableHead>
                  <TableHead className="min-w-[180px]">Certificate URL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, i) => (
                  <TableRow key={row.participantId}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell className="text-muted-foreground">{row.institution}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        placeholder="0"
                        value={row.score}
                        onChange={(e) => handleRowChange(i, "score", e.target.value)}
                        className="h-8 w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={1}
                        placeholder="—"
                        value={row.rank}
                        onChange={(e) => handleRowChange(i, "rank", e.target.value)}
                        className="h-8 w-16"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="Optional remarks"
                        value={row.remarks}
                        onChange={(e) => handleRowChange(i, "remarks", e.target.value)}
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="https://…"
                        value={row.certificateUrl}
                        onChange={(e) => handleRowChange(i, "certificateUrl", e.target.value)}
                        className="h-8"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
