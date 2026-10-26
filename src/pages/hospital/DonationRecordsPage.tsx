import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '@/layouts/DashboardLayout';
import {
  listDonationRecords,
  createDonationRecord,
  deleteDonationRecord,
} from '@/pages/hospital/services/donationRecordService';
import { getPendingDonationQueue } from '@/pages/hospital/services/donationQueueService';
import type {
  BloodRequest,
  AcceptedDonor,
  DonationRecord,
  DonationScreening,
  DonationOutcome,
  ScreeningResult,
  BloodType,
  PendingDonation,
} from '@/features/hospital/types/hospital-types';
import { ALLOWED_BLOOD_TYPES } from '@/features/hospital/types/hospital-types';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { useDialog } from '@/context/DialogContext';
import {
  FileHeart,
  Plus,
  X,
  RefreshCw,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle2,
  FlaskConical,
  User,
  Stethoscope,
  Phone,
} from 'lucide-react';

type ScreeningKey = keyof DonationScreening;

const SCREENING_KEYS: ScreeningKey[] = ['hiv', 'hepatitisB', 'hepatitisC', 'syphilis', 'malaria'];

const SCREENING_LABEL_KEYS: Record<ScreeningKey, string> = {
  hiv: 'donationRecords.form.hiv',
  hepatitisB: 'donationRecords.form.hepatitisB',
  hepatitisC: 'donationRecords.form.hepatitisC',
  syphilis: 'donationRecords.form.syphilis',
  malaria: 'donationRecords.form.malaria',
};

const emptyScreening: DonationScreening = {
  hiv: 'pending',
  hepatitisB: 'pending',
  hepatitisC: 'pending',
  syphilis: 'pending',
  malaria: 'pending',
};

interface FormState {
  donorName: string;
  donorId: string;
  donorPhone: string;
  bloodType: BloodType | '';
  unitsCollected: string;
  donatedOn: string;
  screening: DonationScreening;
  hemoglobin: string;
  pulse: string;
  systolic: string;
  diastolic: string;
  temperature: string;
  outcome: DonationOutcome;
  notes: string;
  recordedBy: string;
}

const defaultForm = (): FormState => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return {
    donorName: '',
    donorId: '',
    donorPhone: '',
    bloodType: '',
    unitsCollected: '1',
    donatedOn: now.toISOString().slice(0, 16),
    screening: { ...emptyScreening },
    hemoglobin: '',
    pulse: '',
    systolic: '',
    diastolic: '',
    temperature: '',
    outcome: 'donated',
    notes: '',
    recordedBy: '',
  };
};

const toNumberOrNull = (value: string): number | null => {
  const parsed = Number(value);
  return value.trim() !== '' && Number.isFinite(parsed) ? parsed : null;
};

