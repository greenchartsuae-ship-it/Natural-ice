import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { base44 } from '@/api/base44Client';
import { Navigation, MapPin } from 'lucide-react';

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const driverIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:36px;height:36px;border-radius:50%;
    background:#1d4ed8;border:3px solid white;
    box-shadow:0 2px 8px rgba(0,0,0,0.4);
    display:flex;align-items:center;justify-content:center;
  ">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="3 11 22 2 13 21 11 13 3 11"/>
    </svg>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const destIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:32px;height:32px;border-radius:50%;
    background:#dc2626;border:3px solid white;
    box-shadow:0 2px 8px rgba(0,0,0,0.4);
    display:flex;align-items:center;justify-content:center;
  ">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
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

export default function DriverLiveMap({ order }) {
  const [driverPos, setDriverPos] = useState(null);
  const [gpsError, setGpsError] = useState(null);
  const watchId = useRef(null);
  const saveTimer = useRef(null);

  const destPos = order.delivery_lat && order.delivery_lng
    ? [order.delivery_lat, order.delivery_lng]
    : null;

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsError('GPS not supported on this device');
      return;
    }

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setDriverPos([lat, lng]);
        setGpsError(null);

        // Throttle saves to DB: save at most every 10s
        if (!saveTimer.current) {
          saveTimer.current = setTimeout(() => {
            base44.entities.Order.update(order.id, {
              driver_location_lat: lat,
              driver_location_lng: lng,
            });
            saveTimer.current = null;
          }, 10000);
        }
      },
      (err) => setGpsError('Unable to get GPS location'),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => {
      if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [order.id]);

  const positions = [driverPos, destPos].filter(Boolean);
  const center = driverPos || destPos || [25.2048, 55.2708]; // fallback to Dubai

  return (
    <div className="rounded-xl overflow-hidden border shadow-sm">
      <div className="flex items-center justify-between px-3 py-2 bg-indigo-50 border-b text-xs font-medium text-indigo-700">
        <span className="flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5" />
          Live Tracking — {order.client_name}
        </span>
        {driverPos && (
          <span className="text-green-600 font-semibold">● GPS Active</span>
        )}
        {gpsError && (
          <span className="text-red-500">{gpsError}</span>
        )}
      </div>

      <div style={{ height: 280 }}>
        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={true}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />
          <FitBounds positions={positions} />

          {driverPos && (
            <Marker position={driverPos} icon={driverIcon}>
              <Popup>📍 You are here</Popup>
            </Marker>
          )}

          {destPos && (
            <Marker position={destPos} icon={destIcon}>
              <Popup>
                <div className="text-xs">
                  <p className="font-semibold">{order.client_name}</p>
                  <p>{order.delivery_address}</p>
                </div>
              </Popup>
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

      {!destPos && (
        <div className="px-3 py-2 bg-amber-50 border-t text-xs text-amber-700 flex items-center gap-1.5">
          <MapPin className="w-3 h-3" /> No delivery coordinates — client did not share location
        </div>
      )}
    </div>
  );
}