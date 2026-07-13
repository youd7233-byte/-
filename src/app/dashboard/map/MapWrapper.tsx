"use client";

import DynamicClusterMap from "@/components/DynamicClusterMap";
import type { ArtisanMarker } from "@/components/ClusterMap";

export default function MapWrapper({ artisans }: { artisans: ArtisanMarker[] }) {
  return (
    <div style={{
      height: "500px", borderRadius: "20px", overflow: "hidden",
      boxShadow: "0 4px 24px rgba(26,18,8,0.07)",
      border: "1px solid rgba(200,149,108,0.15)",
    }}>
      <DynamicClusterMap
        artisans={artisans}
        center={[28.0339, 1.6596]}
        zoom={5}
        height="500px"
      />
    </div>
  );
}
