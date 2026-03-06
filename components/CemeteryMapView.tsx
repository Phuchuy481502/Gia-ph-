"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { GraveStatus } from "@/types";
import Link from "next/link";

// Fix Leaflet default marker icons
L.Icon.Default.mergeOptions({
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Color-coded circle markers by grave status
function makeCircleIcon(status: GraveStatus): L.DivIcon {
  const COLOR_MAP: Record<GraveStatus, string> = {
    no_grave:     "#ef4444", // red
    has_grave:    "#22c55e", // green
    grave_moved:  "#f97316", // orange
    cremated_urn: "#3b82f6", // blue
    unknown:      "#a8a29e", // stone
  };
  const color = COLOR_MAP[status] ?? COLOR_MAP.unknown;
  return L.divIcon({
    className: "",
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.35)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });
}

export interface GraveMapPoint {
  id: string;
  person_id: string;
  grave_status: GraveStatus;
  cemetery_name: string | null;
  cemetery_address: string | null;
  gps_lat: number;
  gps_lng: number;
  public_memorial: boolean;
  persons: { id: string; full_name: string; death_year: number | null } | null;
}

interface CemeteryMapViewProps {
  graves: GraveMapPoint[];
}

const STATUS_LABEL: Record<GraveStatus, string> = {
  no_grave:     "Chưa có mộ",
  has_grave:    "Đã xây mộ",
  grave_moved:  "Đã cải táng",
  cremated_urn: "Tro cốt",
  unknown:      "Chưa rõ",
};

export default function CemeteryMapView({ graves }: CemeteryMapViewProps) {
  const center: [number, number] = graves.length > 0
    ? [graves[0].gps_lat, graves[0].gps_lng]
    : [21.0285, 105.8542]; // Hanoi default

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: "100%", width: "100%", borderRadius: "12px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {graves.map((g) => (
        <Marker
          key={g.id}
          position={[g.gps_lat, g.gps_lng]}
          icon={makeCircleIcon(g.grave_status)}
        >
          <Popup>
            <div className="text-sm space-y-1 min-w-[180px]">
              <p className="font-semibold text-stone-800">
                {g.persons?.full_name ?? "Không rõ tên"}
              </p>
              {g.persons?.death_year && (
                <p className="text-xs text-stone-500">Mất: {g.persons.death_year}</p>
              )}
              <p className="text-xs">
                <span className="font-medium">Trạng thái:</span>{" "}
                {STATUS_LABEL[g.grave_status]}
              </p>
              {g.cemetery_name && (
                <p className="text-xs">
                  <span className="font-medium">Nghĩa trang:</span> {g.cemetery_name}
                </p>
              )}
              {g.cemetery_address && (
                <p className="text-xs text-stone-400">{g.cemetery_address}</p>
              )}
              <Link
                href={`/dashboard/members/${g.person_id}`}
                className="block mt-2 text-xs font-medium text-amber-600 hover:text-amber-800"
              >
                Xem chi tiết →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
