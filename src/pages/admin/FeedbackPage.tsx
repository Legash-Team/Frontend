import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/layouts/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight,
  Search,
  History,
  Trash2
} from 'lucide-react';
import Button from '@/components/ui/Button';

// 1. MOCK DATA representing the feedback loop
const INITIAL_FEEDBACKS = [
  {
    id: 'fb_001',
    hospitalId: 'hosp_001', // Linked to the ID on the Dashboard
    hospitalName: 'Abay Central Clinic',
    email: 'contact@abayclinic.et',
    originalRejectionReason: 'License document was unreadable or blurry.',
    hospitalResponse: 'We have updated our scanner. I have attached the high-res 2026 license. Please re-open our application for review.',
    timestamp: '2 hours ago',
    status: 'new'
  },
  {
    id: 'fb_002',
    hospitalId: 'hosp_002',
    hospitalName: 'Selam General Hospital',
    email: 'info@selamgen.et',
    originalRejectionReason: 'Coordinates provided do not match the physical address.',
    hospitalResponse: 'Our GPS was off during capture. We are actually located in Bole, not Kirkos. Can we reset our location data?',
    timestamp: 'Yesterday',
    status: 'reviewed'
  }
];

const FeedbackPage = () => {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState(INITIAL_FEEDBACKS);
  const [activeTab, setActiveTab] = useState<'new' | 'reviewed'>('new');
  const [searchQuery, setSearchQuery] = useState('');

  // --- ACTIONS ---

  const handleMarkReviewed = (id: string) => {
    setFeedbacks(prev => prev.map(item => 
      item.id === id ? { ...item, status: 'reviewed' as const } : item
    ));
  };

  const handleDelete = (id: string) => {
    setFeedbacks(prev => prev.filter(item => item.id !== id));
  };

  const handleViewApplication = (hospitalId: string) => {
    // Logic: Navigate back to dashboard to re-verify the facility
    navigate('/admin/dashboard');
  };

  // Filter logic
  const filteredFeedbacks = feedbacks.filter(item => {
    const matchesTab = item.status === activeTab;
    const matchesSearch = item.hospitalName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <AdminLayout title="Hospital Feedback Hub">
      <div className="space-y-8">
        
        {/* TAB & SEARCH NAVIGATION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-4 rounded-[24px] border border-line-soft shadow-sm">
          <div className="flex p-1 bg-paper rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('new')}
              className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'new' ? 'bg-white text-crimson shadow-sm' : 'text-ink-soft hover:text-ink'
              }`}
            >
              New Appeals ({feedbacks.filter(f => f.status === 'new').length})
            </button>
            <button
              onClick={() => setActiveTab('reviewed')}
              className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'reviewed' ? 'bg-white text-crimson shadow-sm' : 'text-ink-soft hover:text-ink'
              }`}
            >
              History
            </button>
          </div>

          <div className="relative max-w-sm w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/30" size={18} />
            <input 
              type="text" 
              placeholder="Search by facility name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-12 pr-4 bg-paper border border-line-soft rounded-xl outline-none focus:border-crimson text-sm transition-all"
            />
          </div>
        </div>

        {/* FEEDBACK LIST */}
        <div className="grid gap-6">
          <AnimatePresence mode='popLayout'>
            {filteredFeedbacks.length > 0 ? (
              filteredFeedbacks.map((item) => (
                <motion.div 
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`bg-white border rounded-[32px] overflow-hidden transition-all shadow-sm hover:shadow-md ${
                    item.status === 'new' ? 'border-crimson/10' : 'border-line-soft'
                  }`}
                >
                  <div className="p-8 md:p-10">
                    <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-serif font-bold text-ink">{item.hospitalName}</h3>
                          {item.status === 'new' && (
                            <span className="px-2 py-0.5 rounded-full bg-crimson text-white text-[9px] font-black uppercase tracking-widest animate-pulse">
                              Pending Review
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-ink-soft font-medium font-mono tracking-tight">{item.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-mono font-bold text-ink-soft/40 uppercase tracking-widest flex items-center justify-end gap-2">
                          <History size={12} /> {item.timestamp}
                        </p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Context Area */}
                      <div className="p-6 rounded-2xl bg-crimson/[0.02] border border-crimson/5">
                        <div className="flex items-center gap-2 mb-3 text-crimson opacity-60">
                          <AlertCircle size={14} />
                          <span className="text-[9px] font-mono font-bold uppercase tracking-widest">Previous Rejection Reason</span>
                        </div>
                        <p className="text-sm text-ink-soft leading-relaxed italic italic">
                          "{item.originalRejectionReason}"
                        </p>
                      </div>

                      {/* Hospital Appeal Area */}
                      <div className="p-6 rounded-2xl bg-paper border border-line-soft">
                        <div className="flex items-center gap-2 mb-3 text-ink opacity-60">
                          <MessageSquare size={14} />
                          <span className="text-[9px] font-mono font-bold uppercase tracking-widest">Hospital Appeal Message</span>
                        </div>
                        <p className="text-sm text-ink leading-relaxed font-medium">
                          {item.hospitalResponse}
                        </p>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="mt-8 pt-8 border-t border-line-soft flex flex-wrap items-center justify-between gap-4">
                      <div className="text-[10px] font-mono font-bold text-ink-soft/30 uppercase">
                        Reference: CASE-{item.id.toUpperCase()}
                      </div>
                      
                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2.5 text-ink-soft/40 hover:text-crimson hover:bg-crimson/5 rounded-xl transition-all"
                          title="Delete Feedback"
                        >
                          <Trash2 size={18} />
                        </button>

                        {item.status === 'new' && (
                          <button 
                            onClick={() => handleMarkReviewed(item.id)}
                            className="px-5 py-2.5 rounded-xl border border-line-soft text-[11px] font-bold text-ink-soft hover:bg-paper transition-all flex items-center gap-2 uppercase tracking-wider"
                          >
                            <CheckCircle2 size={16} className="text-verified" /> Mark Reviewed
                          </button>
                        )}

                        <button 
                          onClick={() => handleViewApplication(item.hospitalId)}
                          className="px-6 py-2.5 rounded-xl bg-ink text-white text-[11px] font-bold hover:bg-crimson transition-all flex items-center gap-2 group uppercase tracking-widest shadow-lg shadow-ink/10"
                        >
                          Verify Facility <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-crimson" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="py-32 text-center bg-white rounded-[40px] border border-dashed border-line-soft"
              >
                <MessageSquare className="mx-auto text-ink-soft/20 mb-4" size={48} strokeWidth={1} />
                <p className="text-ink-soft font-serif italic text-lg">No feedbacks found in this category.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AdminLayout>
  );
};

export default FeedbackPage;