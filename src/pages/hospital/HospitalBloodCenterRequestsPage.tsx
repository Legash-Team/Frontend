import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import Button from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { LocationLink } from '@/utils/mapsUrl';
import {
  fetchHospitalBloodCenterRequests,
  createBloodCenterRequest,
  fetchAcceptedBloodCenters,
  closeBloodCenterRequest,
  type BloodCenterRequestItem,
  type AcceptedBloodCenter,
} from '@/features/hospital/api/bloodCenterRequestApi';
import { ALLOWED_BLOOD_TYPES } from '@/features/hospital/types/hospital-types';
import type { BloodType } from '@/features/hospital/types/hospital-types';
import {
  Building2,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Phone,
  Mail,
} from 'lucide-react';
import { useDialog } from '@/context/DialogContext';

export const HospitalBloodCenterRequestsPage: React.FC = () => {
  const { confirm, toast } = useDialog();

  const [requests, setRequests] = useState<BloodCenterRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create Request Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formBloodType, setFormBloodType] = useState<BloodType | ''>('');
  const [formQuantity, setFormQuantity] = useState('5');
  const [formClosesAt, setFormClosesAt] = useState('');
  const [formNote, setFormNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Accepted Centers Modal State
  const [selectedRequest, setSelectedRequest] = useState<BloodCenterRequestItem | null>(null);
  const [acceptedCenters, setAcceptedCenters] = useState<AcceptedBloodCenter[]>([]);
  const [centersLoading, setCentersLoading] = useState(false);
  const [centersModalOpen, setCentersModalOpen] = useState(false);

  const loadRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHospitalBloodCenterRequests();
      setRequests(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load blood center requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleOpenCreateModal = () => {
    setFormBloodType('');
    setFormQuantity('5');
    setFormNote('');
    setFormError(null);
    // Default closing time to 48 hours from now
    const d = new Date(Date.now() + 48 * 60 * 60 * 1000);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    setFormClosesAt(d.toISOString().slice(0, 16));
    setCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formBloodType) {
      setFormError('Please select a blood type.');
      return;
    }
    const qty = parseInt(formQuantity, 10);
    if (isNaN(qty) || qty < 1) {
      setFormError('Quantity needed must be a positive number.');
      return;
    }
    if (!formClosesAt) {
      setFormError('Please specify when the request closes.');
      return;
    }
    const closesAtDate = new Date(formClosesAt);
    if (isNaN(closesAtDate.getTime()) || closesAtDate <= new Date()) {
      setFormError('Closing time must be in the future.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createBloodCenterRequest({
        bloodType: formBloodType,
        quantityNeeded: qty,
        closesAt: closesAtDate.toISOString(),
        note: formNote.trim() || undefined,
      });
      toast.success(res?.message || 'Blood center request created successfully.');
      setCreateModalOpen(false);
      loadRequests();
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to create request.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewAcceptedCenters = async (reqItem: BloodCenterRequestItem) => {
    setSelectedRequest(reqItem);
    setCentersModalOpen(true);
    setCentersLoading(true);
    try {
      const centers = await fetchAcceptedBloodCenters(reqItem.id);
      setAcceptedCenters(centers);
    } catch (err: any) {
      toast.error('Failed to load accepted blood centers.');
      setAcceptedCenters([]);
    } finally {
      setCentersLoading(false);
    }
  };

  const handleCloseRequest = async (reqItem: BloodCenterRequestItem) => {
    const ok = await confirm({
      title: 'Close Blood Center Request',
      message: 'Are you sure you want to close this request? Blood centers will no longer be able to respond.',
      type: 'danger',
      confirmText: 'Close Request',
    });
    if (!ok) return;

    try {
      await closeBloodCenterRequest(reqItem.id);
      toast.success('Request closed successfully.');
      loadRequests();
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Failed to close request.');
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line-soft">
          <div>
            <h1 className="text-2xl font-serif font-bold text-ink tracking-tight flex items-center gap-2.5">
              <Building2 className="w-6 h-6 text-crimson" />
              Blood Center Requests
            </h1>
            <p className="text-sm font-sans text-ink-soft mt-1">
              Request bulk blood kits from regional Blood Centers within search radius.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadRequests}
              className="p-2.5 border border-line-soft rounded-xl text-ink-soft hover:text-ink hover:bg-paper transition-colors"
              title="Refresh requests"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Button
              type="button"
              variant="primary"
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 bg-crimson hover:bg-crimson-dark text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>New Center Request</span>
            </Button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-line-soft p-12">
            <LoadingState text="Loading blood center requests..." />
          </div>
        ) : error ? (
          <ErrorState title="Error Loading Requests" message={error} retryLabel="Try Again" onRetry={loadRequests} />
        ) : requests.length === 0 ? (
          <EmptyState
            icon={<Building2 className="w-12 h-12 text-ink-soft/40" />}
            title="No Blood Center Requests"
            description="You have not created any requests to regional Blood Centers yet."
            action={
              <Button type="button" variant="primary" onClick={handleOpenCreateModal} className="mt-4 gap-2">
                <Plus className="w-4 h-4" />
                <span>Create Request</span>
              </Button>
            }
          />
        ) : (
          <div className="bg-white rounded-2xl border border-line-soft shadow-xs overflow-hidden">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-xs min-w-[760px]">
                <thead>
                  <tr className="bg-paper/70 border-b border-line-soft text-[10px] font-mono font-bold uppercase tracking-wider text-ink-soft">
                    <th className="text-left px-5 py-3.5">Blood Type</th>
                    <th className="text-left px-5 py-3.5">Quantity Needed</th>
                    <th className="text-left px-5 py-3.5">Status</th>
                    <th className="text-left px-5 py-3.5">Center Responses</th>
                    <th className="text-left px-5 py-3.5">Closes At</th>
                    <th className="text-right px-5 py-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft">
                  {requests.map((r) => {
                    const isOpen = r.status === 'open';
                    return (
                      <tr key={r.id} className="hover:bg-paper/30 transition-colors">
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-crimson/10 text-crimson">
                            {r.bloodType}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-mono font-bold text-ink text-sm">
                          {r.quantityNeeded} <span className="text-xs font-normal text-ink-soft">kits</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                              isOpen
                                ? 'bg-verified/10 text-verified border-verified/20'
                                : 'bg-paper text-ink-soft border-line-soft'
                            }`}
                          >
                            {isOpen ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {r.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-verified bg-verified/10 px-2 py-0.5 rounded">
                              {r.acceptedCount} accepted
                            </span>
                            <span className="font-mono text-xs text-ink-soft">
                              / {r.matchedCenterCount} notified
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-ink-soft">
                          {formatDate(r.closesAt)}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleViewAcceptedCenters(r)}
                              className="px-3 py-1.5 bg-paper hover:bg-paper-dim text-ink border border-line-soft rounded-lg text-xs font-semibold transition-colors"
                            >
                              Accepted Centers ({r.acceptedCount})
                            </button>
                            {isOpen && (
                              <button
                                type="button"
                                onClick={() => handleCloseRequest(r)}
                                className="px-3 py-1.5 border border-line-soft hover:border-crimson/30 hover:bg-crimson/5 text-crimson rounded-lg text-xs font-semibold transition-colors"
                              >
                                Close
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create Request Modal */}
        {createModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs">
            <div className="bg-white border border-line-soft rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-line-soft">
                <div>
                  <h3 className="font-serif font-bold text-xl text-ink">New Blood Center Request</h3>
                  <p className="text-xs text-ink-soft mt-0.5">
                    Notifies all eligible Blood Centers within search radius.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="p-1.5 text-ink-soft hover:text-ink rounded-lg hover:bg-paper-dim"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="p-3 bg-crimson/10 border border-crimson/20 rounded-xl text-crimson text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-ink-soft mb-1.5">
                    Blood Type <span className="text-crimson">*</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {ALLOWED_BLOOD_TYPES.map((bt) => (
                      <button
                        key={bt}
                        type="button"
                        onClick={() => setFormBloodType(bt)}
                        className={`h-10 rounded-xl font-mono font-bold text-xs border transition-all ${
                          formBloodType === bt
                            ? 'bg-crimson text-white border-crimson shadow-xs'
                            : 'bg-paper text-ink border-line-soft hover:bg-sand/30'
                        }`}
                      >
                        {bt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-ink-soft mb-1.5">
                    Quantity Needed (kits) <span className="text-crimson">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(e.target.value)}
                    required
                    className="w-full h-11 px-3.5 bg-white border border-line-soft rounded-xl text-sm font-mono outline-none focus:border-crimson"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-ink-soft mb-1.5">
                    Request Closes At <span className="text-crimson">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formClosesAt}
                    onChange={(e) => setFormClosesAt(e.target.value)}
                    required
                    className="w-full h-11 px-3.5 bg-white border border-line-soft rounded-xl text-sm outline-none focus:border-crimson"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-ink-soft mb-1.5">
                    Optional Note
                  </label>
                  <textarea
                    rows={3}
                    value={formNote}
                    onChange={(e) => setFormNote(e.target.value)}
                    placeholder="Provide any clinical context or emergency details for centers..."
                    className="w-full px-3.5 py-2.5 bg-white border border-line-soft rounded-xl text-sm outline-none focus:border-crimson resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-line-soft">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="px-5 py-2.5 border border-line-soft text-ink-soft hover:text-ink hover:bg-paper rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={submitting}
                    loadingText="Submitting..."
                    className="px-5 py-2.5 bg-crimson hover:bg-crimson-dark text-white rounded-xl text-xs font-semibold"
                  >
                    Submit Request
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Accepted Centers Modal */}
        {centersModalOpen && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs">
            <div className="bg-white border border-line-soft rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto no-scrollbar">
              <div className="flex items-center justify-between pb-4 border-b border-line-soft">
                <div>
                  <h3 className="font-serif font-bold text-xl text-ink">
                    Accepted Blood Centers
                  </h3>
                  <p className="text-xs text-ink-soft mt-0.5">
                    Blood Type: <span className="font-mono font-bold text-crimson">{selectedRequest.bloodType}</span> | Needed: <span className="font-mono font-bold">{selectedRequest.quantityNeeded} kits</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCentersModalOpen(false)}
                  className="p-1.5 text-ink-soft hover:text-ink rounded-lg hover:bg-paper-dim"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {centersLoading ? (
                <div className="py-8">
                  <LoadingState text="Loading accepted centers..." />
                </div>
              ) : acceptedCenters.length === 0 ? (
                <div className="p-8 text-center bg-paper/40 border border-line-soft rounded-xl space-y-1">
                  <p className="text-sm font-sans font-semibold text-ink">No Blood Centers have accepted yet</p>
                  <p className="text-xs text-ink-soft">
                    Centers notified within radius are reviewing the request. Check back soon.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {acceptedCenters.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 bg-paper/60 border border-line-soft rounded-xl space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-serif font-bold text-base text-ink">{c.centerName}</h4>
                          {c.respondedAt && (
                            <p className="text-[10px] font-mono text-ink-soft">
                              Accepted on {formatDate(c.respondedAt)}
                            </p>
                          )}
                        </div>
                        <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-verified/10 text-verified border border-verified/20 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Accepted
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-ink">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-ink-soft" />
                          <span className="font-mono">{c.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-ink-soft" />
                          <span>{c.email}</span>
                        </div>
                      </div>

                      {/* Location & Google Maps Link */}
                      <div className="pt-2 border-t border-line-soft/80">
                        <LocationLink location={c.location || { address: c.address, coordinates: c.coordinates ? [c.coordinates.lng, c.coordinates.lat] : undefined, mapsUrl: c.mapsUrl }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end pt-3 border-t border-line-soft">
                <button
                  type="button"
                  onClick={() => setCentersModalOpen(false)}
                  className="px-5 py-2 bg-ink text-white rounded-xl text-xs font-semibold hover:bg-ink/90 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default HospitalBloodCenterRequestsPage;
