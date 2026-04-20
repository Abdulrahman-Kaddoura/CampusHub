import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./LocationMessage.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function LocationMessage({ latitude, longitude, isMine }) {
  const gmapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

  return (
    <div className={`loc-msg ${isMine ? "loc-msg-mine" : "loc-msg-theirs"}`}>
      <div className="loc-msg-map">
        <MapContainer
          center={[latitude, longitude]}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
          dragging={false}
          zoomControl={false}
          attributionControl={false}
          doubleClickZoom={false}
          touchZoom={false}
          keyboard={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[latitude, longitude]} />
        </MapContainer>
      </div>
      <a
        href={gmapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`loc-msg-link ${isMine ? "loc-msg-link-mine" : "loc-msg-link-theirs"}`}
      >
        📍 Open in Google Maps
      </a>
    </div>
  );
}
