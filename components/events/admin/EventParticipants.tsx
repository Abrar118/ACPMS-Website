"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { updateParticipantStatusAction } from "@/actions/registration";
import createSupabaseBrowser from "@/utils/supabase/supabase-browser";
import { getEventParticipants } from "@/queries/participants";
import { Search, Download, Users, CheckCircle, XCircle, Clock } from "lucide-react";

interface EventParticipantsProps {
  eventId: string;
  eventTitle: string;
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  approved: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

const statusIcons = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle,
};

export default function EventParticipants({ eventId, eventTitle }: EventParticipantsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const supabase = createSupabaseBrowser();

  const { data: participants = [], isLoading, refetch } = useQuery({
    queryKey: ["event-participants", eventId],
    queryFn: async () => {
      const result = await getEventParticipants(supabase, eventId);
      if (result.success) {
        return result.data || [];
      }
      throw new Error(result.error || "Failed to fetch participants");
    },
  });

  const filteredParticipants = participants.filter((registration: any) => {
    const matchesSearch = 
      registration.participant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.participant?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.participant?.institution?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || registration.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = async (registrationId: string, newStatus: string) => {
    try {
      setUpdatingStatus(registrationId);
      
      const result = await updateParticipantStatusAction(registrationId, newStatus);
      
      if (result.success) {
        toast.success(`Status updated to ${newStatus}`);
        refetch();
      } else {
        toast.error(result.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Institution",
      "Class",
      "Student ID",
      "Competition",
      "Status",
      "Registration Date",
      "Transaction ID",
      "Payment Provider",
    ];

    const csvData = filteredParticipants.map((registration: any) => [
      registration.participant?.name || "",
      registration.participant?.email || "",
      registration.participant?.phone || "",
      registration.participant?.institution || "",
      registration.participant?.class || "",
      registration.participant?.id_at_institution || "",
      registration.competition?.title || "",
      registration.status,
      new Date(registration.created_at).toLocaleDateString(),
      registration.participant?.transaction_id || "",
      registration.participant?.payment_provider || "",
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${eventTitle.replace(/\s+/g, "_")}_participants.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusStats = () => {
    const stats = participants.reduce((acc: any, registration: any) => {
      acc[registration.status] = (acc[registration.status] || 0) + 1;
      return acc;
    }, {});

    return {
      total: participants.length,
      pending: stats.pending || 0,
      approved: stats.approved || 0,
      rejected: stats.rejected || 0,
    };
  };

  const stats = getStatusStats();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Approved</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium">Rejected</p>
                <p className="text-2xl font-bold">{stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Event Participants - {eventTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search participants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Participants Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participant</TableHead>
                  <TableHead>Institution</TableHead>
                  <TableHead>Competition</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParticipants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      No participants found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredParticipants.map((registration: any) => {
                    const StatusIcon = statusIcons[registration.status as keyof typeof statusIcons];
                    
                    return (
                      <TableRow key={registration.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{registration.participant?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {registration.participant?.email}
                            </p>
                            {registration.participant?.phone && (
                              <p className="text-sm text-muted-foreground">
                                {registration.participant.phone}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div>
                            <p className="font-medium">{registration.participant?.institution}</p>
                            <p className="text-sm text-muted-foreground">
                              Class {registration.participant?.class} • {registration.participant?.id_at_institution}
                            </p>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div>
                            <p className="font-medium">{registration.competition?.title}</p>
                            {registration.competition?.fee > 0 && (
                              <p className="text-sm text-muted-foreground">
                                Fee: ${registration.competition.fee}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          {registration.participant?.transaction_id ? (
                            <div>
                              <p className="text-sm font-medium">
                                {registration.participant.payment_provider}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {registration.participant.transaction_id}
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">No payment</span>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <Badge className={statusColors[registration.status as keyof typeof statusColors]}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {registration.status}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {new Date(registration.created_at).toLocaleDateString()}
                          </span>
                        </TableCell>
                        
                        <TableCell>
                          <Select
                            value={registration.status}
                            onValueChange={(value) => handleStatusUpdate(registration.id, value)}
                            disabled={updatingStatus === registration.id}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="approved">Approved</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
