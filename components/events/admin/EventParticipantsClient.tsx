'use client';

import { useState, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  Building, 
  GraduationCap,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";
import { type EventRow } from "@/queries/events";
import { type CompetitionRow } from "@/queries/competitions";
import { 
  updateParticipantStatusAction, 
  updateAllParticipantStatusesAction 
} from "@/actions/participants";
import { toast } from "sonner";
import { format } from "date-fns";

interface ParticipantData {
  participant: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    institution: string;
    class: number;
    id_at_institution: string;
    note: string;
    transaction_id: string | null;
    payment_provider: string | null;
    created_at: string;
  };
  registrations: Array<{
    id: string;
    competition_id: string;
    status: string;
    created_at: string;
    updated_at: string;
    competition: CompetitionRow;
  }>;
}

interface EventParticipantsClientProps {
  event: EventRow;
  competitions: CompetitionRow[];
  participants: ParticipantData[];
  error?: string;
}

export default function EventParticipantsClient({
  event,
  competitions,
  participants,
  error,
}: EventParticipantsClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompetition, setSelectedCompetition] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

  // Filter participants based on search term, competition, and status
  const filteredParticipants = useMemo(() => {
    return participants.filter((participantData) => {
      const { participant, registrations } = participantData;
      
      // Search filter
      const searchMatch = 
        participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.id_at_institution.toLowerCase().includes(searchTerm.toLowerCase());

      if (!searchMatch) return false;

      // Competition filter
      if (selectedCompetition !== "all") {
        const hasCompetition = registrations.some(reg => reg.competition_id === selectedCompetition);
        if (!hasCompetition) return false;
      }

      // Status filter
      if (statusFilter !== "all") {
        const hasStatus = registrations.some(reg => reg.status === statusFilter);
        if (!hasStatus) return false;
      }

      return true;
    });
  }, [participants, searchTerm, selectedCompetition, statusFilter]);

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return <Badge variant="default" className="bg-green-500">Confirmed</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Handle individual status update
  const handleStatusUpdate = async (registrationId: string, newStatus: string) => {
    setIsUpdatingStatus(registrationId);
    try {
      const result = await updateParticipantStatusAction(registrationId, newStatus, event.id);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update status");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  // Handle all statuses update for a participant
  const handleAllStatusesUpdate = async (participantId: string, newStatus: string) => {
    setIsUpdatingStatus(`all-${participantId}`);
    try {
      const result = await updateAllParticipantStatusesAction(participantId, event.id, newStatus);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update all statuses");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  // Get participant statistics
  const stats = useMemo(() => {
    const totalParticipants = participants.length;
    let confirmedCount = 0;
    let pendingCount = 0;
    let totalRegistrations = 0;

    participants.forEach(({ registrations }) => {
      totalRegistrations += registrations.length;
      const hasConfirmed = registrations.some(reg => reg.status === "confirmed");
      const hasPending = registrations.some(reg => reg.status === "pending");
      
      if (hasConfirmed) confirmedCount++;
      else if (hasPending) pendingCount++;
    });

    return {
      total: totalParticipants,
      confirmed: confirmedCount,
      pending: pendingCount,
      totalRegistrations,
    };
  }, [participants]);

  return (
    <div className="space-y-6 p-6 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Event
          </Button> */}
          <div>
            <h1 className="text-2xl font-bold">Event Participants</h1>
            <p className="text-muted-foreground">{event.title}</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-full">
                <GraduationCap className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Participants</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold">{stats.confirmed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-yellow-100 rounded-full">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-full">
                <AlertCircle className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Registrations</p>
                <p className="text-2xl font-bold">{stats.totalRegistrations}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search Participants</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, email, institution..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Competition Filter */}
            <div className="space-y-2">
              <Label>Competition</Label>
              <Select value={selectedCompetition} onValueChange={setSelectedCompetition}>
                <SelectTrigger>
                  <SelectValue placeholder="Select competition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Competitions</SelectItem>
                  {competitions.map((competition) => (
                    <SelectItem key={competition.id} value={competition.id}>
                      {competition.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Participants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Participants ({filteredParticipants.length})</CardTitle>
          <CardDescription>
            Manage participant registrations and verify their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8 text-destructive">
              Error loading participants: {error}
            </div>
          ) : filteredParticipants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No participants found matching your filters
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Participant</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Institution</TableHead>
                    <TableHead>Competitions</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParticipants.map(({ participant, registrations }) => (
                    <TableRow key={participant.id}>
                      {/* Participant Info */}
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{participant.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ID: {participant.id_at_institution}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Class: {participant.class}
                          </p>
                          {participant.note && (
                            <p className="text-sm text-blue-600 italic">
                              Note: {participant.note}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      {/* Contact */}
                      <TableCell>
                        <div className="space-y-1">
                          {participant.email && (
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3" />
                              {participant.email}
                            </div>
                          )}
                          {participant.phone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />
                              {participant.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Institution */}
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          <span className="text-sm">{participant.institution}</span>
                        </div>
                      </TableCell>

                      {/* Competitions */}
                      <TableCell>
                        <div className="space-y-2">
                          {registrations.map((registration) => (
                            <div key={registration.id} className="flex items-center justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium">
                                    {registration.competition.title}
                                  </p>
                                  <p className="text-sm font-semibold text-green-600">
                                    ৳{registration.competition.fee}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {getStatusBadge(registration.status)}
                                  <Select
                                    value={registration.status}
                                    onValueChange={(value) => handleStatusUpdate(registration.id, value)}
                                    disabled={isUpdatingStatus === registration.id}
                                  >
                                    <SelectTrigger className="h-6 w-24 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="confirmed">Confirmed</SelectItem>
                                      <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>
                          ))}
                          {/* Total Fee */}
                          <div className="pt-2 mt-2 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-bold text-gray-700">
                                Total Fee:
                              </p>
                              <p className="text-sm font-bold text-green-700">
                                ৳{registrations.reduce((total, reg) => total + reg.competition.fee, 0)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Payment */}
                      <TableCell>
                        {participant.transaction_id ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <CreditCard className="h-3 w-3" />
                              {participant.payment_provider || "Unknown"}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {participant.transaction_id}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No payment info</span>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <div className="space-y-2">
                          <Select
                            onValueChange={(value) => handleAllStatusesUpdate(participant.id, value)}
                            disabled={isUpdatingStatus === `all-${participant.id}`}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Update All" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Set All Pending</SelectItem>
                              <SelectItem value="confirmed">Set All Confirmed</SelectItem>
                              <SelectItem value="rejected">Set All Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            Registered: {format(new Date(participant.created_at), "PP")}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
