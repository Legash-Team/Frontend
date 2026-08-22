import React, { useState, useEffect } from 'react';
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
  Activity
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { fetchPendingHospitals, approveHospital, rejectHospital } from './api/admin-api';

const DashboardPage = () => {
  // --- STATE FOR INTEGRATED FUNCTIONALITY ---
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedHosp, setSelectedHosp] = useState<any | null>(null);
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
    } catch (err: any) {
      setError(err || 'Failed to fetch pending list.');
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
        alert('Hospital approved successfully!');
      }
    } catch (err: any) {
      alert(err || 'Failed to approve hospital.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason.');
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
        alert('Hospital rejected successfully.');
      }
    } catch (err: any) {
      alert(err || 'Failed to reject hospital.');
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
      <div className="space-y-8">
        
        {/* WELCOME BANNER */}
        <div className="bg-crimson rounded-3xl p-8 text-paper shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-crimson/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <h2 className="text-3xl font-serif font-bold tracking-tight">System Command Center</h2>
            <p>Approves or rejects hospital based on their information, gives reasons if it was rejected and posts upcoming events across Ethiopia.</p>
          </div>
        </div>

        {/* STATS STRIP */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <AdminStatCard label="Pending Approval" value={loading ? '...' : hospitals.length} icon={<Clock />} color="text-amber-500" />
           <AdminStatCard label="System Integrity" value="Active" icon={<ShieldCheck />} color="text-verified" />
           <AdminStatCard label="Portal Status" value="Online" icon={<Activity />} color="text-crimson" />
        </div>

        {/* LIST HEADER */}
        <div className="flex items-center justify-between border-b border-line-soft pb-4">
           <h3 className="text-sm font-mono font-bold text-ink-soft uppercase tracking-widest flex items-center gap-2">
             <Building2 size={16} className="text-crimson" /> Facility Verification Queue
           </h3>
        </div>

        {/* LOADING & ERROR STATES */}
        {loading ? (
          <div className="py-20 text-center bg-white rounded-[32px] border border-line-soft shadow-xs">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-crimson border-t-transparent" />
            <p className="mt-4 text-sm text-ink-soft font-medium">Loading verification queue...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-crimson/5 border border-crimson/25 rounded-3xl text-crimson text-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle size={24} />
              <div>
                <p className="font-bold">Failed to load queue</p>
                <p className="text-xs opacity-75 mt-0.5">{error}</p>
              </div>
            </div>
            <button onClick={loadPendingHospitals} className="px-4 py-2 bg-crimson text-white rounded-xl text-xs font-bold uppercase">Retry</button>
          </div>
        ) : hospitals.length > 0 ? (
          /* HOSPITAL CARDS GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hospitals.map((hosp) => (
              <motion.div
                layoutId={hosp.id}
                key={hosp.id}
                onClick={() => setSelectedHosp(hosp)}
                className="bg-white border border-line-soft rounded-[24px] p-6 hover:shadow-xl hover:border-crimson/20 transition-all cursor-pointer group"
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
          <div className="py-20 text-center bg-white rounded-[32px] border border-dashed border-line-soft">
            <p className="text-ink-soft font-serif italic text-lg">Verification queue is currently empty.</p>
          </div>
        )}
      </div>

      {/* --- CENTERED INSPECTION MODAL --- */}
      <AnimatePresence>
        {selectedHosp && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
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
              className="relative bg-white rounded-[40px] shadow-2xl border border-line-soft w-full max-w-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-8 border-b border-line-soft flex justify-between items-center bg-paper/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-crimson/10 flex items-center justify-center text-crimson">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-bold text-ink leading-none">Verification Review</h3>
                    <p className="text-[10px] font-mono font-bold text-ink-soft/50 uppercase mt-1 tracking-widest">Case ID: {selectedHosp.id.toUpperCase()}</p>
                  </div>
                </div>
                <button disabled={actionLoading} onClick={() => { setSelectedHosp(null); setShowRejectStep(false); }} className="p-2 hover:bg-white rounded-full text-ink-soft transition-colors"><X size={20} /></button>
              </div>

              {/* Modal Content */}
              <div className="p-8 md:p-12">
                {!showRejectStep ? (
                  <>
                    <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <DetailItem label="Legal Entity" value={selectedHosp.hospitalName} icon={<Building2 />} />
                        <DetailItem label="Medical License" value={selectedHosp.licenseNumber} icon={<Activity />} />
                        <DetailItem label="Contact Email" value={selectedHosp.email} icon={<Mail />} />
                      </div>
                      <div className="space-y-6">
                        <DetailItem label="Phone Line" value={selectedHosp.phone} icon={<Phone />} />
                        <DetailItem label="Facility Address" value={selectedHosp.location?.address || 'N/A'} icon={<MapPin />} />
                        {selectedHosp.location && (
                          <div className="p-4 bg-paper rounded-2xl border border-line-soft">
                            <p className="text-[9px] font-mono font-bold text-ink-soft/40 uppercase mb-1">Geolocation</p>
                            <p className="text-xs font-bold text-ink">{selectedHosp.location.lat}, {selectedHosp.location.lng}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="mt-12 flex gap-4">
                      <Button 
                        variant="ghost" 
                        disabled={actionLoading}
                        onClick={() => setShowRejectStep(true)}
                        className="flex-1 border-line-soft text-crimson hover:bg-crimson/5 text-xs font-bold uppercase tracking-widest h-14 rounded-2xl"
                      >
                        Decline Application
                      </Button>
                      <Button 
                        variant="primary" 
                        disabled={actionLoading}
                        onClick={() => handleApprove(selectedHosp.id)}
                        className="flex-1 h-14 rounded-2xl font-bold flex gap-2 items-center justify-center"
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
                      <h3 className="text-xl font-serif font-bold">Reason for Rejection</h3>
                    </div>
                    <p className="text-sm text-ink-soft">This message will be sent to the hospital. Please be specific (e.g., "License document is blurry").</p>
                    <textarea 
                      autoFocus
                      disabled={actionLoading}
                      className="w-full h-40 p-5 bg-paper border border-line-soft rounded-[24px] outline-none focus:border-crimson text-sm resize-none"
                      placeholder="Write your reason here..."
                      value={rejectionReason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                    <div className="flex gap-4">
                      <Button variant="ghost" disabled={actionLoading} onClick={() => setShowRejectStep(false)} className="flex-1 h-12 rounded-xl">Back</Button>
                      <Button 
                        variant="primary" 
                        disabled={!rejectionReason || actionLoading}
                        onClick={() => handleConfirmReject(selectedHosp.id)}
                        className="flex-1 h-12 rounded-xl font-bold justify-center"
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
const AdminStatCard = ({ label, value, icon, color }: any) => (
  <div className="bg-white border border-line-soft rounded-3xl p-6 shadow-sm flex items-center gap-5">
    <div className={`w-12 h-12 rounded-2xl bg-paper flex items-center justify-center ${color}`}>{React.cloneElement(icon as React.ReactElement<any>, { size: 24 })}</div>
    <div>
      <p className="text-[10px] font-mono font-bold text-ink-soft/40 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-serif font-bold text-ink">{value}</p>
    </div>
  </div>
);

const DetailItem = ({ label, value, icon }: any) => (
  <div className="flex gap-4 items-start">
    <div className="text-crimson mt-1">{React.cloneElement(icon as React.ReactElement<any>, { size: 18 })}</div>
    <div>
      <p className="text-[9px] font-mono font-bold text-ink-soft/50 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm font-bold text-ink leading-tight">{value}</p>
    </div>
  </div>
);

export default DashboardPage;