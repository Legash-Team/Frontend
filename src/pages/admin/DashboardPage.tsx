import React, { useState } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle2, 
  XCircle, 
  Calendar,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import Button from '@/components/ui/Button';

// Mock Data representing the full registration payload
const PENDING_HOSPITALS = [
  {
    id: '1',
    name: 'St. Paul’s Specialized Hospital',
    email: 'admin@stpaul.edu.et',
    phone: '+251 911 223 344',
    licenseNumber: 'MOH/ETH/2026/882',
    address: 'Bole Sub-city, Woreda 03, Addis Ababa',
    coordinates: [38.75, 9.03],
    submittedAt: 'Oct 12, 2026 • 10:30 AM',
  },
  {
    id: '2',
    name: 'Hayat General Hospital',
    email: 'contact@hayat.et',
    phone: '+251 115 510 022',
    licenseNumber: 'MOH/ETH/2025/119',
    address: 'Casanchis, Kirkos Sub-city, Addis Ababa',
    coordinates: [38.76, 9.01],
    submittedAt: 'Oct 11, 2026 • 02:15 PM',
  }
];

const DashboardPage = () => {
  const [selectedHosp, setSelectedHosp] = useState<any | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);

  return (
    <AdminLayout title="Facility Verifications">
      {/* GRID OF CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {PENDING_HOSPITALS.map((hosp) => (
          <motion.div
            layoutId={hosp.id}
            key={hosp.id}
            onClick={() => setSelectedHosp(hosp)}
            className="bg-white border border-line-soft rounded-[24px] p-6 shadow-sm hover:shadow-xl hover:border-crimson/20 transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-crimson/5 flex items-center justify-center text-crimson group-hover:bg-crimson group-hover:text-white transition-colors">
                <Building2 size={24} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-ink-soft/40 bg-paper px-2 py-1 rounded">
                Pending Review
              </span>
            </div>
            
            <h3 className="text-lg font-serif font-bold text-ink mb-1">{hosp.name}</h3>
            <p className="text-xs text-ink-soft font-mono mb-4">{hosp.licenseNumber}</p>
            
            <div className="flex items-center justify-between pt-4 border-t border-line-soft">
              <div className="flex items-center gap-2 text-ink-soft">
                <Calendar size={14} />
                <span className="text-[10px] font-bold uppercase tracking-tighter">{hosp.submittedAt}</span>
              </div>
              <ChevronRight size={16} className="text-crimson opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* DETAIL DRAWER OVERLAY */}
      <AnimatePresence>
        {selectedHosp && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedHosp(null)}
              className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[60]"
            />
            
            {/* The "File" Drawer */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-xl bg-paper shadow-2xl z-[70] overflow-y-auto no-scrollbar"
            >
              <div className="p-8 md:p-12 min-h-full flex flex-col">
                {/* Drawer Header */}
                <div className="flex justify-between items-center mb-12">
                  <button onClick={() => setSelectedHosp(null)} className="p-2 hover:bg-white rounded-full transition-colors">
                    <XCircle size={24} className="text-ink-soft" />
                  </button>
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-verified/10 text-verified border border-verified/20">
                    <ShieldCheck size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">System Authenticated</span>
                  </div>
                </div>

                {/* Profile Section */}
                <div className="bg-white border border-line-soft rounded-[32px] p-8 shadow-sm mb-8">
                  <h2 className="text-3xl font-serif font-bold text-ink mb-2">{selectedHosp.name}</h2>
                  <p className="text-crimson font-mono text-xs font-bold uppercase tracking-widest mb-8">
                    Facility Document ID: {selectedHosp.licenseNumber}
                  </p>

                  <div className="grid gap-6">
                    <DetailItem icon={<Mail />} label="Communication" value={selectedHosp.email} />
                    <DetailItem icon={<Phone />} label="Verified Line" value={selectedHosp.phone} />
                    <DetailItem icon={<MapPin />} label="Physical Address" value={selectedHosp.address} />
                    <div className="p-4 bg-paper rounded-2xl flex justify-between items-center">
                       <span className="text-[10px] font-mono font-bold text-ink-soft uppercase tracking-widest">Geolocation</span>
                       <span className="text-xs font-bold text-ink">{selectedHosp.coordinates.join(', ')}</span>
                    </div>
                  </div>
                </div>

                {/* Actions - Stays at bottom */}
                <div className="mt-auto pt-8 flex gap-4">
                  <Button 
                    variant="ghost" 
                    className="flex-1 border-line-soft hover:bg-crimson/5 hover:text-crimson text-xs font-bold uppercase tracking-widest"
                    onClick={() => setShowRejectModal(true)}
                  >
                    Reject Application
                  </Button>
                  <Button 
                    variant="primary" 
                    className="flex-1 h-14 rounded-2xl font-bold flex gap-2 items-center"
                  >
                    <CheckCircle2 size={18} /> Approve Facility
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* REJECTION REASON MODAL (Same as before but matching new styles) */}
      {showRejectModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-ink/60 backdrop-blur-md">
           <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white p-10 rounded-[32px] max-w-md w-full shadow-2xl">
              <h3 className="text-2xl font-serif font-bold text-ink mb-6">Rejection Reason</h3>
              <textarea className="w-full h-32 p-4 bg-paper border border-line-soft rounded-2xl outline-none focus:border-crimson text-sm mb-6 resize-none" placeholder="Explain why the facility was not approved..." />
              <div className="flex gap-4">
                <Button onClick={() => setShowRejectModal(false)} variant="ghost" className="flex-1">Back</Button>
                <Button variant="primary" className="flex-1">Confirm Reject</Button>
              </div>
           </motion.div>
        </div>
      )}
    </AdminLayout>
  );
};

// Helper for Drawer Fields
const DetailItem = ({ icon, label, value }: { icon: any, label: string, value: string }) => (
  <div className="flex gap-4 items-start">
    <div className="mt-1 text-crimson">{React.cloneElement(icon, { size: 18 })}</div>
    <div>
      <p className="text-[10px] font-mono font-bold text-ink-soft/50 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-bold text-ink">{value}</p>
    </div>
  </div>
);

export default DashboardPage;