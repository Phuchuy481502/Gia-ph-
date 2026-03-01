"use client";

import { adminCreateSetting, deleteSetting } from "@/app/actions/setting";
import { Setting } from "@/types";
import { createClient } from "@/utils/supabase/client";
import { Edit, Trash } from "lucide-react";
import { useMemo, useState } from "react";

interface SettingListProps {
    initialSettings: Setting[];
}

interface Notification {
    message: string;
    type: "success" | "error" | "info";
}

export default function SettingList({
    initialSettings,
}: SettingListProps) {
    const [settings, setSettings] = useState<Setting[]>(initialSettings);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [notification, setNotification] = useState<Notification | null>(null);

    // Edit modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingSetting, setEditingSetting] = useState<Setting | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const supabase = useMemo(() => createClient(), []);

    const handleDelete = async function (settingId: string) {
        if (
            !confirm(
                "Bạn có chắc chắn muốn xóa cài đặt này khỏi hệ thống vĩnh viễn không?",
            )
        )
            return;
        try {
            const result = await deleteSetting(settingId);

            if (result?.error) {
                showNotification(result.error, "error");
                return;
            }

            showNotification("Đã xóa người dùng thành công.", "success");
        } catch (error: unknown) {
            const msg =
                error instanceof Error
                    ? error.message
                    : "Lỗi không xác định khi xoá cài đặt";
            showNotification(msg, "error");
        }
    }

    const showNotification = (
        message: string,
        type: "success" | "error" | "info" = "info",
    ) => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    };

    const handleCreateSetting = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setIsCreating(true);
        const formData = new FormData(e.currentTarget);
        try {
            const result = await adminCreateSetting(formData);

            if (result?.error) {
                showNotification(result.error, "error");
                return;
            }

            showNotification(
                "Tạo cài đặt thành công! Họ có thể đăng nhập ngay bây giờ.",
                "success",
            );
            setIsCreateModalOpen(false);
            setTimeout(() => window.location.reload(), 1500);
        } catch (error: unknown) {
            const msg =
                error instanceof Error
                    ? error.message
                    : "Lỗi không xác định khi tạo user";
            showNotification(msg, "error");
        } finally {
            setIsCreating(false);
        }
    };

    function handleEdit(setting: Setting): void {
        setEditingSetting(setting);
        setIsEditModalOpen(true);
    }

    const handleEditSetting = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingSetting) return;

        setIsEditing(true);
        const formData = new FormData(e.currentTarget);
        formData.append("id", editingSetting.id);

        try {
            // const result = await updateSetting(formData);
            const setting = {
                key: formData.get("key") as string,
                value: formData.get("value") as string,
            }
            const { data, error } = await supabase
                .from("settings")
                .update(setting)
                .eq("key", setting.key)
                .select()
                .single();

            if (error) {
                console.error("Update failed:", error);
                return;
            }

            console.log("Updated:", data);

            if (error) {
                showNotification(error, "error");
                return;
            }

            // Update local state
            const updatedKey = formData.get("key") as string;
            const updatedValue = formData.get("value") as string;
            setSettings((prev) =>
                prev.map((s) =>
                    s.id === editingSetting.id
                        ? { ...s, key: updatedKey, value: updatedValue }
                        : s,
                ),
            );

            showNotification("Cập nhật cài đặt thành công.", "success");
            setIsEditModalOpen(false);
            setEditingSetting(null);
        } catch (error: unknown) {
            const msg =
                error instanceof Error
                    ? error.message
                    : "Lỗi không xác định khi cập nhật cài đặt";
            showNotification(msg, "error");
        } finally {
            setIsEditing(false);
        }
    };

    return (
        <div className="space-y-6 relative">
            <div className="flex justify-end">
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="btn-primary"
                >
                    <svg
                        className="size-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                    Thêm cài đặt
                </button>
            </div>

            {/* Table */}
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-sm border border-stone-200/60 overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="uppercase tracking-wider border-b border-stone-200/60 bg-stone-50/50">
                            <tr>
                                <th className="px-6 py-4 text-stone-500 font-semibold text-xs">
                                    Tên
                                </th>
                                <th className="px-6 py-4 text-stone-500 font-semibold text-xs">
                                    Giá trị
                                </th>
                                <th className="px-6 py-4 text-stone-500 font-semibold text-xs">
                                    Ngày tạo
                                </th>
                                <th className="px-6 py-4 text-stone-500 font-semibold text-xs text-right">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {settings.map((setting) => (
                                <tr
                                    key={setting.id}
                                    className="hover:bg-stone-50/80 transition-colors"
                                >
                                    <td className="px-6 py-4 font-medium text-stone-900">
                                        {setting.key}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-stone-900">
                                        {setting.value}
                                    </td>
                                    <td className="px-6 py-4 text-stone-500">
                                        {new Date(setting.created_at).toLocaleDateString("vi-VN")}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            <button
                                                title="Xoá cài đặt"
                                                onClick={() => handleDelete(setting.id)}
                                                className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                                            >
                                                <Trash className="size-4" />
                                            </button>
                                            <button
                                                title="Sửa cài đặt"
                                                onClick={() => handleEdit(setting)}
                                                className="p-1.5 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
                                            >
                                                <Edit className="size-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {setSettings.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-6 py-8 text-center text-stone-500"
                                    >
                                        Chưa có cài đặt nào
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* End table */}

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm transition-opacity duration-300">
                    <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-stone-200/60 w-full max-w-md overflow-hidden transform transition-all">
                        <div className="px-6 py-5 border-b border-stone-100/80 flex justify-between items-center bg-stone-50/50">
                            <h3 className="text-xl font-serif font-bold text-stone-800">
                                Tạo Người Dùng Mới
                            </h3>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-stone-400 hover:text-stone-600 transition-colors size-8 flex items-center justify-center hover:bg-stone-100 rounded-full"
                            >
                                <svg
                                    className="size-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleCreateSetting} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">
                                        Tên <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="key"
                                        required
                                        className="w-full px-3 py-2 sm:py-2.5 bg-white text-stone-900 placeholder-stone-400 border border-stone-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">
                                        Giá trị <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="value"
                                        className="w-full px-3 py-2 sm:py-2.5 bg-white text-stone-900 placeholder-stone-400 border border-stone-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="btn"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="btn-primary"
                                >
                                    {isCreating ? "Đang tạo..." : "Tạo cài đặt"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* end create modal */}

            {/* Edit Modal */}
            {isEditModalOpen && editingSetting && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm transition-opacity duration-300">
                    <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-stone-200/60 w-full max-w-md overflow-hidden transform transition-all">
                        <div className="px-6 py-5 border-b border-stone-100/80 flex justify-between items-center bg-stone-50/50">
                            <h3 className="text-xl font-serif font-bold text-stone-800">
                                Sửa Cài Đặt
                            </h3>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="text-stone-400 hover:text-stone-600 transition-colors size-8 flex items-center justify-center hover:bg-stone-100 rounded-full"
                            >
                                <svg
                                    className="size-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleEditSetting} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">
                                        Tên <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="key"
                                        required
                                        defaultValue={editingSetting.key}
                                        className="w-full px-3 py-2 sm:py-2.5 bg-white text-stone-900 placeholder-stone-400 border border-stone-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">
                                        Giá trị <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="value"
                                        defaultValue={editingSetting.value}
                                        className="w-full px-3 py-2 sm:py-2.5 bg-white text-stone-900 placeholder-stone-400 border border-stone-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditModalOpen(false);
                                        setEditingSetting(null);
                                    }}
                                    className="btn"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isEditing}
                                    className="btn-primary"
                                >
                                    {isEditing ? "Đang lưu..." : "Lưu thay đổi"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* end edit modal */}


        </div>
    );
}