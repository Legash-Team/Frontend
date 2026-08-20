import React, { useState } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/Button';
import { 
  UserPlus, 
  Mail, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2
} from 'lucide-react';

const AdminCreationPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    permissions: {
      approveHospitals: false,
      postEvents: false
    }
  });

  const [isCreated, setIsCreated] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic: Send Invite Email logic here
    setIsCreated(true);
  };

  return (
    <AdminLayout title="System Administration">
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* LEFT: Provisioning Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-line-soft rounded-[32px] p-8 md:p-12 shadow-sm">
            
            <div className="mb-10">
              <h2 className="text-2xl font-serif font-bold text-ink mb-2">Provision New Admin</h2>
              <p className="text-ink-soft text-sm">Assign credentials and access levels for system staff.</p>
            </div>

            <form onSubmit={handleCreate} className="space-y-8">
              
              {/* Identity Section */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold text-ink-soft uppercase tracking-widest">Full Name</label>
                  <input 
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full h-12 px-4 bg-paper border border-line-soft rounded-xl outline-none focus:border-crimson transition-all text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold text-ink-soft uppercase tracking-widest">System Email</label>
                  <input 
                    type="email"
                    required
                    placeholder="staff@legash.et"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full h-12 px-4 bg-paper border border-line-soft rounded-xl outline-none focus:border-crimson transition-all text-sm"
                  />
                </div>
              </div>

              {/* Roles & Permissions Section */}
              <div className="space-y-4">
                <label className="text-[10px] font-mono font-bold text-ink-soft uppercase tracking-widest block mb-4">
                  Access Control Level (ACL)
                </label>
                
                <div className="grid gap-4">
                  {/* Permission 1 */}
                  <PermissionToggle 
                    title="Hospital Verifier"
                    desc="Can approve or reject hospital registrations and view licenses."
                    active={formData.permissions.approveHospitals}
                    onClick={() => setFormData({
                      ...formData, 
                      permissions: {...formData.permissions, approveHospitals: !formData.permissions.approveHospitals}
                    })}
                  />

                  {/* Permission 2 */}
                  <PermissionToggle 
                    title="Event Coordinator"
                    desc="Can create, broadcast, and manage donor events and news."
                    active={formData.permissions.postEvents}
                    onClick={() => setFormData({
                      ...formData, 
                      permissions: {...formData.permissions, postEvents: !formData.permissions.postEvents}
                    })}
                  />
                </div>
              </div>

              <div className="pt-6">
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={!formData.permissions.approveHospitals && !formData.permissions.postEvents}
                  className="w-full h-14 rounded-2xl font-bold shadow-lg flex gap-3"
                >
                  <UserPlus size={18} /> Generate Invite & Provision Account
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT: Onboarding Lifecycle */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-ink text-paper rounded-[32px] p-8 shadow-xl relative overflow-hidden">
            <h3 className="text-sm font-serif font-bold mb-8 relative z-10">Onboarding Lifecycle</h3>
            
            <div className="space-y-8 relative z-10">
              <LifecycleStep 
                icon={<Mail size={16} />} 
                title="Invitation Sent" 
                desc="An encrypted link is sent to the staff email address." 
                completed={isCreated}
              />
              <LifecycleStep 
                icon={<ShieldCheck size={16} />} 
                title="Identity Verification" 
                desc="Staff verifies their email and sets a secure password." 
                completed={false}
              />
              <LifecycleStep 
                icon={<CheckCircle2 size={16} />} 
                title="Access Granted" 
                desc="The account becomes active with the assigned roles." 
                completed={false}
              />
            </div>

            {/* Decorative Pulse */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-crimson/10 blur-[80px] rounded-full" />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex gap-4">
             <ShieldAlert className="text-amber-600 shrink-0" size={24} />
             <p className="text-xs text-amber-900 leading-relaxed">
               <strong>Security Note:</strong> Admin invitations expire after 24 hours. Ensure the recipient completes their setup promptly to avoid re-provisioning.
             </p>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

// --- SUB-COMPONENTS ---

const PermissionToggle = ({ title, desc, active, onClick }: any) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full p-5 rounded-2xl border text-left transition-all flex items-center justify-between group ${
      active ? 'bg-crimson/5 border-crimson shadow-sm' : 'bg-paper border-line-soft hover:border-crimson/30'
    }`}
  >
    <div className="max-w-[85%]">
      <h4 className={`text-sm font-bold mb-1 transition-colors ${active ? 'text-crimson' : 'text-ink'}`}>
        {title}
      </h4>
      <p className="text-xs text-ink-soft leading-snug">{desc}</p>
    </div>
    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
      active ? 'bg-crimson border-crimson text-white' : 'border-line-soft group-hover:border-crimson/50'
    }`}>
      {active && <CheckCircle2 size={14} />}
    </div>
  </button>
);

const LifecycleStep = ({ icon, title, desc, completed }: any) => (
  <div className={`flex gap-4 items-start transition-opacity ${completed ? 'opacity-100' : 'opacity-40'}`}>
    <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${completed ? 'bg-crimson text-white' : 'bg-white/10 text-white/50'}`}>
      {icon}
    </div>
    <div>
      <h4 className="text-xs font-bold uppercase tracking-wider mb-1">{title}</h4>
      <p className="text-[11px] text-paper/50 leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default AdminCreationPage;