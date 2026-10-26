import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BloodCenterLayout } from '@/layouts/BloodCenterLayout';
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
  RefreshCw,
  CalendarPlus,
  Sparkles
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { fetchPendingHospitals, approveHospital, rejectHospital } from './api/admin-api';
import { LocationLink } from '@/utils/mapsUrl';
import { useDialog } from '@/context/DialogContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import { TEMP_OPEN_ACCESS } from '@/lib/temporaryAccess';
import { myPostsService } from './services/myPostsService';
import type { MockEvent } from './services/myPostsService';

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

const getErrorMessage = (err: unknown, fallback: string): string => {
  if (typeof err === 'string' && err.trim()) return err;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
};

const BloodCenterDashboardPage = () => {
  const { t } = useTranslation();
  const { toast } = useDialog();
  const { user } = useAuth();
  
  const canApprove =
    TEMP_OPEN_ACCESS ||
    user?.role === 'superadmin' ||
    Boolean(user?.permissions?.canApproveHospitals);
  const canPost =
    TEMP_OPEN_ACCESS ||
    user?.role === 'superadmin' ||
    Boolean(user?.permissions?.canPostEvents);
  
  const basePath = '/blood-center';
  
  const [hospitals, setHospitals] = useState<PendingHospital[]>([]);
  const [hospitalsLoading, setHospitalsLoading] = useState(true);
  const [hospitalsError, setHospitalsError] = useState<string | null>(null);
  
  const [selectedHosp, setSelectedHosp] = useState<PendingHospital | null>(null);
  const [showRejectStep, setShowRejectStep] = useState(false);
  const [rejectionReason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [events, setEvents] = useState<MockEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  const loadPendingHospitals = async () => {
    if (!canApprove) return;
    setHospitalsLoading(true);
    setHospitalsError(null);
    try {
      const res = await fetchPendingHospitals();
      if (res.success && Array.isArray(res.hospitals)) {
        setHospitals(res.hospitals);
      } else {
        setHospitals([]);
      }
    } catch (err: unknown) {
      setHospitalsError(getErrorMessage(err, t('adminDashboard.loadFailed')));
    } finally {
      setHospitalsLoading(false);
    }
  };

  const loadEvents = async () => {
    if (!canPost) return;
    setEventsLoading(true);
    try {
      const data = await myPostsService.getMyPosts();
      setEvents(data);
    } catch {
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    loadPendingHospitals();
    loadEvents();
  }, []);

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await approveHospital(id);
      if (res.success) {
        setHospitals(prev => prev.filter(h => h.id !== id));
        setSelectedHosp(null);
        toast.success(t('adminDashboard.approveSuccess'));
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('adminDashboard.loadFailed')));
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      toast.warning(t('adminDashboard.reasonPlaceholder'));
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
        toast.success(t('adminDashboard.rejectSuccess'));
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('adminDashboard.loadFailed')));
    } finally {
      setActionLoading(false);
    }
  };

  const getDisplayTime = (isoString?: string) => {
    if (!isoString) return t('adminDashboard.newCase');
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return t('adminDashboard.newCase');
    }
  };

  return (
    <BloodCenterLayout title={t('bloodCenterDashboard.title')} icon={<Activity size={16} className="stroke-[1.75]" />}>
      <div className="space-y-6">

        {/* PAGE HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-line-soft gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-ink tracking-tight flex items-center gap-2.5">
              <Activity className="w-6 h-6 text-crimson stroke-[1.75]" />
              <span>{t('bloodCenterDashboard.title')}</span>
            </h1>
            <p className="text-sm font-sans text-ink-soft mt-1">
              {t('bloodCenterDashboard.description')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {canPost && (
              <Link
                to={`${basePath}/events`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-crimson hover:bg-crimson-dark text-white rounded-xl text-xs font-sans font-semibold transition-colors shadow-sm shadow-crimson/15"
              >
                <CalendarPlus className="w-4 h-4" />
                <span>{t('bloodCenterDashboard.postNewEvent')}</span>
              </Link>
            )}
          </div>
        </div>

        {/* WELCOME BANNER */}
        <div className="relative overflow-hidden rounded-2xl border border-line-soft bg-white shadow-sm p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute -right-10 -bottom-16 w-56 h-56 rounded-full bg-crimson/[0.07] blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -top-16 w-48 h-48 rounded-full bg-sand/50 blur-3xl pointer-events-none" />

          <div className="space-y-2 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-crimson/[0.06] rounded-full text-[11px] font-mono font-bold uppercase tracking-wider text-crimson border border-crimson/15">
              <Sparkles className="w-3.5 h-3.5 text-crimson stroke-[1.75]" />
              <span>{t('bloodCenterDashboard.networkBadge')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-ink">
              {t('bloodCenterDashboard.welcome', { name: user?.name || user?.centerName || 'Blood Center' })}
            </h2>
            <p className="text-sm font-sans text-ink-soft max-w-2xl leading-relaxed">
              {t('bloodCenterDashboard.welcomeDesc')}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 z-10">
            {canApprove && (
              <button
                type="button"
                onClick={loadPendingHospitals}
                disabled={hospitalsLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-paper hover:bg-paper-dim border border-line-soft text-ink-soft font-sans font-bold rounded-xl text-xs transition-all"
              >
                <RefreshCw className={`w-4 h-4 stroke-[1.75] ${hospitalsLoading ? 'animate-spin' : ''}`} />
                <span>{t('adminDashboard.refreshList')}</span>
              </button>
            )}
          </div>
        </div>

        {/* STATS STRIP */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {canApprove && (
            <AdminStatCard
              label={t('bloodCenterDashboard.statHospitals')}
              value={hospitalsLoading ? '...' : String(hospitals.length)}
              icon={<Clock />}
              chip={
                hospitalsLoading
                  ? { text: t('adminDashboard.statLoading'), tone: 'verified' }
                  : hospitals.length === 0
                    ? { text: t('adminDashboard.statClear'), tone: 'verified' }
                    : { text: t('adminDashboard.statAwaiting'), tone: 'crimson' }
              }
            />
          )}
          {canPost && (
            <AdminStatCard
              label={t('bloodCenterDashboard.statDrives')}
              value={eventsLoading ? '...' : String(events.filter(e => e.status === 'open').length)}
              icon={<CalendarPlus />}
              chip={{ text: t('adminDashboard.statLive'), tone: 'verified' }}
            />
          )}
        </div>

        {/* HOSPITAL APPROVAL SECTION */}
        {canApprove && (
          <>
            <div className="flex items-center justify-between border-b border-line-soft pb-4 gap-4">
              <div>
                <h2 className="text-base font-serif font-bold text-ink flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-crimson stroke-[1.75]" />
                  <span>{t('adminDashboard.facilitiesTitle')}</span>
                </h2>
                <p className="text-xs font-sans text-ink-soft mt-0.5">
                  {t('adminDashboard.facilitiesSubtitle')}
                </p>
              </div>
              {!hospitalsLoading && !hospitalsError && (
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-ink-soft bg-paper border border-line-soft px-2.5 py-1 rounded-lg whitespace-nowrap">
                  {t('adminDashboard.pendingCount', { count: hospitals.length })}
                </span>
              )}
            </div>

            {hospitalsLoading ? (
              <div className="bg-white rounded-2xl border border-line-soft shadow-xs">
                <LoadingState text={t('adminDashboard.loadingHospitals')} />
              </div>
            ) : hospitalsError ? (
              <ErrorState
                title={t('adminDashboard.loadFailed')}
                message={hospitalsError}
                onRetry={loadPendingHospitals}
              />
            ) : hospitals.length > 0 ? (
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
                      {t('adminDashboard.inspectApplication')} <ChevronRight size={14} />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-line-soft">
                <div className="w-12 h-12 mx-auto rounded-xl bg-verified/10 flex items-center justify-center text-verified mb-3">
                  <CheckCircle2 size={24} className="stroke-[1.75]" />
                </div>
                <p className="text-ink-soft font-serif italic text-lg">{t('adminDashboard.noHospitals')}</p>
                <p className="text-xs font-sans text-ink-soft/70 mt-1">{t('adminDashboard.noHospitalsDesc')}</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* --- CENTERED INSPECTION MODAL --- */}
      <AnimatePresence>
        {selectedHosp && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { if (!actionLoading) { setSelectedHosp(null); setShowRejectStep(false); } }}
              className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-line-soft w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="p-5 sm:p-8 border-b border-line-soft flex justify-between items-center bg-paper/30 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-crimson/10 flex items-center justify-center text-crimson shrink-0">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-serif font-bold text-ink leading-none">{t('adminDashboard.reviewModalTitle')}</h3>
                    <p className="text-[10px] font-mono font-bold text-ink-soft/50 uppercase mt-1 tracking-widest">{t('adminDashboard.caseId', { id: selectedHosp.id.toUpperCase() })}</p>
                  </div>
                </div>
                <button disabled={actionLoading} onClick={() => { setSelectedHosp(null); setShowRejectStep(false); }} className="p-2 hover:bg-white rounded-full text-ink-soft transition-colors"><X size={20} /></button>
              </div>

              <div className="p-6 sm:p-8 md:p-12 overflow-y-auto no-scrollbar flex-1">
                {!showRejectStep ? (
                  <>
                    <div className="grid md:grid-cols-2 gap-6 sm:gap-10">
                      <div className="space-y-5 sm:space-y-6">
                        <DetailItem label={t('adminDashboard.legalEntity')} value={selectedHosp.hospitalName} icon={<Building2 />} />
                        <DetailItem label={t('adminDashboard.medicalLicense')} value={selectedHosp.licenseNumber} icon={<Activity />} />
                        <DetailItem label={t('adminDashboard.contactEmail')} value={selectedHosp.email} icon={<Mail />} />
                      </div>
                      <div className="space-y-5 sm:space-y-6">
                        <DetailItem label={t('adminDashboard.phoneLine')} value={selectedHosp.phone} icon={<Phone />} />
                        <DetailItem label={t('adminDashboard.facilityAddress')} value={selectedHosp.location?.address || 'N/A'} icon={<MapPin />} />
                        {selectedHosp.location && (
                          <div className="p-3.5 sm:p-4 bg-paper rounded-2xl border border-line-soft">
                            <LocationLink location={selectedHosp.location} showLabel label={t('adminDashboard.facilityMap')} />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <Button 
                        variant="ghost" 
                        disabled={actionLoading}
                        onClick={() => setShowRejectStep(true)}
                        className="flex-1 border border-crimson text-crimson hover:bg-crimson hover:text-white text-xs font-bold uppercase tracking-widest h-12 sm:h-14 rounded-2xl"
                      >
                        {t('adminDashboard.declineBtn')}
                      </Button>
                      <Button 
                        variant="primary" 
                        disabled={actionLoading}
                        onClick={() => handleApprove(selectedHosp.id)}
                        className="flex-1 h-12 sm:h-14 rounded-2xl font-bold flex gap-2 items-center justify-center text-xs uppercase tracking-wider"
                      >
                        <CheckCircle2 size={18} /> {t('adminDashboard.approveBtn')}
                      </Button>
                    </div>
                  </>
                ) : (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <div className="flex items-center gap-3 text-crimson">
                      <AlertCircle size={24} />
                      <h3 className="text-lg sm:text-xl font-serif font-bold">{t('adminDashboard.rejectionReasonTitle')}</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-ink-soft">{t('adminDashboard.rejectionReasonDesc')}</p>
                    <textarea 
                      autoFocus
                      disabled={actionLoading}
                      className="w-full h-36 sm:h-40 p-4 sm:p-5 bg-paper border border-line-soft rounded-2xl outline-none focus:border-crimson text-sm resize-none"
                      placeholder={t('adminDashboard.reasonPlaceholder')}
                      value={rejectionReason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                    <div className="flex gap-3 sm:gap-4">
                      <Button variant="ghost" disabled={actionLoading} onClick={() => setShowRejectStep(false)} className="flex-1 h-12 rounded-xl">{t('adminDashboard.backBtn')}</Button>
                      <Button 
                        variant="primary" 
                        disabled={!rejectionReason || actionLoading}
                        onClick={() => handleConfirmReject(selectedHosp.id)}
                        className="flex-1 h-12 rounded-xl font-bold justify-center text-xs"
                      >
                        {t('adminDashboard.confirmRejectBtn')}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </BloodCenterLayout>
  );
};

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

export default BloodCenterDashboardPage;
