"use client";

import { useState, useEffect, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Users,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  createTeamAction,
  deleteTeamAction,
  addTeamMemberAction,
  removeTeamMemberAction,
  getTeamsForEventAction,
} from "@/actions/teams";
import type { Competition } from "@/lib/db/competitions";
import type { ParticipantWithRegistrations } from "@/lib/db/participants";
import type { TeamWithMembers } from "@/lib/db/teams";

interface TeamsTabProps {
  competitions: Competition[];
  eventId: string;
  participants: ParticipantWithRegistrations[];
}

export default function TeamsTab({
  competitions,
  eventId,
  participants,
}: TeamsTabProps) {
  const [teams, setTeams] = useState<TeamWithMembers[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamInstitution, setNewTeamInstitution] = useState("");
  const [addMemberParticipantId, setAddMemberParticipantId] = useState<
    Record<string, string>
  >({});
  const [addMemberRole, setAddMemberRole] = useState<Record<string, string>>(
    {}
  );
  const [isPending, startTransition] = useTransition();

  const competitionIds = competitions.map((c) => c.id);

  // Unique participants from props
  const uniqueParticipants = Array.from(
    new Map(participants.map((p) => [p.participant.id, p.participant])).values()
  );

  const fetchTeams = async () => {
    if (competitionIds.length === 0) {
      setTeams([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const result = await getTeamsForEventAction(competitionIds);
    if (result.success && result.data) {
      setTeams(result.data);
    } else {
      toast.error(result.error || "Failed to load teams");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const handleCreateTeam = () => {
    if (!newTeamName.trim()) {
      toast.error("Team name is required");
      return;
    }
    startTransition(async () => {
      const result = await createTeamAction({
        name: newTeamName.trim(),
        institution: newTeamInstitution.trim(),
      });
      if (result.success) {
        toast.success(result.message || "Team created");
        setNewTeamName("");
        setNewTeamInstitution("");
        setIsCreateOpen(false);
        await fetchTeams();
      } else {
        toast.error(result.error || "Failed to create team");
      }
    });
  };

  const handleDeleteTeam = (teamId: string, teamName: string) => {
    if (!confirm(`Delete team "${teamName}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteTeamAction(teamId);
      if (result.success) {
        toast.success(result.message || "Team deleted");
        if (expandedTeamId === teamId) setExpandedTeamId(null);
        await fetchTeams();
      } else {
        toast.error(result.error || "Failed to delete team");
      }
    });
  };

  const handleAddMember = (teamId: string) => {
    const participantId = addMemberParticipantId[teamId];
    const role = addMemberRole[teamId] || "member";
    if (!participantId) {
      toast.error("Select a participant first");
      return;
    }
    startTransition(async () => {
      const result = await addTeamMemberAction({
        team_id: teamId,
        participant_id: participantId,
        role,
      });
      if (result.success) {
        toast.success(result.message || "Member added");
        setAddMemberParticipantId((prev) => ({ ...prev, [teamId]: "" }));
        setAddMemberRole((prev) => ({ ...prev, [teamId]: "member" }));
        await fetchTeams();
      } else {
        toast.error(result.error || "Failed to add member");
      }
    });
  };

  const handleRemoveMember = (
    teamId: string,
    participantId: string,
    memberName: string
  ) => {
    startTransition(async () => {
      const result = await removeTeamMemberAction(teamId, participantId);
      if (result.success) {
        toast.success(result.message || "Member removed");
        await fetchTeams();
      } else {
        toast.error(result.error || "Failed to remove member");
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Teams</h2>
        <Button size="sm" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Create Team
        </Button>
      </div>

      {/* Create Team Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Team</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Team Name</label>
              <Input
                placeholder="e.g. Team Alpha"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Institution</label>
              <Input
                placeholder="e.g. XYZ School"
                value={newTeamInstitution}
                onChange={(e) => setNewTeamInstitution(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateTeam} disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Team Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : teams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
            <Users className="h-8 w-8" />
            <p>No teams yet. Create a team to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {teams.map((team) => {
            const isExpanded = expandedTeamId === team.id;
            return (
              <Card key={team.id}>
                <CardHeader className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <button
                      className="flex items-center gap-2 text-left flex-1 min-w-0"
                      onClick={() =>
                        setExpandedTeamId(isExpanded ? null : team.id)
                      }
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <div className="min-w-0">
                        <CardTitle className="text-sm font-semibold truncate">
                          {team.name}
                        </CardTitle>
                        {team.institution && (
                          <p className="text-xs text-muted-foreground truncate">
                            {team.institution}
                          </p>
                        )}
                      </div>
                    </button>
                    <div className="flex items-center gap-2 ml-2 shrink-0">
                      <Badge variant="secondary" className="text-xs">
                        {team.members.length}{" "}
                        {team.members.length === 1 ? "member" : "members"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteTeam(team.id, team.name)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0 px-4 pb-4 space-y-3">
                    {/* Member list */}
                    {team.members.length > 0 ? (
                      <ul className="space-y-1.5">
                        {team.members.map((member) => (
                          <li
                            key={member.participant_id}
                            className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                          >
                            <span className="font-medium truncate mr-2">
                              {member.participant.name}
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge
                                variant={
                                  member.role === "captain"
                                    ? "default"
                                    : "outline"
                                }
                                className="text-xs capitalize"
                              >
                                {member.role || "member"}
                              </Badge>
                              <button
                                className="text-muted-foreground hover:text-destructive transition-colors"
                                onClick={() =>
                                  handleRemoveMember(
                                    team.id,
                                    member.participant_id,
                                    member.participant.name
                                  )
                                }
                                disabled={isPending}
                                aria-label="Remove member"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        No members yet.
                      </p>
                    )}

                    {/* Add Member Form */}
                    <div className="flex items-center gap-2 pt-1">
                      <Select
                        value={addMemberParticipantId[team.id] || ""}
                        onValueChange={(val) =>
                          setAddMemberParticipantId((prev) => ({
                            ...prev,
                            [team.id]: val,
                          }))
                        }
                      >
                        <SelectTrigger className="flex-1 h-8 text-xs">
                          <SelectValue placeholder="Select participant..." />
                        </SelectTrigger>
                        <SelectContent>
                          {uniqueParticipants.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={addMemberRole[team.id] || "member"}
                        onValueChange={(val) =>
                          setAddMemberRole((prev) => ({
                            ...prev,
                            [team.id]: val,
                          }))
                        }
                      >
                        <SelectTrigger className="w-28 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="captain">Captain</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => handleAddMember(team.id)}
                        disabled={isPending || !addMemberParticipantId[team.id]}
                      >
                        {isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          "Add"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
