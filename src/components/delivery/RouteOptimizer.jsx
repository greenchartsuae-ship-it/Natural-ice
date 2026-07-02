import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navigation, MapPin, Phone, Route, ExternalLink } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Numbered marker icon
const numberedIcon = (num, color = '#0ea5e9') => L.divIcon({
  className: '',
  html: `<div style="background:${color};color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)">${num}</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Nearest-neighbor TSP heuristic
function optimizeRoute(orders) {
  const validOrders = orders.filter(o => o.delivery_lat && o.delivery_lng);
  if (validOrders.length === 0) return [];
  if (validOrders.length === 1) return validOrders;

  const dist = (a, b) => {
    const R = 6371;
    const dLat = ((b.delivery_lat - a.delivery_lat) * Math.PI) / 180;
    const dLng = ((b.delivery_lng - a.delivery_lng) * Math.PI) / 180;
    const x = Math.sin(dLat / 2) ** 2 +
      Math.cos((a.delivery_lat * Math.PI) / 180) *
      Math.cos((b.delivery_lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  };

  const unvisited = [...validOrders];
  const route = [unvisited.shift()];
  while (unvisited.length > 0) {
    const last = route[route.length - 1];
    let nearest = 0;
    let nearestDist = Infinity;
    unvisited.forEach((o, i) => {
      const d = dist(last, o);
      if (d < nearestDist) { nearestDist = d; nearest = i; }
    });
    route.push(unvisited.splice(nearest, 1)[0]);
  }
  return route;
}

function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      map.fitBounds(positions, { padding: [40, 40] });
    }
  }, [positions, map]);
  return null;
}

export default function RouteOptimizer({ orders, open, onOpenChange }) {
  const collectedWithCoords = orders.filter(o => o.status === 'collected' && o.delivery_lat && o.delivery_lng);
  const collectedNoCoords = orders.filter(o => o.status === 'collected' && (!o.delivery_lat || !o.delivery_lng));
  const optimized = optimizeRoute(collectedWithCoords);
  const positions = optimized.map(o => [o.delivery_lat, o.delivery_lng]);

  // Build Google Maps directions URL
  const buildGoogleMapsUrl = () => {
    if (optimized.length === 0) return '#';
    if (optimized.length === 1) {
      return `https://www.google.com/maps/dir/?api=1&destination=${optimized[0].delivery_lat},${optimized[0].delivery_lng}`;
    }
    const destination = optimized[optimized.length - 1];
    const waypoints = optimized.slice(0, -1).map(o => `${o.delivery_lat},${o.delivery_lng}`).join('|');
    return `https://www.google.com/maps/dir/?api=1&destination=${destination.delivery_lat},${destination.delivery_lng}&waypoints=${waypoints}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <DialogTitle className="flex items-center gap-2">
              <Route className="w-5 h-5 text-primary" /> Optimized Delivery Route
            </DialogTitle>
            {optimized.length > 0 && (
              <a href={buildGoogleMapsUrl()} target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="gap-1.5 text-xs">
                  <ExternalLink className="w-3.5 h-3.5" /> Open in Google Maps
                </Button>
              </a>
            )}
          </div>
        </DialogHeader>

        {orders.filter(o => o.status === 'collected').length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <MapPin className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No collected orders to route.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Map */}
            {positions.length > 0 && (
              <div className="rounded-xl overflow-hidden border h-72">
                <MapContainer center={positions[0]} zoom={12} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {positions.length > 1 && (
                    <Polyline positions={positions} color="#0ea5e9" weight={3} dashArray="6 4" />
                  )}
                  {optimized.map((order, idx) => (
                    <Marker key={order.id} position={[order.delivery_lat, order.delivery_lng]} icon={numberedIcon(idx + 1)}>
                      <Popup>
                        <div className="text-sm font-semibold">{idx + 1}. {order.client_name}</div>
                        <div className="text-xs text-gray-500">{order.delivery_address}</div>
                        {order.delivery_phone && <div className="text-xs">{order.delivery_phone}</div>}
                      </Popup>
                    </Marker>
                  ))}
                  <FitBounds positions={positions} />
                </MapContainer>
              </div>
            )}

            {/* Ordered stop list */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Stop Order ({optimized.length} stops)
              </p>
              {optimized.map((order, idx) => (
                <div key={order.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{order.client_name}</p>
                    {order.delivery_address && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 shrink-0" />{order.delivery_address}
                      </p>
                    )}
                    {order.delivery_phone && (
                      <a href={`tel:${order.delivery_phone}`} className="text-xs text-primary flex items-center gap-1 mt-0.5 hover:underline w-fit">
                        <Phone className="w-3 h-3" />{order.delivery_phone}
                      </a>
                    )}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {order.items?.map((item, i) => (
                        <span key={i} className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full">
                          {item.product_name} × {item.quantity}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-primary shrink-0">AED {order.total_amount?.toFixed(2)}</span>
                </div>
              ))}

              {/* Orders without GPS */}
              {collectedNoCoords.length > 0 && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs font-semibold text-amber-700 mb-1">⚠ {collectedNoCoords.length} order(s) have no GPS — not included in route:</p>
                  {collectedNoCoords.map(o => (
                    <p key={o.id} className="text-xs text-amber-600">· {o.client_name} — {o.delivery_address || 'No address'}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}