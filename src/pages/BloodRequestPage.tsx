import React, { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { createBloodRequest } from '../api/hospital-api';
import { ALLOWED_BLOOD_TYPES } from '../types/hospital-types';
import type { BloodType, RequestType, BloodRequestPayload } from '../types/hospital-types';
import {
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  FileText,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const BloodRequestPage: React.FC = () => {
  const navigate = useNavigate();

  // Form State
  const [selectedBloodType, setSelectedBloodType] = useState<BloodType | ''>('');
  const [quantityKits, setQuantityKits] = useState<string>('1');
  const [requestType, setRequestType] = useState<RequestType>('Normal');
  const [description, setDescription] = useState<string>('');
  const [closingDateTime, setClosingDateTime] = useState<string>('');

  // UI state
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Helper to format min datetime-local to now
  const getCurrentLocalDateTime = (): string => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedBloodType) {
      newErrors.bloodType = 'Please select a blood group.';
    }

    const qty = parseInt(quantityKits.trim(), 10);
    if (!quantityKits.trim() || isNaN(qty) || qty < 1) {
      newErrors.quantity = 'Quantity must be at least 1 blood kit.';
    }

    if (!closingDateTime) {
      newErrors.closingDateTime = 'Please specify when this request should close.';
    } else {
      const chosenDate = new Date(closingDateTime);
      if (chosenDate.getTime() <= Date.now()) {
        newErrors.closingDateTime = 'Closing date & time must be in the future.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const payload: BloodRequestPayload = {
        bloodType: selectedBloodType as BloodType,
        quantity: parseInt(quantityKits.trim(), 10),
        requestType,
        description: description.trim() || undefined,
        notes: description.trim() || undefined,
        closingDateTime,
      };

      const response = await createBloodRequest(payload);

      setSuccessMsg(
        response.message ||
          `Blood request for ${quantityKits} kit(s) of ${selectedBloodType} (${requestType}) created successfully!`
      );

      // Reset form fields for creating subsequent requests
      setSelectedBloodType('');
      setQuantityKits('1');
      setRequestType('Normal');
      setDescription('');
      setClosingDateTime('');
      setErrors({});
    } catch (err: unknown) {
      let message = 'Failed to create blood request. Please try again.';
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string; error?: string } } };
        message = axiosErr.response?.data?.message || axiosErr.response?.data?.error || message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setErrorMsg(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-line-soft">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-ink-soft mb-1">
              <Link to="/hospital/dashboard" className="hover:text-crimson transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-ink">Blood Request</span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-ink tracking-tight flex items-center gap-2.5">
              <PlusCircle className="w-6 h-6 text-crimson stroke-[1.75]" />
              <span>Create Blood Request</span>
            </h1>
            <p className="text-sm font-sans text-ink-soft mt-1">
              Dispatch requests for donor kits to emergency volunteers and affiliated healthcare centers.
            </p>
          </div>

          <Link
            to="/hospital/all-requests"
            className="inline-flex items-center gap-2 px-4 py-2 bg-paper hover:bg-paper-dim border border-line-soft text-ink-soft rounded-xl font-sans font-semibold text-xs transition-colors"
          >
            <span>View All Requests</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Request Form Container */}
        <div className="bg-white rounded-2xl border border-line-soft shadow-xs overflow-hidden">
          <div className="bg-gradient-to-r from-crimson to-crimson-dark px-6 py-4 text-white flex items-center justify-between">
            <h2 className="text-base font-serif font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 stroke-[1.75]" />
              <span>New Clinical Blood Requisition</span>
            </h2>
            <span className="text-[11px] font-mono text-red-100 uppercase tracking-wider">
              Emergency Network Dispatch
            </span>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Feedback Messages */}
            {successMsg && (
              <div className="p-4 bg-verified/10 border border-verified/20 text-verified rounded-xl text-sm font-medium flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-verified shrink-0 mt-0.5" />
                  <div>
                    <p className="font-serif font-bold text-ink">Requisition Submitted</p>
                    <p className="text-xs mt-0.5">{successMsg}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/hospital/all-requests')}
                  className="text-xs font-mono font-bold uppercase tracking-wider text-verified underline shrink-0"
                >
                  View in All Requests &rarr;
                </button>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 bg-crimson/10 border border-crimson/20 text-crimson rounded-xl text-sm font-medium flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-crimson shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Request Type (Emergency vs Normal) */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-ink-soft uppercase tracking-wider block">
                1. Request Priority / Type <span className="text-crimson">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRequestType('Normal')}
                  className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3.5 ${
                    requestType === 'Normal'
                      ? 'bg-paper border-ink ring-2 ring-ink/10 shadow-xs'
                      : 'bg-white border-line-soft hover:bg-paper/50'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      requestType === 'Normal' ? 'bg-ink text-white' : 'bg-paper text-ink-soft'
                    }`}
                  >
                    <Clock className="w-4 h-4 stroke-[1.75]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-serif font-bold text-ink">Normal Requisition</h3>
                    <p className="text-xs text-ink-soft mt-0.5">
                      Standard scheduled patient procedures and non-critical buffer restock.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRequestType('Emergency')}
                  className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3.5 ${
                    requestType === 'Emergency'
                      ? 'bg-crimson/5 border-crimson ring-2 ring-crimson/20 shadow-xs'
                      : 'bg-white border-line-soft hover:bg-crimson/5'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      requestType === 'Emergency'
                        ? 'bg-crimson text-white'
                        : 'bg-crimson/10 text-crimson'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 stroke-[1.75]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-serif font-bold text-crimson flex items-center gap-1.5">
                      <span>Emergency Priority</span>
                      <span className="text-[10px] font-mono uppercase tracking-wider bg-crimson text-white px-1.5 py-0.5 rounded">
                        Urgent
                      </span>
                    </h3>
                    <p className="text-xs text-ink-soft mt-0.5">
                      High priority critical trauma, ICU, surgery, or immediate transfusion need.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Blood Type Selection */}
            <div className="space-y-2.5 pt-2 border-t border-line-soft">
              <label className="text-xs font-mono font-bold text-ink-soft uppercase tracking-wider flex items-center justify-between">
                <span>
                  2. Required Blood Group <span className="text-crimson">*</span>
                </span>
                {errors.bloodType && (
                  <span className="text-xs font-sans text-crimson font-normal">
                    {errors.bloodType}
                  </span>
                )}
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
                        setErrors((prev) => ({ ...prev, bloodType: '' }));
                      }}
                      className={`py-3 px-2 rounded-xl text-sm font-mono font-bold border transition-all ${
                        isSelected
                          ? 'bg-crimson text-white border-crimson shadow-xs ring-2 ring-crimson/20'
                          : 'bg-paper text-ink border-line-soft hover:border-line'
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Number of Kits & Closing Date/Time Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-line-soft">
              {/* Number of Kits */}
              <div>
                <Input
                  label="3. Number of Blood Kits / Units Needed"
                  type="number"
                  min="1"
                  name="quantity"
                  value={quantityKits}
                  onChange={(e) => {
                    setQuantityKits(e.target.value);
                    setErrors((prev) => ({ ...prev, quantity: '' }));
                  }}
                  error={errors.quantity}
                  placeholder="e.g. 2"
                  helperText="Enter integer number of required donor kits"
                  requiredBadge
                  disabled={submitting}
                />
              </div>

              {/* Closing Date / Time */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-crimson" />
                    4. Requisition Closing Date & Time
                    <span className="text-crimson ml-1">*</span>
                  </span>
                </label>
                <input
                  type="datetime-local"
                  required
                  min={getCurrentLocalDateTime()}
                  value={closingDateTime}
                  onChange={(e) => {
                    setClosingDateTime(e.target.value);
                    setErrors((prev) => ({ ...prev, closingDateTime: '' }));
                  }}
                  disabled={submitting}
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm text-gray-900 
                    transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-crimson/20 focus:border-crimson
                    ${
                      errors.closingDateTime
                        ? 'border-crimson bg-crimson/5'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                />
                {errors.closingDateTime ? (
                  <p className="text-xs text-crimson font-medium">{errors.closingDateTime}</p>
                ) : (
                  <p className="text-xs text-gray-500">
                    Hospital defines custom closing deadline (must be in future)
                  </p>
                )}
              </div>
            </div>

            {/* Description / Clinical Notes */}
            <div className="space-y-1.5 pt-2 border-t border-line-soft">
              <label className="text-xs font-mono font-bold text-ink-soft uppercase tracking-wider flex items-center justify-between">
                <span>5. Clinical Notes / Details (Optional)</span>
                <span className="text-[10px] text-ink-soft/60 font-sans">
                  Visible to authorized responders
                </span>
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Scheduled cardiac bypass surgery, patient blood type verified O-negative. Deliver to Floor 3 Emergency Ward."
                disabled={submitting}
                className="w-full p-3.5 bg-paper/60 border border-line-soft rounded-xl text-sm font-sans text-ink outline-none focus:border-crimson resize-none"
              />
            </div>

            {/* Submit Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-line-soft">
              <div className="flex items-center gap-2 text-xs font-sans text-ink-soft">
                <Sparkles className="w-4 h-4 text-crimson shrink-0" />
                <span>Hospitals can create multiple simultaneous blood requests.</span>
              </div>

              <Button
                type="submit"
                isLoading={submitting}
                loadingText="Broadcasting Request..."
                className="px-8 gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Broadcast Blood Request</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BloodRequestPage;
