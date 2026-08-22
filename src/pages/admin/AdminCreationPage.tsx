import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Trash2
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { createAdmin, listAdmins, deleteAdmin } from './api/admin-api';

interface AdminEntry {
  id: string;
  name: string;
  email: string;
  permissions: { canApproveHospitals: boolean; canPostEvents: boolean };
  emailVerified: boolean;
  createdAt: string;
}

const AdminCreationPage = () => {
  const [admins, setAdmins] = useState<AdminEntry[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isCreating, setIsCreating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    canApproveHospitals: false,
    canPostEvents: false
  });

  // Load the live admin list from backend
  const loadAdmins = async () => {
    setLoadingAdmins(true);
    setLoadError(null);
    try {
      const res = await listAdmins();
      if (res.success && Array.isArray(res.admins)) {
        setAdmins(res.admins);
      } else {
        setAdmins([]);
      }
    } catch (err: any) {
      setLoadError(err || 'Failed to load staff list.');
    } finally {
      setLoadingAdmins(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await deleteAdmin(id);
      setSuccessMsg("Admin account deleted successfully.");
      setTimeout(() => setSuccessMsg(null), 3000);
      loadAdmins();
    } catch (err: any) {
      setCreateError(err || "Failed to delete admin.");
      setTimeout(() => setCreateError(null), 3000);
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateError(null);
    setSuccessMsg(null);

    try {
      const res = await createAdmin({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        permissions: {
          canApproveHospitals: formData.canApproveHospitals,
          canPostEvents: formData.canPostEvents,
        },
      });

      if (res.success) {
        setSuccessMsg(res.message || 'Admin account created! Verification OTP has been sent to their email.');
        // Reset Form
        setFormData({ name: '', email: '', canApproveHospitals: false, canPostEvents: false });
        // Refresh the admin list
        await loadAdmins();
        // Hide success message after 5 seconds
        setTimeout(() => setSuccessMsg(null), 5000);
      }
    } catch (err: any) {
      setCreateError(err || 'Failed to create admin account.');
    } finally {
      setIsCreating(false);
    }
  };

  const getRoleLabel = (permissions: AdminEntry['permissions']) => {
    const { canApproveHospitals, canPostEvents } = permissions;
    if (canApproveHospitals && canPostEvents) return 'Full Access';
    if (canApproveHospitals) return 'Hospital Verifier';
    if (canPostEvents) return 'Event Coordinator';
    return 'No Permissions';
  };

  return (
    <AdminLayout title="Staff Management">
      <div className="space-y-8">
        
        {/* 1. CREATION BANNER */}
        <div className="w-full bg-white border border-line-soft rounded-[32px] p-8 md:p-10 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-crimson/5 flex items-center justify-center text-crimson">
                <UserPlus size={20} />
              </div>
              <div>
                <h2 className="text-xl font-serif font-bold text-ink">Provision New Staff</h2>
                <p className="text-xs text-ink-soft">Assign administrative roles and send system invitations via OTP.</p>
              </div>
            </div>

            <form onSubmit={handleCreateAdmin} className="grid lg:grid-cols-3 gap-8">
              {/* Inputs */}
              <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold text-ink-soft uppercase tracking-widest">Full Name</label>
                  <input 
                    type="text" required value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Elias Gebre"
                    className="w-full h-12 px-4 bg-paper border border-line-soft rounded-xl outline-none focus:border-crimson text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold text-ink-soft uppercase tracking-widest">System Email</label>
                  <input 
                    type="email" required value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="name@legash.et"
                    className="w-full h-12 px-4 bg-paper border border-line-soft rounded-xl outline-none focus:border-crimson text-sm"
                  />
                </div>

                {/* Role Toggles */}
                <div className="md:col-span-2 flex flex-wrap gap-4">
                  <PermissionBadge 
                    label="Can Approve Hospitals" 
                    active={formData.canApproveHospitals} 
                    onClick={() => setFormData({...formData, canApproveHospitals: !formData.canApproveHospitals})} 
                  />
                  <PermissionBadge 
                    label="Can Post Events" 
                    active={formData.canPostEvents} 
                    onClick={() => setFormData({...formData, canPostEvents: !formData.canPostEvents})} 
                  />
                </div>
              </div>

              {/* Submit Side */}
              <div className="flex flex-col justify-end">
                <Button 
                  type="submit" 
                  isLoading={isCreating}
                  disabled={!formData.name || !formData.email || (!formData.canApproveHospitals && !formData.canPostEvents)}
                  className="w-full h-14 rounded-2xl font-bold shadow-lg"
                >
                  Create Admin Account
                </Button>
                <p className="text-[10px] text-ink-soft/50 text-center mt-4 italic">
                  A verification OTP will be sent to the email above.
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* 2. NOTIFICATIONS */}
        <AnimatePresence>
          {successMsg && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="bg-verified/10 border border-verified/20 rounded-2xl p-4 flex items-center gap-3 text-verified overflow-hidden"
            >
              <CheckCircle2 size={18} />
              <p className="text-sm font-bold">{successMsg}</p>
            </motion.div>
          )}
          {createError && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="bg-crimson/5 border border-crimson/20 rounded-2xl p-4 flex items-center gap-3 text-crimson overflow-hidden"
            >
              <AlertCircle size={18} />
              <p className="text-sm font-bold">{createError}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3. STAFF TABLE */}
        <div className="bg-white border border-line-soft rounded-[32px] overflow-hidden shadow-sm">
          <div className="p-6 border-b border-line-soft bg-paper/30 flex justify-between items-center">
            <h3 className="text-sm font-mono font-bold text-ink-soft uppercase tracking-widest">Active Administrative Staff</h3>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-full bg-paper border border-line-soft text-[10px] font-bold text-ink-soft uppercase tracking-tighter">
                {loadingAdmins ? '...' : `${admins.length} Total`}
              </div>
              <button 
                onClick={loadAdmins} 
                disabled={loadingAdmins}
                className="p-2 text-ink-soft/40 hover:text-crimson transition-colors"
                title="Refresh list"
              >
                <RefreshCw size={14} className={loadingAdmins ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
          
          {loadingAdmins ? (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-4 border-crimson border-t-transparent" />
              <p className="mt-3 text-xs text-ink-soft">Loading staff list...</p>
            </div>
          ) : loadError ? (
            <div className="p-6 text-center text-crimson text-sm">
              <AlertCircle size={20} className="mx-auto mb-2" />
              <p>{loadError}</p>
              <button onClick={loadAdmins} className="mt-3 text-xs font-bold underline">Retry</button>
            </div>
          ) : admins.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-ink-soft font-serif italic">No admin staff found. Create the first one above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left min-w-[540px]">
                <tbody className="divide-y divide-line-soft">
                  {admins.map((admin) => (
                    <tr key={admin.id} className="group hover:bg-paper/20 transition-all">
                      <td className="p-4 sm:p-6">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-paper border border-line-soft flex items-center justify-center font-serif font-bold text-ink-soft text-xs uppercase tracking-tighter shrink-0">
                            {admin.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-ink truncate">{admin.name}</p>
                            <p className="text-xs text-ink-soft font-mono truncate">{admin.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 sm:p-6">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border whitespace-nowrap ${
                          getRoleLabel(admin.permissions) === 'Full Access' 
                            ? 'bg-crimson/5 border-crimson/20 text-crimson' 
                            : 'bg-paper border-line-soft text-ink-soft'
                        }`}>
                          {getRoleLabel(admin.permissions)}
                        </span>
                      </td>
                      <td className="p-4 sm:p-6">
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <div className={`w-1.5 h-1.5 rounded-full ${admin.emailVerified ? 'bg-verified animate-pulse' : 'bg-amber-400'}`} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-ink-soft/40">
                            {admin.emailVerified ? 'Verified' : 'Pending OTP'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 sm:p-6 text-right whitespace-nowrap">
                        {confirmDeleteId === admin.id ? (
                          <div className="flex items-center justify-end gap-2 animate-in fade-in zoom-in duration-200">
                            <span className="text-[10px] font-bold text-crimson uppercase mr-1 tracking-widest">Are you sure?</span>
                            <button 
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2.5 py-1 text-xs font-bold text-ink-soft hover:bg-paper rounded-md transition-colors border border-line-soft"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={() => handleDelete(admin.id)}
                              className="px-2.5 py-1 text-xs font-bold text-white bg-crimson hover:bg-crimson-dark rounded-md transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setConfirmDeleteId(admin.id)}
                            className="p-2 text-ink-soft hover:text-crimson hover:bg-crimson/5 rounded-lg transition-colors"
                            title="Delete Admin"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

// --- SUB-COMPONENTS ---

const PermissionBadge = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${
      active 
        ? 'bg-crimson border-crimson text-white shadow-md shadow-crimson/20' 
        : 'bg-white border-line-soft text-ink-soft hover:border-crimson/30'
    }`}
  >
    {active ? <CheckCircle2 size={14} /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-current opacity-20" />}
    {label}
  </button>
);

export default AdminCreationPage;