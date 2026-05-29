import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { Poll } from "@/lib/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const raw = await redis.get(`poll:${id}`);
  if (!raw) return NextResponse.json({ error: "poll not found" }, { status: 404 });

  const poll: Poll = typeof raw === "string" ? JSON.parse(raw) : (raw as Poll);
  return NextResponse.json(poll);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const raw = await redis.get(`poll:${id}`);
  if (!raw) return NextResponse.json({ error: "poll not found" }, { status: 404 });

  const poll: Poll = typeof raw === "string" ? JSON.parse(raw) : (raw as Poll);
  const { consensusReport } = await req.json();
  poll.consensusReport = consensusReport;
  await redis.set(`poll:${id}`, JSON.stringify(poll));

  return NextResponse.json({ ok: true });
}
