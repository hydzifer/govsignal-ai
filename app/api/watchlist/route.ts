import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { TOPIC_IDS } from "@/lib/constants/topics";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseServer
    .from("watchlists")
    .select("id, topic, created_at")
    .eq("clerk_user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { topic } = body;

  if (!topic || !TOPIC_IDS.includes(topic)) {
    return NextResponse.json({ error: "Invalid topic" }, { status: 400 });
  }

  const { data, error } = await supabaseServer
    .from("watchlists")
    .insert({ clerk_user_id: userId, topic })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Already watching this topic" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { topic } = body;

  if (!topic) {
    return NextResponse.json({ error: "Topic required" }, { status: 400 });
  }

  const { error } = await supabaseServer
    .from("watchlists")
    .delete()
    .eq("clerk_user_id", userId)
    .eq("topic", topic);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
