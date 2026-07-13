"use client";

import dynamic from "next/dynamic";
import type { ArtisanMarker } from "@/components/ClusterMap";

const ClusterMap = dynamic(() => import("@/components/ClusterMap"), {
  ssr: false,
  loading: () => (
    <div style={{
      height: "100%", width: "100%",
      background: "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: "1rem",
      borderRadius: "inherit",
    }}>
      <div style={{
        width: "48px", height: "48px", border: "4px solid #B5531A",
        borderTopColor: "transparent", borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <span style={{ fontFamily: "'Cairo', sans-serif", color: "#7A6045", fontWeight: 700 }}>
        جاري تحميل الخريطة...
      </span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  ),
});

interface DynamicClusterMapProps {
  artisans: ArtisanMarker[];
  center: [number, number];
  zoom?: number;
  height?: string;
  onArtisanClick?: (artisan: ArtisanMarker) => void;
}

export default function DynamicClusterMap(props: DynamicClusterMapProps) {
  return <ClusterMap {...props} />;
}
