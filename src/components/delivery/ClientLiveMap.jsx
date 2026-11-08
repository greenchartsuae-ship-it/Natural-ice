import React from 'react';
import { Navigation2, MapPin, ExternalLink } from 'lucide-react';

export default function ClientLiveMap({ order }) {
  const driverLat = order.driver_location_lat;
  const driverLng = order.driver_location_lng;
  const destLat = order.delivery_lat;
  const destLng = order.delivery_lng;

  const hasDriver = driverLat && driverLng;
  const hasDest = destLat && destLng;

  // Center on driver if available, else destination, else Dubai
  const centerLat = driverLat || destLat || 25.2048;
  const centerLng = driverLng || destLng || 55.2708;

  // Show route from driver to destination when both available
  const embedUrl = hasDriver && hasDest
    ? `https://maps.google.com/maps?saddr=${driverLat},${driverLng}&daddr=${destLat},${destLng}&output=embed`
    : hasDriver
    ? `https://maps.google.com/maps?q=${driverLat},${driverLng}&z=15&output=embed`
    : hasDest
    ? `https://maps.google.com/maps?q=${destLat},${destLng}&z=15&output=embed`
    : `https://maps.google.com/maps?q=${centerLat},${centerLng}&z=14&output=embed`;

  // Key forces iframe reload when driver position changes
  const iframeKey = hasDriver ? `${Math.round(driverLat * 5000)},${Math.round(driverLng * 5000)}` : 'default';

  // Google Maps directions link (driver → destination)
  const directionsUrl = hasDriver && hasDest
    ? `https://www.google.com/maps/dir/${driverLat},${driverLng}/${destLat},${destLng}`
    : hasDest
    ? `https://www.google.com/maps?q=${destLat},${destLng}`
    : null;

  return (
    <div className="rounded-xl overflow-hidden border shadow-sm">
      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border-b text-xs font-medium text-blue-700">
        <Navigation2 className="w-3.5 h-3.5" />
        <span>Driver Location</span>
        {hasDriver
          ? <span className="ml-auto text-green-600 font-semibold">● Live</span>
          : <span className="ml-auto text-muted-foreground">No GPS data yet</span>}
        {directionsUrl && (
          <a href={directionsUrl} target="_blank" rel="noopener noreferrer"
            className="ml-2 flex items-center gap-1 text-blue-600 hover:underline">
            <ExternalLink className="w-3 h-3" /> Open in Google Maps
          </a>
        )}
      </div>
      <div style={{ height: 240 }}>
        <iframe
          key={iframeKey}
          title="Google Maps"
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      {!hasDriver && !hasDest && (
        <div className="px-3 py-2 bg-amber-50 border-t text-xs text-amber-700 flex items-center gap-1.5">
          <MapPin className="w-3 h-3" /> Location not available yet
        </div>
      )}
    </div>
  );
}