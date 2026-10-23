import React from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      {/* 1. Synced Label */}
      <label className="text-[11px] font-mono font-bold text-ink-soft uppercase tracking-wider">
        {t('auth.register.facilityLocation')} <span className="text-crimson">*</span>
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
            loadingText={t('auth.register.accessingGps')}
            disabled={disabled}
            className={`w-full h-12 text-xs font-bold rounded-xl border-line-soft transition-all
              ${location ? 'bg-verified/5 text-verified border-verified/20' : 'bg-paper text-ink hover:bg-sand/20'}`}
          >
            {location ? (
              <span className="flex items-center gap-2">
                <Navigation size={14} /> {t('auth.register.updateLocation')}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <MapPin size={14} className="text-crimson" /> {t('auth.register.currentLocation')}
              </span>
            )}
          </Button>
        </div>

        {/* Right: The Status/Instruction */}
        <div className={`h-12 flex items-center px-4 rounded-xl border text-[11px] font-mono font-bold uppercase tracking-tight transition-all
          ${location 
            ? 'bg-verified/5 border-verified/20 text-verified' 
            : 'bg-paper border-line-soft text-ink-soft/40'}`}
        >
          {location ? (
            <span className="flex items-center gap-2">
              <CheckCircle2 size={14} /> {t('auth.register.locationFound')}
            </span>
          ) : (
            t('auth.register.waitingToLocate')
          )}
        </div>
      </div>

      {/* 3. Helper and Error Text */}
      <div className="space-y-1">
        {(locationError || error) && (
          <p className="text-[10px] text-crimson font-bold uppercase">
            {locationError || error}
          </p>
        )}
        
        <p className="text-[10px] text-ink-soft/50 italic leading-relaxed">
          {t('auth.register.locationHint')}
        </p>
      </div>
    </div>
  );
};

export default LocationField;