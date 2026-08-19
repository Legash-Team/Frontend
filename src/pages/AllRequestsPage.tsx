import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { getBloodRequests } from '../api/hospital-api';
import type { BloodRequest, AcceptedDonor } from '../types/hospital-types';
import {
  ClipboardList,
  AlertTriangle,
  Clock,
  Plus,
  RefreshCw,
  AlertCircle,
  Calendar,
  Layers,
  User,
  Phone,
  Mail,
  X,
  Eye,
  CheckCircle2,
} from 'lucide-react';

export const AllRequestsPage: React.FC = () => {
  type FilterOption = 'All' | 'Emergency' | 'Standard';
  const [filter, setFilter] = useState<FilterOption>('All');
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Details Modal State
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);

  const fetchRequests = async (activeFilter: FilterOption) => {
    setLoading(true);
    setError(null);
    try {
      // Map UI "Standard" filter to backend "Normal" type
      const backendFilter = activeFilter === 'Standard' ? 'Normal' : activeFilter === 'Emergency' ? 'Emergency' : 'All';
      const data = await getBloodRequests(backendFilter);
      let list: BloodRequest[] = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data && typeof data === 'object') {
        const raw = data as Record<string, unknown>;
        if (Array.isArray(raw.requests)) {
          list = raw.requests as BloodRequest[];
        } else if (Array.isArray(raw.data)) {
          list = raw.data as BloodRequest[];
        }
      }

      // If backend does not filter server-side when 'All' is not selected, apply client fallback
      if (activeFilter === 'Emergency') {
        list = list.filter((r) => r.requestType === 'Emergency');
      } else if (activeFilter === 'Standard') {
        list = list.filter((r) => r.requestType === 'Normal' || (r.requestType as string) === 'Standard');
      }

      setRequests(list);
    } catch (err: unknown) {
      let message = 'Failed to load blood requests.';
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string; error?: string } } };
        message = axiosErr.response?.data?.message || axiosErr.response?.data?.error || message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(filter);
  }, [filter]);

  const formatDate = (isoString?: string): string => {
    if (!isoString) return 'N/A';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const getDisplayRequestType = (type: string) => {
    if (type === 'Normal') return 'Standard';
    return type;
  };

  const getStatusBadge = (status: string) => {
    const s = (status || 'ACTIVE').toUpperCase();
    switch (s) {
      case 'ACCEPTED':
      case 'FULFILLED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-verified/10 text-verified border border-verified/20">
            <CheckCircle2 className="w-3 h-3" />
            <span>{s}</span>
          </span>
        );
      case 'CLOSED':
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-paper-dim text-ink-soft border border-line-soft">
            <span>{s}</span>
          </span>
        );
      case 'EMERGENCY':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-crimson/10 text-crimson border border-crimson/20">
            <AlertTriangle className="w-3 h-3" />
            <span>{s}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3" />
            <span>{s}</span>
          </span>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-line-soft">
          <div>
            <h1 className="text-2xl font-serif font-bold text-ink tracking-tight flex items-center gap-2.5">
              <ClipboardList className="w-6 h-6 text-crimson stroke-[1.75]" />
              <span>All Blood Requests</span>
            </h1>
            <p className="text-sm font-sans text-ink-soft mt-1">
              Review and monitor all active, fulfilled, and emergency blood requisitions.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => fetchRequests(filter)}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-paper hover:bg-paper-dim border border-line-soft text-ink-soft rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <Link
              to="/hospital/blood-request"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-crimson hover:bg-crimson-dark text-white rounded-xl font-sans font-semibold text-xs transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>New Blood Request</span>
            </Link>
          </div>
        </div>

        {/* Exactly Three Filters: All | Emergency | Standard */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-line-soft shadow-xs">
          <div className="flex items-center gap-1 p-1 bg-paper rounded-xl border border-line-soft">
            <button
              type="button"
              onClick={() => setFilter('All')}
              className={`px-5 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all ${filter === 'All'
                  ? 'bg-ink text-white shadow-xs'
                  : 'text-ink-soft hover:text-ink hover:bg-paper-dim'
                }`}
            >
              All
            </button>

            <button
              type="button"
              onClick={() => setFilter('Emergency')}
              className={`px-5 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${filter === 'Emergency'
                  ? 'bg-crimson text-white shadow-xs'
                  : 'text-crimson hover:bg-crimson/10'
                }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Emergency</span>
            </button>

            <button
              type="button"
              onClick={() => setFilter('Standard')}
              className={`px-5 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all ${filter === 'Standard'
                  ? 'bg-ink-soft text-white shadow-xs'
                  : 'text-ink-soft hover:text-ink hover:bg-paper-dim'
                }`}
            >
              Not Urgent
            </button>
          </div>

          <div className="text-xs font-mono text-ink-soft px-2">
            Showing <span className="font-bold text-ink">{requests.length}</span> request{requests.length === 1 ? '' : 's'}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl p-16 text-center border border-line-soft shadow-xs">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-crimson border-t-transparent"></div>
            <p className="mt-3 text-sm font-sans text-ink-soft font-medium">Fetching blood requisitions...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-crimson/5 border border-crimson/20 rounded-xl p-4 text-ink text-sm flex items-start justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-crimson shrink-0 stroke-[1.75]" />
              <div>
                <p className="font-serif font-bold text-ink">Unable to load requests</p>
                <p className="text-crimson text-xs mt-0.5 font-sans">{error}</p>
              </div>
            </div>
            <button
              onClick={() => fetchRequests(filter)}
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider bg-crimson/10 hover:bg-crimson/20 text-crimson px-3 py-1.5 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && requests.length === 0 && (
          <div className="bg-white rounded-2xl p-16 text-center border border-line-soft shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-paper-dim flex items-center justify-center mx-auto text-ink-soft">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-ink">No blood requests found.</h3>
              <p className="text-xs text-ink-soft mt-1 font-sans max-w-sm mx-auto">
                {filter === 'All'
                  ? 'Your facility has not broadcast any blood requisitions yet.'
                  : `No ${filter.toLowerCase()} blood requests found.`}
              </p>
            </div>
            <Link
              to="/hospital/blood-request"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-crimson hover:bg-crimson-dark text-white rounded-xl font-sans font-semibold text-xs transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Request</span>
            </Link>
          </div>
        )}

        {/* Requests Grid */}
        {!loading && !error && requests.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {requests.map((req, idx) => {
              const isEmergency = req.requestType === 'Emergency';
              const donorsCount = req.acceptedDonors ? req.acceptedDonors.length : 0;
              const displayType = getDisplayRequestType(req.requestType);

              return (
                <div
                  key={req.id || idx}
                  className={`bg-white rounded-2xl border transition-all p-5 flex flex-col justify-between space-y-4 ${isEmergency
                      ? 'border-crimson/30 hover:border-crimson shadow-xs'
                      : 'border-line-soft hover:border-line shadow-xs'
                    }`}
                >
                  <div className="space-y-3">
                    {/* Top Row: Blood Group Badge & Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-bold text-white bg-crimson px-3 py-1 rounded-lg shadow-xs">
                          {req.bloodType}
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${isEmergency
                              ? 'bg-crimson/10 text-crimson border border-crimson/20'
                              : 'bg-paper text-ink-soft border border-line-soft'
                            }`}
                        >
                          {displayType}
                        </span>
                      </div>

                      {getStatusBadge(req.status)}
                    </div>

                    {/* Quantity and Details */}
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-serif font-bold text-ink">
                          {req.quantity}
                        </span>
                        <span className="text-xs font-mono text-ink-soft font-medium">
                          kits requested
                        </span>
                      </div>

                      {req.description && (
                        <p className="text-xs font-sans text-ink-soft mt-2 line-clamp-2 leading-relaxed">
                          {req.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Metadata and Actions */}
                  <div className="space-y-3 pt-3 border-t border-line-soft text-xs text-ink-soft font-sans">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1 text-ink-soft/70">
                        <Calendar className="w-3.5 h-3.5 text-ink-soft/50" />
                        Created:
                      </span>
                      <span className="font-mono text-ink">{formatDate(req.createdAt)}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1 text-ink-soft/70">
                        <Clock className="w-3.5 h-3.5 text-crimson/70" />
                        Closes:
                      </span>
                      <span className="font-mono text-crimson font-medium">
                        {formatDate(req.closingDateTime)}
                      </span>
                    </div>

                    {donorsCount > 0 && (
                      <div className="p-2 bg-verified/5 border border-verified/15 rounded-lg flex items-center justify-between text-[11px]">
                        <span className="text-verified font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Accepted Donors:
                        </span>
                        <span className="font-mono font-bold text-verified">
                          {donorsCount} volunteer{donorsCount === 1 ? '' : 's'}
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setSelectedRequest(req)}
                      className="w-full mt-2 py-2 px-3 bg-paper hover:bg-paper-dim border border-line-soft text-ink rounded-xl font-sans font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-crimson" />
                      <span>View Full Requisition Details</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Request Details & Accepted Donors Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-line-soft rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto no-scrollbar">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-line-soft">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-mono font-bold text-white bg-crimson px-2.5 py-0.5 rounded">
                    {selectedRequest.bloodType}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${selectedRequest.requestType === 'Emergency'
                        ? 'bg-crimson/10 text-crimson border border-crimson/20'
                        : 'bg-paper text-ink-soft border border-line-soft'
                      }`}
                  >
                    {getDisplayRequestType(selectedRequest.requestType)}
                  </span>
                  {getStatusBadge(selectedRequest.status)}
                </div>
                <h3 className="font-serif font-bold text-xl text-ink">
                  Requisition #{selectedRequest.id ? selectedRequest.id.slice(-8) : 'DETAILS'}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="p-1.5 text-ink-soft hover:text-ink rounded-lg hover:bg-paper-dim"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Request Summary Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-paper/60 border border-line-soft rounded-xl space-y-1">
                <span className="text-ink-soft/70 font-mono uppercase text-[10px] block">
                  Required Kits
                </span>
                <p className="text-base font-serif font-bold text-ink">
                  {selectedRequest.quantity} units / kits
                </p>
              </div>

              <div className="p-3.5 bg-paper/60 border border-line-soft rounded-xl space-y-1">
                <span className="text-ink-soft/70 font-mono uppercase text-[10px] block">
                  Requisition Priority
                </span>
                <p className="text-base font-sans font-semibold text-ink">
                  {getDisplayRequestType(selectedRequest.requestType)} Requisition
                </p>
              </div>

              <div className="p-3.5 bg-paper/60 border border-line-soft rounded-xl space-y-1">
                <span className="text-ink-soft/70 font-mono uppercase text-[10px] block">
                  Created Date & Time
                </span>
                <p className="font-mono text-ink font-medium">
                  {formatDate(selectedRequest.createdAt)}
                </p>
              </div>

              <div className="p-3.5 bg-crimson/5 border border-crimson/15 rounded-xl space-y-1">
                <span className="text-crimson font-mono uppercase text-[10px] block">
                  Closing Date & Time
                </span>
                <p className="font-mono text-crimson font-bold">
                  {formatDate(selectedRequest.closingDateTime)}
                </p>
              </div>
            </div>

            {/* Clinical Description */}
            {selectedRequest.description && (
              <div className="p-4 bg-paper/40 border border-line-soft rounded-xl space-y-1.5">
                <span className="text-[11px] font-mono font-bold uppercase text-ink-soft tracking-wider block">
                  Clinical Notes & Description
                </span>
                <p className="text-xs font-sans text-ink leading-relaxed">
                  {selectedRequest.description}
                </p>
              </div>
            )}

            {/* Accepted Donors Section */}
            <div className="space-y-3 pt-4 border-t border-line-soft">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-ink text-sm flex items-center gap-2">
                  <User className="w-4 h-4 text-crimson" />
                  <span>Accepted Donor Responses</span>
                </h4>
                <span className="text-xs font-mono text-ink-soft font-bold">
                  {selectedRequest.acceptedDonors ? selectedRequest.acceptedDonors.length : 0} accepted
                </span>
              </div>

              {selectedRequest.acceptedDonors && selectedRequest.acceptedDonors.length > 0 ? (
                <div className="space-y-2.5">
                  {selectedRequest.acceptedDonors.map((donor: AcceptedDonor, dIdx: number) => (
                    <div
                      key={donor.id || dIdx}
                      className="p-3.5 bg-paper/60 border border-line-soft rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold font-sans text-ink">{donor.name}</span>
                          {donor.bloodType && (
                            <span className="font-mono text-[10px] bg-crimson/10 text-crimson px-2 py-0.5 rounded font-bold">
                              {donor.bloodType}
                            </span>
                          )}
                        </div>
                        {donor.acceptedAt && (
                          <p className="text-[10px] text-ink-soft/70 font-mono">
                            Accepted: {formatDate(donor.acceptedAt)}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-ink-soft text-xs">
                        {donor.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-ink-soft/60" />
                            <span className="font-mono">{donor.phone}</span>
                          </div>
                        )}
                        {donor.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-ink-soft/60" />
                            <span>{donor.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-paper/40 border border-line-soft rounded-xl text-center space-y-1">
                  <p className="text-xs font-sans text-ink-soft font-medium">
                    No donor responses recorded yet.
                  </p>
                  <p className="text-[11px] font-sans text-ink-soft/60">
                    Emergency notifications have been broadcast across the network.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Close Button */}
            <div className="flex justify-end pt-3 border-t border-line-soft">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="px-5 py-2 bg-ink text-white rounded-xl text-xs font-sans font-semibold hover:bg-ink/90 transition-colors"
              >
                Close Requisition
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AllRequestsPage;
