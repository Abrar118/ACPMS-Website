import prisma from "@/lib/prisma";
import type { ContactSubmission } from "@/lib/generated/prisma";

export type { ContactSubmission };

export interface CreateContactData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function createContactSubmission(
  data: CreateContactData
): Promise<ContactSubmission> {
  return prisma.contactSubmission.create({
    data: {
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
      status: "new",
    },
  });
}

export async function getAllContactSubmissions(): Promise<ContactSubmission[]> {
  return prisma.contactSubmission.findMany({
    orderBy: { created_at: "desc" },
  });
}

export async function getContactSubmissionsByStatus(
  status: string
): Promise<ContactSubmission[]> {
  return prisma.contactSubmission.findMany({
    where: { status },
    orderBy: { created_at: "desc" },
  });
}

export async function getNewContactSubmissions(): Promise<ContactSubmission[]> {
  return prisma.contactSubmission.findMany({
    where: { status: "new" },
    orderBy: { created_at: "asc" },
  });
}

export async function getContactSubmissionById(
  submissionId: string
): Promise<ContactSubmission | null> {
  return prisma.contactSubmission.findUnique({ where: { id: submissionId } });
}

export async function updateContactStatus(
  submissionId: string,
  status: string
): Promise<ContactSubmission> {
  return prisma.contactSubmission.update({
    where: { id: submissionId },
    data: { status },
  });
}

export async function markContactAsReplied(
  submissionId: string,
  repliedBy: string
): Promise<ContactSubmission> {
  return prisma.contactSubmission.update({
    where: { id: submissionId },
    data: {
      status: "replied",
      replied_by: repliedBy,
      replied_at: new Date(),
    },
  });
}

export async function deleteContactSubmission(submissionId: string): Promise<void> {
  await prisma.contactSubmission.delete({ where: { id: submissionId } });
}