const formatDate = (iso?: string): string => {
  if (!iso) return '—';
  try {
    const date = new Date(iso);
    if (isNaN(date.getTime())) return iso;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
};

export const DonationRecordsPage: React.FC = () => {
  const { t } = useTranslation();
  const { confirm, toast } = useDialog();
  const navigation = useLocation();

  const [activeTab, setActiveTab] = useState<'waiting' | 'filled'>(() => {
    const stateTab = (navigation.state as any)?.tab;
    if (stateTab === 'waiting' || stateTab === 'filled') return stateTab;
    const searchTab = new URLSearchParams(navigation.search).get('tab');
    if (searchTab === 'waiting' || searchTab === 'filled') return searchTab;
    return 'waiting';
  });

  const [records, setRecords] = useState<DonationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pendingQueue, setPendingQueue] = useState<PendingDonation[]>([]);
  const [queueLoading, setQueueLoading] = useState<boolean>(true);
  const [queueError, setQueueError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [formContext, setFormContext] = useState<{ request?: BloodRequest; donor?: AcceptedDonor }>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const [detailRecord, setDetailRecord] = useState<DonationRecord | null>(null);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listDonationRecords();
      setRecords(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('donationRecords.errorTitle'));
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  const loadQueue = useCallback(async () => {
    setQueueLoading(true);
    setQueueError(null);
    try {
      const queue = await getPendingDonationQueue();
      setPendingQueue(queue);
    } catch (err: unknown) {
      setQueueError(err instanceof Error ? err.message : 'Failed to load pending queue');
      setPendingQueue([]);
    } finally {
      setQueueLoading(false);
    }
  }, []);

  const handleRefreshAll = () => {
    loadRecords();
    loadQueue();
  };

  // Switch tab if navigation state requests it
  useEffect(() => {
    const stateTab = (navigation.state as any)?.tab;
    if (stateTab === 'waiting' || stateTab === 'filled') {
      setActiveTab(stateTab);
    }
  }, [navigation.state]);

  // Prefill when arriving from a request's accepted-donor list
  useEffect(() => {
    const state = (navigation.state ?? {}) as { request?: BloodRequest; donor?: AcceptedDonor };
    if (state.donor) {
      const rawDonor = state.donor as any;
      setForm({
        ...defaultForm(),
        donorName: rawDonor.name || '',
        donorId: rawDonor.shortId || rawDonor.donorId || rawDonor.id || '',
        donorPhone: rawDonor.phone || '',
        bloodType: (rawDonor.bloodType as BloodType) || '',
      });
      setFormContext({ request: state.request, donor: state.donor });
      setFormOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation.state]);

  useEffect(() => {
    loadRecords();
    loadQueue();
  }, [loadRecords, loadQueue]);

  // Only actual persisted records with successful outcome for existing donors (never display deleted or anonymous donors)
  const filledRecords = useMemo(
    () =>
      records.filter(
        (r) =>
          r.outcome !== 'did_not_donate' &&
          r.donorName &&
          r.donorName.trim() !== '' &&
          r.donorName !== 'Anonymous Donor' &&
          r.donorId &&
          r.donorId !== 'DONOR'
      ),
    [records]
  );

  // Cleaned pending queue excluding any deleted or placeholder donors
  const validPendingQueue = useMemo(
    () =>
      pendingQueue.filter(
        (item) =>
          item.donor &&
          item.name &&
          item.name !== 'Anonymous Donor' &&
          item.shortId !== 'DONOR' &&
          item.donor.shortId !== 'DONOR' &&
          item.donor.name !== 'Anonymous Donor'
      ),
    [pendingQueue]
  );

  interface RequestGroup {
    requestId: string;
    bloodType: string;
    quantityNeeded?: number;
    isEmergency?: boolean;
    status?: string;
    description?: string;
    createdAt?: string;
    donors: PendingDonation[];
  }

  // Group pending queue by request for the Waiting tab
  const groupedQueue = useMemo(() => {
    const groups: Record<string, RequestGroup> = {};
    for (const item of validPendingQueue) {
      const reqId = item.bloodRequestId || item.request?.id || 'request-group';
      if (!groups[reqId]) {
        groups[reqId] = {
          requestId: reqId,
          bloodType: item.request?.bloodType || item.acceptedRequest || 'Blood Request',
          quantityNeeded: item.request?.quantityNeeded,
          isEmergency: item.request?.isEmergency,
          status: item.request?.status,
          description: item.request?.description,
          createdAt: item.request?.createdAt,
          donors: [],
        };
      }
      groups[reqId].donors.push(item);
    }
    return Object.values(groups);
  }, [validPendingQueue]);

  const openBlankForm = () => {
    setForm(defaultForm());
    setFormContext({});
    setFormErrors({});
    setFormOpen(true);
  };

  const openOutcomeForPending = (item: PendingDonation) => {
    setFormContext({
      request: item.request
        ? ({
            id: item.request.id,
            bloodType: item.request.bloodType as BloodType,
            quantity: item.request.quantityNeeded || 1,
            requestType: item.request.isEmergency ? 'Emergency' : 'Normal',
            closingDateTime: '',
            status: (item.request.status as any) || 'ACTIVE',
            description: item.request.description || '',
            createdAt: item.request.createdAt || '',
          } as BloodRequest)
        : undefined,
      donor: {
        id: item.donorId || item.donor?.id || item.id,
        donorId: item.donorId || item.donor?.id || item.id,
        name: item.name,
        phone: item.phone || item.donor?.phone || '',
        bloodType: (item.bloodType || item.donor?.bloodType || '') as BloodType,
        responseId: item.responseId || item.bloodRequestResponseId || item.id,
        shortId: item.shortId || item.donor?.shortId,
      } as any,
    });
    setForm({
      ...defaultForm(),
      donorName: item.name || '',
      donorId: item.shortId || item.donorId || item.donor?.id || '',
      donorPhone: item.phone || item.donor?.phone || '',
      bloodType: ((item.bloodType || item.donor?.bloodType || '') as BloodType) || '',
    });
    setFormErrors({});
    setFormOpen(true);
  };

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.donorName.trim()) {
      errors.donorName = t('donationRecords.form.errors.nameRequired');
    }
    const units = Number(form.unitsCollected);
    if (!Number.isFinite(units) || units < 1 || units > 4) {
      errors.unitsCollected = t('donationRecords.form.errors.unitsRange');
    }
    if (form.hemoglobin.trim() !== '') {
      const hgb = Number(form.hemoglobin);
      if (!Number.isFinite(hgb) || hgb < 5 || hgb > 20) {
        errors.hemoglobin = t('donationRecords.form.errors.hgbRange');
      }
    }
    if (!form.recordedBy.trim()) {
      errors.recordedBy = t('donationRecords.form.errors.staffRequired');
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    const respId = formContext.donor?.responseId ? String(formContext.donor.responseId) : null;
    try {
      const payload = {
        requestId: formContext.request?.id ? String(formContext.request.id) : null,
        responseId: respId,
        donorId: form.donorId.trim() || (formContext.donor?.donorId ? String(formContext.donor.donorId) : null) || ((formContext.donor as any)?.shortId ? String((formContext.donor as any).shortId) : null) || (formContext.donor?.id ? String(formContext.donor.id) : null) || null,
        donorName: form.donorName.trim(),
        donorPhone: form.donorPhone.trim() || undefined,
        bloodType: (form.bloodType || null) as BloodType | null,
        unitsCollected: Number(form.unitsCollected),
        donatedOn: new Date(form.donatedOn).toISOString(),
        screening: { ...form.screening },
        vitals: {
          hemoglobin: toNumberOrNull(form.hemoglobin),
          pulse: toNumberOrNull(form.pulse),
          systolic: toNumberOrNull(form.systolic),
          diastolic: toNumberOrNull(form.diastolic),
          temperature: toNumberOrNull(form.temperature),
        },
        outcome: 'donated' as const,
        notes: form.notes.trim() || undefined,
        recordedBy: form.recordedBy.trim(),
      };
      await createDonationRecord(payload);
      toast.success(t('donationRecords.savedSuccess'));
      setFormOpen(false);
      setFormContext({});
      if (respId) {
        setPendingQueue((prev) => prev.filter((item) => (item.responseId || item.id) !== respId));
      }
      loadQueue();
      loadRecords();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      toast.error(errMsg);
      if (respId) {
        setPendingQueue((prev) => prev.filter((item) => (item.responseId || item.id) !== respId));
      }
      if (errMsg.toLowerCase().includes('no longer exists') || errMsg.toLowerCase().includes('not found') || errMsg.toLowerCase().includes('deleted')) {
        setFormOpen(false);
        setFormContext({});
        loadQueue();
        loadRecords();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDidNotDonate = async () => {
    setSaving(true);
    const respId = formContext.donor?.responseId ? String(formContext.donor.responseId) : null;
    try {
      const payload = {
        requestId: formContext.request?.id ? String(formContext.request.id) : null,
        responseId: respId,
        donorId: (formContext.donor?.donorId ? String(formContext.donor.donorId) : null) || (formContext.donor?.id ? String(formContext.donor.id) : null) || null,
        donorName: form.donorName.trim() || 'Anonymous Donor',
        donorPhone: form.donorPhone.trim() || undefined,
        bloodType: (form.bloodType || null) as BloodType | null,
        unitsCollected: 0,
        donatedOn: new Date().toISOString(),
        screening: { ...form.screening },
        vitals: {
          hemoglobin: null,
          pulse: null,
          systolic: null,
          diastolic: null,
          temperature: null,
        },
        outcome: 'did_not_donate' as const,
        notes: form.notes.trim() || undefined,
        recordedBy: form.recordedBy.trim() || 'Hospital Staff',
      };
      await createDonationRecord(payload);
      toast.success("Recorded donor as didn't donate.");
      setFormOpen(false);
      setFormContext({});
      if (respId) {
        setPendingQueue((prev) => prev.filter((item) => (item.responseId || item.id) !== respId));
      }
      loadQueue();
      loadRecords();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      toast.error(errMsg);
      if (respId) {
        setPendingQueue((prev) => prev.filter((item) => (item.responseId || item.id) !== respId));
      }
      if (errMsg.toLowerCase().includes('no longer exists') || errMsg.toLowerCase().includes('not found') || errMsg.toLowerCase().includes('deleted')) {
        setFormOpen(false);
        setFormContext({});
        loadQueue();
        loadRecords();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (record: DonationRecord) => {
    const ok = await confirm({
      title: t('donationRecords.deleteConfirmTitle'),
      message: t('donationRecords.deleteConfirmMessage'),
      type: 'danger',
      confirmText: t('donationRecords.deleteRecord'),
    });
    if (!ok) return;
    try {
      await deleteDonationRecord(record.id);
      setDetailRecord(null);
      loadRecords();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    }
  };

  const outcomeBadge = (outcome: DonationOutcome | string) => {
    if (outcome === 'donated' || outcome === 'cleared') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-verified/10 text-verified border border-verified/20">
          <CheckCircle2 className="w-3 h-3" />
          Donated
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-paper text-ink-soft border border-line-soft">
        <X className="w-3 h-3" />
        Didn't donate
      </span>
    );
  };

  const inputClass = (hasError?: boolean) =>
    `w-full h-11 px-3.5 bg-white border rounded-xl outline-none transition-all text-sm font-medium ${
      hasError ? 'border-crimson focus:border-crimson' : 'border-line-soft focus:border-crimson focus:ring-1 focus:ring-crimson/10'
    }`;

  const labelClass = 'text-[11px] font-mono font-bold text-ink-soft uppercase tracking-wider';

  const selectScreening = (key: ScreeningKey, value: ScreeningResult) => {
    setForm((prev) => ({ ...prev, screening: { ...prev.screening, [key]: value } }));
  };

  return (
    <DashboardLayout icon={<FileHeart size={16} className="stroke-[1.75]" />}>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-line-soft">
          <div>
            <h1 className="text-2xl font-serif font-bold text-ink tracking-tight">
              {t('donationRecords.title')}
            </h1>
            <p className="text-sm font-sans text-ink-soft mt-1">{t('donationRecords.description')}</p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleRefreshAll}
              disabled={loading || queueLoading}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-paper hover:bg-paper-dim border border-line-soft text-ink-soft rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading || queueLoading ? 'animate-spin' : ''}`} />
              <span>{t('common.retry')}</span>
            </button>
            <button
              type="button"
              onClick={openBlankForm}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-crimson hover:bg-crimson-dark text-white rounded-xl font-sans font-semibold text-xs transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{t('donationRecords.recordDonation')}</span>
            </button>
          </div>
        </div>

        {/* Status Toggle Tabs: Waiting | Filled */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-line-soft shadow-xs">
          <div className="flex items-center gap-1.5 p-1 bg-paper rounded-xl border border-line-soft">
            <button
              type="button"
              onClick={() => setActiveTab('waiting')}
              className={`inline-flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                activeTab === 'waiting'
                  ? 'bg-crimson text-white shadow-xs'
                  : 'text-ink-soft hover:text-ink hover:bg-paper-dim'
              }`}
            >
              <span>{t('donationRecords.tabWaiting', 'Waiting')}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  activeTab === 'waiting'
                    ? 'bg-white/20 text-white'
                    : 'bg-paper-dim text-ink-soft'
                }`}
              >
                {validPendingQueue.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('filled')}
              className={`inline-flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                activeTab === 'filled'
                  ? 'bg-ink text-white shadow-xs'
                  : 'text-ink-soft hover:text-ink hover:bg-paper-dim'
              }`}
            >
              <span>{t('donationRecords.tabFilled', 'Filled')}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  activeTab === 'filled'
                    ? 'bg-white/20 text-white'
                    : 'bg-paper-dim text-ink-soft'
                }`}
              >
                {filledRecords.length}
              </span>
            </button>
          </div>

          <div className="text-xs font-mono text-ink-soft px-2">
            {activeTab === 'waiting'
              ? `${validPendingQueue.length} ${validPendingQueue.length === 1 ? 'donor awaiting outcome' : 'donors awaiting outcome'}`
              : `${filledRecords.length} ${filledRecords.length === 1 ? 'persisted donation record' : 'persisted donation records'}`}
          </div>
        </div>

        {/* --- TAB 1: WAITING TAB --- */}
        {activeTab === 'waiting' && (
          <>
            {queueLoading && (
              <div className="bg-white rounded-2xl border border-line-soft shadow-xs">
                <LoadingState text="Loading waiting queue..." />
              </div>
            )}

            {queueError && !queueLoading && (
              <ErrorState title="Unable to load queue" message={queueError} onRetry={loadQueue} />
            )}

            {!queueLoading && !queueError && validPendingQueue.length === 0 && (
              <EmptyState
                icon={<CheckCircle2 className="w-6 h-6 text-verified" />}
                title={t('donationRecords.emptyWaitingTitle', 'No Donors Waiting')}
                description={t(
                  'donationRecords.emptyWaitingDesc',
                  'All accepted donor requests have been confirmed or there are no pending donors waiting for donation outcome.'
                )}
              />
            )}

            {!queueLoading && !queueError && pendingQueue.length > 0 && (
              <div className="space-y-4">
                {groupedQueue.map((group) => (
                  <div
                    key={group.requestId}
                    className="bg-white rounded-2xl border border-line-soft shadow-xs overflow-hidden"
                  >
                    {/* Request Group Header */}
                    <div className="p-4 sm:p-5 bg-paper/60 border-b border-line-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-crimson/10 text-crimson font-bold">
                          {group.bloodType}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-serif font-bold text-ink text-sm sm:text-base">
                              {group.bloodType.includes('Request') ? group.bloodType : `${group.bloodType} Blood Request`}
                            </h3>
                            {group.isEmergency && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-crimson text-white">
                                <AlertTriangle className="w-3 h-3" />
                                Emergency
                              </span>
                            )}
                            {group.status && (
                              <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-paper text-ink-soft border border-line-soft">
                                {group.status}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-ink-soft font-sans mt-0.5">
                            {group.quantityNeeded && (
                              <span>Needed: <strong>{group.quantityNeeded} units</strong></span>
                            )}
                            {group.description && (
                              <span className="truncate max-w-xs">{group.description}</span>
                            )}
                            {group.createdAt && (
                              <span className="font-mono text-[11px]">Created: {formatDate(group.createdAt)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs font-mono font-semibold text-crimson bg-crimson/5 px-3 py-1 rounded-lg self-start sm:self-auto border border-crimson/15">
                        {group.donors.length} {group.donors.length === 1 ? 'donor waiting' : 'donors waiting'}
                      </div>
                    </div>

                    {/* Donors under this request */}
                    <div className="divide-y divide-line-soft">
                      {group.donors.map((donorItem) => (
                        <div
                          key={donorItem.id}
                          className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-paper/30 transition-colors"
                        >
                          <div className="flex items-start sm:items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-paper flex items-center justify-center shrink-0 text-ink-soft border border-line-soft">
                              <User className="w-5 h-5 text-crimson" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-sans font-bold text-ink text-sm sm:text-base">
                                  {donorItem.name}
                                </span>
                                {donorItem.bloodType && (
                                  <span className="font-mono text-[10px] bg-crimson/10 text-crimson px-2 py-0.5 rounded font-bold">
                                    {donorItem.bloodType}
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-soft font-sans mt-1">
                                <span className="font-mono text-xs">
                                  ID: <span className="font-semibold text-ink">{donorItem.shortId}</span>
                                </span>
                                {donorItem.phone && (
                                  <span className="flex items-center gap-1 font-mono">
                                    <Phone className="w-3 h-3 text-ink-soft/70" />
                                    {donorItem.phone}
                                  </span>
                                )}
                                {donorItem.acceptedAt && (
                                  <span className="font-mono text-ink-soft/80">
                                    Accepted: {formatDate(donorItem.acceptedAt)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                            <button
                              type="button"
                              onClick={() => openOutcomeForPending(donorItem)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-crimson hover:bg-crimson-dark text-white rounded-xl text-xs font-sans font-semibold transition-colors shadow-xs"
                            >
                              <Stethoscope className="w-3.5 h-3.5" />
                              <span>{t('donationRecords.recordOutcome', 'Record Outcome')}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* --- TAB 2: FILLED TAB --- */}
        {activeTab === 'filled' && (
          <>
            {loading && (
              <div className="bg-white rounded-2xl border border-line-soft shadow-xs">
                <LoadingState text={t('donationRecords.loading')} />
              </div>
            )}

            {error && !loading && (
              <ErrorState title={t('donationRecords.errorTitle')} message={error} onRetry={loadRecords} />
            )}

            {!loading && !error && filledRecords.length === 0 && (
              <EmptyState
                icon={<FlaskConical className="w-6 h-6" />}
                title={t('donationRecords.emptyFilledTitle', 'No Completed Donations Yet')}
                description={t(
                  'donationRecords.emptyFilledDesc',
                  'Confirmed donation records for donors who successfully completed donations will appear here.'
                )}
                action={
                  <button
                    type="button"
                    onClick={openBlankForm}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-crimson hover:bg-crimson-dark text-white rounded-xl font-sans font-semibold text-xs transition-colors shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    {t('donationRecords.recordDonation')}
                  </button>
                }
              />
            )}

            {!loading && !error && filledRecords.length > 0 && (
              <div className="bg-white rounded-2xl border border-line-soft shadow-xs overflow-hidden">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-xs min-w-[720px]">
                    <thead>
                      <tr className="bg-paper/70 border-b border-line-soft text-[10px] font-mono font-bold uppercase tracking-wider text-ink-soft">
                        <th className="text-left px-5 py-3.5">{t('donationRecords.colDonor')}</th>
                        <th className="text-left px-5 py-3.5">{t('donationRecords.colDonatedOn')}</th>
                        <th className="text-left px-5 py-3.5">{t('donationRecords.colUnits')}</th>
                        <th className="text-left px-5 py-3.5">{t('donationRecords.colOutcome')}</th>
                        <th className="text-right px-5 py-3.5">
                          <span className="sr-only">{t('donationRecords.detailsTitle')}</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line-soft">
                      {filledRecords.map((record) => {
                        return (
                          <tr key={record.id} className="hover:bg-paper/40 transition-colors">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2">
                                <span className="font-sans font-bold text-ink">{record.donorName}</span>
                                {record.bloodType && (
                                  <span className="font-mono text-[10px] bg-crimson/10 text-crimson px-2 py-0.5 rounded font-bold">
                                    {record.bloodType}
                                  </span>
                                )}
                              </div>
                              {record.donorPhone && (
                                <p className="text-[10px] text-ink-soft/70 font-mono mt-0.5">{record.donorPhone}</p>
                              )}
                            </td>
                            <td className="px-5 py-3.5 font-mono text-ink-soft">{formatDate(record.donatedOn)}</td>
                            <td className="px-5 py-3.5 font-mono font-bold text-ink">{record.unitsCollected}</td>
                            <td className="px-5 py-3.5">{outcomeBadge(record.outcome)}</td>
                            <td className="px-5 py-3.5 text-right">
                              <button
                                type="button"
                                onClick={() => setDetailRecord(record)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-paper hover:bg-paper-dim border border-line-soft text-ink rounded-lg font-sans font-semibold transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5 text-crimson" />
                                {t('donationRecords.detailsTitle')}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Record Form Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs">
          <div className="bg-white border border-line-soft rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-start justify-between pb-4 border-b border-line-soft">
              <div>
                <h3 className="font-serif font-bold text-xl text-ink">
                  {t('donationRecords.form.title')}
                </h3>
                {formContext.request && (
                  <p className="text-xs font-mono text-crimson mt-1">
                    {t('donationRecords.fromRequest')} #{formContext.request.id?.slice(-8) || '—'}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="p-1.5 text-ink-soft hover:text-ink rounded-lg hover:bg-paper-dim"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} noValidate className="space-y-6">
              {/* Donor & collection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={labelClass}>
                    {t('donationRecords.form.donorName')} <span className="text-crimson">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.donorName}
                    onChange={(e) => setField('donorName', e.target.value)}
                    className={inputClass(!!formErrors.donorName)}
                  />
                  {formErrors.donorName && (
                    <p className="text-[10px] text-crimson font-bold uppercase">{formErrors.donorName}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className={labelClass}>{t('donationRecords.form.donorId', 'Donor ID')}</label>
                  <input
                    type="text"
                    placeholder="e.g. D-10492"
                    value={form.donorId}
                    onChange={(e) => setField('donorId', e.target.value)}
                    className={inputClass()}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={labelClass}>{t('donationRecords.form.bloodType')}</label>
                  <select
                    value={form.bloodType}
                    onChange={(e) => setField('bloodType', e.target.value as BloodType | '')}
                    className={inputClass()}
                  >
                    <option value="">{t('donationRecords.form.bloodTypeUnconfirmed')}</option>
                    {ALLOWED_BLOOD_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className={labelClass}>
                    {t('donationRecords.form.units')} <span className="text-crimson">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={4}
                    value={form.unitsCollected}
                    onChange={(e) => setField('unitsCollected', e.target.value)}
                    className={inputClass(!!formErrors.unitsCollected)}
                  />
                  {formErrors.unitsCollected && (
                    <p className="text-[10px] text-crimson font-bold uppercase">{formErrors.unitsCollected}</p>
                  )}
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className={labelClass}>{t('donationRecords.form.donatedOn')}</label>
                  <input
                    type="datetime-local"
                    value={form.donatedOn}
                    onChange={(e) => setField('donatedOn', e.target.value)}
                    className={inputClass()}
                  />
                </div>
              </div>

              {/* Screening */}
              <div className="p-4 bg-paper/50 border border-line-soft rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-crimson" />
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-ink">
                    {t('donationRecords.form.screeningTitle')}
                  </span>
                </div>
                <p className="text-[11px] text-ink-soft/80 leading-relaxed">
                  {t('donationRecords.form.screeningHint')}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SCREENING_KEYS.map((key) => (
                    <div key={key} className="flex items-center justify-between gap-3 bg-white border border-line-soft rounded-lg px-3 py-2">
                      <span className="text-xs font-sans font-semibold text-ink">
                        {t(SCREENING_LABEL_KEYS[key])}
                      </span>
                      <select
                        value={form.screening[key]}
                        onChange={(e) => selectScreening(key, e.target.value as ScreeningResult)}
                        className="h-8 px-2 bg-paper border border-line-soft rounded-lg text-[11px] font-mono font-bold uppercase outline-none focus:border-crimson"
                      >
                        <option value="non_reactive">{t('donationRecords.form.testNegative')}</option>
                        <option value="reactive">{t('donationRecords.form.testPositive')}</option>
                        <option value="pending">{t('donationRecords.form.testPending')}</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vitals */}
              <div className="p-4 bg-paper/50 border border-line-soft rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-crimson" />
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-ink">
                    {t('donationRecords.form.vitalsTitle')}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className={labelClass}>{t('donationRecords.form.hemoglobin')}</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.hemoglobin}
                      onChange={(e) => setField('hemoglobin', e.target.value)}
                      className={inputClass(!!formErrors.hemoglobin)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}>{t('donationRecords.form.pulse')}</label>
                    <input
                      type="number"
                      value={form.pulse}
                      onChange={(e) => setField('pulse', e.target.value)}
                      className={inputClass()}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}>{t('donationRecords.form.bloodPressure')} (mmHg)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="120"
                        value={form.systolic}
                        onChange={(e) => setField('systolic', e.target.value)}
                        className={`${inputClass()} min-w-[75px] text-center font-mono`}
                      />
                      <span className="text-ink-soft font-bold text-base select-none">/</span>
                      <input
                        type="number"
                        placeholder="80"
                        value={form.diastolic}
                        onChange={(e) => setField('diastolic', e.target.value)}
                        className={`${inputClass()} min-w-[75px] text-center font-mono`}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}>{t('donationRecords.form.temperature')}</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.temperature}
                      onChange={(e) => setField('temperature', e.target.value)}
                      className={inputClass()}
                    />
                  </div>
                </div>
                {formErrors.hemoglobin && (
                  <p className="text-[10px] text-crimson font-bold uppercase">{formErrors.hemoglobin}</p>
                )}
              </div>

              {/* Outcome guidance */}
              <div className="p-3.5 bg-paper/60 border border-line-soft rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-ink block">
                    Donation Outcome
                  </span>
                  <p className="text-xs text-ink-soft mt-0.5">
                    Click <strong>Save Record</strong> if the donation was completed, or <strong>Didn't donate</strong> if the donor did not donate.
                  </p>
                </div>
              </div>

              {/* Notes + staff */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={labelClass}>{t('donationRecords.form.notes')}</label>
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setField('notes', e.target.value)}
                    placeholder={t('donationRecords.form.notesPlaceholder')}
                    className="w-full px-3.5 py-2.5 bg-white border border-line-soft rounded-xl outline-none focus:border-crimson focus:ring-1 focus:ring-crimson/10 transition-all text-sm font-medium resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>
                    {t('donationRecords.form.recordedBy')} <span className="text-crimson">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.recordedBy}
                    onChange={(e) => setField('recordedBy', e.target.value)}
                    className={inputClass(!!formErrors.recordedBy)}
                  />
                  {formErrors.recordedBy && (
                    <p className="text-[10px] text-crimson font-bold uppercase">{formErrors.recordedBy}</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-line-soft">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="px-5 py-2.5 border border-line-soft text-ink-soft hover:text-ink hover:bg-paper rounded-xl text-xs font-sans font-semibold transition-colors"
                >
                  {t('donationRecords.form.cancel')}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDidNotDonate}
                    disabled={saving}
                    className="px-4 py-2.5 border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-sans font-semibold transition-colors disabled:opacity-50"
                  >
                    Didn't donate
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 bg-crimson hover:bg-crimson-dark text-white rounded-xl text-xs font-sans font-semibold transition-colors shadow-xs disabled:opacity-50"
                  >
                    {saving ? t('donationRecords.form.saving') : t('donationRecords.form.saveRecord')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Detail Modal */}
      {detailRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs">
          <div className="bg-white border border-line-soft rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-start justify-between pb-4 border-b border-line-soft">
              <div>
                <h3 className="font-serif font-bold text-xl text-ink">
                  {t('donationRecords.detailsTitle')}
                </h3>
                <p className="text-xs font-mono text-ink-soft mt-1">
                  {formatDate(detailRecord.donatedOn)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetailRecord(null)}
                className="p-1.5 text-ink-soft hover:text-ink rounded-lg hover:bg-paper-dim"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-paper/60 border border-line-soft rounded-xl space-y-1">
                <span className="text-ink-soft/70 font-mono uppercase text-[10px] flex items-center gap-1.5">
                  <User className="w-3 h-3" /> {t('donationRecords.colDonor')}
                </span>
                <p className="font-sans font-bold text-ink">{detailRecord.donorName}</p>
                {detailRecord.donorPhone && (
                  <p className="font-mono text-ink-soft">{detailRecord.donorPhone}</p>
                )}
              </div>
              <div className="p-3.5 bg-paper/60 border border-line-soft rounded-xl space-y-1">
                <span className="text-ink-soft/70 font-mono uppercase text-[10px]">
                  {t('donationRecords.form.bloodType')}
                </span>
                <p className="font-mono font-bold text-ink">{detailRecord.bloodType || t('donationRecords.form.bloodTypeUnconfirmed')}</p>
              </div>
              <div className="p-3.5 bg-paper/60 border border-line-soft rounded-xl space-y-1">
                <span className="text-ink-soft/70 font-mono uppercase text-[10px]">
                  {t('donationRecords.colUnits')}
                </span>
                <p className="font-mono font-bold text-ink">{detailRecord.unitsCollected}</p>
              </div>
            </div>

            <div className="p-4 bg-paper/40 border border-line-soft rounded-xl space-y-2.5">
              <span className="text-[11px] font-mono font-bold uppercase text-ink-soft tracking-wider block">
                {t('donationRecords.screeningSection')}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {SCREENING_KEYS.map((key) => {
                  const value = detailRecord.screening[key];
                  return (
                    <div key={key} className="flex items-center justify-between bg-white border border-line-soft rounded-lg px-3 py-2">
                      <span className="font-sans font-semibold text-ink">{t(SCREENING_LABEL_KEYS[key])}</span>
                      <span
                        className={`font-mono font-bold uppercase text-[10px] ${
                          value === 'non_reactive' ? 'text-verified' : value === 'reactive' ? 'text-crimson' : 'text-amber-700'
                        }`}
                      >
                        {value === 'non_reactive'
                          ? t('donationRecords.form.testNegative')
                          : value === 'reactive'
                          ? t('donationRecords.form.testPositive')
                          : t('donationRecords.form.testPending')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 bg-paper/40 border border-line-soft rounded-xl space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase text-ink-soft tracking-wider block">
                {t('donationRecords.vitalsSection')}
              </span>
              <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-xs font-mono text-ink">
                <span>
                  {t('donationRecords.form.hemoglobin')}: <b>{detailRecord.vitals.hemoglobin ?? '—'}</b>
                </span>
                <span>
                  {t('donationRecords.form.pulse')}: <b>{detailRecord.vitals.pulse ?? '—'}</b>
                </span>
                <span>
                  {t('donationRecords.form.bloodPressure')}:{' '}
                  <b>
                    {detailRecord.vitals.systolic ?? '—'}/{detailRecord.vitals.diastolic ?? '—'}
                  </b>
                </span>
                <span>
                  {t('donationRecords.form.temperature')}: <b>{detailRecord.vitals.temperature ?? '—'}</b>
                </span>
              </div>
            </div>

            {detailRecord.notes && (
              <div className="p-4 bg-paper/40 border border-line-soft rounded-xl space-y-1.5">
                <span className="text-[11px] font-mono font-bold uppercase text-ink-soft tracking-wider block">
                  {t('donationRecords.notesSection')}
                </span>
                <p className="text-xs font-sans text-ink leading-relaxed">{detailRecord.notes}</p>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-line-soft text-[11px] font-mono text-ink-soft">
              <span>
                {t('donationRecords.recordedByLabel')}: <b className="text-ink">{detailRecord.recordedBy}</b>
              </span>
              <span>
                {t('donationRecords.recordedAtLabel')}: {formatDate(detailRecord.recordedAt)}
              </span>
              {outcomeBadge(detailRecord.outcome)}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleDelete(detailRecord)}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-crimson text-crimson hover:bg-crimson/5 rounded-xl text-xs font-sans font-semibold transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t('donationRecords.deleteRecord')}
              </button>
              <button
                type="button"
                onClick={() => setDetailRecord(null)}
                className="px-5 py-2 bg-ink text-white rounded-xl text-xs font-sans font-semibold hover:bg-ink/90 transition-colors"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DonationRecordsPage;
