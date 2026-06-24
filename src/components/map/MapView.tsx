/// <reference types="google.maps" />
import { useEffect, useRef } from "react";
import { loadGoogleMaps, pinIcon } from "@/lib/googleMaps";
import { BENGALURU_CENTER } from "@/lib/constants";
import type { PotholeReport } from "@/lib/reports";

function markerHex(report: PotholeReport): string {
  if (report.status === "resolved") return "#22c55e";
  if (report.severity === "dangerous") return "#e11d2a";
  if (report.severity === "severe") return "#f97316";
  return "#eab308";
}

const MAP_OPTIONS: google.maps.MapOptions = {
  mapTypeId: "hybrid",
  mapTypeControl: true,
  streetViewControl: false,
  fullscreenControl: false,
  clickableIcons: false,
  gestureHandling: "greedy",
};

export function MapView({ reports }: { reports: PotholeReport[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoRef = useRef<google.maps.InfoWindow | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps().then((maps) => {
      if (cancelled || !ref.current) return;
      if (!mapRef.current) {
        mapRef.current = new maps.Map(ref.current, {
          ...MAP_OPTIONS,
          center: BENGALURU_CENTER,
          zoom: 12,
        });
        infoRef.current = new maps.InfoWindow();
      }
      const map = mapRef.current;
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];

      const bounds = new maps.LatLngBounds();
      reports.forEach((r) => {
        const marker = new maps.Marker({
          position: { lat: r.latitude, lng: r.longitude },
          map,
          icon: { url: pinIcon(markerHex(r)), scaledSize: new maps.Size(30, 40), anchor: new maps.Point(15, 40) },
        });
        marker.addListener("click", () => {
          infoRef.current?.setContent(
            `<div style="font-family:system-ui;min-width:160px">
              <div style="font:600 11px monospace;color:#64748b">${r.complaint_id}</div>
              <div style="font:700 14px system-ui;margin:2px 0">${r.road_name || r.area || "Pothole report"}</div>
              <a href="/reports/${r.id}" style="font:600 12px system-ui;color:#2563eb">View details →</a>
            </div>`,
          );
          infoRef.current?.open({ map, anchor: marker });
        });
        markersRef.current.push(marker);
        bounds.extend({ lat: r.latitude, lng: r.longitude });
      });

      if (reports.length === 1) {
        map.setCenter({ lat: reports[0].latitude, lng: reports[0].longitude });
        map.setZoom(16);
      } else if (reports.length > 1) {
        map.fitBounds(bounds, 48);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [reports]);

  return <div ref={ref} className="h-full w-full" />;
}

export function LocationPicker({
  value,
  onChange,
}: {
  value: { lat: number; lng: number } | null;
  onChange: (lat: number, lng: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps().then((maps) => {
      if (cancelled || !ref.current || mapRef.current) return;
      const map = new maps.Map(ref.current, {
        ...MAP_OPTIONS,
        center: value ?? BENGALURU_CENTER,
        zoom: value ? 16 : 12,
      });
      mapRef.current = map;
      map.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (e.latLng) onChangeRef.current(e.latLng.lat(), e.latLng.lng());
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Sync marker + view with the controlled value.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !value) return;
    const maps = (window as unknown as { google: { maps: typeof google.maps } }).google.maps;
    if (!markerRef.current) {
      markerRef.current = new maps.Marker({
        map,
        draggable: true,
        icon: { url: pinIcon("#e11d2a"), scaledSize: new maps.Size(30, 40), anchor: new maps.Point(15, 40) },
      });
      markerRef.current.addListener("dragend", (e: google.maps.MapMouseEvent) => {
        if (e.latLng) onChangeRef.current(e.latLng.lat(), e.latLng.lng());
      });
    }
    markerRef.current.setPosition(value);
    map.panTo(value);
  }, [value]);

  return <div ref={ref} className="h-full w-full" />;
}
