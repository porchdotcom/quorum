import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";
import { Poll } from "@/lib/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const redis = await getRedis();
  const raw = await redis.get(`poll:${id}`);
  if (!raw) return NextResponse.json({ error: "poll not found" }, { status: 404 });

  const poll: Poll = JSON.parse(raw);
  return NextResponse.json(poll);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const redis = await getRedis();
  const raw = await redis.get(`poll:${id}`);
  if (!raw) return NextResponse.json({ error: "poll not found" }, { status: 404 });

  const poll: Poll = JSON.parse(raw);
  const { consensusReport } = await req.json();
  poll.consensusReport = consensusReport;
  await redis.set(`poll:${id}`, JSON.stringify(poll));

  return NextResponse.json({ ok: true });
}
