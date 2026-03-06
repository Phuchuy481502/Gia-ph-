import { getProfile } from "@/utils/supabase/queries";
import { CreditCard } from "lucide-react";
import { redirect } from "next/navigation";
import SubscriptionManager from "@/components/SubscriptionManager";

export default async function AdminSubscriptionsPage() {
  const profile = await getProfile();
  if (profile?.role !== "admin") redirect("/dashboard");

  return (
    <div className="max-w-2xl mx-auto space-y-6 px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3">
        <CreditCard className="size-6 text-blue-600" />
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">Subscription Management</h1>
          <p className="text-sm text-stone-500 mt-0.5">Quản lý gói dịch vụ và quota AI</p>
        </div>
      </div>

      <SubscriptionManager />
    </div>
  );
}
