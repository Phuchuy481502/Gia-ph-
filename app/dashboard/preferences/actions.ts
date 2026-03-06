"use server";

import { getSupabase } from "@/utils/supabase/queries";

export async function getUserPreferences() {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", user.id)
    .single();
  return data;
}

export async function saveUserPreferences(prefs: {
  default_root_person_id?: string | null;
  default_branch_id?: string | null;
  default_generation_from?: number | null;
}) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Chưa đăng nhập");

  const { error } = await supabase
    .from("user_preferences")
    .upsert({ user_id: user.id, ...prefs });

  if (error) throw error;
}
