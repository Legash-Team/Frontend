import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { searchHospitals } from '../services/hospitalService';
import { ALLOWED_BLOOD_TYPES } from '../types/hospital-types';
import type { BloodType, HospitalSearchResult } from '../types/hospital-types';
import {
  Search,
  AlertTriangle,
  Building2,
  Phone,
  FileText,
  MapPin,
  Droplets,
  CheckCircle2,
} from 'lucide-react';

export const HospitalSearchPage: React.FC = () => {
  const [selectedBloodType, setSelectedBloodType] = useState<BloodType | ''>('');
  const [quantityNeeded, setQuantityNeeded] = useState<string>('1');
  const [searchedQuantity, setSearchedQuantity] = useState<number | null>(null);

  const [validationError, setValidationError] = useState<string | null>(null);

  const [results, setResults] = useState<HospitalSearchResult[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const handleSearch = async () => {
    setValidationError(null);
    setError(null);

    // 1. Validate Blood Type Selection
    if (!selectedBloodType) {
      setValidationError('Please select a blood type filter before searching.');
      return;
    }

    if (!ALLOWED_BLOOD_TYPES.includes(selectedBloodType as BloodType)) {
      setValidationError('Invalid blood type filter.');
      return;
    }

    // 2. Validate Quantity Needed
    const qtyStr = quantityNeeded.trim();
    if (!qtyStr) {
      setValidationError('Please specify the quantity of blood units needed.');
      return;
    }

    if (!/^\d+$/.test(qtyStr)) {
      setValidationError('Quantity needed must be a whole positive integer.');
      return;
    }

    const numQty = parseInt(qtyStr, 10);
    if (isNaN(numQty) || numQty < 1) {
      setValidationError('Quantity needed must be at least 1 unit.');
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setSearchedQuantity(numQty);

    try {
      const response = await searchHospitals(selectedBloodType as BloodType, numQty);

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
  const hospitalCount = resultsList.length;

  let resultCountLabel = `${hospitalCount} hospitals found`;
  if (hospitalCount === 0) {
    resultCountLabel = 'No hospitals found';
  } else if (hospitalCount === 1) {
    resultCountLabel = '1 hospital found';
  }

  return (
    <ErrorBoundary>
      <DashboardLayout>
        <div className="space-y-6 max-w-5xl mx-auto">
          {/* Header */}
          <div className="pb-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
              <Search className="w-7 h-7 text-red-600" />
              <span>Hospital Search</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Search regional hospitals by blood group and required quantity of units for emergency dispatch.
            </p>
          </div>

          {/* Search Control Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-6">
            {/* Step 1: Select Blood Type */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-900 flex items-center justify-between">
                <span>
                  1. Select Blood Group <span className="text-red-500">*</span>
                </span>
                <span className="text-xs font-normal text-gray-500">Required before searching</span>
              </label>

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
                      className={`py-2.5 px-2 rounded-xl text-sm font-extrabold border transition-all duration-150 ${isSelected
                          ? 'bg-red-600 text-white border-red-600 shadow-sm ring-2 ring-red-500/20'
                          : 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                        }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Quantity Needed */}
            <div className="pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  type="text"
                  inputMode="numeric"
                  label="2. Quantity / Units Needed *"
                  value={quantityNeeded}
                  onChange={(e) => {
                    setQuantityNeeded(e.target.value);
                    setValidationError(null);
                  }}
                  placeholder="e.g. 3"
                  helperText="Specify how many blood units your patient requires"
                />
              </div>

              <div className="flex items-end justify-start sm:justify-end pb-1">
                <Button
                  type="button"
                  onClick={handleSearch}
                  isLoading={loading}
                  loadingText="Searching Hospitals..."
                  className="w-full sm:w-auto px-8 gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Hospitals</span>
                </Button>
              </div>
            </div>

            {/* Validation Error Alert */}
            {validationError && (
              <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1.5 p-3 bg-red-50 border border-red-200 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{validationError}</span>
              </p>
            )}
          </div>

          {/* Results Section */}
          {loading && (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-xs">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent"></div>
              <p className="mt-3 text-sm text-gray-600 font-medium">
                Searching hospitals for {quantityNeeded} unit{parseInt(quantityNeeded, 10) === 1 ? '' : 's'} of {selectedBloodType} blood...
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 text-sm flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && hasSearched && results !== null && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white px-5 py-4 rounded-xl border border-gray-200 shadow-xs gap-2">
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-5 h-5 text-red-600" />
                  <span className="text-base font-bold text-gray-900">{resultCountLabel}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600 font-medium">
                  <span>
                    Group: <span className="font-bold text-red-600">{selectedBloodType}</span>
                  </span>
                  <span>|</span>
                  <span>
                    Requested: <span className="font-bold text-gray-900">{searchedQuantity} unit{searchedQuantity === 1 ? '' : 's'}</span>
                  </span>
                </div>
              </div>

              {hospitalCount === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-xs space-y-3">
                  <Building2 className="w-10 h-10 text-gray-400 mx-auto" />
                  <p className="text-sm font-semibold text-gray-800">No Hospitals Found</p>
                  <p className="text-xs text-gray-500 max-w-md mx-auto">
                    No hospitals currently report available inventory for blood group {selectedBloodType}.
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

                    let availableQuantityNum: number = 0;
                    if (typeof h.stockQuantity === 'number') {
                      availableQuantityNum = h.stockQuantity;
                    } else if (h.availableStock && typeof h.availableStock === 'object' && selectedBloodType) {
                      const stock = h.availableStock[selectedBloodType as BloodType];
                      if (typeof stock === 'number') {
                        availableQuantityNum = stock;
                      }
                    }

                    const reqQty = searchedQuantity ?? 1;
                    const hasSufficientStock = availableQuantityNum >= reqQty;

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
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${hasSufficientStock
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-amber-50 text-amber-900 border-amber-200'
                              }`}
                          >
                            <Droplets className={`w-3.5 h-3.5 ${hasSufficientStock ? 'text-emerald-600' : 'text-amber-600'}`} />
                            <span>{availableQuantityNum} units available</span>
                          </span>
                        </div>

                        {/* Stock vs Requirement Comparison Badge */}
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
                          <span className="text-gray-600 font-medium">
                            Required: <span className="font-bold text-gray-900">{reqQty} units</span>
                          </span>
                          {hasSufficientStock ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Sufficient Stock</span>
                            </span>
                          ) : (
                            <span className="text-amber-700 font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              <span>Partial Stock ({availableQuantityNum}/{reqQty})</span>
                            </span>
                          )}
                        </div>

                        <div className="space-y-1.5 text-xs text-gray-600 pt-2 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            <span>{hospitalPhone}</span>
                          </div>

                          {hospitalLicense && (
                            <div className="flex items-center gap-2">
                              <FileText className="w-3.5 h-3.5 text-gray-400" />
                              <span>License: {hospitalLicense}</span>
                            </div>
                          )}

                          {lat !== null && lng !== null ? (
                            <div className="flex items-center gap-2 text-gray-700">
                              <MapPin className="w-3.5 h-3.5 text-red-600" />
                              <span>
                                Lat: <span className="font-mono">{String(lat)}</span> | Lng:{' '}
                                <span className="font-mono">{String(lng)}</span>
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-gray-400">
                              <MapPin className="w-3.5 h-3.5 text-gray-400" />
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
