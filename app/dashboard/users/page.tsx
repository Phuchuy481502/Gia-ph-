import AdminUserList from "@/components/AdminUserList";
import PendingApprovalQueue from "@/components/PendingApprovalQueue";
import { AdminUserData } from "@/types";
import { getProfile, getSupabase } from "@/utils/supabase/queries";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
  const profile = await getProfile();
  const isAdmin = profile?.role === "admin";

  if (!isAdmin) {
    redirect("/dashboard");
  }

  const supabase = await getSupabase();

  // Fetch all users via RPC
  const { data: users, error } = await supabase.rpc("get_admin_users");
  if (error) console.error("Error fetching users:", error);

  const typedUsers = (users as AdminUserData[]) || [];

  // Fetch pending users separately for approval queue
  const { data: pendingProfiles } = await supabase
    .from("profiles")
    .select("id, role, is_active, account_status, created_at")
    .eq("account_status", "pending");

  // Build pending user list by joining with typedUsers email data
  const pendingUsers: AdminUserData[] = (pendingProfiles ?? []).map((p) => {
    const match = typedUsers.find((u) => u.id === p.id);
    return {
      id: p.id,
      email: match?.email ?? "(email ẩn)",
      role: p.role,
      is_active: p.is_active,
      account_status: p.account_status ?? "pending",
      created_at: p.created_at,
    };
  });

  // Non-pending users for the main list
  const activeUsers = typedUsers.filter(
    (u) => u.account_status !== "pending",
  );

  return (
    <main className="flex-1 overflow-auto bg-stone-50/50 flex flex-col pt-8 relative w-full">
      <div className="max-w-7xl mx-auto px-4 pb-8 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="title">Quản lý Người dùng</h1>
            <p className="text-stone-500 mt-2 text-sm sm:text-base">
              Danh sách các tài khoản đang tham gia vào hệ thống.
            </p>
          </div>
        </div>

        {/* Pending approval queue (shows only when there are pending users) */}
        <PendingApprovalQueue pendingUsers={pendingUsers} />

        <AdminUserList initialUsers={activeUsers.length > 0 ? activeUsers : typedUsers} currentUserId={profile.id} />
      </div>
    </main>
  );
}
