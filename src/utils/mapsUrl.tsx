/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { ExternalLink, MapPin } from 'lucide-react';

export function isValidCoordinates(lat?: number | string | null, lng?: number | string | null): boolean {
  if (lat === null || lat === undefined || lng === null || lng === undefined) return false;
  const numLat = Number(lat);
  const numLng = Number(lng);
  if (!Number.isFinite(numLat) || !Number.isFinite(numLng)) return false;
  if (numLat === 0 && numLng === 0) return false;
  if (numLat < -90 || numLat > 90 || numLng < -180 || numLng > 180) return false;
  return true;
}

export type LocationInput = {
  lat?: number | string | null;
  lng?: number | string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  coordinates?: (number | string)[] | { lat?: number | string | null; lng?: number | string | null } | null;
  address?: string | null;
  mapsUrl?: string | null;
} | string | null;

export function getGoogleMapsUrl(location?: LocationInput): string | null {
  if (!location) return null;

  if (typeof location === 'string') {
    const trimmed = location.trim();
    return trimmed ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}` : null;
  }

  if (location.mapsUrl && typeof location.mapsUrl === 'string') {
    return location.mapsUrl;
  }

  let latVal: number | string | null | undefined = location.lat ?? location.latitude;
  let lngVal: number | string | null | undefined = location.lng ?? location.longitude;

  if (Array.isArray(location.coordinates) && location.coordinates.length >= 2) {
    lngVal = location.coordinates[0];
    latVal = location.coordinates[1];
  } else if (location.coordinates && typeof location.coordinates === 'object') {
    const coords = location.coordinates as { lat?: number | string | null; lng?: number | string | null };
    latVal = coords.lat ?? latVal;
    lngVal = coords.lng ?? lngVal;
  }

  if (isValidCoordinates(latVal, lngVal)) {
    return `https://www.google.com/maps/search/?api=1&query=${Number(latVal)},${Number(lngVal)}`;
  }

  if (location.address && typeof location.address === 'string' && location.address.trim()) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address.trim())}`;
  }

  return null;
}

interface LocationLinkProps {
  location?: LocationInput;
  className?: string;
  showIcon?: boolean;
  showLabel?: boolean;
  label?: string;
  showAddress?: boolean;
}

export const LocationLink: React.FC<LocationLinkProps> = ({
  location,
  className = '',
  showIcon = true,
  showLabel = false,
  label = 'Location',
  showAddress = false,
}) => {
  const url = getGoogleMapsUrl(location);
  const address = typeof location === 'object' && location !== null && 'address' in location && typeof location.address === 'string'
    ? location.address.trim()
    : (typeof location === 'string' ? location.trim() : '');

  if (!url && !address) {
    return null;
  }

  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      {showLabel && (
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-soft/70">
          {label}
        </span>
      )}
      {showAddress && address && (
        <span className="text-xs text-ink font-medium">
          {address}
        </span>
      )}
      {url ? (
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
      ) : (
        <span className="text-xs text-ink-soft italic">Google Maps link unavailable</span>
      )}
    </div>
  );
};
