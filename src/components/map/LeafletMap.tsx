import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { BENGALURU_CENTER, markerColor, SEVERITY_CONFIG, STATUS_CONFIG } from "@/lib/constants";
import type { PotholeReport } from "@/lib/reports";

function pin(color: string) {
  return L.divIcon({
    className: "",
    html: `<div class="pothole-pin" style="background:${color}"><span>!</span></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28],
  });
}

function FitToReports({ reports }: { reports: PotholeReport[] }) {
  const map = useMap();
  useEffect(() => {
    if (reports.length > 1) {
      const bounds = L.latLngBounds(reports.map((r) => [r.latitude, r.longitude]));
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15 });
    }
  }, [reports, map]);
  return null;
}

export default function LeafletMap({ reports }: { reports: PotholeReport[] }) {
  return (
    <MapContainer
      center={[BENGALURU_CENTER.lat, BENGALURU_CENTER.lng]}
      zoom={12}
      scrollWheelZoom
      className="h-full w-full"
      style={{ minHeight: "100%" }}
    >
      <LayersControl position="topright">
        <LayersControl.BaseLayer name="Street">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer checked name="Satellite">
          <>
            <TileLayer
              attribution='Imagery &copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
            <TileLayer
              attribution='Labels &copy; Esri'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
          </>
        </LayersControl.BaseLayer>
      </LayersControl>
      <FitToReports reports={reports} />
      {reports.map((r) => (
        <Marker key={r.id} position={[r.latitude, r.longitude]} icon={pin(markerColor(r.status, r.severity))}>
          <Popup>
            <div className="space-y-1.5">
              <p className="font-mono text-[11px] text-muted-foreground">{r.complaint_id}</p>
              <p className="text-sm font-semibold">{r.road_name || r.area || "Pothole report"}</p>
              <p className="text-xs text-muted-foreground">
                {SEVERITY_CONFIG[r.severity].label} · {STATUS_CONFIG[r.status].label}
              </p>
              <Link
                to="/reports/$id"
                params={{ id: r.id }}
                className="inline-block text-xs font-semibold text-accent underline-offset-2 hover:underline"
              >
                View details →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}