import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { Poll, Response } from "@/lib/types";
import { nanoid } from "nanoid";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const raw = await redis.get(`poll:${id}`);
  if (!raw) return NextResponse.json({ error: "poll not found" }, { status: 404 });

  const poll: Poll = typeof raw === "string" ? JSON.parse(raw) : (raw as Poll);

  const body = await req.json();
  const response: Response = {
    responderId: nanoid(8),
    name: body.name || undefined,
    answers: body.answers,
    submittedAt: new Date().toISOString(),
  };

  poll.responses.push(response);
  await redis.set(`poll:${id}`, JSON.stringify(poll));

  return NextResponse.json({ ok: true });
}
