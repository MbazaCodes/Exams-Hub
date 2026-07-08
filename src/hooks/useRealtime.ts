// ── useRealtime hook — live exam leaderboard ──────────────────
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

export function useOnlineExamParticipants(examSessionId: string | null) {
  const [participants, setParticipants] = useState<Record<string, unknown>[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!examSessionId) return;

    // Initial fetch
    supabase
      .from("online_exam_participants")
      .select("*")
      .eq("exam_session_id", examSessionId)
      .order("rank", { ascending: true, nullsFirst: false })
      .then(({ data }) => setParticipants(data ?? []));

    // Realtime
    channelRef.current = supabase
      .channel(`participants-${examSessionId}`)
      .on("postgres_changes" as any, {
        event: "*", schema: "public",
        table:  "online_exam_participants",
        filter: `exam_session_id=eq.${examSessionId}`,
      }, (payload: Record<string, unknown>) => {
        setParticipants(prev => {
          const updated = payload["new"] as Record<string, unknown>;
          if (payload["eventType"] === "INSERT") return [...prev, updated];
          if (payload["eventType"] === "UPDATE") {
            return prev
              .map(p => (p["id"] === updated["id"] ? updated : p))
              .sort((a, b) => ((a["rank"] as number) ?? 9999) - ((b["rank"] as number) ?? 9999));
          }
          return prev;
        });
      })
      .subscribe();

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [examSessionId]);

  return participants;
}

export function useNotifications(userId: string | null) {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!userId) return;

    supabase.from("notifications").select("id", { count: "exact" })
      .eq("user_id", userId).eq("is_read", false)
      .then(({ count }) => setUnread(count ?? 0));

    const channel = supabase
      .channel(`notifs-${userId}`)
      .on("postgres_changes" as any, {
        event: "INSERT", schema: "public",
        table:  "notifications",
        filter: `user_id=eq.${userId}`,
      }, () => setUnread(n => n + 1))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  return { unread };
}
