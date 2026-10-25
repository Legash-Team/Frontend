import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import {
  getPendingDonationQueue,
  recordDonationOutcome,
} from '@/pages/hospital/services/donationQueueService';
import type {
  BloodType,
  DonationOutcomePayload,
  DonationQueueOutcome,
  PendingDonation,
} from '@/features/hospital/types/hospital-types';
import { ALLOWED_BLOOD_TYPES } from '@/features/hospital/types/hospital-types';

interface DonationQueueModalProps {
  open: boolean;
  onClose: () => void;
  onCountRefresh: () => void;
}

const initialForm = () => ({
  donorBloodType: '',
  donatedToBloodType: '',
  height: '',
  weight: '',
  healthStatus: '',
  peopleSaved: '',
  thankYouMessage: '',
});

/**
 * One-at-a-time donation queue modal.
 *
 * Opens with the oldest pending donor first. Each screen shows the donor's
 * name, Short ID, and which request they accepted, with two paths:
 *  - "Donor donated" expands a full form (donor blood type and donated-to
 *    blood type required; height, weight, health status, people saved and
 *    thank-you message optional) and POSTs with outcome: 'donated'.
 *  - "User didn't donate" POSTs with outcome: 'did_not_donate' and nothing
 *    else — one click, no form.
 * After either submission the modal advances to the next pending donor, or
 * closes and refreshes the dashboard pending count when the queue clears.
 */
