"use client";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <div style={{ height: "calc(100vh - 70px)", background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center" }}>جاري تحميل الخريطة...</div>
});

export default function ClientMap({ artisans, center }: { artisans: any[], center: [number, number] }) {
  return <Map artisans={artisans} defaultCenter={center} />;
}
