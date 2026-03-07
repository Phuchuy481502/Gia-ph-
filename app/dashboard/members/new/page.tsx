import MemberForm from "@/components/MemberForm";
import { getProfile, getSupabase } from "@/utils/supabase/queries";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function NewMemberPage({
  searchParams,
}: {
  searchParams: Promise<{ parent?: string }>;
}) {
  const profile = await getProfile();

  const isAdmin = profile?.role === "admin";
  const canEdit = profile?.role === "admin" || profile?.role === "editor";

  if (!canEdit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-stone-800">Truy cập bị từ chối</h1>
          <p className="text-stone-600 mt-2">Bạn không có quyền thêm thành viên.</p>
        </div>
      </div>
    );
  }

  const { parent: parentId } = await searchParams;

  const supabase = await getSupabase();
  const [{ data: branches }, parentResult] = await Promise.all([
    supabase.from("branches").select("id, name").order("name", { ascending: true }),
    parentId
      ? supabase.from("persons").select("id, full_name, generation").eq("id", parentId).single()
      : Promise.resolve({ data: null }),
  ]);

  const parentPerson = parentResult?.data;
  const initialData = parentPerson?.generation != null
    ? { generation: parentPerson.generation + 1 }
    : undefined;

  const backHref = parentId
    ? `/dashboard/members/${parentId}`
    : "/dashboard/members";

  return (
    <div className="flex-1 w-full relative flex flex-col pb-8">
      <div className="w-full relative z-20 py-4 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={backHref}
            className="p-2 -ml-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
            title="Quay lại"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="title">Thêm Thành Viên Mới</h1>
            {parentPerson && (
              <p className="text-sm text-stone-500 mt-0.5">
                Con của{" "}
                <span className="font-semibold text-stone-700">{parentPerson.full_name}</span>
                {parentPerson.generation != null && (
                  <span className="ml-1 text-emerald-600">(Đời {parentPerson.generation} → Đời {parentPerson.generation + 1})</span>
                )}
              </p>
            )}
          </div>
        </div>
        <Link
          href={backHref}
          className="px-4 py-2 bg-stone-100/80 text-stone-700 rounded-lg hover:bg-stone-200 hover:text-stone-900 font-medium text-sm transition-all shadow-sm"
        >
          Hủy
        </Link>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10 w-full flex-1">
        <MemberForm isAdmin={isAdmin} branches={branches ?? []} initialData={initialData as Parameters<typeof MemberForm>[0]["initialData"]} />
      </main>
    </div>
  );
}
