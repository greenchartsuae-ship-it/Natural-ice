import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation2, MapPin } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const driverIcon = L.divIcon({
  className: '',
  html: `<div style="width:34px;height:34px;border-radius:50%;background:#1d4ed8;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
  </div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const destIcon = L.divIcon({
  className: '',
  html: `<div style="width:30px;height:30px;border-radius:50%;background:#dc2626;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
  </div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length >= 2) {
      map.fitBounds(positions, { padding: [40, 40] });
    } else if (positions.length === 1) {
      map.setView(positions[0], 14);
    }
  }, [positions.map(p => p.join(',')).join('|')]);
  return null;
}

export default function ClientLiveMap({ order }) {
  const driverPos = order.driver_location_lat && order.driver_location_lng
    ? [order.driver_location_lat, order.driver_location_lng]
    : null;

  const destPos = order.delivery_lat && order.delivery_lng
    ? [order.delivery_lat, order.delivery_lng]
    : null;

  const positions = [driverPos, destPos].filter(Boolean);
  const center = driverPos || destPos || [25.2048, 55.2708];

  return (
    <div className="rounded-xl overflow-hidden border shadow-sm">
      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border-b text-xs font-medium text-blue-700">
        <Navigation2 className="w-3.5 h-3.5" />
        <span>Driver Location</span>
        {driverPos
          ? <span className="ml-auto text-green-600 font-semibold">● Live</span>
          : <span className="ml-auto text-muted-foreground">No GPS data yet</span>}
      </div>
      <div style={{ height: 240 }}>
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />
          <FitBounds positions={positions} />
          {driverPos && (
            <Marker position={driverPos} icon={driverIcon}>
              <Popup>🚚 Driver is here</Popup>
            </Marker>
          )}
          {destPos && (
            <Marker position={destPos} icon={destIcon}>
              <Popup>📦 Your delivery location</Popup>
            </Marker>
          )}
          {driverPos && destPos && (
            <Polyline
              positions={[driverPos, destPos]}
              pathOptions={{ color: '#1d4ed8', weight: 3, dashArray: '8 6', opacity: 0.8 }}
            />
          )}
        </MapContainer>
      </div>
      {!driverPos && !destPos && (
        <div className="px-3 py-2 bg-amber-50 border-t text-xs text-amber-700 flex items-center gap-1.5">
          <MapPin className="w-3 h-3" /> Location not available yet
        </div>
      )}
    </div>
  );
}