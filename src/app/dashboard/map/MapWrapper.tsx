"use client";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <div style={{ height: "600px", background: "#e5e7eb", borderRadius: "24px", display: "flex", alignItems: "center", justifyContent: "center" }}>جاري تحميل الخريطة...</div>
});

export default function MapWrapper({ artisans }: { artisans: any[] }) {
  return (
    <div style={{ height: "600px", borderRadius: "24px", overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,0.1)" }}>
      <Map artisans={artisans} interactive={true} />
    </div>
  );
}
