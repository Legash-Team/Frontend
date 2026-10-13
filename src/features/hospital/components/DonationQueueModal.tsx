import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Droplet,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  HeartHandshake,
  Loader2,
} from 'lucide-react';
import type {
  PendingDonationRecord,
  BloodType,
  SubmitDonationRecordPayload,
} from '@/features/hospital/types/hospital-types';
import { ALLOWED_BLOOD_TYPES } from '@/features/hospital/types/hospital-types';
import {
  getPendingDonationRecords,
  submitDonationRecord,
} from '@/features/hospital/api/hospital-api';

interface DonationQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQueueUpdated: () => void;
}

interface DonationFormState {
  donorBloodType: BloodType | '';
  donatedToBloodType: BloodType | '';
  height: string;
  weight: string;
  healthStatus: string;
  peopleSaved: string;
  thankYouMessage: string;
}

const initialFormState: DonationFormState = {
  donorBloodType: '',
  donatedToBloodType: '',
  height: '',
  weight: '',
  healthStatus: '',
  peopleSaved: '',
  thankYouMessage: '',
};

export const DonationQueueModal: React.FC<DonationQueueModalProps> = ({
  isOpen,
  onClose,
  onQueueUpdated,
}) => {
  const [records, setRecords] = useState<PendingDonationRecord[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form expansion state for "Donor donated" path
  const [isFormExpanded, setIsFormExpanded] = useState<boolean>(false);
  const [formState, setFormState] = useState<DonationFormState>(initialFormState);
  const [formValidationErrors, setFormValidationErrors] = useState<{
    donorBloodType?: string;
    donatedToBloodType?: string;
  }>({});

  // Finished state
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Fetch pending records queue when modal opens
  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal is closed
      setRecords([]);
      setCurrentIndex(0);
      setIsFormExpanded(false);
      setFormState(initialFormState);
      setFetchError(null);
      setSubmitError(null);
      setIsFinished(false);
      return;
    }

    const loadQueue = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const data = await getPendingDonationRecords();
        setRecords(data);
        setCurrentIndex(0);
        setIsFormExpanded(false);
        setFormState(initialFormState);
        if (!data || data.length === 0) {
          setIsFinished(true);
        }
      } catch (err: any) {
        setFetchError(
          typeof err === 'string' ? err : err?.message || 'Failed to load pending queue.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadQueue();
  }, [isOpen]);

  const currentDonor: PendingDonationRecord | undefined = records[currentIndex];

  // When currentDonor changes, pre-fill intelligent defaults if available
  useEffect(() => {
    if (!currentDonor) return;

    const defaultDonorBlood =
      (currentDonor.donor?.bloodType as BloodType) ||
      (currentDonor.donorBloodType as BloodType) ||
      '';
    const defaultDonatedToBlood =
      (currentDonor.request?.bloodType as BloodType) ||
      (currentDonor.requestBloodType as BloodType) ||
      '';

    setFormState({
      donorBloodType: ALLOWED_BLOOD_TYPES.includes(defaultDonorBlood as BloodType)
        ? (defaultDonorBlood as BloodType)
        : '',
      donatedToBloodType: ALLOWED_BLOOD_TYPES.includes(defaultDonatedToBlood as BloodType)
        ? (defaultDonatedToBlood as BloodType)
        : '',
      height: '',
      weight: '',
      healthStatus: '',
      peopleSaved: '3',
      thankYouMessage: 'Thank you for your life-saving blood donation!',
    });
    setIsFormExpanded(false);
    setFormValidationErrors({});
    setSubmitError(null);
  }, [currentDonor]);

  if (!isOpen) return null;

  // Donor identifier helpers
  const donorName =
    currentDonor?.donorName ||
    currentDonor?.name ||
    currentDonor?.donor?.name ||
    'Anonymous Donor';

  const shortId =
    currentDonor?.shortId ||
    currentDonor?.donorShortId ||
    currentDonor?.donor?.shortId ||
    (currentDonor?.donorId ? currentDonor.donorId.slice(-6).toUpperCase() : null) ||
    (currentDonor?.id ? currentDonor.id.slice(-6).toUpperCase() : 'N/A');

  const requestTitle =
    currentDonor?.request?.description ||
    currentDonor?.requestDescription ||
    (currentDonor?.request?.bloodType
      ? `${currentDonor.request.bloodType} Blood Request`
      : null) ||
    (currentDonor?.requestId
      ? `Blood Request #${currentDonor.requestId.slice(-6)}`
      : 'Blood Donation Request');

  const requestUrgency =
    currentDonor?.request?.isEmergency ||
    currentDonor?.request?.requestType === 'Emergency'
      ? 'Emergency'
      : 'Standard';

  const acceptedDate = currentDonor?.acceptedAt
    ? new Date(currentDonor.acceptedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  // Advance to next donor or complete queue
  const advanceQueue = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < records.length) {
      setCurrentIndex(nextIndex);
    } else {
      // Completed all items in the queue
      setIsFinished(true);
      onQueueUpdated();
      setTimeout(() => {
        onClose();
      }, 1400);
    }
  };

  // Path 1: "Donor donated" submission
  const handleSubmitDonated = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDonor) return;

    // Validate required fields: donor blood type and donated-to blood type
    const errors: { donorBloodType?: string; donatedToBloodType?: string } = {};
    if (!formState.donorBloodType) {
      errors.donorBloodType = 'Donor blood type is required.';
    }
    if (!formState.donatedToBloodType) {
      errors.donatedToBloodType = 'Donated-to blood type is required.';
    }

    if (Object.keys(errors).length > 0) {
      setFormValidationErrors(errors);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const payload: SubmitDonationRecordPayload = {
      recordId: currentDonor.id,
      acceptanceId: currentDonor.acceptanceId || currentDonor.id,
      donorId: currentDonor.donorId || currentDonor.donor?.id,
      requestId: currentDonor.requestId || currentDonor.request?.id,
      outcome: 'donated',
      donorBloodType: formState.donorBloodType as BloodType,
      donatedToBloodType: formState.donatedToBloodType as BloodType,
      height: formState.height.trim() || undefined,
      weight: formState.weight.trim() || undefined,
      healthStatus: formState.healthStatus.trim() || undefined,
      peopleSaved: formState.peopleSaved.trim() || undefined,
      thankYouMessage: formState.thankYouMessage.trim() || undefined,
    };

    try {
      await submitDonationRecord(payload);
      advanceQueue();
    } catch (err: any) {
      setSubmitError(
        typeof err === 'string' ? err : err?.message || 'Failed to confirm donation record.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Path 2: "User didn't donate" one-click submission
  const handleUserDidNotDonate = async () => {
    if (!currentDonor) return;

    setSubmitting(true);
    setSubmitError(null);

    const payload: SubmitDonationRecordPayload = {
      recordId: currentDonor.id,
      acceptanceId: currentDonor.acceptanceId || currentDonor.id,
      donorId: currentDonor.donorId || currentDonor.donor?.id,
      requestId: currentDonor.requestId || currentDonor.request?.id,
      outcome: 'did_not_donate',
    };

    try {
      await submitDonationRecord(payload);
      advanceQueue();
    } catch (err: any) {
      setSubmitError(
        typeof err === 'string' ? err : err?.message || 'Failed to update record.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    // Notify parent to recheck count even if user closed early
    onQueueUpdated();
    onClose();
  };

  return (
    <div
      id="donation-queue-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-ink/70 backdrop-blur-sm transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="donation-queue-modal-title"
    >
      <div
        id="donation-queue-modal-container"
        className="relative w-full max-w-2xl bg-white rounded-3xl border border-line-soft shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-line-soft bg-paper flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-crimson/10 border border-crimson/20 flex items-center justify-center text-crimson">
              <HeartHandshake className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h2
                id="donation-queue-modal-title"
                className="text-base sm:text-lg font-serif font-bold text-ink leading-tight"
              >
                Pending Donation Queue
              </h2>
              <p className="text-[11px] sm:text-xs font-mono text-ink-soft">
                Sequential Review (1-at-a-time, oldest first)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!loading && records.length > 0 && !isFinished && (
              <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full bg-crimson/10 text-crimson text-xs font-mono font-bold">
                Donor {currentIndex + 1} of {records.length}
              </span>
            )}
            <button
              id="close-donation-queue-btn"
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="w-8 h-8 rounded-full hover:bg-paper-dim flex items-center justify-center text-ink-soft hover:text-ink transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 stroke-[1.75]" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {!loading && records.length > 0 && !isFinished && (
          <div className="w-full bg-line-soft h-1.5 overflow-hidden">
            <div
              className="bg-crimson h-full transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / records.length) * 100}%`,
              }}
            />
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Loading state */}
          {loading && (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 text-crimson animate-spin" />
              <p className="text-sm font-sans font-medium text-ink-soft">
                Loading pending donation queue...
              </p>
            </div>
          )}

          {/* Error loading */}
          {fetchError && !loading && (
            <div className="p-4 rounded-2xl bg-red-50 border border-crimson/20 text-crimson flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm font-sans">
                <p className="font-bold">Failed to load pending queue</p>
                <p className="mt-0.5 text-crimson/80">{fetchError}</p>
              </div>
            </div>
          )}

          {/* Finished or Empty State */}
          {!loading && isFinished && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-9 h-9 stroke-[2]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-serif font-bold text-ink">
                  Queue Fully Processed!
                </h3>
                <p className="text-xs sm:text-sm font-sans text-ink-soft max-w-sm">
                  All pending donation records for your hospital have been reviewed and updated.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="mt-2 px-5 py-2.5 bg-paper-dim hover:bg-line-soft text-ink font-sans font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          )}

          {/* Active Queue Item View (One donor at a time) */}
          {!loading && !isFinished && currentDonor && (
            <div className="space-y-5">
              {/* Submission Error Banner */}
              {submitError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-crimson/20 text-crimson text-xs font-sans flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Donor Card */}
              <div className="p-5 rounded-2xl border border-line-soft bg-paper/60 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line-soft pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-white border border-line-soft shadow-xs flex items-center justify-center text-ink font-serif font-bold text-lg">
                      <User className="w-5 h-5 text-ink-soft stroke-[2]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base sm:text-lg font-serif font-bold text-ink">
                          {donorName}
                        </h4>
                        <span className="px-2 py-0.5 rounded-md bg-white border border-line-soft text-ink font-mono font-bold text-xs tracking-wide">
                          ID: {shortId}
                        </span>
                      </div>
                      <p className="text-xs font-sans text-ink-soft mt-0.5">
                        Donor Queue Item #{currentIndex + 1}
                      </p>
                    </div>
                  </div>

                  {acceptedDate && (
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-ink-soft">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Accepted: {acceptedDate}</span>
                    </div>
                  )}
                </div>

                {/* Accepted Request Details */}
                <div className="rounded-xl bg-white p-3.5 border border-line-soft space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-ink-soft text-[11px] uppercase tracking-wider font-semibold">
                      Accepted Request:
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-mono font-bold text-[10px] uppercase tracking-wider ${
                        requestUrgency === 'Emergency'
                          ? 'bg-crimson/10 text-crimson border border-crimson/20'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {requestUrgency}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-sans font-semibold text-ink">
                    {requestTitle}
                  </p>

                  {currentDonor.request?.bloodType && (
                    <div className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-soft pt-1">
                      <Droplet className="w-3.5 h-3.5 text-crimson fill-crimson" />
                      <span>
                        Target Blood Group:{' '}
                        <strong className="text-ink">{currentDonor.request.bloodType}</strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons: The Two Paths */}
              {!isFormExpanded ? (
                <div className="space-y-3 pt-2">
                  <p className="text-xs font-mono uppercase tracking-wider text-ink-soft font-semibold">
                    Select Outcome:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Path 1 Button: Expands Form */}
                    <button
                      id="donor-donated-btn"
                      type="button"
                      disabled={submitting}
                      onClick={() => setIsFormExpanded(true)}
                      className="flex items-center justify-between p-4 rounded-2xl bg-crimson text-white hover:bg-crimson-dark active:scale-[0.99] font-sans transition-all shadow-sm group cursor-pointer disabled:opacity-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
                          <CheckCircle2 className="w-5 h-5 stroke-[2]" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-bold">Donor Donated</div>
                          <div className="text-[11px] text-red-100 font-sans">
                            Fill record details
                          </div>
                        </div>
                      </div>
                      <ChevronDown className="w-5 h-5 text-white/80 group-hover:translate-y-0.5 transition-transform" />
                    </button>

                    {/* Path 2 Button: One-click "User didn't donate" */}
                    <button
                      id="user-did-not-donate-btn"
                      type="button"
                      disabled={submitting}
                      onClick={handleUserDidNotDonate}
                      className="flex items-center justify-between p-4 rounded-2xl bg-paper hover:bg-paper-dim border border-line text-ink active:scale-[0.99] font-sans transition-all shadow-xs group cursor-pointer disabled:opacity-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-100/60 text-crimson flex items-center justify-center">
                          {submitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <XCircle className="w-5 h-5 stroke-[2]" />
                          )}
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-bold text-ink">
                            User Didn't Donate
                          </div>
                          <div className="text-[11px] text-ink-soft font-sans">
                            One-click resolution
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-ink-soft uppercase tracking-wider">
                        Quick Mark &rarr;
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Expanded Donation Form */
                <form
                  id="donation-details-form"
                  onSubmit={handleSubmitDonated}
                  className="rounded-2xl border-2 border-crimson/20 bg-red-50/20 p-5 space-y-4 animate-in fade-in duration-200"
                >
                  <div className="flex items-center justify-between border-b border-line-soft pb-3">
                    <div className="flex items-center gap-2">
                      <Droplet className="w-4 h-4 text-crimson fill-crimson" />
                      <h5 className="text-sm font-serif font-bold text-ink">
                        Record Donation Specifics
                      </h5>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsFormExpanded(false)}
                      className="text-xs font-mono text-ink-soft hover:text-ink flex items-center gap-1 cursor-pointer"
                    >
                      <span>Collapse</span>
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Required Dropdowns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Donor Blood Type (Required) */}
                    <div>
                      <label
                        htmlFor="donorBloodType"
                        className="block text-xs font-sans font-bold text-ink mb-1"
                      >
                        Donor Blood Type <span className="text-crimson">*</span>
                      </label>
                      <select
                        id="input-donor-blood-type"
                        value={formState.donorBloodType}
                        onChange={(e) => {
                          setFormState((prev) => ({
                            ...prev,
                            donorBloodType: e.target.value as BloodType,
                          }));
                          if (formValidationErrors.donorBloodType) {
                            setFormValidationErrors((prev) => ({
                              ...prev,
                              donorBloodType: undefined,
                            }));
                          }
                        }}
                        className={`w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border bg-white focus:outline-hidden focus:ring-2 focus:ring-crimson/30 transition-all ${
                          formValidationErrors.donorBloodType
                            ? 'border-crimson bg-red-50/30'
                            : 'border-line-soft hover:border-line'
                        }`}
                      >
                        <option value="">-- Select Blood Type --</option>
                        {ALLOWED_BLOOD_TYPES.map((bt) => (
                          <option key={bt} value={bt}>
                            {bt}
                          </option>
                        ))}
                      </select>
                      {formValidationErrors.donorBloodType && (
                        <p className="text-[11px] font-sans text-crimson mt-1">
                          {formValidationErrors.donorBloodType}
                        </p>
                      )}
                    </div>

                    {/* Donated-To Blood Type (Required) */}
                    <div>
                      <label
                        htmlFor="donatedToBloodType"
                        className="block text-xs font-sans font-bold text-ink mb-1"
                      >
                        Donated-To Blood Type <span className="text-crimson">*</span>
                      </label>
                      <select
                        id="input-donated-to-blood-type"
                        value={formState.donatedToBloodType}
                        onChange={(e) => {
                          setFormState((prev) => ({
                            ...prev,
                            donatedToBloodType: e.target.value as BloodType,
                          }));
                          if (formValidationErrors.donatedToBloodType) {
                            setFormValidationErrors((prev) => ({
                              ...prev,
                              donatedToBloodType: undefined,
                            }));
                          }
                        }}
                        className={`w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border bg-white focus:outline-hidden focus:ring-2 focus:ring-crimson/30 transition-all ${
                          formValidationErrors.donatedToBloodType
                            ? 'border-crimson bg-red-50/30'
                            : 'border-line-soft hover:border-line'
                        }`}
                      >
                        <option value="">-- Select Blood Type --</option>
                        {ALLOWED_BLOOD_TYPES.map((bt) => (
                          <option key={bt} value={bt}>
                            {bt}
                          </option>
                        ))}
                      </select>
                      {formValidationErrors.donatedToBloodType && (
                        <p className="text-[11px] font-sans text-crimson mt-1">
                          {formValidationErrors.donatedToBloodType}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Optional Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Height */}
                    <div>
                      <label
                        htmlFor="input-height"
                        className="block text-xs font-sans font-medium text-ink-soft mb-1"
                      >
                        Height <span className="text-ink-soft/40">(Optional)</span>
                      </label>
                      <input
                        id="input-height"
                        type="text"
                        placeholder="e.g. 175 cm"
                        value={formState.height}
                        onChange={(e) =>
                          setFormState((prev) => ({ ...prev, height: e.target.value }))
                        }
                        className="w-full px-3 py-2 text-xs font-sans rounded-xl border border-line-soft bg-white hover:border-line focus:outline-hidden focus:ring-2 focus:ring-crimson/30 transition-all"
                      />
                    </div>

                    {/* Weight */}
                    <div>
                      <label
                        htmlFor="input-weight"
                        className="block text-xs font-sans font-medium text-ink-soft mb-1"
                      >
                        Weight <span className="text-ink-soft/40">(Optional)</span>
                      </label>
                      <input
                        id="input-weight"
                        type="text"
                        placeholder="e.g. 70 kg"
                        value={formState.weight}
                        onChange={(e) =>
                          setFormState((prev) => ({ ...prev, weight: e.target.value }))
                        }
                        className="w-full px-3 py-2 text-xs font-sans rounded-xl border border-line-soft bg-white hover:border-line focus:outline-hidden focus:ring-2 focus:ring-crimson/30 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Health Status */}
                    <div>
                      <label
                        htmlFor="input-health-status"
                        className="block text-xs font-sans font-medium text-ink-soft mb-1"
                      >
                        Health Status <span className="text-ink-soft/40">(Optional)</span>
                      </label>
                      <input
                        id="input-health-status"
                        type="text"
                        placeholder="e.g. Cleared, Normal vitals"
                        value={formState.healthStatus}
                        onChange={(e) =>
                          setFormState((prev) => ({
                            ...prev,
                            healthStatus: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 text-xs font-sans rounded-xl border border-line-soft bg-white hover:border-line focus:outline-hidden focus:ring-2 focus:ring-crimson/30 transition-all"
                      />
                    </div>

                    {/* People Saved */}
                    <div>
                      <label
                        htmlFor="input-people-saved"
                        className="block text-xs font-sans font-medium text-ink-soft mb-1"
                      >
                        People Saved <span className="text-ink-soft/40">(Optional)</span>
                      </label>
                      <input
                        id="input-people-saved"
                        type="text"
                        placeholder="e.g. 3"
                        value={formState.peopleSaved}
                        onChange={(e) =>
                          setFormState((prev) => ({
                            ...prev,
                            peopleSaved: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 text-xs font-sans rounded-xl border border-line-soft bg-white hover:border-line focus:outline-hidden focus:ring-2 focus:ring-crimson/30 transition-all"
                      />
                    </div>
                  </div>

                  {/* Thank-You Message */}
                  <div>
                    <label
                      htmlFor="input-thank-you-message"
                      className="block text-xs font-sans font-medium text-ink-soft mb-1"
                    >
                      Thank-You Message <span className="text-ink-soft/40">(Optional)</span>
                    </label>
                    <textarea
                      id="input-thank-you-message"
                      rows={2}
                      placeholder="e.g. Thank you for your generous gift of life today!"
                      value={formState.thankYouMessage}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          thankYouMessage: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 text-xs font-sans rounded-xl border border-line-soft bg-white hover:border-line focus:outline-hidden focus:ring-2 focus:ring-crimson/30 transition-all"
                    />
                  </div>

                  {/* Form Submission Actions */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsFormExpanded(false)}
                      disabled={submitting}
                      className="px-4 py-2 text-xs font-sans font-semibold text-ink-soft hover:text-ink cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      id="submit-donation-form-btn"
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-crimson hover:bg-crimson-dark active:scale-[0.98] text-white rounded-xl text-xs font-sans font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 stroke-[2]" />
                          <span>Confirm & Advance &rarr;</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {!loading && !isFinished && records.length > 0 && (
          <div className="px-6 py-3 border-t border-line-soft bg-paper/50 flex items-center justify-between text-[11px] font-mono text-ink-soft">
            <span>
              Queue Order: Oldest acceptance first ({currentIndex + 1}/{records.length})
            </span>
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="text-ink hover:underline cursor-pointer"
            >
              Close & Resume Later
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationQueueModal;
