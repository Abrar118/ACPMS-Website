"use client";

import { useState, useMemo, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { CreditCard, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { verifyPaymentAction } from "@/actions/payments";
import type { PaymentWithDetails } from "@/lib/db/payments";

interface PaymentsTabProps {
  payments: PaymentWithDetails[];
}

export default function PaymentsTab({ payments }: PaymentsTabProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Summary counts from full list (unfiltered)
  const totalCount = payments.length;
  const pendingCount = payments.filter((p) => p.status === "pending").length;
  const verifiedCount = payments.filter((p) => p.status === "verified").length;
  const rejectedCount = payments.filter((p) => p.status === "rejected").length;

  const filteredPayments = useMemo(() => {
    if (statusFilter === "all") return payments;
    return payments.filter((p) => p.status === statusFilter);
  }, [payments, statusFilter]);

  function handleVerify(paymentId: string, status: "verified" | "rejected") {
    setLoadingId(paymentId);
    startTransition(async () => {
      const result = await verifyPaymentAction(paymentId, status);
      if (result.success) {
        toast.success(result.message ?? `Payment ${status}`);
      } else {
        toast.error(result.error ?? "Action failed");
      }
      setLoadingId(null);
    });
  }

  function formatAmount(amount: unknown): string {
    const num = Number(amount);
    if (isNaN(num)) return "—";
    return `৳${num.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function truncate(value: string | null | undefined, len = 16): string {
    if (!value) return "—";
    return value.length > len ? `${value.slice(0, len)}…` : value;
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalCount}</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {pendingCount}
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-500/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">
              Verified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {verifiedCount}
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-500/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {rejectedCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter + Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Payment Records</CardTitle>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="p-0">
          {filteredPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
              <CreditCard className="h-10 w-10 opacity-40" />
              <p className="text-sm">No payments for this event</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Participant</TableHead>
                    <TableHead>Competition</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verified By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => {
                    const isThisLoading = isPending && loadingId === payment.id;
                    return (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {payment.participant.name}
                        </TableCell>
                        <TableCell>
                          {payment.competition?.title ?? "—"}
                        </TableCell>
                        <TableCell>{formatAmount(payment.amount)}</TableCell>
                        <TableCell>
                          {payment.payment_provider ?? "—"}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {truncate(payment.transaction_id)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              payment.status === "verified"
                                ? "bg-green-500 hover:bg-green-600 text-white"
                                : payment.status === "rejected"
                                ? "bg-red-500 hover:bg-red-600 text-white"
                                : "bg-yellow-500 hover:bg-yellow-600 text-white"
                            }
                          >
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {payment.verified_by
                            ? truncate(payment.verified_by, 8)
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {payment.status === "pending" && (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                disabled={isPending}
                                onClick={() =>
                                  handleVerify(payment.id, "verified")
                                }
                              >
                                {isThisLoading ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                )}
                                <span className="ml-1">Verify</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={isPending}
                                onClick={() =>
                                  handleVerify(payment.id, "rejected")
                                }
                              >
                                {isThisLoading ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <X className="h-3 w-3" />
                                )}
                                <span className="ml-1">Reject</span>
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
