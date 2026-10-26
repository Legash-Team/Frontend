import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '@/layouts/DashboardLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ErrorBoundary from '@/components/ErrorBoundary';
import { searchHospitals } from '@/features/hospital/api/hospital-api';
import { ALLOWED_BLOOD_TYPES } from '@/features/hospital/types/hospital-types';
import type { BloodType, HospitalSearchResult } from '@/features/hospital/types/hospital-types';
import {
  Search,
  AlertTriangle,
  Building2,
  Phone,
  Droplets,
  CheckCircle2,
} from 'lucide-react';
import { LocationLink } from '@/utils/mapsUrl';

export const HospitalSearchPage: React.FC = () => {
  const { t } = useTranslation();
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
      setValidationError(t('hospitalSearch.errorSelectType'));
      return;
    }

    if (!ALLOWED_BLOOD_TYPES.includes(selectedBloodType as BloodType)) {
      setValidationError(t('hospitalSearch.errorInvalidType'));
      return;
    }

    // 2. Validate Quantity Needed
    const qtyStr = quantityNeeded.trim();
    if (!qtyStr) {
      setValidationError(t('hospitalSearch.errorQuantityRequired'));
      return;
    }

    if (!/^\d+$/.test(qtyStr)) {
      setValidationError(t('hospitalSearch.errorQuantityWhole'));
      return;
    }

    const numQty = parseInt(qtyStr, 10);
    if (isNaN(numQty) || numQty < 1) {
      setValidationError(t('hospitalSearch.errorQuantityMin'));
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
      let message = t('hospitalSearch.errorSearchFailed');
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

  const reqQty = searchedQuantity ?? 1;
  const rawList = Array.isArray(results) ? results : [];
  const resultsList = rawList.filter((h) => {
    if (!h) return false;
    let qty: number | null = null;
    if (typeof h.stockQuantity === 'number') {
      qty = h.stockQuantity;
    } else if (h.availableStock && typeof h.availableStock === 'object' && selectedBloodType) {
      const s = h.availableStock[selectedBloodType as BloodType];
      if (typeof s === 'number') qty = s;
    }
    if (qty !== null && qty < reqQty) return false;
    return true;
  });
  const hospitalCount = resultsList.length;

  let resultCountLabel = t('hospitalSearch.resultCountMany', { count: hospitalCount });
  if (hospitalCount === 0) {
    resultCountLabel = t('hospitalSearch.resultCountZero');
  } else if (hospitalCount === 1) {
    resultCountLabel = t('hospitalSearch.resultCountOne');
  }

  return (
    <ErrorBoundary>
      <DashboardLayout
        icon={<Search size={16} className="stroke-[1.75]" />}
      >
        <div className="space-y-6 max-w-5xl mx-auto">
          {/* Header */}
          <div className="pb-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              <span>{t('hospitalSearch.title')}</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {t('hospitalSearch.description')}
            </p>
          </div>

          {/* Search Control Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-6">
            {/* Step 1: Select Blood Type */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-900 flex items-center justify-between">
                <span>
                  {t('hospitalSearch.step1Label')} <span className="text-red-500">*</span>
                </span>
                <span className="text-xs font-normal text-gray-500">{t('hospitalSearch.step1Hint')}</span>
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
            </div>

            {/* Step 2: Quantity Needed */}
            <div className="pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  type="text"
                  inputMode="numeric"
                  label={t('hospitalSearch.step2Label')}
                  value={quantityNeeded}
                  onChange={(e) => {
                    setQuantityNeeded(e.target.value);
                    setValidationError(null);
                  }}
                  placeholder={t('hospitalSearch.quantityPlaceholder')}
                  helperText={t('hospitalSearch.quantityHelper')}
                />
              </div>

              <div className="flex items-end justify-start sm:justify-end pb-1">
                <Button
                  type="button"
                  onClick={handleSearch}
                  isLoading={loading}
                  loadingText={t('hospitalSearch.searchingButton')}
                  className="w-full sm:w-auto px-8 gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>{t('hospitalSearch.searchButton')}</span>
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
                {parseInt(quantityNeeded, 10) === 1
                  ? t('hospitalSearch.searchingOne', { qty: quantityNeeded, type: selectedBloodType })
                  : t('hospitalSearch.searchingMany', { qty: quantityNeeded, type: selectedBloodType })}
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
                    {t('hospitalSearch.groupLabel')} <span className="font-bold text-red-600">{selectedBloodType}</span>
                  </span>
                  <span>|</span>
                  <span>
                    {t('hospitalSearch.requestedLabel')}{' '}
                    <span className="font-bold text-gray-900">
                      {searchedQuantity} {searchedQuantity === 1 ? t('hospitalSearch.unit') : t('hospitalSearch.units')}
                    </span>
                  </span>
                </div>
              </div>

              {hospitalCount === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-xs space-y-3">
                  <Building2 className="w-10 h-10 text-gray-400 mx-auto" />
                  <p className="text-sm font-semibold text-gray-800">{t('hospitalSearch.noHospitalsTitle')}</p>
                  <p className="text-xs text-gray-500 max-w-md mx-auto">
                    {t('hospitalSearch.noHospitalsBody', { type: selectedBloodType })}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resultsList.map((h, idx) => {
                    if (!h || typeof h !== 'object') return null;

                    const itemObj = h as unknown as Record<string, unknown>;
                    const hospitalName = h.name || (itemObj.hospitalName as string) || t('hospitalSearch.unnamedHospital');
                    const hospitalEmail = h.email || t('hospitalSearch.noEmail');
                    const hospitalPhone = h.phone || t('hospitalSearch.noPhone');

                    let availableQuantityNum: number = 0;
                    if (typeof h.stockQuantity === 'number') {
                      availableQuantityNum = h.stockQuantity;
                    } else if (typeof (h as any).availableUnits === 'number') {
                      availableQuantityNum = (h as any).availableUnits;
                    } else if (h.availableStock && typeof h.availableStock === 'object' && selectedBloodType) {
                      const stock = h.availableStock[selectedBloodType as BloodType];
                      if (typeof stock === 'number') {
                        availableQuantityNum = stock;
                      }
                    }

                    const reqQty = searchedQuantity ?? 1;
                    const hasSufficientStock = availableQuantityNum >= reqQty;

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
                            className={`text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                              hasSufficientStock
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-amber-50 text-amber-900 border-amber-200'
                            }`}
                          >
                            <Droplets className={`w-3.5 h-3.5 ${hasSufficientStock ? 'text-emerald-600' : 'text-amber-600'}`} />
                            <span>
                              {availableQuantityNum === 1
                                ? t('hospitalSearch.unitAvailable', { count: availableQuantityNum, defaultValue: '1 unit available' })
                                : t('hospitalSearch.unitsAvailable', { count: availableQuantityNum })}
                            </span>
                          </span>
                        </div>

                        {/* Stock vs Requirement Comparison Badge */}
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
                          <span className="text-gray-600 font-medium">
                            {t('hospitalSearch.requiredLabel')}{' '}
                            <span className="font-bold text-gray-900">
                              {reqQty} {reqQty === 1 ? t('hospitalSearch.unit') : t('hospitalSearch.units')}
                            </span>
                          </span>
                          {hasSufficientStock ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{t('hospitalSearch.sufficientStock')}</span>
                            </span>
                          ) : (
                            <span className="text-amber-700 font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              <span>{t('hospitalSearch.partialStock', { have: availableQuantityNum, need: reqQty })}</span>
                            </span>
                          )}
                        </div>

                        <div className="space-y-1.5 text-xs text-gray-600 pt-2 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            <span>{hospitalPhone}</span>
                          </div>

                          <div className="pt-0.5">
                            <LocationLink location={h.location} showAddress={true} className="text-xs" />
                          </div>
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
