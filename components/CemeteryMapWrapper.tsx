"use client";

import dynamic from "next/dynamic";
import type { GraveMapPoint } from "@/components/CemeteryMapView";

const CemeteryMapView = dynamic(() => import("@/components/CemeteryMapView"), { ssr: false });

export default function CemeteryMapWrapper({ graves }: { graves: GraveMapPoint[] }) {
  return <CemeteryMapView graves={graves} />;
}
