import React, { useState, useEffect } from 'react';
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
import { fetchFeedbacks, markFeedbackReviewed } from './api/admin-api';

const FeedbackPage = () => {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<'new' | 'reviewed'>('new');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadFeedbacks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFeedbacks();
      if (res.success && Array.isArray(res.feedbacks)) {
        setFeedbacks(res.feedbacks);
      } else {
        setFeedbacks([]);
      }
    } catch (err: any) {
      setError(err || 'Failed to fetch appeals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, []);

  // --- ACTIONS ---

  const handleMarkReviewed = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await markFeedbackReviewed(id);
      if (res.success) {
        setFeedbacks(prev => prev.map(item => 
          item.id === id || item._id === id ? { ...item, status: 'reviewed' } : item
        ));
        alert('Appeal marked as reviewed.');
      }
    } catch (err: any) {
      alert(err || 'Failed to resolve appeal.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewApplication = (hospitalId?: string) => {
    // Navigate back to dashboard to verify the facility
    navigate('/admin/dashboard');
  };

  const getDisplayTime = (isoString?: string) => {
    if (!isoString) return 'Just now';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recent';
    }
  };

  // Filter logic
  const filteredFeedbacks = feedbacks.filter(item => {
    const matchesTab = item.status === activeTab;
    const name = item.hospitalName || 'Hospital';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
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

        {/* LOADING & ERROR STATES */}
        {loading ? (
          <div className="py-20 text-center bg-white rounded-[32px] border border-line-soft shadow-xs">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-crimson border-t-transparent" />
            <p className="mt-4 text-sm text-ink-soft font-medium">Loading appeals list...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-crimson/5 border border-crimson/25 rounded-3xl text-crimson text-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle size={24} />
              <div>
                <p className="font-bold">Failed to load appeals</p>
                <p className="text-xs opacity-75 mt-0.5">{error}</p>
              </div>
            </div>
            <button onClick={loadFeedbacks} className="px-4 py-2 bg-crimson text-white rounded-xl text-xs font-bold uppercase">Retry</button>
          </div>
        ) : (
          /* FEEDBACK LIST */
          <div className="grid gap-6">
            <AnimatePresence mode='popLayout'>
              {filteredFeedbacks.length > 0 ? (
                filteredFeedbacks.map((item) => {
                  const id = item.id || item._id;
                  return (
                    <motion.div 
                      key={id}
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
                              <History size={12} /> {getDisplayTime(item.createdAt)}
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
                            <p className="text-sm text-ink-soft leading-relaxed italic">
                              "{item.rejectionReason || 'No registered reason'}"
                            </p>
                          </div>

                          {/* Hospital Appeal Area */}
                          <div className="p-6 rounded-2xl bg-paper border border-line-soft">
                            <div className="flex items-center gap-2 mb-3 text-ink opacity-60">
                              <MessageSquare size={14} />
                              <span className="text-[9px] font-mono font-bold uppercase tracking-widest">Hospital Appeal Message</span>
                            </div>
                            <p className="text-sm text-ink leading-relaxed font-medium">
                              {item.message}
                            </p>
                          </div>
                        </div>

                        {/* Action Bar */}
                        <div className="mt-8 pt-8 border-t border-line-soft flex flex-wrap items-center justify-between gap-4">
                          <div className="text-[10px] font-mono font-bold text-ink-soft/30 uppercase">
                            Reference: CASE-{id.substring(0, 8).toUpperCase()}
                          </div>
                          
                          <div className="flex gap-3">
                            {item.status === 'new' && (
                              <button 
                                disabled={actionLoading}
                                onClick={() => handleMarkReviewed(id)}
                                className="px-5 py-2.5 rounded-xl border border-line-soft text-[11px] font-bold text-ink-soft hover:bg-paper transition-all flex items-center gap-2 uppercase tracking-wider"
                              >
                                <CheckCircle2 size={16} className="text-verified" /> Mark Reviewed
                              </button>
                            )}

                            <button 
                              disabled={actionLoading}
                              onClick={() => handleViewApplication(item.hospital)}
                              className="px-6 py-2.5 rounded-xl bg-ink text-white text-[11px] font-bold hover:bg-crimson transition-all flex items-center gap-2 group uppercase tracking-widest shadow-lg shadow-ink/10"
                            >
                              Verify Facility <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-crimson" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
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
        )}
      </div>
    </AdminLayout>
  );
};

export default FeedbackPage;