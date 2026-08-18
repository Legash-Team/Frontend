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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-line-soft">
          <div>
            <h1 className="text-2xl font-serif font-bold text-ink tracking-tight flex items-center gap-2.5">
              <Droplets className="w-6 h-6 text-crimson stroke-[1.75]" />
              <span>Blood Stock Inventory</span>
            </h1>
            <p className="text-sm font-sans text-ink-soft mt-1">
              Manage live blood units across all 8 standard blood groups for emergency dispatching.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchStock}
            disabled={stockLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-paper hover:bg-paper-dim border border-line-soft text-ink-soft rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-colors"
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
                    ? 'bg-crimson/5 border-crimson/20 shadow-xs'
                    : 'bg-white border-line-soft shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-ink bg-paper px-2.5 py-0.5 rounded-md border border-line-soft">
                    {type}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isLow ? 'bg-crimson/10 text-crimson' : 'bg-verified/10 text-verified'
                    }`}
                  >
                    {isLow ? 'Low Stock' : 'Available'}
                  </span>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-2xl font-serif font-bold text-ink tracking-tight">
                    {quantity}
                  </span>
                  <span className="text-xs font-mono text-ink-soft font-medium">units</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Update Form Section */}
        <section className="bg-white rounded-2xl border border-line-soft shadow-xs overflow-hidden">
          <div className="bg-gradient-to-r from-crimson to-crimson-dark px-6 py-4 text-white flex items-center justify-between">
            <h2 className="text-base font-serif font-bold flex items-center gap-2">
              <Droplets className="w-5 h-5 stroke-[1.75]" />
              <span>Update Blood Stock Quantities</span>
            </h2>
            <span className="text-[11px] font-mono text-red-100 font-medium uppercase tracking-wider">
              Enter non-negative integers
            </span>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {stockLoading ? (
              <div className="py-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-crimson border-t-transparent"></div>
                <p className="mt-3 text-sm font-sans text-ink-soft font-medium">Loading inventory data...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {stockSuccessMsg && (
                  <div className="p-4 bg-verified/10 border border-verified/20 text-verified rounded-xl text-sm font-medium flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-verified shrink-0 stroke-[1.75]" />
                    <span className="font-sans">{stockSuccessMsg}</span>
                  </div>
                )}

                {stockErrorMsg && (
                  <div className="p-4 bg-crimson/10 border border-crimson/20 text-crimson rounded-xl text-sm font-medium flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-crimson shrink-0 stroke-[1.75]" />
                    <span className="font-sans">{stockErrorMsg}</span>
                  </div>
                )}

                {/* 8 Blood Type Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {ALLOWED_BLOOD_TYPES.map((type) => (
                    <div
                      key={type}
                      className="p-4 bg-paper/60 border border-line-soft rounded-xl space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-mono font-bold text-ink bg-white px-2.5 py-0.5 rounded border border-line-soft">
                          {type}
                        </span>
                        <span className="text-xs font-mono text-ink-soft font-medium">
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

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-line-soft">
                  <div className="flex items-center gap-2 text-xs font-sans text-ink-soft">
                    <Info className="w-4 h-4 text-ink-soft/60 shrink-0 stroke-[1.75]" />
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
