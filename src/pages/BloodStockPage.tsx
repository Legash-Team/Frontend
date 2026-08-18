import React, { useState, useEffect, type FormEvent } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { getBloodStock, updateBloodStock } from '../api/hospital-api';
import { ALLOWED_BLOOD_TYPES } from '../types/hospital-types';
import type { BloodStock, BloodType } from '../types/hospital-types';
import {
  Droplets,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Save,
  Info,
} from 'lucide-react';

export const BloodStockPage: React.FC = () => {
  const INITIAL_STOCK: BloodStock = {
    'A+': 0,
    'A-': 0,
    'B+': 0,
    'B-': 0,
    'AB+': 0,
    'AB-': 0,
    'O+': 0,
    'O-': 0,
  };

  const [stock, setStock] = useState<BloodStock>(INITIAL_STOCK);
  const [stockInputs, setStockInputs] = useState<Record<BloodType, string>>({
    'A+': '0',
    'A-': '0',
    'B+': '0',
    'B-': '0',
    'AB+': '0',
    'AB-': '0',
    'O+': '0',
    'O-': '0',
  });

  const [stockLoading, setStockLoading] = useState<boolean>(true);
  const [stockSubmitting, setStockSubmitting] = useState<boolean>(false);
  const [stockErrors, setStockErrors] = useState<Partial<Record<BloodType, string>>>({});
  const [stockSuccessMsg, setStockSuccessMsg] = useState<string | null>(null);
  const [stockErrorMsg, setStockErrorMsg] = useState<string | null>(null);

  const fetchStock = async () => {
    setStockLoading(true);
    setStockErrorMsg(null);
    try {
      const resStock = await getBloodStock();
      if (resStock) {
        const rawStockObj = (resStock as unknown as Record<string, unknown>) || {};
        const stockMap =
          (rawStockObj.bloodStock as Record<string, number>) ||
          (rawStockObj.blood_stock as Record<string, number>) ||
          (rawStockObj.stock as Record<string, number>) ||
          (resStock as Record<string, number>) ||
          {};

        const extractedStock: BloodStock = { ...INITIAL_STOCK };
        ALLOWED_BLOOD_TYPES.forEach((type) => {
          extractedStock[type] = stockMap[type] ?? 0;
        });

        setStock(extractedStock);
        const initialStringInputs: Record<BloodType, string> = {
          ...INITIAL_STOCK,
        } as unknown as Record<BloodType, string>;
        ALLOWED_BLOOD_TYPES.forEach((type) => {
          initialStringInputs[type] = String(extractedStock[type] ?? 0);
        });
        setStockInputs(initialStringInputs);
      }
    } catch (err: unknown) {
      let message = 'Failed to load blood stock inventory.';
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string; error?: string } } };
        message = axiosErr.response?.data?.message || axiosErr.response?.data?.error || message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setStockErrorMsg(message);
    } finally {
      setStockLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const handleInputChange = (type: BloodType, value: string) => {
    setStockInputs((prev) => ({ ...prev, [type]: value }));
    if (stockErrors[type]) {
      setStockErrors((prev) => ({ ...prev, [type]: undefined }));
    }
  };

  const validateStock = (): boolean => {
    const errors: Partial<Record<BloodType, string>> = {};

    ALLOWED_BLOOD_TYPES.forEach((type) => {
      const valStr = stockInputs[type]?.trim();

      if (valStr === '' || valStr === undefined) {
        errors[type] = 'Quantity is required.';
        return;
      }

      if (!/^-?\d+$/.test(valStr)) {
        errors[type] = 'Must be a whole integer.';
        return;
      }

      const num = Number(valStr);
      if (isNaN(num)) {
        errors[type] = 'Must be a valid number.';
      } else if (num < 0) {
        errors[type] = 'Quantity cannot be negative.';
      }
    });

    setStockErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStockSuccessMsg(null);
    setStockErrorMsg(null);

    if (!validateStock()) {
      return;
    }

    setStockSubmitting(true);
    try {
      const payload: BloodStock = { ...INITIAL_STOCK };
      ALLOWED_BLOOD_TYPES.forEach((type) => {
        payload[type] = parseInt(stockInputs[type].trim(), 10);
      });

      const response = await updateBloodStock(payload);

      const updatedStock = response.bloodStock || payload;
      setStock(updatedStock);

      const syncedInputs: Record<BloodType, string> = {
        ...INITIAL_STOCK,
      } as unknown as Record<BloodType, string>;
      ALLOWED_BLOOD_TYPES.forEach((type) => {
        syncedInputs[type] = String(updatedStock[type] ?? 0);
      });
      setStockInputs(syncedInputs);

      setStockSuccessMsg(response.message || 'Blood stock inventory updated successfully!');
    } catch (err: unknown) {
      let message = 'Failed to update blood stock inventory.';
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string; error?: string } } };
        message = axiosErr.response?.data?.message || axiosErr.response?.data?.error || message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setStockErrorMsg(message);
    } finally {
      setStockSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
              <Droplets className="w-7 h-7 text-red-600" />
              <span>Blood Stock Inventory</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage live blood units across all 8 standard blood groups for emergency dispatching.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchStock}
            disabled={stockLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${stockLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Inventory</span>
          </button>
        </div>

        {/* Inventory Summary Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {ALLOWED_BLOOD_TYPES.map((type) => {
            const quantity = stock[type] ?? 0;
            const isLow = quantity < 5;

            return (
              <div
                key={type}
                className={`p-4 rounded-2xl border transition-all ${
                  isLow
                    ? 'bg-red-50/50 border-red-200'
                    : 'bg-white border-gray-200 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-gray-800 bg-gray-100 px-2.5 py-0.5 rounded-md border border-gray-200">
                    {type}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isLow ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {isLow ? 'Low Stock' : 'Available'}
                  </span>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-2xl font-black text-gray-900 tracking-tight">
                    {quantity}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">units</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Update Form Section */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="bg-gradient-to-r from-red-700 to-red-600 px-6 py-4 text-white flex items-center justify-between">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Droplets className="w-5 h-5" />
              <span>Update Blood Stock Quantities</span>
            </h2>
            <span className="text-xs text-red-100 font-medium">
              Enter non-negative whole numbers
            </span>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {stockLoading ? (
              <div className="py-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent"></div>
                <p className="mt-3 text-sm text-gray-600 font-medium">Loading inventory data...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {stockSuccessMsg && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{stockSuccessMsg}</span>
                  </div>
                )}

                {stockErrorMsg && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm font-medium flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                    <span>{stockErrorMsg}</span>
                  </div>
                )}

                {/* 8 Blood Type Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {ALLOWED_BLOOD_TYPES.map((type) => (
                    <div
                      key={type}
                      className="p-4 bg-gray-50/80 border border-gray-200 rounded-xl space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-gray-900 bg-white px-2.5 py-0.5 rounded border border-gray-300">
                          {type}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">
                          Current: {stock[type] ?? 0}
                        </span>
                      </div>

                      <Input
                        type="text"
                        inputMode="numeric"
                        label={`Quantity (${type})`}
                        value={stockInputs[type] ?? '0'}
                        onChange={(e) => handleInputChange(type, e.target.value)}
                        error={stockErrors[type]}
                        placeholder="0"
                        disabled={stockSubmitting}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Info className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>Values must be integers $\ge 0$. Decimals and negative values are rejected.</span>
                  </div>

                  <Button
                    type="submit"
                    isLoading={stockSubmitting}
                    loadingText="Updating Inventory..."
                    className="px-6 gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Stock Inventory</span>
                  </Button>
                </div>
              </form>
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default BloodStockPage;
