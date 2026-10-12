import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { conversationId, message, receiverId } = body;

    if (!message) {
      return NextResponse.json({ error: "Missing message body" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId || "00000000-0000-0000-0000-000000000000",
        sender_id: user.id,
        message,
      })
      .select()
      .single();

    if (error) throw error;

    // Send notification to receiver if specified
    if (receiverId) {
      await supabase.from("notifications").insert({
        user_id: receiverId,
        type: "new_message",
        title: "New Message Received",
        message: message.slice(0, 80),
        link: "/candidate/dashboard?tab=Messages",
      });
    }

    return NextResponse.json({ message: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
