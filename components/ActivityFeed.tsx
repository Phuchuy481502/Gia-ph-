import { ActivityFeedItem } from "@/types";
import { Calendar, Flower2, UserPlus, Edit3, Star } from "lucide-react";

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  member_added: UserPlus,
  member_updated: Edit3,
  member_deceased_marked: Flower2,
  family_event_created: Calendar,
  grave_added: Star,
  grave_updated: Edit3,
};

const ACTIVITY_COLORS: Record<string, string> = {
  member_added: "bg-emerald-50 text-emerald-600",
  member_updated: "bg-blue-50 text-blue-600",
  member_deceased_marked: "bg-purple-50 text-purple-600",
  family_event_created: "bg-amber-50 text-amber-600",
  grave_added: "bg-stone-50 text-stone-500",
  grave_updated: "bg-stone-50 text-stone-500",
};

interface ActivityFeedProps {
  items: ActivityFeedItem[];
}

export default function ActivityFeed({ items }: ActivityFeedProps) {
  if (items.length === 0) return null;

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const Icon = ACTIVITY_ICONS[item.activity_type] ?? Star;
        const colorCls = ACTIVITY_COLORS[item.activity_type] ?? "bg-stone-50 text-stone-500";
        const date = new Date(item.created_at);

        return (
          <li
            key={item.id}
            className="flex items-start gap-3 p-3.5 bg-white rounded-xl border border-stone-100 shadow-sm hover:border-stone-200 transition-colors"
          >
            <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${colorCls}`}>
              <Icon className="size-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-800">{item.message}</p>
              <p className="text-xs text-stone-400 mt-0.5">
                {date.toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
