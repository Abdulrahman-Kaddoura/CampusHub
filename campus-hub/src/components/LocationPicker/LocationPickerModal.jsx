import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./LocationPickerModal.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function MapClickHandler({ onSelect }) {
  useMapEvents({
    click: (e) => onSelect({ lat: e.latlng.lat, lng: e.latlng.lng }),
  });
  return null;
}

export default function LocationPickerModal({ onConfirm, onCancel }) {
  const [pinned, setPinned] = useState(null);
  // Default center: AUB, Beirut
  const defaultCenter = [33.9008, 35.4839];

  return (
    <div className="loc-overlay" onClick={onCancel}>
      <div className="loc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="loc-modal-header">
          <span className="loc-modal-title">Share a Location</span>
          <button className="loc-close-btn" onClick={onCancel} aria-label="Close">×</button>
        </div>
        <p className="loc-hint">Click anywhere on the map to drop a pin</p>
        <div className="loc-map-wrap">
          <MapContainer center={defaultCenter} zoom={15} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onSelect={setPinned} />
            {pinned && <Marker position={[pinned.lat, pinned.lng]} />}
          </MapContainer>
        </div>
        {pinned && (
          <p className="loc-coords">
            📍 {pinned.lat.toFixed(5)}, {pinned.lng.toFixed(5)}
          </p>
        )}
        <div className="loc-actions">
          <button className="loc-btn-cancel" onClick={onCancel}>Cancel</button>
          <button
            className="loc-btn-confirm"
            onClick={() => pinned && onConfirm(pinned)}
            disabled={!pinned}
          >
            Send Location
          </button>
        </div>
      </div>
    </div>
  );
}
