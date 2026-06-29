import { type NextRequest, NextResponse } from "next/server";

const SANDBOX_URL = process.env.SANDBOX_URL ?? "http://localhost:3002";

export async function GET(
  _request: NextRequest,
  { params }: { params: { token: string } },
) {
  const upstream = await fetch(`${SANDBOX_URL}/stream/${params.token}`, {
    headers: { accept: "text/event-stream" },
  });

  if (!upstream.ok) {
    return new NextResponse(null, { status: upstream.status });
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
