import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/layouts/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  Mail, 
  Phone, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Activity,
  Sparkles,
  RefreshCw,
  PieChart,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { fetchPendingHospitals, approveHospital, rejectHospital } from './api/admin-api';
import { useDialog } from '@/context/DialogContext';
import { useAuth } from '@/features/auth/context/AuthContext';

interface PendingHospitalLocation {
  address?: string;
  lat?: number | string;
  lng?: number | string;
}

interface PendingHospital {
  id: string;
  hospitalName: string;
  licenseNumber: string;
  email: string;
  phone: string;
  createdAt?: string;
  location?: PendingHospitalLocation | null;
}

// admin-api throws plain strings (server message or fallback); normalize anything else to a readable message
const getErrorMessage = (err: unknown, fallback: string): string => {
  if (typeof err === 'string' && err.trim()) return err;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
};

const DashboardPage = () => {
  const { toast } = useDialog();
  const { user } = useAuth();
  // --- STATE FOR INTEGRATED FUNCTIONALITY ---
  const [hospitals, setHospitals] = useState<PendingHospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedHosp, setSelectedHosp] = useState<PendingHospital | null>(null);
  const [showRejectStep, setShowRejectStep] = useState(false);
  const [rejectionReason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // --- API CALL: FETCH PENDING ---
  const loadPendingHospitals = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPendingHospitals();
      if (res.success && Array.isArray(res.hospitals)) {
        setHospitals(res.hospitals);
      } else {
        setHospitals([]);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to fetch pending applications.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingHospitals();
  }, []);

  // --- ACTIONS ---
  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await approveHospital(id);
      if (res.success) {
        setHospitals(prev => prev.filter(h => h.id !== id));
        setSelectedHosp(null);
        toast.success('Hospital approved successfully! An approval email has been sent.');
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to approve hospital.'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      toast.warning('Please provide a rejection reason.');
      return;
    }
    setActionLoading(true);
    try {
      const res = await rejectHospital(id, rejectionReason.trim());
      if (res.success) {
        setHospitals(prev => prev.filter(h => h.id !== id));
        setSelectedHosp(null);
        setShowRejectStep(false);
        setReason('');
        toast.success('Hospital registration declined.');
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to reject hospital.'));
    } finally {
      setActionLoading(false);
    }
  };

  const getDisplayTime = (isoString?: string) => {
    if (!isoString) return 'New Case';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return 'New Case';
    }
  };

  return (
    <AdminLayout title="System Overview">
      <div className="space-y-6">

        {/* PAGE HEADER — matches the hospital dashboard header structure */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-line-soft gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-ink tracking-tight flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-crimson stroke-[1.75]" />
              <span>System Overview</span>
            </h1>
            <p className="text-sm font-sans text-ink-soft mt-1">
              Review pending hospital applications and keep the Legash facility network verified.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/hospital-analytics"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-paper hover:bg-paper-dim border border-line-soft text-ink-soft rounded-xl text-xs font-sans font-semibold transition-colors"
            >
              <PieChart className="w-4 h-4 text-ink-soft stroke-[1.75]" />
              <span>View Analytics</span>
            </Link>
          </div>
        </div>

        {/* WELCOME BANNER — hospital portal gradient + pill badge + CTA pattern */}
        <div className="bg-gradient-to-r from-crimson via-crimson to-crimson-dark rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="space-y-2 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-[11px] font-mono font-bold uppercase tracking-wider text-red-100 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 stroke-[1.75]" />
              <span>Legash Admin Console</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-white">
              Welcome, {user?.name || 'Administrator'}
            </h2>
            <p className="text-sm font-sans text-red-100 max-w-2xl leading-relaxed">
              Approve or reject hospital applications based on their submitted information, provide a reason when declining, and keep the verification queue moving across Ethiopia.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 z-10">
            <button
              type="button"
              onClick={loadPendingHospitals}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-crimson hover:bg-paper font-sans font-bold rounded-xl text-xs transition-all shadow-sm disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 text-crimson stroke-[1.75] ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Queue</span>
            </button>
          </div>
        </div>

        {/* STATS STRIP — bordered cards with mono labels + status chips */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AdminStatCard
            label="Pending Approval"
            value={loading ? '...' : String(hospitals.length)}
            icon={<Clock />}
            chip={
              loading
                ? { text: 'Loading', tone: 'verified' }
                : hospitals.length === 0
                  ? { text: 'Clear', tone: 'verified' }
                  : { text: 'Awaiting', tone: 'crimson' }
            }
          />
          <AdminStatCard label="System Integrity" value="Active" icon={<ShieldCheck />} chip={{ text: 'Secure', tone: 'verified' }} />
          <AdminStatCard label="Portal Status" value="Online" icon={<Activity />} chip={{ text: 'Live', tone: 'verified' }} />
        </div>

        {/* LIST HEADER — shared section-header pattern */}
        <div className="flex items-center justify-between border-b border-line-soft pb-4 gap-4">
          <div>
            <h2 className="text-base font-serif font-bold text-ink flex items-center gap-2">
              <Building2 className="w-5 h-5 text-crimson stroke-[1.75]" />
              <span>Facility Verification Queue</span>
            </h2>
            <p className="text-xs font-sans text-ink-soft mt-0.5">
              New hospital registrations waiting for approval or a rejection reason.
            </p>
          </div>
          {!loading && !error && (
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-ink-soft bg-paper border border-line-soft px-2.5 py-1 rounded-lg whitespace-nowrap">
              {hospitals.length} pending
            </span>
          )}
        </div>

        {/* LOADING & ERROR STATES */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-line-soft shadow-xs">
            <LoadingState text="Loading verification queue..." />
          </div>
        ) : error ? (
          <ErrorState
            title="Failed to load queue"
            message={error}
            onRetry={loadPendingHospitals}
          />
        ) : hospitals.length > 0 ? (
          /* HOSPITAL CARDS GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hospitals.map((hosp) => (
              <motion.div
                layoutId={hosp.id}
                key={hosp.id}
                onClick={() => setSelectedHosp(hosp)}
                className="bg-white border border-line-soft rounded-2xl p-6 hover:shadow-md hover:border-crimson/20 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-xl bg-paper flex items-center justify-center text-ink-soft group-hover:bg-crimson group-hover:text-white transition-colors">
                    <Building2 size={20} />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-ink-soft/40 bg-paper px-2 py-1 rounded">
                    {getDisplayTime(hosp.createdAt)}
                  </span>
                </div>
                <h4 className="text-lg font-serif font-bold text-ink mb-1">{hosp.hospitalName}</h4>
                <p className="text-xs font-mono text-ink-soft uppercase">{hosp.licenseNumber}</p>
                <div className="mt-6 pt-4 border-t border-line-soft flex items-center justify-between text-crimson font-bold text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Inspect Application <ChevronRight size={14} />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-line-soft">
            <div className="w-12 h-12 mx-auto rounded-xl bg-verified/10 flex items-center justify-center text-verified mb-3">
              <CheckCircle2 size={24} className="stroke-[1.75]" />
            </div>
            <p className="text-ink-soft font-serif italic text-lg">Verification queue is currently empty.</p>
            <p className="text-xs font-sans text-ink-soft/70 mt-1">New hospital applications will appear here for review.</p>
          </div>
        )}
      </div>

      {/* --- CENTERED INSPECTION MODAL --- */}
      <AnimatePresence>
        {selectedHosp && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { if (!actionLoading) { setSelectedHosp(null); setShowRejectStep(false); } }}
              className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
            />
            
            {/* Modal Card */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-line-soft w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-5 sm:p-8 border-b border-line-soft flex justify-between items-center bg-paper/30 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-crimson/10 flex items-center justify-center text-crimson shrink-0">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-serif font-bold text-ink leading-none">Verification Review</h3>
                    <p className="text-[10px] font-mono font-bold text-ink-soft/50 uppercase mt-1 tracking-widest">Case ID: {selectedHosp.id.toUpperCase()}</p>
                  </div>
                </div>
                <button disabled={actionLoading} onClick={() => { setSelectedHosp(null); setShowRejectStep(false); }} className="p-2 hover:bg-white rounded-full text-ink-soft transition-colors"><X size={20} /></button>
              </div>

              {/* Modal Content */}
              <div className="p-6 sm:p-8 md:p-12 overflow-y-auto no-scrollbar flex-1">
                {!showRejectStep ? (
                  <>
                    <div className="grid md:grid-cols-2 gap-6 sm:gap-10">
                      <div className="space-y-5 sm:space-y-6">
                        <DetailItem label="Legal Entity" value={selectedHosp.hospitalName} icon={<Building2 />} />
                        <DetailItem label="Medical License" value={selectedHosp.licenseNumber} icon={<Activity />} />
                        <DetailItem label="Contact Email" value={selectedHosp.email} icon={<Mail />} />
                      </div>
                      <div className="space-y-5 sm:space-y-6">
                        <DetailItem label="Phone Line" value={selectedHosp.phone} icon={<Phone />} />
                        <DetailItem label="Facility Address" value={selectedHosp.location?.address || 'N/A'} icon={<MapPin />} />
                        {selectedHosp.location && (
                          <div className="p-3.5 sm:p-4 bg-paper rounded-2xl border border-line-soft">
                            <p className="text-[9px] font-mono font-bold text-ink-soft/40 uppercase mb-1">Geolocation</p>
                            <p className="text-xs font-bold text-ink font-mono">{selectedHosp.location.lat}, {selectedHosp.location.lng}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <Button 
                        variant="ghost" 
                        disabled={actionLoading}
                        onClick={() => setShowRejectStep(true)}
                        className="flex-1 border border-crimson/20 text-crimson hover:bg-crimson/5 text-xs font-bold uppercase tracking-widest h-12 sm:h-14 rounded-2xl"
                      >
                        Decline Application
                      </Button>
                      <Button 
                        variant="primary" 
                        disabled={actionLoading}
                        onClick={() => handleApprove(selectedHosp.id)}
                        className="flex-1 h-12 sm:h-14 rounded-2xl font-bold flex gap-2 items-center justify-center text-xs uppercase tracking-wider"
                      >
                        <CheckCircle2 size={18} /> Approve Facility
                      </Button>
                    </div>
                  </>
                ) : (
                  /* REJECTION STEP */
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <div className="flex items-center gap-3 text-crimson">
                      <AlertCircle size={24} />
                      <h3 className="text-lg sm:text-xl font-serif font-bold">Reason for Rejection</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-ink-soft">This message will be sent to the hospital. Please be specific (e.g., "License document is blurry").</p>
                    <textarea 
                      autoFocus
                      disabled={actionLoading}
                      className="w-full h-36 sm:h-40 p-4 sm:p-5 bg-paper border border-line-soft rounded-2xl outline-none focus:border-crimson text-sm resize-none"
                      placeholder="Write your reason here..."
                      value={rejectionReason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                    <div className="flex gap-3 sm:gap-4">
                      <Button variant="ghost" disabled={actionLoading} onClick={() => setShowRejectStep(false)} className="flex-1 h-12 rounded-xl">Back</Button>
                      <Button 
                        variant="primary" 
                        disabled={!rejectionReason || actionLoading}
                        onClick={() => handleConfirmReject(selectedHosp.id)}
                        className="flex-1 h-12 rounded-xl font-bold justify-center text-xs"
                      >
                        Confirm Rejection
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

// --- HELPERS ---
interface StatChip {
  text: string;
  tone: 'crimson' | 'verified';
}

const AdminStatCard = ({ label, value, icon, chip }: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactElement;
  chip: StatChip;
}) => (
  <div className="bg-white rounded-2xl border border-line-soft shadow-xs p-6 space-y-4">
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 text-ink-soft/60">
        {React.cloneElement(icon as React.ReactElement<{ size?: number; className?: string }>, { size: 16, className: 'w-4 h-4 stroke-[1.75]' })}
        <span className="text-[10px] font-mono font-bold text-ink-soft/60 uppercase tracking-widest">{label}</span>
      </div>
      <span
        className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
          chip.tone === 'verified' ? 'bg-verified/10 text-verified' : 'bg-crimson/10 text-crimson'
        }`}
      >
        {chip.text}
      </span>
    </div>
    <p className="text-2xl font-serif font-bold text-ink tracking-tight">{value}</p>
  </div>
);

const DetailItem = ({ label, value, icon }: { label: string; value: React.ReactNode; icon: React.ReactElement }) => (
  <div className="flex gap-4 items-start">
    <div className="text-crimson mt-1">{React.cloneElement(icon as React.ReactElement<{ size?: number }>, { size: 18 })}</div>
    <div>
      <p className="text-[9px] font-mono font-bold text-ink-soft/50 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm font-bold text-ink leading-tight">{value}</p>
    </div>
  </div>
);

export default DashboardPage;