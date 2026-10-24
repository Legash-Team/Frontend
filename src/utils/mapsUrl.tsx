import React from 'react';
import { ExternalLink, MapPin } from 'lucide-react';

export function isValidCoordinates(lat?: number | null, lng?: number | null): boolean {
  if (lat === null || lat === undefined || lng === null || lng === undefined) return false;
  const numLat = Number(lat);
  const numLng = Number(lng);
  if (!Number.isFinite(numLat) || !Number.isFinite(numLng)) return false;
  if (numLat === 0 && numLng === 0) return false;
  if (numLat < -90 || numLat > 90 || numLng < -180 || numLng > 180) return false;
  return true;
}

export function getGoogleMapsUrl(location?: {
  lat?: number | null;
  lng?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  coordinates?: number[] | { lat?: number | null; lng?: number | null } | null;
  address?: string | null;
  mapsUrl?: string | null;
} | string | null): string | null {
  if (!location) return null;

  if (typeof location === 'string') {
    const trimmed = location.trim();
    return trimmed ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}` : null;
  }

  if (location.mapsUrl && typeof location.mapsUrl === 'string') {
    return location.mapsUrl;
  }

  let lat: number | null | undefined = location.lat ?? location.latitude;
  let lng: number | null | undefined = location.lng ?? location.longitude;

  if (Array.isArray(location.coordinates) && location.coordinates.length >= 2) {
    lng = location.coordinates[0];
    lat = location.coordinates[1];
  } else if (location.coordinates && typeof location.coordinates === 'object') {
    lat = (location.coordinates as any).lat ?? lat;
    lng = (location.coordinates as any).lng ?? lng;
  }

  if (isValidCoordinates(lat, lng)) {
    return `https://www.google.com/maps/search/?api=1&query=${Number(lat)},${Number(lng)}`;
  }

  if (location.address && typeof location.address === 'string' && location.address.trim()) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address.trim())}`;
  }

  return null;
}

interface LocationLinkProps {
  location?: Parameters<typeof getGoogleMapsUrl>[0];
  className?: string;
  showIcon?: boolean;
}

export const LocationLink: React.FC<LocationLinkProps> = ({
  location,
  className = '',
  showIcon = true,
}) => {
  const url = getGoogleMapsUrl(location);

  if (!url) {
    return null;
  }

  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-soft/70">
        Location
      </span>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold text-crimson hover:text-crimson-dark transition-colors group"
      >
        {showIcon && <MapPin className="w-3.5 h-3.5 shrink-0 stroke-[1.75]" />}
        <span>View on Google Maps</span>
        <ExternalLink className="w-3 h-3 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
      </a>
    </div>
  );
};
