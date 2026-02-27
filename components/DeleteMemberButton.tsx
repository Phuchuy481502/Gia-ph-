"use client";

import { deleteMemberProfile } from "@/app/actions/member";
import { useTransition } from "react";

interface DeleteMemberButtonProps {
  memberId: string;
}

export default function DeleteMemberButton({
  memberId,
}: DeleteMemberButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={deleteMemberProfile.bind(null, memberId)}
      onSubmit={(e) => {
        if (
          !window.confirm(
            "Bạn có chắc chắn muốn xoá hồ sơ này không? Hành động này không thể hoàn tác."
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        disabled={isPending}
        className="px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? "Đang xoá..." : "Xoá hồ sơ"}
      </button>
    </form>
  );
}
