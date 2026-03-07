import config from "@/app/config";
import { createPublicClient } from "@/utils/supabase/public";
import { timingSafeEqual } from "crypto";
import { ArrowLeft, TreePine } from "lucide-react";
import Link from "next/link";
import PublicTreeView from "@/components/PublicTreeView";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function PublicTreePage({ params }: PageProps) {
  const { token } = await params;

  const supabase = createPublicClient();

  const [{ data: tokenSetting }, { data: enabledSetting }] = await Promise.all([
    supabase.from("family_settings").select("setting_value").eq("setting_key", "public_share_token").maybeSingle(),
    supabase.from("family_settings").select("setting_value").eq("setting_key", "public_share_enabled").maybeSingle(),
  ]);

  const isEnabled = enabledSetting?.setting_value === "true";
  const storedToken = tokenSetting?.setting_value ?? "";
  const isValidToken =
    storedToken.length > 0 &&
    token.length === storedToken.length &&
    timingSafeEqual(Buffer.from(token), Buffer.from(storedToken));

  if (!isEnabled || !isValidToken) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
          <TreePine className="size-8 text-stone-300 mx-auto mb-4" />
          <h1 className="text-xl font-serif font-bold text-stone-800 mb-2">Liên kết không hợp lệ</h1>
          <p className="text-stone-500 text-sm">
            Liên kết này không hợp lệ hoặc đã bị vô hiệu hoá.
          </p>
        </div>
      </div>
    );
  }

  const [{ data: persons }, { data: relationships }] = await Promise.all([
    supabase.from("persons").select("*").order("generation", { ascending: true, nullsFirst: false }),
    supabase.from("relationships").select("*"),
  ]);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-stone-200">
        <div className="max-w-full mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <TreePine className="size-5 text-amber-600 shrink-0" />
            <h1 className="font-serif font-bold text-stone-800 text-lg">{config.siteName}</h1>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Link
              href={`/public/${token}`}
              className="flex items-center gap-1.5 text-stone-500 hover:text-stone-700 transition-colors"
            >
              <ArrowLeft className="size-4" />
              Danh sách
            </Link>
          </div>
        </div>
      </header>

      {/* Tree toolbar portal target */}
      <div className="sticky top-14 z-10 flex justify-center py-2 pointer-events-none">
        <div id="tree-toolbar-portal" className="pointer-events-auto" />
      </div>

      <main className="flex-1 relative overflow-hidden" style={{ height: "calc(100vh - 56px)" }}>
        <PublicTreeView
          persons={(persons ?? []) as Parameters<typeof PublicTreeView>[0]["persons"]}
          relationships={relationships ?? []}
        />
      </main>
    </div>
  );
}
