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
    const chatId = searchParams.get("chatId");

    if (!chatId) {
      return NextResponse.json({ error: "Chat ID required" }, { status: 400 });
    }

    const messages = await prisma.message.findMany({
      where: { chatId },
      include: {
        sender: {
          select: { fullName: true, workerId: true, profilePicture: true }
        }
      },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Messages fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { chatId, content, type, attachments } = body;

    if (!chatId || !content) {
      return NextResponse.json({ error: "Chat ID and content required" }, { status: 400 });
    }

    const senderId = session.user.role === "WORKER"
      ? (session.user as { workerId?: string }).workerId || session.user.id
      : session.user.id;

    const message = await prisma.message.create({
      data: {
        chatId,
        senderId,
        content,
        type: type || "TEXT",
        attachments: attachments || []
      },
      include: {
        sender: {
          select: { fullName: true, workerId: true, profilePicture: true }
        }
      }
    });

    await prisma.chat.update({
      where: { id: chatId },
      data: {
        lastMessage: content.substring(0, 100),
        lastMessageAt: new Date()
      }
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Message creation error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}