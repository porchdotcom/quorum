import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";
import { Poll, PollMode, Question } from "@/lib/types";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { mode, title, context, questions } = body as {
    mode: PollMode;
    title: string;
    context: string;
    questions: Question[];
  };

  if (!mode || !title || !questions?.length) {
    return NextResponse.json({ error: "mode, title, questions required" }, { status: 400 });
  }

  const poll: Poll = {
    id: nanoid(10),
    mode,
    title,
    context: context ?? "",
    questions,
    responses: [],
    createdAt: new Date().toISOString(),
  };

  const redis = await getRedis();
  await redis.set(`poll:${poll.id}`, JSON.stringify(poll));

  return NextResponse.json({ id: poll.id });
}
