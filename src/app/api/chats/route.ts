import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const userId = session.user.workerId || session.user.id;

    const where: Record<string, unknown> = {};

    if (type) {
      where.type = type;
    }

    where.participants = {
      has: session.user.role === "WORKER" ? session.user.workerId || session.user.id : session.user.id
    };

    const chats = await prisma.chat.findMany({
      where,
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    return NextResponse.json({ chats });
  } catch (error) {
    console.error("Chats fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch chats" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, name, participantIds } = body;

    const participants = [
      session.user.role === "WORKER" ? session.user.workerId || session.user.id : session.user.id,
      ...(participantIds || [])
    ];

    const chat = await prisma.chat.create({
      data: {
        type: type || "PRIVATE",
        name,
        participants
      },
      include: {
        messages: true
      }
    });

    await prisma.activityLog.create({
      data: {
        workerId: session.user.workerId || null,
        action: "CREATE",
        entityType: "CHAT",
        entityId: chat.id,
        details: { type, name }
      }
    });

    return NextResponse.json(chat, { status: 201 });
  } catch (error) {
    console.error("Chat creation error:", error);
    return NextResponse.json({ error: "Failed to create chat" }, { status: 500 });
  }
}