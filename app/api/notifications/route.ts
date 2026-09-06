import { NextRequest, NextResponse } from "next/server";
import {
  addNotification,
  isNotificationType,
  listByUser,
} from "@/lib/notifications-store";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId")?.trim();

  if (!userId) {
    return NextResponse.json(
      { error: "query param userId is required" },
      { status: 400 },
    );
  }

  return NextResponse.json({
    notifications: listByUser(userId),
  });
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const { userId, message, type } = body as Record<string, unknown>;

  if (typeof userId !== "string" || !userId.trim()) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  if (typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  if (typeof type !== "string" || !isNotificationType(type)) {
    return NextResponse.json(
      { error: "type must be one of: info, success, warning, error" },
      { status: 400 },
    );
  }

  const notification = addNotification({
    userId: userId.trim(),
    message: message.trim(),
    type,
  });

  return NextResponse.json({ notification }, { status: 201 });
}
