import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Button from '../components/ui/Button';
import ErrorBoundary from '../components/ErrorBoundary';
import { searchHospitals } from '../api/hospital-api';
import { ALLOWED_BLOOD_TYPES } from '../types/hospital-types';
import type { BloodType, HospitalSearchResult } from '../types/hospital-types';

export const HospitalSearchPage: React.FC = () => {
  const [selectedBloodType, setSelectedBloodType] = useState<BloodType | ''>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const [results, setResults] = useState<HospitalSearchResult[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const handleSearch = async () => {
    setValidationError(null);
    setError(null);

    // Validate Blood Type filter requirement before calling API
    if (!selectedBloodType) {
      setValidationError('Please select a blood type filter before searching.');
      return;
    }

    if (!ALLOWED_BLOOD_TYPES.includes(selectedBloodType as BloodType)) {
      setValidationError('Invalid blood type filter.');
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const response = await searchHospitals(selectedBloodType as BloodType);

      // Safe extraction helper: ensure results is always a valid array
      let hospitalsList: HospitalSearchResult[] = [];
      if (Array.isArray(response)) {
        hospitalsList = response;
      } else if (response && typeof response === 'object') {
        const resObj = response as Record<string, unknown>;
        if (Array.isArray(resObj.hospitals)) {
          hospitalsList = resObj.hospitals as HospitalSearchResult[];
        } else if (Array.isArray(resObj.data)) {
          hospitalsList = resObj.data as HospitalSearchResult[];
        } else if (Array.isArray(resObj.results)) {
          hospitalsList = resObj.results as HospitalSearchResult[];
        }
      }

      setResults(hospitalsList);
    } catch (err: unknown) {
      let message = 'Failed to search hospitals.';
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string; error?: string } } };
        message = axiosErr.response?.data?.message || axiosErr.response?.data?.error || message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const resultsList = Array.isArray(results) ? results : [];

  return (
    <ErrorBoundary>
      <DashboardLayout>
        <div className="space-y-6 max-w-5xl mx-auto">
          {/* Header */}
          <div className="pb-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Hospital Search</h1>
            <p className="text-sm text-gray-500 mt-1">
              Search regional hospitals by blood type availability for emergency transfers.
            </p>
          </div>

          {/* Search Control Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-900 flex items-center justify-between">
                <span>
                  1. Select Blood Type Filter <span className="text-red-500">*</span>
                </span>
                <span className="text-xs font-normal text-gray-500">Required before searching</span>
              </label>

              {/* 8 Blood Types Filter Selection */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {ALLOWED_BLOOD_TYPES.map((type) => {
                  const isSelected = selectedBloodType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setSelectedBloodType(type);
                        setValidationError(null);
                      }}
                      className={`py-2.5 px-2 rounded-xl text-sm font-extrabold border transition-all duration-150 ${
                        isSelected
                          ? 'bg-red-600 text-white border-red-600 shadow-sm ring-2 ring-red-500/20'
                          : 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>

              {validationError && (
                <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                  <span>⚠️</span> {validationError}
                </p>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <Button
                type="button"
                onClick={handleSearch}
                isLoading={loading}
                loadingText="Searching Hospitals..."
                className="px-8"
              >
                🔍 Search Hospitals
              </Button>
            </div>
          </div>

          {/* Results Section */}
          {loading && (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-xs">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent"></div>
              <p className="mt-3 text-sm text-gray-600 font-medium">
                Searching hospitals with {selectedBloodType} blood inventory...
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 text-sm flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && hasSearched && results !== null && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900">
                  Search Results ({resultsList.length} hospital{resultsList.length === 1 ? '' : 's'} found)
                </h2>
                <span className="text-xs text-gray-500 font-medium">
                  Filtered by Blood Group: <span className="font-bold text-red-600">{selectedBloodType}</span>
                </span>
              </div>

              {resultsList.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-xs space-y-2">
                  <span className="text-3xl">🏥</span>
                  <p className="text-sm font-semibold text-gray-800">No Hospitals Found</p>
                  <p className="text-xs text-gray-500 max-w-md mx-auto">
                    No hospitals currently report available inventory for blood type {selectedBloodType}.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resultsList.map((h, idx) => {
                    if (!h || typeof h !== 'object') return null;

                    const itemObj = h as unknown as Record<string, unknown>;
                    const hospitalName = h.name || (itemObj.hospitalName as string) || 'Unnamed Hospital';
                    const hospitalEmail = h.email || 'No email recorded';
                    const hospitalPhone = h.phone || 'No phone recorded';
                    const hospitalLicense = h.licenseNumber || (itemObj.license_number as string) || null;

                    // Extract available stock safely
                    let availableQuantity: string | number = 'Available';
                    if (typeof h.stockQuantity === 'number') {
                      availableQuantity = h.stockQuantity;
                    } else if (h.availableStock && typeof h.availableStock === 'object' && selectedBloodType) {
                      const stock = h.availableStock[selectedBloodType as BloodType];
                      if (typeof stock === 'number') {
                        availableQuantity = stock;
                      }
                    }

                    // Extract location coordinates safely
                    const loc = h.location && typeof h.location === 'object' ? (h.location as unknown as Record<string, unknown>) : null;
                    const lat = loc ? (loc.lat ?? loc.latitude ?? null) : null;
                    const lng = loc ? (loc.lng ?? loc.longitude ?? null) : null;

                    const hObj = h as unknown as Record<string, unknown>;

                    return (
                      <div
                        key={h.id || (hObj._id as string) || idx}
                        className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 hover:border-gray-300 transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-gray-900 text-base">{hospitalName}</h3>
                            <p className="text-xs text-gray-500 mt-0.5">{hospitalEmail}</p>
                          </div>
                          <span className="bg-red-100 text-red-800 text-xs font-bold px-2.5 py-1 rounded-full border border-red-200">
                            {selectedBloodType}: {availableQuantity} units
                          </span>
                        </div>

                        <div className="space-y-1.5 text-xs text-gray-600 pt-2 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <span>📞</span>
                            <span>{hospitalPhone}</span>
                          </div>

                          {hospitalLicense && (
                            <div className="flex items-center gap-2">
                              <span>📜</span>
                              <span>License: {hospitalLicense}</span>
                            </div>
                          )}

                          {lat !== null && lng !== null ? (
                            <div className="flex items-center gap-2 text-gray-700">
                              <span className="text-red-600">📍</span>
                              <span>
                                Lat: <span className="font-mono">{String(lat)}</span> | Lng:{' '}
                                <span className="font-mono">{String(lng)}</span>
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-gray-400">
                              <span>📍</span>
                              <span>Location coordinates not listed</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ErrorBoundary>
  );
};

export default HospitalSearchPage;

