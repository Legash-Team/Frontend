import React, { useState, useEffect, type FormEvent } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Button from '../components/ui/Button';
import {
  getBloodStock,
  updateBloodStock,
  verifyHospitalPassword,
} from '../api/hospital-api';
import { ALLOWED_BLOOD_TYPES } from '../types/hospital-types';
import type { BloodStock, BloodType } from '../types/hospital-types';
import {
  Droplets,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Save,
  Lock,
  Unlock,
  Plus,
  Minus,
  KeyRound,
  ShieldAlert,
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
  const [stockLoading, setStockLoading] = useState<boolean>(true);
  const [stockSubmitting, setStockSubmitting] = useState<boolean>(false);
  const [stockSuccessMsg, setStockSuccessMsg] = useState<string | null>(null);
  const [stockErrorMsg, setStockErrorMsg] = useState<string | null>(null);

  // Security Lock & Password Verification State
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState<boolean>(false);
  const [verifyPasswordInput, setVerifyPasswordInput] = useState<string>('');
  const [verifyLoading, setVerifyLoading] = useState<boolean>(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

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

        setStock(extractedStock);
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

  const handleTriggerAction = (action: () => void) => {
    if (!isUnlocked) {
      setPendingAction(() => action);
      setVerifyPasswordInput('');
      setVerifyError(null);
      setPasswordModalOpen(true);
    } else {
      action();
    }
  };

  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyPasswordInput) {
      setVerifyError('Hospital password is required.');
      return;
    }

    setVerifyLoading(true);
    setVerifyError(null);
    try {
      const res = await verifyHospitalPassword(verifyPasswordInput);
      if (res && res.verified !== false) {
        setIsUnlocked(true);
        setPasswordModalOpen(false);
        setVerifyPasswordInput('');
        if (pendingAction) {
          pendingAction();
          setPendingAction(null);
        }
      } else {
        setVerifyError(res?.message || 'Password verification failed.');
      }
    } catch (err: unknown) {
      let message = 'Invalid password. Verification failed.';
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string; error?: string } } };
        message = axiosErr.response?.data?.message || axiosErr.response?.data?.error || message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setVerifyError(message);
    } finally {
      setVerifyLoading(false);
    }
  };

  const incrementStock = (type: BloodType) => {
    setStock((prev) => ({
      ...prev,
      [type]: (prev[type] ?? 0) + 1,
    }));
  };

  const decrementStock = (type: BloodType) => {
    setStock((prev) => ({
      ...prev,
      [type]: Math.max(0, (prev[type] ?? 0) - 1),
    }));
  };

  const handleDirectQuantityChange = (type: BloodType, valStr: string) => {
    if (!isUnlocked) return;
    const num = parseInt(valStr, 10);
    if (isNaN(num) || num < 0) {
      setStock((prev) => ({ ...prev, [type]: 0 }));
    } else {
      setStock((prev) => ({ ...prev, [type]: num }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStockSuccessMsg(null);
    setStockErrorMsg(null);

    if (!isUnlocked) {
      setPasswordModalOpen(true);
      return;
    }

    setStockSubmitting(true);
    try {
      const payload: BloodStock = { ...stock };
      ALLOWED_BLOOD_TYPES.forEach((type) => {
        payload[type] = Math.max(0, payload[type] ?? 0);
      });

      const response = await updateBloodStock(payload);
      const updatedStock = response.bloodStock || payload;
      setStock(updatedStock);
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
              Securely manage blood kit quantities across all 8 standard blood groups for regional emergency dispatch.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {isUnlocked ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-verified/10 text-verified text-xs font-mono font-bold uppercase tracking-wider border border-verified/20">
                <Unlock className="w-3.5 h-3.5" />
                <span>Unlocked (Editing Active)</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setVerifyPasswordInput('');
                  setVerifyError(null);
                  setPasswordModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-crimson/10 hover:bg-crimson/20 text-crimson rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-colors border border-crimson/20"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Unlock to Edit</span>
              </button>
            )}

            <button
              type="button"
              onClick={fetchStock}
              disabled={stockLoading}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-paper hover:bg-paper-dim border border-line-soft text-ink-soft rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${stockLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Security Notice Banner if Locked */}
        {!isUnlocked && (
          <div className="p-4 bg-paper border border-line-soft rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-ink/5 text-ink-soft rounded-xl shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-mono font-bold uppercase text-ink tracking-wider">
                  Read-Only Security Lock
                </p>
                <p className="text-xs font-sans text-ink-soft mt-0.5">
                  Modifications to live blood inventory require password authorization to prevent unauthorized dispatch adjustments.
                </p>
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              variant="primary"
              onClick={() => {
                setVerifyPasswordInput('');
                setVerifyError(null);
                setPasswordModalOpen(true);
              }}
              className="text-xs shrink-0 px-4"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Authorize Changes</span>
            </Button>
          </div>
        )}

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
                    {isLow ? 'Low Stock' : 'Adequate'}
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

        {/* Interactive Stock Table & Editor */}
        <section className="bg-white rounded-2xl border border-line-soft shadow-xs overflow-hidden">
          <div className="bg-gradient-to-r from-crimson to-crimson-dark px-6 py-4 text-white flex items-center justify-between">
            <h2 className="text-base font-serif font-bold flex items-center gap-2">
              <Droplets className="w-5 h-5 stroke-[1.75]" />
              <span>Blood Group Stock Editor</span>
            </h2>
            <span className="text-[11px] font-mono text-red-100 font-medium uppercase tracking-wider">
              {isUnlocked ? 'Unlocked • Edit Enabled' : 'Protected • Read-Only'}
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

                {/* 8 Blood Types with - / + Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {ALLOWED_BLOOD_TYPES.map((type) => {
                    const quantity = stock[type] ?? 0;
                    return (
                      <div
                        key={type}
                        className="p-4 bg-paper/60 border border-line-soft rounded-2xl space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-mono font-bold text-ink bg-white px-3 py-1 rounded-lg border border-line-soft shadow-xs">
                            {type}
                          </span>
                          <span className="text-[11px] font-mono font-medium text-ink-soft">
                            {quantity === 0 ? 'Out of stock' : `${quantity} in stock`}
                          </span>
                        </div>

                        {/* Increment / Decrement & Input Control */}
                        <div className="flex items-center justify-between bg-white border border-line-soft rounded-xl p-1.5 shadow-xs">
                          <button
                            type="button"
                            onClick={() => handleTriggerAction(() => decrementStock(type))}
                            disabled={isUnlocked && quantity <= 0}
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
                            onClick={() => {
                              if (!isUnlocked) {
                                handleTriggerAction(() => {});
                              }
                            }}
                            readOnly={!isUnlocked}
                            className={`w-16 text-center font-mono font-bold text-base bg-transparent outline-none ${
                              !isUnlocked ? 'cursor-pointer text-ink' : 'text-crimson'
                            }`}
                          />

                          <button
                            type="button"
                            onClick={() => handleTriggerAction(() => incrementStock(type))}
                            title="Increase quantity"
                            className="w-9 h-9 flex items-center justify-center rounded-lg bg-crimson hover:bg-crimson-dark text-white transition-colors"
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
                    <Info className="w-4 h-4 text-ink-soft/60 shrink-0 stroke-[1.75]" />
                    <span>Quantities cannot be negative ($\ge 0$). Adjustments are saved to the central registry.</span>
                  </div>

                  <Button
                    type="submit"
                    isLoading={stockSubmitting}
                    loadingText="Saving Inventory..."
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

      {/* Password Verification Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-line-soft rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-crimson pb-3 border-b border-line-soft">
              <div className="p-3 bg-crimson/10 rounded-xl">
                <ShieldAlert className="w-6 h-6 stroke-[1.75]" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-ink">Confirm Authorization</h3>
                <p className="text-xs text-ink-soft font-sans">Enter password to modify blood inventory</p>
              </div>
            </div>

            <p className="text-xs text-ink-soft leading-relaxed">
              Modifying blood stock impacts live regional emergency dispatching. Please authenticate with your hospital credentials.
            </p>

            {verifyError && (
              <div className="p-3 bg-crimson/10 border border-crimson/20 text-crimson rounded-xl text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{verifyError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold text-ink-soft uppercase tracking-wider">
                  Hospital Password <span className="text-crimson">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft/40 w-4 h-4" />
                  <input
                    type="password"
                    required
                    autoFocus
                    value={verifyPasswordInput}
                    onChange={(e) => setVerifyPasswordInput(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full h-11 pl-10 pr-4 bg-paper border border-line-soft rounded-xl text-sm outline-none focus:border-crimson"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setPasswordModalOpen(false);
                    setPendingAction(null);
                  }}
                  disabled={verifyLoading}
                  className="px-4 py-2 border border-line-soft text-ink-soft rounded-xl text-xs font-semibold hover:bg-paper"
                >
                  Cancel
                </button>

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={verifyLoading}
                  loadingText="Verifying..."
                  className="px-5 text-xs"
                >
                  Unlock & Proceed
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default BloodStockPage;

