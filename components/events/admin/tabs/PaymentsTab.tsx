"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PaymentWithDetails } from "@/lib/db/payments";

interface PaymentsTabProps {
  payments: PaymentWithDetails[];
}

export default function PaymentsTab({ payments }: PaymentsTabProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Payments</CardTitle></CardHeader>
      <CardContent><p className="text-muted-foreground">Payment verification — {payments.length} payments for this event.</p></CardContent>
    </Card>
  );
}
