"use server";

import { getIsAdmin, getSupabase, getUser } from "@/utils/supabase/queries";
import { FamilyEventType } from "@/types";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/utils/activityLogger";
import { notifyTelegram } from "@/utils/notifyTelegram";
import { notifyZalo } from "@/utils/notifyZalo";

export async function createFamilyEvent(data: {
  title: string;
  event_type: FamilyEventType;
  event_date: string;
  location: string;
  description: string;
  branch_id: string | null;
  is_public: boolean;
}) {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  const user = await getUser();
  const supabase = await getSupabase();

  const { data: created, error } = await supabase
    .from("family_events")
    .insert({
      title: data.title,
      event_type: data.event_type,
      event_date: data.event_date,
      location: data.location || null,
      description: data.description || null,
      branch_id: data.branch_id,
      is_public: data.is_public,
      created_by: user?.id,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await logActivity("family_event_created", `Sự kiện mới: ${data.title}`, {
    related_id: created?.id,
    related_type: "family_event",
    is_public: data.is_public,
  });

  const msg =
    `📅 <b>Sự kiện họ tộc mới</b>\n` +
    `<b>${data.title}</b>\n` +
    `🗓 Ngày: ${data.event_date}` +
    (data.location ? `\n📍 Địa điểm: ${data.location}` : "") +
    (data.description ? `\n📝 ${data.description}` : "");

  await notifyTelegram(msg);
  await notifyZalo(
    `📅 Sự kiện họ tộc mới: ${data.title} — Ngày: ${data.event_date}` +
      (data.location ? ` | ${data.location}` : ""),
  );

  revalidatePath("/dashboard/family-events");
  revalidatePath("/dashboard/timeline");
  return created?.id;
}

export async function updateFamilyEvent(
  id: string,
  data: {
    title: string;
    event_type: FamilyEventType;
    event_date: string;
    location: string;
    description: string;
    branch_id: string | null;
    is_public: boolean;
  },
) {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  const supabase = await getSupabase();
  const { error } = await supabase
    .from("family_events")
    .update({
      title: data.title,
      event_type: data.event_type,
      event_date: data.event_date,
      location: data.location || null,
      description: data.description || null,
      branch_id: data.branch_id,
      is_public: data.is_public,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/family-events");
}

export async function deleteFamilyEvent(id: string) {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  const supabase = await getSupabase();
  const { error } = await supabase.from("family_events").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/family-events");
}
