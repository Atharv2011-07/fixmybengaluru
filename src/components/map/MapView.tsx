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

// Bengaluru urban bounding box — keeps the map scoped to the city.
const BENGALURU_BOUNDS = {
  north: 13.235,
  south: 12.734,
  east: 77.858,
  west: 77.379,
};

const MAP_OPTIONS: google.maps.MapOptions = {
  mapTypeId: "hybrid",
  mapTypeControl: true,
  streetViewControl: false,
  fullscreenControl: false,
  clickableIcons: false,
  gestureHandling: "greedy",
  minZoom: 10,
  maxZoom: 20,
  restriction: {
    latLngBounds: BENGALURU_BOUNDS,
    strictBounds: true,
  },
};

export function MapView({ reports }: { reports: PotholeReport[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoRef = useRef<google.maps.InfoWindow | null>(null);
  const hasFitRef = useRef(false);

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

      // Only auto-frame the map once so filtering/searching doesn't make the
      // viewport jump ("glitch") on every keystroke.
      if (!hasFitRef.current && reports.length > 0) {
        if (reports.length === 1) {
          map.setCenter({ lat: reports[0].latitude, lng: reports[0].longitude });
          map.setZoom(16);
        } else {
          map.fitBounds(bounds, 48);
        }
        hasFitRef.current = true;
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
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  // Guards against feedback loops between programmatic panTo and idle events.
  const programmaticRef = useRef(false);

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
      // GeoGuessr-style: the pin is fixed at the screen centre — moving the
      // map moves the location. Report the centre when the map settles.
      map.addListener("idle", () => {
        if (programmaticRef.current) {
          programmaticRef.current = false;
          return;
        }
        const c = map.getCenter();
        if (c) onChangeRef.current(c.lat(), c.lng());
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Recentre the map when the value is set externally (area select, "use my
  // location"), without echoing it back through the idle handler.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !value) return;
    const c = map.getCenter();
    // Skip if the map is already centred here (avoids feedback with idle).
    if (c && Math.abs(c.lat() - value.lat) < 1e-6 && Math.abs(c.lng() - value.lng) < 1e-6) return;
    programmaticRef.current = true;
    map.panTo(value);
  }, [value]);

  return (
    <div className="relative h-full w-full">
      <div ref={ref} className="h-full w-full" />
      {/* Fixed centre pin — stays put while the map moves under it. */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-full">
        <img src={pinIcon("#4338ca")} alt="Selected location" width={30} height={40} className="drop-shadow-md" />
      </div>
    </div>
  );
}
