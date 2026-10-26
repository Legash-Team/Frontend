import { useState, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AdminLayout } from '@/layouts/AdminLayout';
import { BloodCenterLayout } from '@/layouts/BloodCenterLayout';
import { useAuth } from '@/features/auth/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  History, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Activity, 
  X, 
  Eye 
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { fetchFeedbacks, markFeedbackReviewed, approveHospital } from './api/admin-api';
import { LocationLink } from '@/utils/mapsUrl';
import { useDialog } from '@/context/DialogContext';

const FeedbackPage = () => {
  const { t } = useTranslation();
  const { confirm, toast } = useDialog();
  const location = useLocation();
  const { user } = useAuth();

  const isBloodCenter = location.pathname.startsWith('/blood-center');
  const canApprove =
    user?.role === 'superadmin' ||
    Boolean(user?.permissions?.canApproveHospitals);

  if (isBloodCenter && !canApprove) {
    return <Navigate to="/blood-center/dashboard" replace />;
  }

  const Layout = isBloodCenter ? BloodCenterLayout : AdminLayout;

  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<'new' | 'reviewed'>('new');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<any | null>(null);

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

  const handleMarkReviewed = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await markFeedbackReviewed(id);
      if (res.success) {
        setFeedbacks(prev => prev.map(item => 
          (item.id === id || item._id === id) ? { ...item, status: 'reviewed' } : item
        ));
        if (selectedFeedback && (selectedFeedback.id === id || selectedFeedback._id === id)) {
          setSelectedFeedback((prev: any) => ({ ...prev, status: 'reviewed' }));
        }
        toast.success(t('feedback.markSuccess'));
      }
    } catch (err: any) {
      toast.error(err || 'Failed to resolve appeal.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveFromAppeal = async (feedbackItem: any) => {
    const hospitalId = feedbackItem.hospital?._id || feedbackItem.hospital?.id || feedbackItem.hospital;
    const feedbackId = feedbackItem._id || feedbackItem.id;

    if (!hospitalId) {
      toast.error('Hospital record ID not found. The facility may not exist.');
      return;
    }

    const ok = await confirm({
      title: t('feedback.reApproveBtn'),
      message: `Are you sure you want to approve "${feedbackItem.hospitalName || feedbackItem.hospital?.hospitalName}" and grant them access to Legash?`,
      type: 'info',
      confirmText: t('feedback.reApproveBtn'),
    });
    if (!ok) {
      return;
    }

    setActionLoading(true);
    try {
      const approveRes = await approveHospital(hospitalId.toString());
      if (approveRes.success) {
        try {
          await markFeedbackReviewed(feedbackId);
        } catch (_) {}

        setFeedbacks(prev => prev.map(item => {
          if (item.id === feedbackId || item._id === feedbackId) {
            return {
              ...item,
              status: 'reviewed',
              hospital: typeof item.hospital === 'object' ? { ...item.hospital, verificationStatus: 'approved' } : item.hospital,
            };
          }
          return item;
        }));

        setSelectedFeedback(null);
        toast.success(t('feedback.reApproveSuccess'));
      }
    } catch (err: any) {
      toast.error(err || 'Failed to approve hospital.');
    } finally {
      setActionLoading(false);
    }
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

  const filteredFeedbacks = feedbacks.filter(item => {
    const matchesTab = item.status === activeTab;
    const name = item.hospitalName || item.hospital?.hospitalName || 'Hospital';
    const email = item.email || '';
    const matchesSearch = 
      name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <Layout title={t('feedback.title')} icon={<MessageSquare size={16} className="stroke-[1.75]" />}>
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
              {t('feedback.tabNew')} ({feedbacks.filter(f => f.status === 'new').length})
            </button>
            <button
              onClick={() => setActiveTab('reviewed')}
              className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'reviewed' ? 'bg-white text-crimson shadow-sm' : 'text-ink-soft hover:text-ink'
              }`}
            >
              {t('feedback.tabReviewed')}
            </button>
          </div>

          <div className="relative max-w-sm w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/30" size={18} />
            <input 
              type="text" 
              placeholder={t('feedback.searchPlaceholder')} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-12 pr-4 bg-paper border border-line-soft rounded-xl outline-none focus:border-crimson text-sm transition-all"
            />
          </div>
        </div>

        {/* LOADING & ERROR STATES */}
        {loading ? (
          <div className="bg-white rounded-[32px] border border-line-soft shadow-xs">
            <LoadingState text="Loading appeals..." />
          </div>
        ) : error ? (
          <ErrorState
            title="Failed to load appeals"
            message={error}
            onRetry={loadFeedbacks}
          />
        ) : (
          /* FEEDBACK LIST */
          <div className="grid gap-6">
            <AnimatePresence mode='popLayout'>
              {filteredFeedbacks.length > 0 ? (
                filteredFeedbacks.map((item) => {
                  const id = item.id || item._id;
                  const hospitalObj = item.hospital && typeof item.hospital === 'object' ? item.hospital : null;
                  const isApproved = hospitalObj?.verificationStatus === 'approved';

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
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <h3 className="text-xl font-serif font-bold text-ink">{item.hospitalName || hospitalObj?.hospitalName || 'Hospital'}</h3>
                              {item.status === 'new' && (
                                <span className="px-2 py-0.5 rounded-full bg-crimson text-white text-[9px] font-black uppercase tracking-widest animate-pulse">
                                  {t('feedback.tabNew')}
                                </span>
                              )}
                              {isApproved && (
                                <span className="px-2 py-0.5 rounded-full bg-verified/10 text-verified text-[9px] font-black uppercase tracking-widest">
                                  Approved
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
                          {/* Rejection Area */}
                          <div className="p-6 rounded-2xl bg-crimson/[0.02] border border-crimson/5">
                            <div className="flex items-center gap-2 mb-3 text-crimson opacity-60">
                              <AlertCircle size={14} />
                              <span className="text-[9px] font-mono font-bold uppercase tracking-widest">Rejection Reason</span>
                            </div>
                            <p className="text-sm text-ink-soft leading-relaxed italic">
                              "{item.rejectionReason || hospitalObj?.rejectionReason || 'No registered reason'}"
                            </p>
                          </div>

                          {/* Hospital Appeal Area */}
                          <div className="p-6 rounded-2xl bg-paper border border-line-soft">
                            <div className="flex items-center gap-2 mb-3 text-ink opacity-60">
                              <MessageSquare size={14} />
                              <span className="text-[9px] font-mono font-bold uppercase tracking-widest">{t('feedback.appealMessage')}</span>
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
                          
                          <div className="flex flex-wrap gap-3">
                            <Button 
                              variant="outline"
                              size="sm"
                              disabled={actionLoading}
                              onClick={() => setSelectedFeedback(item)}
                            >
                              <Eye size={16} /> {t('feedback.inspectBtn')}
                            </Button>

                            {item.status === 'new' && (
                              <Button 
                                variant="outline"
                                size="sm"
                                disabled={actionLoading}
                                onClick={() => handleMarkReviewed(id)}
                              >
                                <CheckCircle2 size={16} className="text-verified" /> {t('feedback.markReviewedBtn')}
                              </Button>
                            )}

                            {!isApproved && (
                              <Button 
                                variant="primary"
                                size="sm"
                                disabled={actionLoading}
                                onClick={() => handleApproveFromAppeal(item)}
                              >
                                <CheckCircle2 size={16} /> {t('feedback.reApproveBtn')}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <EmptyState
                  icon={<MessageSquare className="w-12 h-12" strokeWidth={1} />}
                  title={t('feedback.noFeedbacks')}
                />
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* --- DETAIL INSPECTION MODAL --- */}
      <AnimatePresence>
        {selectedFeedback && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { if (!actionLoading) setSelectedFeedback(null); }}
              className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[40px] shadow-2xl border border-line-soft w-full max-w-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-line-soft flex justify-between items-center bg-paper/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-crimson/10 flex items-center justify-center text-crimson">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-bold text-ink leading-none">{t('feedback.inspectBtn')}</h3>
                    <p className="text-[10px] font-mono font-bold text-ink-soft/50 uppercase mt-1 tracking-widest">
                      Ref: CASE-{(selectedFeedback.id || selectedFeedback._id).substring(0, 8).toUpperCase()}
                    </p>
                  </div>
                </div>
                <button 
                  disabled={actionLoading} 
                  onClick={() => setSelectedFeedback(null)} 
                  className="p-2 hover:bg-white rounded-full text-ink-soft transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 md:p-10 space-y-8 max-h-[75vh] overflow-y-auto">
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-ink-soft mb-4">{t('feedback.hospitalInfo')}</h4>
                  <div className="grid md:grid-cols-2 gap-6 bg-paper p-6 rounded-2xl border border-line-soft">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Building2 size={18} className="text-crimson shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[9px] font-mono uppercase text-ink-soft/60 font-bold">Hospital Name</p>
                          <p className="text-sm font-bold text-ink">
                            {selectedFeedback.hospitalName || selectedFeedback.hospital?.hospitalName || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Activity size={18} className="text-crimson shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[9px] font-mono uppercase text-ink-soft/60 font-bold">License Number</p>
                          <p className="text-sm font-bold text-ink">
                            {selectedFeedback.hospital?.licenseNumber || 'Not recorded'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Mail size={18} className="text-crimson shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[9px] font-mono uppercase text-ink-soft/60 font-bold">Registered Email</p>
                          <p className="text-sm font-bold text-ink">{selectedFeedback.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Phone size={18} className="text-crimson shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[9px] font-mono uppercase text-ink-soft/60 font-bold">Phone Number</p>
                          <p className="text-sm font-bold text-ink">
                            {selectedFeedback.hospital?.phone || 'Not recorded'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin size={18} className="text-crimson shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[9px] font-mono uppercase text-ink-soft/60 font-bold">Facility Location</p>
                          <p className="text-sm font-bold text-ink">
                            {selectedFeedback.hospital?.location?.address || 'Ethiopia'}
                          </p>
                          {selectedFeedback.hospital?.location && (
                            <LocationLink location={selectedFeedback.hospital.location} className="mt-1.5" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rejection and Appeal Comparison */}
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-crimson/5 border border-crimson/20">
                    <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-crimson mb-2 flex items-center gap-1.5">
                      <AlertCircle size={14} /> Rejection Reason
                    </p>
                    <p className="text-sm text-ink italic">
                      "{selectedFeedback.rejectionReason || selectedFeedback.hospital?.rejectionReason || 'No recorded reason'}"
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-paper border border-line-soft">
                    <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-ink-soft mb-2 flex items-center gap-1.5">
                      <MessageSquare size={14} /> {t('feedback.appealMessage')}
                    </p>
                    <p className="text-sm text-ink font-medium leading-relaxed">
                      {selectedFeedback.message}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-line-soft flex flex-wrap gap-4 justify-end">
                  {selectedFeedback.status === 'new' && (
                    <Button 
                      variant="ghost"
                      disabled={actionLoading}
                      onClick={() => handleMarkReviewed(selectedFeedback.id || selectedFeedback._id)}
                      className="shadow-none"
                    >
                      <CheckCircle2 size={16} className="text-verified" /> {t('feedback.markReviewedBtn')}
                    </Button>
                  )}

                  {selectedFeedback.hospital?.verificationStatus !== 'approved' && (
                    <Button 
                      variant="primary"
                      disabled={actionLoading}
                      onClick={() => handleApproveFromAppeal(selectedFeedback)}
                    >
                      <CheckCircle2 size={16} className="text-verified" /> {t('feedback.reApproveBtn')}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default FeedbackPage;