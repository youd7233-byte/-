"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

// Fix leaflet icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export interface ArtisanMarker {
  id: string;
  lat: number;
  lng: number;
  profession: string;
  name: string;
  userId: string;
  wilaya?: string;
  city?: string;
  isPremium?: boolean;
  isVerified?: boolean;
  avgRating?: number | null;
}

interface ClusterMapProps {
  artisans: ArtisanMarker[];
  center: [number, number];
  zoom?: number;
  height?: string;
  onArtisanClick?: (artisan: ArtisanMarker) => void;
}

export default function ClusterMap({
  artisans,
  center,
  zoom = 6,
  height = "100%",
  onArtisanClick,
}: ClusterMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const clusterGroupRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(containerRef.current, {
      center,
      zoom,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    // Custom cluster icon with orange terracotta color
    const createClusterIcon = (cluster: any) => {
      const count = cluster.getChildCount();
      let size = 44;
      let fontSize = "1rem";
      if (count >= 10) { size = 52; fontSize = "1.1rem"; }
      if (count >= 50) { size = 60; fontSize = "1.2rem"; }

      return L.divIcon({
        html: `
          <div style="
            width: ${size}px;
            height: ${size}px;
            background: linear-gradient(135deg, #B5531A 0%, #d45e1a 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 900;
            font-size: ${fontSize};
            font-family: 'Cairo', sans-serif;
            box-shadow: 0 4px 16px rgba(181,83,26,0.45), 0 0 0 4px rgba(181,83,26,0.18);
            border: 3px solid #fff;
            cursor: pointer;
            transition: transform 0.2s;
          ">
            ${count}
          </div>
        `,
        className: "",
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });
    };

    // Custom artisan icon
    const createArtisanIcon = (artisan: ArtisanMarker) => {
      const bg = artisan.isPremium ? "#D4A843" : "#B5531A";
      return L.divIcon({
        html: `
          <div style="
            width: 38px;
            height: 38px;
            background: linear-gradient(135deg, ${bg} 0%, ${artisan.isPremium ? "#c49030" : "#d45e1a"} 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1rem;
            box-shadow: 0 4px 12px rgba(181,83,26,0.35), 0 0 0 3px rgba(255,255,255,0.9);
            border: 2.5px solid #fff;
            cursor: pointer;
          ">
            ${artisan.isPremium ? "⭐" : "👷"}
          </div>
        `,
        className: "",
        iconSize: [38, 38],
        iconAnchor: [19, 19],
        popupAnchor: [0, -19],
      });
    };

    // Import and create marker cluster group
    import("leaflet.markercluster").then(() => {
      const MarkerClusterGroup = (L as any).markerClusterGroup;
      const clusterGroup = new MarkerClusterGroup({
        iconCreateFunction: createClusterIcon,
        maxClusterRadius: 80,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        animate: true,
        animateAddingMarkers: false,
        disableClusteringAtZoom: 11,
      });

      clusterGroupRef.current = clusterGroup;

      artisans.forEach((artisan) => {
        if (!artisan.lat || !artisan.lng) return;

        const marker = L.marker([artisan.lat, artisan.lng], {
          icon: createArtisanIcon(artisan),
        });

        const ratingStars = artisan.avgRating
          ? "★".repeat(Math.round(artisan.avgRating)) + "☆".repeat(5 - Math.round(artisan.avgRating))
          : null;

        marker.bindPopup(`
          <div dir="rtl" style="
            font-family: 'Cairo', sans-serif;
            min-width: 200px;
            padding: 4px;
          ">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
              <div style="
                width:42px; height:42px; border-radius:50%;
                background: linear-gradient(135deg,#B5531A,#d45e1a);
                display:flex; align-items:center; justify-content:center;
                color:#fff; font-size:1.1rem; flex-shrink:0;
              ">${artisan.isPremium ? "⭐" : "👷"}</div>
              <div>
                <div style="font-weight:900; font-size:1rem; color:#1A1208;">${artisan.name}</div>
                <div style="font-size:0.78rem; color:#B5531A; font-weight:700;">${artisan.profession}</div>
              </div>
            </div>
            ${artisan.wilaya ? `<div style="font-size:0.8rem; color:#7A6045; margin-bottom:4px;">📍 ${artisan.city ? artisan.city + " ،" : ""} ${artisan.wilaya}</div>` : ""}
            ${ratingStars ? `<div style="font-size:0.9rem; color:#D4A843; margin-bottom:8px;">${ratingStars} <span style="color:#3D2B12; font-size:0.78rem;">(${artisan.avgRating?.toFixed(1)})</span></div>` : ""}
            <div style="display:flex; gap:6px; margin-top:8px;">
              <a href="/artisan/${artisan.userId}" style="
                flex:1; padding:6px 10px; background:#B5531A; color:#fff;
                border-radius:8px; font-size:0.8rem; font-weight:800;
                text-decoration:none; text-align:center;
              ">عرض الملف</a>
              ${artisan.isVerified ? '<span style="background:rgba(34,197,94,0.12);color:#16a34a;padding:4px 8px;border-radius:6px;font-size:0.75rem;font-weight:800;">✓ موثّق</span>' : ""}
            </div>
          </div>
        `, { maxWidth: 260 });

        if (onArtisanClick) {
          marker.on("click", () => onArtisanClick(artisan));
        }

        clusterGroup.addLayer(marker);
      });

      map.addLayer(clusterGroup);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update center when it changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center, zoom);
    }
  }, [center, zoom]);

  return (
    <div ref={containerRef} style={{ height, width: "100%", borderRadius: "inherit" }} />
  );
}
