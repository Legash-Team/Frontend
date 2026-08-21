import React, { useState } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, 
  Mail, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  Trash2,
  Clock,
  MoreVertical,
  ChevronRight
} from 'lucide-react';
import Button from '@/components/ui/Button';

// 1. INITIAL MOCK DATA
const INITIAL_ADMINS = [
  { id: '1', name: 'Dr. Selamawit Tadesse', email: 'selam.t@legash.et', role: 'Full Access', status: 'active' },
  { id: '2', name: 'Abebe Kebede', email: 'abebe.k@legash.et', role: 'Event Coordinator', status: 'pending' },
];

const AdminCreationPage = () => {
  const [admins, setAdmins] = useState(INITIAL_ADMINS);
  const [isCreating, setIsCreating] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    canApproveHospitals: false,
    canPostEvents: false
  });

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    // Simulation of API Call and Onboarding Email
    setTimeout(() => {
      const newAdmin = {
        id: Math.random().toString(),
        name: formData.name,
        email: formData.email,
        role: formData.canApproveHospitals && formData.canPostEvents 
              ? 'Full Access' 
              : formData.canApproveHospitals ? 'Hospital Verifier' : 'Event Coordinator',
        status: 'pending' as const
      };

      setAdmins([newAdmin, ...admins]);
      setIsCreating(false);
      setSuccessMsg(true);
      
      // Reset Form
      setFormData({ name: '', email: '', canApproveHospitals: false, canPostEvents: false });
      
      // Hide success message after 4 seconds
      setTimeout(() => setSuccessMsg(false), 4000);
    }, 1500);
  };

  const removeAdmin = (id: string) => {
    setAdmins(admins.filter(a => h.id !== id));
  };

  return (
    <AdminLayout title="Staff Management">
      <div className="space-y-8">
        
        {/* 1. CREATION BANNER (Matches Hospital Dashboard Style) */}
        <div className="w-full bg-white border border-line-soft rounded-[32px] p-8 md:p-10 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-crimson/5 flex items-center justify-center text-crimson">
                <UserPlus size={20} />
              </div>
              <div>
                <h2 className="text-xl font-serif font-bold text-ink">Provision New Staff</h2>
                <p className="text-xs text-ink-soft">Assign administrative roles and send system invitations.</p>
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
                  disabled={!formData.canApproveHospitals && !formData.canPostEvents}
                  className="w-full h-14 rounded-2xl font-bold shadow-lg"
                >
                  Create Admin Account
                </Button>
                <p className="text-[10px] text-ink-soft/50 text-center mt-4 italic">
                  An invitation link will be sent to the email above.
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* 2. SUCCESS NOTIFICATION */}
        <AnimatePresence>
          {successMsg && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="bg-verified/10 border border-verified/20 rounded-2xl p-4 flex items-center gap-3 text-verified"
            >
              <CheckCircle2 size={18} />
              <p className="text-sm font-bold">Invitation Sent! The new admin can now verify their email and set a password.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3. STAFF TABLE (Mirroring Admin Dashboard logic) */}
        <div className="bg-white border border-line-soft rounded-[32px] overflow-hidden shadow-sm">
          <div className="p-6 border-b border-line-soft bg-paper/30 flex justify-between items-center">
            <h3 className="text-sm font-mono font-bold text-ink-soft uppercase tracking-widest">Active Administrative Staff</h3>
            <div className="px-3 py-1 rounded-full bg-paper border border-line-soft text-[10px] font-bold text-ink-soft uppercase tracking-tighter">
              {admins.length} Total
            </div>
          </div>
          
          <table className="w-full text-left">
            <tbody className="divide-y divide-line-soft">
              {admins.map((admin) => (
                <tr key={admin.id} className="group hover:bg-paper/20 transition-all">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-paper border border-line-soft flex items-center justify-center font-serif font-bold text-ink-soft text-xs uppercase tracking-tighter">
                        {admin.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-ink">{admin.name}</p>
                        <p className="text-xs text-ink-soft font-mono">{admin.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border ${
                      admin.role === 'Full Access' ? 'bg-crimson/5 border-crimson/20 text-crimson' : 'bg-paper border-line-soft text-ink-soft'
                    }`}>
                      {admin.role}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                       <div className={`w-1.5 h-1.5 rounded-full ${admin.status === 'active' ? 'bg-verified animate-pulse' : 'bg-amber-400'}`} />
                       <span className="text-[10px] font-black uppercase tracking-widest text-ink-soft/40">{admin.status}</span>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <button className="p-2 text-ink-soft/30 hover:text-crimson transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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