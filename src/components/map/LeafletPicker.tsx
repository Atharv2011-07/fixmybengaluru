import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { BENGALURU_CENTER } from "@/lib/constants";

const pin = L.divIcon({
  className: "",
  html: `<div class="pothole-pin" style="background:oklch(0.58 0.224 27)"><span>!</span></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

function ClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LeafletPicker({
  value,
  onChange,
}: {
  value: { lat: number; lng: number } | null;
  onChange: (lat: number, lng: number) => void;
}) {
  const center = value ?? BENGALURU_CENTER;
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={value ? 16 : 12}
      scrollWheelZoom
      className="h-full w-full"
      style={{ minHeight: "100%" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onChange={onChange} />
      {value && (
        <>
          <Marker
            position={[value.lat, value.lng]}
            icon={pin}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const m = e.target as L.Marker;
                const p = m.getLatLng();
                onChange(p.lat, p.lng);
              },
            }}
          />
          <Recenter lat={value.lat} lng={value.lng} />
        </>
      )}
    </MapContainer>
  );
}