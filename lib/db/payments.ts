import prisma from "@/lib/prisma";
import { Prisma, type Payment, type Participant, type Competition } from "@/lib/generated/prisma";

export type { Payment };

export type PaymentWithDetails = Payment & {
  participant: Participant;
  competition: Competition | null;
};

export interface CreatePaymentData {
  participant_id: string;
  competition_id?: string;
  amount: number;
  payment_provider?: string;
  transaction_id?: string;
}

export async function createPayment(data: CreatePaymentData): Promise<Payment> {
  const now = new Date();
  return prisma.payment.create({
    data: {
      participant_id: data.participant_id,
      competition_id: data.competition_id ?? null,
      amount: new Prisma.Decimal(data.amount),
      payment_provider: data.payment_provider ?? null,
      transaction_id: data.transaction_id ?? null,
      status: "pending",
      created_at: now,
      updated_at: now,
    },
  });
}

export async function getPaymentsByParticipant(
  participantId: string
): Promise<PaymentWithDetails[]> {
  return prisma.payment.findMany({
    where: { participant_id: participantId },
    include: { participant: true, competition: true },
    orderBy: { created_at: "desc" },
  });
}

export async function getPaymentsByCompetition(
  competitionId: string
): Promise<PaymentWithDetails[]> {
  return prisma.payment.findMany({
    where: { competition_id: competitionId },
    include: { participant: true, competition: true },
    orderBy: { created_at: "desc" },
  });
}

export async function getPaymentsByEvent(
  eventId: string
): Promise<PaymentWithDetails[]> {
  const competitions = await prisma.competition.findMany({
    where: { event_id: eventId },
    select: { id: true },
  });

  const competitionIds = competitions.map((c) => c.id);

  return prisma.payment.findMany({
    where: { competition_id: { in: competitionIds } },
    include: { participant: true, competition: true },
    orderBy: { created_at: "desc" },
  });
}

export async function getPendingPayments(): Promise<PaymentWithDetails[]> {
  return prisma.payment.findMany({
    where: { status: "pending" },
    include: { participant: true, competition: true },
    orderBy: { created_at: "asc" },
  });
}

export async function verifyPayment(
  paymentId: string,
  status: "verified" | "rejected",
  verifiedBy: string
): Promise<Payment> {
  return prisma.payment.update({
    where: { id: paymentId },
    data: {
      status,
      verified_by: verifiedBy,
      verified_at: new Date(),
      updated_at: new Date(),
    },
  });
}

export async function getPaymentById(paymentId: string): Promise<PaymentWithDetails | null> {
  return prisma.payment.findUnique({
    where: { id: paymentId },
    include: { participant: true, competition: true },
  });
}

export async function deletePayment(paymentId: string): Promise<void> {
  await prisma.payment.delete({ where: { id: paymentId } });
}
