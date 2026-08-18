import React from 'react';
import Button from '@/components/ui/Button';
import { MapPin, Navigation, CheckCircle2 } from 'lucide-react';
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
    <div className="space-y-4">
      {/* 1. Synced Label - Matching HospitalDetails exactly */}
      <label className="text-[11px] font-mono font-bold text-ink-soft uppercase tracking-wider">
        Facility Location <span className="text-crimson">*</span>
      </label>

      {/* 2. Wide Action Area (2-Column Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left: The Action Button */}
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant={location ? "ghost" : "outline"}
            onClick={onGetLocation}
            isLoading={locationLoading}
            loadingText="Accessing GPS..."
            disabled={disabled}
            /* h-12 to match input heights */
            className={`w-full h-12 text-xs font-bold rounded-md border-line-soft transition-all
              ${location ? 'bg-verified/5 text-verified border-verified/20' : 'bg-paper text-ink'}`}
          >
            {location ? (
              <span className="flex items-center gap-2">
                <Navigation size={14} /> Update Location
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <MapPin size={14} className="text-crimson" />Current Location
              </span>
            )}
          </Button>
        </div>

        {/* Right: The Status/Instruction */}
        <div className={`h-12 flex items-center px-4 rounded-md border text-[11px] font-mono font-bold uppercase tracking-tight transition-all
          ${location 
            ? 'bg-verified/5 border-verified/20 text-verified' 
            : 'bg-paper border-line-soft text-ink-soft/40'}`}
        >
          {location ? (
            <span className="flex items-center gap-2">
              <CheckCircle2 size={14} /> Location Found
            </span>
          ) : (
            'Waiting to Locate...'
          )}
        </div>
      </div>

      {/* 3. Helper and Error Text */}
      <div className="space-y-2">
        {(locationError || error) && (
          <p className="text-[10px] text-crimson font-bold uppercase">
            {locationError || error}
          </p>
        )}
        
        <p className="text-[10px] text-ink-soft/50 italic leading-relaxed">
          * Hospital coordinates are required to calculate donor proximity. 
          Please SignUp while at the facility.
        </p>
      </div>
    </div>
  );
};

export default LocationField;