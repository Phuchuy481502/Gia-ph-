"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function adminCreateSetting(formData: FormData) {
    const key = formData.get("key")?.toString();
    const value = formData.get("value")?.toString();

    if (!key || !value) {
        return { error: "Key và Value là bắt buộc." };
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase.rpc("admin_create_setting", {
        new_key: key,
        new_value: value,
    });

    if (error) {
        console.error("Failed to create setting:", error);
        return { error: error.message };
    }

    revalidatePath("/dashboard/settings");
    return { success: true };
}

export async function deleteSetting(settingId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { error } = await supabase.rpc("delete_setting", {
    target_setting_id: settingId,
  });

  if (error) {
    console.error("Failed to delete setting:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
}