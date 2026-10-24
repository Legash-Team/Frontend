import React, { useState, useEffect } from 'react';
import { BloodCenterLayout } from '@/layouts/BloodCenterLayout';
import Button from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  fetchIncomingBloodCenterRequests,
  respondToBloodCenterRequest,
  type IncomingBloodCenterRequest,
} from '@/features/hospital/api/bloodCenterRequestApi';
import {
  Inbox,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { useDialog } from '@/context/DialogContext';

export const BloodCenterIncomingRequestsPage: React.FC = () => {
  const { confirm, toast } = useDialog();

  const [requests, setRequests] = useState<IncomingBloodCenterRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  const loadRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchIncomingBloodCenterRequests();
      setRequests(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load incoming hospital requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleRespond = async (requestId: string, status: 'accepted' | 'denied') => {
    const actionLabel = status === 'accepted' ? 'Accept' : 'Deny';
    const ok = await confirm({
      title: `${actionLabel} Blood Request`,
      message: `Are you sure you want to ${status} this request from the hospital? Once accepted, your facility contact details and location will be shared with the hospital.`,
      type: status === 'accepted' ? 'info' : 'danger',
      confirmText: actionLabel,
    });
    if (!ok) return;

    setRespondingId(requestId);
    try {
      await respondToBloodCenterRequest(requestId, status);
      toast.success(`Request ${status} successfully.`);
      loadRequests();
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || `Failed to ${status} request.`);
    } finally {
      setRespondingId(null);
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
    <BloodCenterLayout
      title="Incoming Hospital Requests"
      icon={<Inbox size={16} className="stroke-[1.75]" />}
    >
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line-soft">
          <div>
            <h1 className="text-2xl font-serif font-bold text-ink tracking-tight flex items-center gap-2.5">
              <Inbox className="w-6 h-6 text-crimson" />
              Incoming Hospital Requests
            </h1>
            <p className="text-sm font-sans text-ink-soft mt-1">
              Hospitals in your geographic radius requesting emergency or bulk blood supplies.
            </p>
          </div>

          <button
            type="button"
            onClick={loadRequests}
            className="p-2.5 border border-line-soft rounded-xl text-ink-soft hover:text-ink hover:bg-paper transition-colors self-start sm:self-auto"
            title="Refresh requests"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-line-soft p-12">
            <LoadingState text="Checking for incoming hospital requests..." />
          </div>
        ) : error ? (
          <ErrorState
            title="Error Loading Requests"
            message={error}
            retryLabel="Try Again"
            onRetry={loadRequests}
          />
        ) : requests.length === 0 ? (
          <EmptyState
            icon={<Inbox className="w-12 h-12 text-ink-soft/40" />}
            title="No Incoming Requests"
            description="There are currently no open blood requests from nearby hospitals."
          />
        ) : (
          <div className="space-y-4">
            {requests.map((r) => {
              const isPending = r.responseStatus === 'pending';
              const isAccepted = r.responseStatus === 'accepted';
              const isProcessing = respondingId === r.requestId;

              return (
                <div
                  key={r.requestId}
                  className="bg-white border border-line-soft rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 hover:border-line-soft/80 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-crimson/10 text-crimson">
                          {r.bloodType}
                        </span>
                        <span className="font-serif font-bold text-lg text-ink">
                          {r.quantityNeeded} <span className="text-sm font-sans font-normal text-ink-soft">kits requested</span>
                        </span>
                      </div>
                      <p className="text-xs font-mono text-ink-soft">
                        Received: {formatDate(r.createdAt)}
                      </p>
                    </div>

                    <div>
                      {isPending ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-mono font-semibold">
                          <Clock className="w-3.5 h-3.5" /> Awaiting Your Response
                        </span>
                      ) : isAccepted ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-verified/10 text-verified border border-verified/20 text-xs font-mono font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-paper text-ink-soft border border-line-soft text-xs font-mono font-semibold">
                          <XCircle className="w-3.5 h-3.5" /> Denied
                        </span>
                      )}
                    </div>
                  </div>

                  {r.note && (
                    <div className="p-3 bg-paper/60 border border-line-soft rounded-xl text-xs text-ink leading-relaxed">
                      <span className="font-mono font-bold text-[10px] uppercase text-ink-soft block mb-0.5">
                        Hospital Note:
                      </span>
                      {r.note}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-line-soft text-xs font-mono text-ink-soft">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Closes: {formatDate(r.closesAt)}</span>
                    </div>

                    {isPending ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleRespond(r.requestId, 'denied')}
                          className="px-4 py-2 border border-line-soft hover:bg-paper text-ink-soft hover:text-ink rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          Deny
                        </button>
                        <Button
                          type="button"
                          variant="primary"
                          disabled={isProcessing}
                          isLoading={isProcessing}
                          loadingText="Responding..."
                          onClick={() => handleRespond(r.requestId, 'accepted')}
                          className="px-5 py-2 bg-verified hover:bg-verified/90 text-white rounded-xl text-xs font-semibold"
                        >
                          Accept Request
                        </Button>
                      </div>
                    ) : (
                      <div className="text-[11px]">
                        Responded on {formatDate(r.respondedAt || r.createdAt)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </BloodCenterLayout>
  );
};

export default BloodCenterIncomingRequestsPage;
