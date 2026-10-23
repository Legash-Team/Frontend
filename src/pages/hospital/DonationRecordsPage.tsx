import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '@/layouts/DashboardLayout';
import {
  listDonationRecords,
  createDonationRecord,
  deleteDonationRecord,
} from '@/pages/hospital/services/donationRecordService';
import type {
  BloodRequest,
  AcceptedDonor,
  DonationRecord,
  DonationScreening,
  DonationOutcome,
  ScreeningResult,
  BloodType,
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
  ClipboardList,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FlaskConical,
  User,
  Stethoscope,
  Info,
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
    outcome: 'cleared',
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

  const [records, setRecords] = useState<DonationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Prefill when arriving from a request's accepted-donor list
  useEffect(() => {
    const state = (navigation.state ?? {}) as { request?: BloodRequest; donor?: AcceptedDonor };
    if (state.donor) {
      setForm({
        ...defaultForm(),
        donorName: state.donor.name || '',
        donorPhone: state.donor.phone || '',
        bloodType: (state.donor.bloodType as BloodType) || '',
      });
      setFormContext({ request: state.request, donor: state.donor });
      setFormOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation.state]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const openBlankForm = () => {
    setForm(defaultForm());
    setFormContext({});
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
    try {
      const payload = {
        requestId: formContext.request?.id ?? null,
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
        outcome: form.outcome,
        notes: form.notes.trim() || undefined,
        recordedBy: form.recordedBy.trim(),
      };
      await createDonationRecord(payload);
      toast.success(t('donationRecords.savedSuccess'));
      setFormOpen(false);
      setFormContext({});
      loadRecords();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
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

  const screeningSummary = (screening: DonationScreening): { label: string; tone: 'clear' | 'reactive' | 'pending' } => {
    const values = SCREENING_KEYS.map((key) => screening[key]);
    if (values.some((value) => value === 'reactive')) {
      return { label: t('donationRecords.reactiveFound'), tone: 'reactive' };
    }
    if (values.some((value) => value === 'pending')) {
      return { label: t('donationRecords.screeningPending'), tone: 'pending' };
    }
    return { label: t('donationRecords.allClear'), tone: 'clear' };
  };

  const outcomeBadge = (outcome: DonationOutcome) => {
    if (outcome === 'cleared') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-verified/10 text-verified border border-verified/20">
          <CheckCircle2 className="w-3 h-3" />
          {t('donationRecords.outcomeCleared')}
        </span>
      );
    }
    if (outcome === 'deferred') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
          <Clock className="w-3 h-3" />
          {t('donationRecords.outcomeDeferred')}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-crimson/10 text-crimson border border-crimson/20">
        <AlertTriangle className="w-3 h-3" />
        {t('donationRecords.outcomeRejected')}
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
              onClick={loadRecords}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-paper hover:bg-paper-dim border border-line-soft text-ink-soft rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
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

        {/* Local-storage notice */}
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <Info className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
          <div className="text-xs text-amber-900">
            <p className="font-bold uppercase font-mono tracking-wider text-[11px]">
              {t('donationRecords.noticeTitle')}
            </p>
            <p className="mt-1 leading-relaxed">{t('donationRecords.noticeBody')}</p>
          </div>
          <Link
            to="/hospital/all-requests"
            className="ml-auto shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-300 text-amber-900 rounded-lg font-sans font-semibold text-[11px] hover:bg-amber-100 transition-colors"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            {t('donationRecords.viewAllRequests')}
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-2xl border border-line-soft shadow-xs">
            <LoadingState text={t('donationRecords.loading')} />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <ErrorState title={t('donationRecords.errorTitle')} message={error} onRetry={loadRecords} />
        )}

        {/* Empty */}
        {!loading && !error && records.length === 0 && (
          <EmptyState
            icon={<FlaskConical className="w-6 h-6" />}
            title={t('donationRecords.emptyTitle')}
            description={t('donationRecords.emptyDescription')}
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

        {/* Records table */}
        {!loading && !error && records.length > 0 && (
          <div className="bg-white rounded-2xl border border-line-soft shadow-xs overflow-hidden">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-xs min-w-[720px]">
                <thead>
                  <tr className="bg-paper/70 border-b border-line-soft text-[10px] font-mono font-bold uppercase tracking-wider text-ink-soft">
                    <th className="text-left px-5 py-3.5">{t('donationRecords.colDonor')}</th>
                    <th className="text-left px-5 py-3.5">{t('donationRecords.colDonatedOn')}</th>
                    <th className="text-left px-5 py-3.5">{t('donationRecords.colUnits')}</th>
                    <th className="text-left px-5 py-3.5">{t('donationRecords.colScreening')}</th>
                    <th className="text-left px-5 py-3.5">{t('donationRecords.colOutcome')}</th>
                    <th className="text-right px-5 py-3.5">
                      <span className="sr-only">{t('donationRecords.detailsTitle')}</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft">
                  {records.map((record) => {
                    const summary = screeningSummary(record.screening);
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
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                              summary.tone === 'clear'
                                ? 'bg-verified/10 text-verified border-verified/20'
                                : summary.tone === 'reactive'
                                ? 'bg-crimson/10 text-crimson border-crimson/20'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            <FlaskConical className="w-3 h-3" />
                            {summary.label}
                          </span>
                        </td>
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
                  <label className={labelClass}>{t('donationRecords.form.donorPhone')}</label>
                  <input
                    type="tel"
                    value={form.donorPhone}
                    onChange={(e) => setField('donorPhone', e.target.value)}
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
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
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
                    <label className={labelClass}>{t('donationRecords.form.bloodPressure')}</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        placeholder="120"
                        value={form.systolic}
                        onChange={(e) => setField('systolic', e.target.value)}
                        className={inputClass()}
                      />
                      <span className="text-ink-soft font-bold">/</span>
                      <input
                        type="number"
                        placeholder="80"
                        value={form.diastolic}
                        onChange={(e) => setField('diastolic', e.target.value)}
                        className={inputClass()}
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

              {/* Outcome */}
              <div className="space-y-3">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-ink block">
                  {t('donationRecords.form.outcomeTitle')}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(['cleared', 'deferred', 'rejected'] as DonationOutcome[]).map((outcome) => (
                    <label
                      key={outcome}
                      className={`flex items-start gap-2.5 p-3 border rounded-xl cursor-pointer transition-all ${
                        form.outcome === outcome
                          ? outcome === 'cleared'
                            ? 'border-verified bg-verified/5'
                            : outcome === 'deferred'
                            ? 'border-amber-400 bg-amber-50'
                            : 'border-crimson bg-crimson/5'
                          : 'border-line-soft bg-white hover:bg-paper/60'
                      }`}
                    >
                      <input
                        type="radio"
                        name="outcome"
                        checked={form.outcome === outcome}
                        onChange={() => setField('outcome', outcome)}
                        className="mt-0.5 accent-crimson"
                      />
                      <span className="text-xs font-sans font-semibold text-ink leading-snug">
                        {t(`donationRecords.form.outcome${outcome.charAt(0).toUpperCase()}${outcome.slice(1)}`)}
                      </span>
                    </label>
                  ))}
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
              <div className="flex justify-end gap-3 pt-3 border-t border-line-soft">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="px-5 py-2.5 border border-line-soft text-ink-soft hover:text-ink hover:bg-paper rounded-xl text-xs font-sans font-semibold transition-colors"
                >
                  {t('donationRecords.form.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-crimson hover:bg-crimson-dark text-white rounded-xl text-xs font-sans font-semibold transition-colors shadow-xs disabled:opacity-60"
                >
                  {saving ? t('donationRecords.form.saving') : t('donationRecords.form.saveRecord')}
                </button>
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
              {detailRecord.outcome !== 'cleared' && outcomeBadge(detailRecord.outcome)}
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