export const DonationQueueModal: React.FC<DonationQueueModalProps> = ({
  open,
  onClose,
  onCountRefresh,
}) => {
  const { t } = useTranslation();
  const [queue, setQueue] = useState<PendingDonation[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const current = queue[index];

  const loadQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPendingDonationQueue();
      setQueue(data);
      setIndex(0);
      setExpanded(false);
      setForm(initialForm());
      setFormErrors({});
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load donation queue.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) loadQueue();
  }, [open, loadQueue]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.donorBloodType) {
      errors.donorBloodType = t('dashboard.donationQueue.form.required', 'Required');
    }
    if (!form.donatedToBloodType) {
      errors.donatedToBloodType = t(
        'dashboard.donationQueue.form.required',
        'Required'
      );
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitDonated = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitOutcome('donated');
  };

  const submitOutcome = async (outcome: DonationQueueOutcome) => {
    if (!current) return;
    if (outcome === 'donated' && !validateForm()) return;
    setSubmitting(true);
    try {
      const payload: DonationOutcomePayload = {
        outcome,
        bloodRequestId: current.bloodRequestId,
        bloodRequestResponseId: current.bloodRequestResponseId || current.id,
      };
      if (outcome === 'donated') {
        payload.donorBloodType = form.donorBloodType as BloodType;
        payload.donatedToBloodType = form.donatedToBloodType as BloodType;
        if (form.height.trim() !== '') {
          payload.heightCm = Number(form.height);
        }
        if (form.weight.trim() !== '') {
          payload.weightKg = Number(form.weight);
        }
        if (form.healthStatus.trim() !== '') {
          payload.healthStatus = form.healthStatus.trim();
        }
        if (form.peopleSaved.trim() !== '') {
          payload.peopleSaved = Number(form.peopleSaved);
        }
        if (form.thankYouMessage.trim() !== '') {
          payload.thankYouMessage = form.thankYouMessage.trim();
        }
      }
      await recordDonationOutcome(payload);

      if (index + 1 < queue.length) {
        setIndex(index + 1);
        setExpanded(false);
        setForm(initialForm());
        setFormErrors({});
      } else {
        setQueue([]);
        setIndex(0);
        setExpanded(false);
        setForm(initialForm());
        onClose();
        onCountRefresh();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to record donation outcome.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-ink/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white border border-line-soft rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 pb-4 border-b border-line-soft">
          <h3 className="font-serif font-bold text-xl text-ink">
            {t('dashboard.donationQueue.modal.title', 'Confirm Pending Donations')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-ink-soft hover:text-ink rounded-lg hover:bg-paper-dim"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <AlertCircle className="w-8 h-8 text-crimson animate-spin mb-3" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-ink-soft">
                {t('common.loading', 'Loading...')}
              </span>
            </div>
          ) : error ? (
            <div className="p-4 bg-crimson/5 border border-crimson/20 rounded-xl text-crimson text-sm text-center">
              {error}
              <button
                type="button"
                onClick={loadQueue}
                className="mt-3 block mx-auto text-xs font-sans font-bold underline underline-offset-2 hover:text-crimson-dark"
              >
                {t('common.retry', 'Retry')}
              </button>
            </div>
          ) : queue.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-verified/10 text-verified mb-3 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-ink">
                {t('dashboard.donationQueue.noMore', 'Queue Cleared')}
              </h3>
              <p className="text-sm text-ink-soft mt-1">
                {t('dashboard.donationQueue.closed', 'All pending donation confirmations have been recorded.')}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 px-4 py-2 bg-ink text-white text-xs font-sans font-bold rounded-xl hover:bg-ink/90 transition-colors"
              >
                {t('dashboard.donationQueue.close', 'Close')}
              </button>
            </div>
          ) : (
            <>
              {/* Current donor: name, Short ID, accepted request */}
              <div className="flex items-center gap-4 p-4 bg-paper/50 border border-line-soft rounded-xl">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-crimson/10 text-crimson font-serif font-bold text-[11px] uppercase tracking-wider shrink-0">
                  {current.shortId}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-ink-soft">
                    {t('dashboard.donationQueue.modal.donor', 'Donor')}
                  </p>
                  <p className="font-serif font-bold text-ink leading-snug">
                    {current.name}
                  </p>
                  {current.acceptedRequest && (
                    <div className="mt-2">
                      <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-ink-soft">
                        {t('dashboard.donationQueue.modal.request', 'Request')}
                      </p>
                      <p className="text-sm text-ink-soft truncate">
                        {current.acceptedRequest}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {!expanded ? (
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => setExpanded(true)}
                    disabled={submitting}
                    className="px-4 py-3 bg-crimson text-white text-xs font-sans font-bold rounded-xl hover:bg-crimson-dark transition-colors disabled:opacity-60 shadow-xs"
                  >
                    {submitting
                      ? t('dashboard.donationQueue.submitting', 'Submitting...')
                      : t('dashboard.donationQueue.modal.markDonated', 'Donor Donated')}
                  </button>
                  <button
                    type="button"
                    onClick={() => submitOutcome('did_not_donate')}
                    disabled={submitting}
                    className="px-4 py-3 border border-line-soft text-ink-soft font-sans font-bold text-xs rounded-xl hover:bg-paper/50 transition-colors disabled:opacity-60"
                  >
                    {t('dashboard.donationQueue.modal.markDidNotDonate', "Didn't Donate")}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitDonated} className="space-y-4">
                  <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-ink-soft">
                    {t('dashboard.donationQueue.form.title', 'Donation Details')}
                  </p>

                  <div className="grid grid-cols-2 gap-4 sm:gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-ink-soft block">
                        {t('dashboard.donationQueue.form.donorBloodType', 'Donor Blood Type')} <span className="text-crimson">*</span>
                      </label>
                      <select
                        value={form.donorBloodType}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            donorBloodType: e.target.value,
                          }))
                        }
                        className="w-full h-10 px-3 bg-white border border-line-soft rounded-xl outline-none text-sm font-medium focus:border-crimson"
                      >
                        <option value="">
                          {t('dashboard.donationQueue.form.selectType', 'Select')}
                        </option>
                        {ALLOWED_BLOOD_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      {formErrors.donorBloodType && (
                        <p className="text-[10px] text-crimson font-bold uppercase">
                          {formErrors.donorBloodType}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-ink-soft block">
                        {t('dashboard.donationQueue.form.donatedToBloodType', 'Donated To Blood Type')} <span className="text-crimson">*</span>
                      </label>
                      <select
                        value={form.donatedToBloodType}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            donatedToBloodType: e.target.value,
                          }))
                        }
                        className="w-full h-10 px-3 bg-white border border-line-soft rounded-xl outline-none text-sm font-medium focus:border-crimson"
                      >
                        <option value="">
                          {t('dashboard.donationQueue.form.selectType', 'Select')}
                        </option>
                        {ALLOWED_BLOOD_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      {formErrors.donatedToBloodType && (
                        <p className="text-[10px] text-crimson font-bold uppercase">
                          {formErrors.donatedToBloodType}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 sm:gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-ink-soft block">
                        {t('dashboard.donationQueue.form.height', 'Height')}
                      </label>
                      <input
                        type="number"
                        placeholder="cm"
                        value={form.height}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, height: e.target.value }))
                        }
                        className="w-full h-10 px-3 bg-white border border-line-soft rounded-xl outline-none text-sm font-medium focus:border-crimson"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-ink-soft block">
                        {t('dashboard.donationQueue.form.weight', 'Weight')}
                      </label>
                      <input
                        type="number"
                        placeholder="kg"
                        value={form.weight}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, weight: e.target.value }))
                        }
                        className="w-full h-10 px-3 bg-white border border-line-soft rounded-xl outline-none text-sm font-medium focus:border-crimson"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-ink-soft block">
                      {t('dashboard.donationQueue.form.healthStatus', 'Health Status')}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Fit to donate"
                      value={form.healthStatus}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          healthStatus: e.target.value,
                        }))
                      }
                      className="w-full h-10 px-3 bg-white border border-line-soft rounded-xl outline-none text-sm font-medium focus:border-crimson"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-ink-soft block">
                      {t('dashboard.donationQueue.form.peopleSaved', 'People Saved')}
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={form.peopleSaved}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          peopleSaved: e.target.value,
                        }))
                      }
                      className="w-full h-10 px-3 bg-white border border-line-soft rounded-xl outline-none text-sm font-medium focus:border-crimson"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-ink-soft block">
                      {t('dashboard.donationQueue.form.thankYouMessage', 'Thank You Message')}
                    </label>
                    <textarea
                      rows={3}
                      placeholder="A short thank-you note to the donor..."
                      value={form.thankYouMessage}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          thankYouMessage: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-3 bg-white border border-line-soft rounded-xl outline-none text-sm font-medium focus:border-crimson resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-line-soft">
                    <button
                      type="button"
                      onClick={() => setExpanded(false)}
                      disabled={submitting}
                      className="px-5 py-2.5 border border-line-soft text-ink-soft text-xs font-sans font-bold rounded-xl hover:bg-paper/50 transition-colors disabled:opacity-60"
                    >
                      {t('dashboard.donationQueue.form.cancel', 'Cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2.5 bg-ink text-white text-xs font-sans font-bold rounded-xl hover:bg-ink/90 transition-colors disabled:opacity-60 shadow-xs"
                    >
                      {submitting
                        ? t('dashboard.donationQueue.submitting', 'Submitting...')
                        : t('dashboard.donationQueue.form.confirm', 'Confirm')}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonationQueueModal;
