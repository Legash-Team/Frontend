import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { getPendingHospitals, approveHospital, rejectHospital } from '@/features/admin/api/admin-api';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
// ... other imports (Building2, etc)

export const DashboardPage = () => {
  const [hospitals, setHospitals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // Tracks which ID is being processed

  // 1. LOAD DATA FROM BACKEND
  useEffect(() => {
    getPendingHospitals()
      .then(data => {
        setHospitals(data.hospitals || []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  // 2. INTERACTIVE APPROVE FUNCTION
  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await approveHospital(id);
      // Success: Remove from local list so the card disappears
      setHospitals(prev => prev.filter((h: any) => h.id !== id));
      alert("Hospital Approved successfully!");
    } catch (err) {
      alert("Failed to approve.");
    } finally {
      setActionLoading(null);
    }
  };

  // 3. INTERACTIVE REJECT FUNCTION
  const handleReject = async (id: string, reason: string) => {
    setActionLoading(id);
    try {
      await rejectHospital(id, reason);
      setHospitals(prev => prev.filter((h: any) => h.id !== id));
      alert("Hospital Rejected.");
    } catch (err) {
      alert("Error processing rejection.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminLayout title="Facility Verifications">
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-crimson" /></div>
      ) : hospitals.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-line-soft">
          <p className="text-ink-soft">No pending hospitals to review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hospitals.map((hosp: any) => (
            <div key={hosp.id} className="bg-white p-6 rounded-[24px] border border-line-soft shadow-sm">
              <h3 className="font-serif font-bold text-lg mb-4">{hosp.hospitalName}</h3>
              
              <div className="flex gap-2">
                {/* APPROVE BUTTON */}
                <button 
                  onClick={() => handleApprove(hosp.id)}
                  disabled={!!actionLoading}
                  className="flex-1 h-10 bg-verified text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-verified-dark transition-all"
                >
                  {actionLoading === hosp.id ? <Loader2 className="animate-spin" size={14}/> : <CheckCircle2 size={16}/>}
                  Approve
                </button>

                {/* REJECT BUTTON (Triggers your modal) */}
                <button 
                   onClick={() => {/* Trigger your modal logic here */}}
                   className="p-2 text-crimson hover:bg-crimson/5 rounded-xl transition-all"
                >
                  <XCircle size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};
export default DashboardPage;