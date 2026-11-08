import React, { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Navigation, MapPin, ExternalLink } from 'lucide-react';

export default function DriverLiveMap({ order }) {
  const [driverPos, setDriverPos] = useState(null);
  const [gpsError, setGpsError] = useState(null);
  const watchId = useRef(null);
  const saveTimer = useRef(null);

  const destLat = order.delivery_lat;
  const destLng = order.delivery_lng;
  const hasDest = destLat && destLng;

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
      () => setGpsError('Unable to get GPS location'),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => {
      if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [order.id]);

  const driverLat = driverPos ? driverPos[0] : null;
  const driverLng = driverPos ? driverPos[1] : null;

  const centerLat = driverLat || destLat || 25.2048;
  const centerLng = driverLng || destLng || 55.2708;

  // Use directions embed when both points available — shows route + live driver pin
  // Add timestamp to key so iframe reloads when driver position updates
  const embedUrl = driverLat && hasDest
    ? `https://maps.google.com/maps?saddr=${driverLat},${driverLng}&daddr=${destLat},${destLng}&output=embed`
    : `https://maps.google.com/maps?q=${centerLat},${centerLng}&z=15&output=embed`;

  const iframeKey = driverLat ? `${Math.round(driverLat * 5000)},${Math.round(driverLng * 5000)}` : 'default';

  const directionsUrl = driverPos && hasDest
    ? `https://www.google.com/maps/dir/${driverLat},${driverLng}/${destLat},${destLng}`
    : hasDest
    ? `https://www.google.com/maps?q=${destLat},${destLng}`
    : null;

  return (
    <div className="rounded-xl overflow-hidden border shadow-sm">
      <div className="flex items-center justify-between px-3 py-2 bg-indigo-50 border-b text-xs font-medium text-indigo-700">
        <span className="flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5" />
          Live Tracking — {order.client_name}
        </span>
        <div className="flex items-center gap-3">
          {driverPos && <span className="text-green-600 font-semibold">● GPS Active</span>}
          {gpsError && <span className="text-red-500">{gpsError}</span>}
          {directionsUrl && (
            <a href={directionsUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-indigo-600 hover:underline">
              <ExternalLink className="w-3 h-3" /> Open in Google Maps
            </a>
          )}
        </div>
      </div>

      <div style={{ height: 280 }}>
        <iframe
          key={iframeKey}
          title="Google Maps Driver"
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      {!hasDest && (
        <div className="px-3 py-2 bg-amber-50 border-t text-xs text-amber-700 flex items-center gap-1.5">
          <MapPin className="w-3 h-3" /> No delivery coordinates — client did not share location
        </div>
      )}
    </div>
  );
}