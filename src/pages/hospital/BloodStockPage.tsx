import React, { useState, useEffect, type FormEvent } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import Button from '@/components/ui/Button';
import {
  getBloodStock,
  updateBloodStock,
} from '@/features/hospital/api/hospital-api';
import { ALLOWED_BLOOD_TYPES } from '@/features/hospital/types/hospital-types';
import type { BloodStock, BloodType } from '@/features/hospital/types/hospital-types';
import {
  Droplets,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Save,
  Plus,
  Minus,
  Info,
  RotateCcw,
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

  const [savedStock, setSavedStock] = useState<BloodStock>(INITIAL_STOCK);
  const [draftStock, setDraftStock] = useState<BloodStock>(INITIAL_STOCK);
  const [stockLoading, setStockLoading] = useState<boolean>(true);
  const [stockSubmitting, setStockSubmitting] = useState<boolean>(false);
  const [stockSuccessMsg, setStockSuccessMsg] = useState<string | null>(null);
  const [stockErrorMsg, setStockErrorMsg] = useState<string | null>(null);

  const hasUnsavedChanges = ALLOWED_BLOOD_TYPES.some(
    (type) => (draftStock[type] ?? 0) !== (savedStock[type] ?? 0)
  );

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
          extractedStock[type] = typeof stockMap[type] === 'number' ? stockMap[type] : 0;
        });

        setSavedStock(extractedStock);
        setDraftStock(extractedStock);
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

  const incrementDraft = (type: BloodType) => {
    setDraftStock((prev) => ({
      ...prev,
      [type]: (prev[type] ?? 0) + 1,
    }));
  };

  const decrementDraft = (type: BloodType) => {
    setDraftStock((prev) => ({
      ...prev,
      [type]: Math.max(0, (prev[type] ?? 0) - 1),
    }));
  };

  const handleDirectQuantityChange = (type: BloodType, valStr: string) => {
    const num = parseInt(valStr, 10);
    if (isNaN(num) || num < 0) {
      setDraftStock((prev) => ({ ...prev, [type]: 0 }));
    } else {
      setDraftStock((prev) => ({ ...prev, [type]: num }));
    }
  };

  const handleResetChanges = () => {
    setDraftStock({ ...savedStock });
    setStockSuccessMsg(null);
    setStockErrorMsg(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStockSuccessMsg(null);
    setStockErrorMsg(null);
    setStockSubmitting(true);

    try {
      const payload: BloodStock = { ...draftStock };
      ALLOWED_BLOOD_TYPES.forEach((type) => {
        payload[type] = Math.max(0, payload[type] ?? 0);
      });

      const response = await updateBloodStock(payload);
      const updatedStock = response.bloodStock || payload;
      setSavedStock(updatedStock);
      setDraftStock(updatedStock);
      setStockSuccessMsg(response.message || 'Blood stock inventory updated successfully across all blood groups!');
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
              Manage blood kit quantities across all 8 standard blood groups. Overview cards display the current database stock.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={fetchStock}
              disabled={stockLoading || stockSubmitting}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-paper hover:bg-paper-dim border border-line-soft text-ink-soft rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${stockLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Inventory Summary Overview Cards (Current Database Stock) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-ink-soft">
              Current Registered Database Stock
            </span>
            {hasUnsavedChanges && (
              <span className="text-xs font-mono font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md animate-pulse">
                Unsaved edits staged below
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {ALLOWED_BLOOD_TYPES.map((type) => {
              const currentUnits = savedStock[type] ?? 0;
              const draftUnits = draftStock[type] ?? 0;
              const isLow = currentUnits < 5;
              const isDirty = draftUnits !== currentUnits;

              return (
                <div
                  key={type}
                  className={`p-4 rounded-2xl border transition-all relative ${
                    isDirty
                      ? 'bg-amber-50/40 border-amber-200 shadow-xs'
                      : isLow
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
                      {isLow ? 'Low Stock' : 'Adequate'}
                    </span>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-2xl font-serif font-bold text-ink tracking-tight">
                      {currentUnits}
                    </span>
                    <span className="text-xs font-mono text-ink-soft font-medium">units</span>
                  </div>

                  {isDirty && (
                    <div className="mt-2 pt-2 border-t border-dashed border-amber-200 flex items-center justify-between text-[11px] font-mono text-amber-700">
                      <span>Staged:</span>
                      <span className="font-bold">
                        {draftUnits} ({draftUnits > currentUnits ? `+${draftUnits - currentUnits}` : draftUnits - currentUnits})
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Stock Table & Editor */}
        <section className="bg-white rounded-2xl border border-line-soft shadow-xs overflow-hidden">
          <div className="bg-gradient-to-r from-crimson to-crimson-dark px-6 py-4 text-white flex items-center justify-between">
            <h2 className="text-base font-serif font-bold flex items-center gap-2">
              <Droplets className="w-5 h-5 stroke-[1.75]" />
              <span>Blood Group Stock Editor</span>
            </h2>
            <div className="flex items-center gap-2">
              {hasUnsavedChanges ? (
                <span className="text-[11px] font-mono bg-white/20 text-white px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider border border-white/30">
                  Unsaved Changes
                </span>
              ) : (
                <span className="text-[11px] font-mono text-red-100 font-medium uppercase tracking-wider">
                  Synced with Database
                </span>
              )}
            </div>
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

                {/* 8 Blood Types with Direct - / + Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {ALLOWED_BLOOD_TYPES.map((type) => {
                    const quantity = draftStock[type] ?? 0;
                    const savedQuantity = savedStock[type] ?? 0;
                    const isModified = quantity !== savedQuantity;

                    return (
                      <div
                        key={type}
                        className={`p-4 border rounded-2xl space-y-3 transition-colors ${
                          isModified ? 'bg-amber-50/50 border-amber-300' : 'bg-paper/60 border-line-soft'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-mono font-bold text-ink bg-white px-3 py-1 rounded-lg border border-line-soft shadow-xs">
                            {type}
                          </span>
                          <span className="text-[11px] font-mono font-medium text-ink-soft">
                            {quantity === 0 ? 'Out of stock' : `${quantity} units`}
                          </span>
                        </div>

                        {/* Direct Increment / Decrement & Input Control */}
                        <div className="flex items-center justify-between bg-white border border-line-soft rounded-xl p-1.5 shadow-xs">
                          <button
                            type="button"
                            onClick={() => decrementDraft(type)}
                            disabled={quantity <= 0 || stockSubmitting}
                            title="Decrease quantity"
                            className="w-9 h-9 flex items-center justify-center rounded-lg bg-paper hover:bg-paper-dim disabled:opacity-40 disabled:cursor-not-allowed text-ink transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>

                          <input
                            type="number"
                            min="0"
                            value={quantity}
                            onChange={(e) => handleDirectQuantityChange(type, e.target.value)}
                            disabled={stockSubmitting}
                            className="w-16 text-center font-mono font-bold text-base bg-transparent outline-none text-crimson disabled:opacity-50"
                          />

                          <button
                            type="button"
                            onClick={() => incrementDraft(type)}
                            disabled={stockSubmitting}
                            title="Increase quantity"
                            className="w-9 h-9 flex items-center justify-center rounded-lg bg-crimson hover:bg-crimson-dark text-white transition-colors disabled:opacity-50"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-line-soft">
                  <div className="flex items-center gap-2 text-xs font-sans text-ink-soft">
                    <Info className="w-4 h-4 text-crimson shrink-0 stroke-[1.75]" />
                    <span>Edits are staged locally. Click &apos;Save Stock Inventory&apos; to commit all 8 blood types to the database.</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {hasUnsavedChanges && (
                      <button
                        type="button"
                        onClick={handleResetChanges}
                        disabled={stockSubmitting}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-paper hover:bg-paper-dim border border-line-soft text-ink-soft rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Changes</span>
                      </button>
                    )}

                    <Button
                      type="submit"
                      isLoading={stockSubmitting}
                      loadingText="Saving All Blood Stock..."
                      className="px-6 gap-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Stock Inventory</span>
                    </Button>
                  </div>
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
