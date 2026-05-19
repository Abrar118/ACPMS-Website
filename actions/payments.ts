"use server";

import { revalidatePath } from "next/cache";
import {
  createPayment,
  verifyPayment,
  deletePayment,
  type CreatePaymentData,
} from "@/lib/db/payments";
import { getCurrentUser, isAdminOrExecutive } from "@/lib/auth-server";

type PaymentActionResult = {
  success: boolean;
  error?: string;
  message?: string;
  data?: any;
};

export async function createPaymentAction(
  paymentData: CreatePaymentData
): Promise<PaymentActionResult> {
  try {
    const payment = await createPayment(paymentData);
    return { success: true, message: "Payment recorded successfully", data: payment };
  } catch (error: any) {
    console.error("Error creating payment:", error);
    return { success: false, error: error.message || "Failed to record payment" };
  }
}

export async function verifyPaymentAction(
  paymentId: string,
  status: "verified" | "rejected"
): Promise<PaymentActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to verify payments" };

    const payment = await verifyPayment(paymentId, status, user.id);
    revalidatePath("/admin/events", "page");
    return { success: true, message: `Payment ${status} successfully`, data: payment };
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return { success: false, error: error.message || "Failed to verify payment" };
  }
}

export async function deletePaymentAction(
  paymentId: string
): Promise<PaymentActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to delete payments" };

    await deletePayment(paymentId);
    revalidatePath("/admin/events", "page");
    return { success: true, message: "Payment deleted successfully" };
  } catch (error: any) {
    console.error("Error deleting payment:", error);
    return { success: false, error: error.message || "Failed to delete payment" };
  }
}
