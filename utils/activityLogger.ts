"use server";

import { getSupabase, getUser } from "@/utils/supabase/queries";

export type ActivityType =
  | "member_added"
  | "member_updated"
  | "member_deceased_marked"
  | "family_event_created"
  | "grave_added"
  | "grave_updated";

export async function logActivity(
  activity_type: ActivityType,
  message: string,
  options?: {
    subject_person_id?: string;
    related_id?: string;
    related_type?: string;
    meta?: Record<string, unknown>;
    is_public?: boolean;
  },
) {
  try {
    const supabase = await getSupabase();
    const user = await getUser();

    await supabase.from("activity_feed").insert({
      activity_type,
      actor_user_id: user?.id ?? null,
      subject_person_id: options?.subject_person_id ?? null,
      related_id: options?.related_id ?? null,
      related_type: options?.related_type ?? null,
      message,
      meta: options?.meta ?? null,
      is_public: options?.is_public ?? false,
    });
  } catch {
    // Activity logging is non-critical — never throw
  }
}
