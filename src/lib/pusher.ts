import Pusher from "pusher";
import PusherClient from "pusher-js";

// Server-side Pusher instance
let pusherServer: Pusher | null = null;

export function getPusherServer(): Pusher {
  if (!pusherServer) {
    pusherServer = new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.PUSHER_CLUSTER!,
      useTLS: true
    });
  }
  return pusherServer;
}

// Client-side Pusher instance
let pusherClient: PusherClient | null = null;

export function getPusherClient(): PusherClient {
  if (typeof window === "undefined") {
    throw new Error("getPusherClient should only be called on client side");
  }

  if (!pusherClient) {
    pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!
    });
  }
  return pusherClient;
}

// Channel names
export const CHANNELS = {
  ADMIN: "admin-channel",
  WORKER: (workerId: string) => `worker-${workerId}`,
  SALES: "sales-channel",
  NOTIFICATIONS: "notifications-channel"
} as const;

// Event names
export const EVENTS = {
  NEW_SALE: "new-sale",
  SALE_APPROVED: "sale-approved",
  SALE_REJECTED: "sale-rejected",
  NEW_PAYMENT: "new-payment",
  NEW_ANNOUNCEMENT: "new-announcement",
  NEW_COMPLAINT: "new-complaint",
  COMPLAINT_REPLY: "complaint-reply",
  NEW_MESSAGE: "new-message",
  NOTIFICATION: "notification"
} as const;

// Helper to trigger events
export async function triggerEvent(channel: string, event: string, data: unknown) {
  try {
    const pusher = getPusherServer();
    await pusher.trigger(channel, event, data);
    return true;
  } catch (error) {
    console.error("Pusher trigger error:", error);
    return false;
  }
}

// Create notification and optionally send Pusher event
export async function createNotification(params: {
  workerId?: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  sendPusher?: boolean;
}) {
  const { workerId, type, title, message, data, sendPusher = true } = params;

  // Save to database
  const notification = await prisma.notification.create({
    data: {
      workerId,
      type: type as "SALE" | "PAYMENT" | "ANNOUNCEMENT" | "COMPLAINT" | "MESSAGE" | "COMMISSION" | "WORKER_ADDED" | "INVENTORY_ALERT",
      title,
      message,
      data: data || undefined
    }
  });

  // Send real-time notification
  if (sendPusher) {
    const channel = workerId ? CHANNELS.WORKER(workerId) : CHANNELS.ADMIN;
    await triggerEvent(channel, EVENTS.NOTIFICATION, notification);
  }

  return notification;
}

import prisma from "./db";