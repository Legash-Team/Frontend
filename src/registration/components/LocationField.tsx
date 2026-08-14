import React from 'react';
import Button from '../../components/ui/Button';
import type { LocationData } from '../types/registration-types';

export interface LocationFieldProps {
  location: LocationData | null;
  locationLoading: boolean;
  locationError: string | null;
  error?: string;
  onGetLocation: () => void;
  disabled?: boolean;
}

export const LocationField: React.FC<LocationFieldProps> = ({
  location,
  locationLoading,
  locationError,
  error,
  onGetLocation,
  disabled = false,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
        <label className="text-sm font-semibold text-gray-900">
          Hospital Location <span className="text-red-500">*</span>
        </label>
        {location && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            ✓ Location Captured
          </span>
        )}
      </div>

      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
        <p className="text-xs text-gray-600 leading-relaxed">
          Allow browser location access to capture your hospital&apos;s geographical coordinates for emergency blood dispatching.
        </p>

        {location ? (
          <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-lg flex items-center justify-between">
            <div className="text-xs text-emerald-900 font-medium">
              <span className="block font-semibold">Coordinates Recorded:</span>
              <span>Latitude: {location.lat} | Longitude: {location.lng}</span>
            </div>
            <button
              type="button"
              onClick={onGetLocation}
              disabled={disabled || locationLoading}
              className="text-xs text-emerald-700 hover:text-emerald-900 underline font-medium"
            >
              Re-capture
            </button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={onGetLocation}
            isLoading={locationLoading}
            loadingText="Detecting coordinates..."
            disabled={disabled}
            className="w-full text-xs py-2 bg-white hover:bg-gray-100 border-gray-300"
          >
            📍 Detect Hospital Location
          </Button>
        )}

        {(locationError || error) && (
          <p className="text-xs text-red-600 font-medium">
            {locationError || error}
          </p>
        )}
      </div>
    </div>
  );
};

export default LocationField;
