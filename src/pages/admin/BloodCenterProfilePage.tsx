import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BloodCenterLayout } from '@/layouts/BloodCenterLayout';
import Button from '@/components/ui/Button';
import axiosInstance from '@/api/axiosInstance';
import { useAuth } from '@/features/auth/context/AuthContext';
import { requestPasswordResetEmail } from '@/features/auth/api/auth-api';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Pencil,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
} from 'lucide-react';
import { LocationLink } from '@/utils/mapsUrl';

interface BloodCenterProfileData {
  id: string;
  name: string;
  centerName: string;
  email: string;
  phone: string;
  location?: {
    lat?: number | null;
    lng?: number | null;
    address?: string;
    mapsUrl?: string | null;
  } | null;
  createdAt?: string;
}

interface BloodCenterProfilePageProps {
  isEditMode?: boolean;
}

export const BloodCenterProfilePage: React.FC<BloodCenterProfilePageProps> = ({ isEditMode = false }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const isEditing = isEditMode || location.pathname.endsWith('/edit');

  const [profile, setProfile] = useState<BloodCenterProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Edit Form State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  const [formCenterName, setFormCenterName] = useState('');
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Reset Password State
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  const { updateUser } = useAuth();

  const handleRequestResetEmail = async () => {
    if (!profile?.email) return;
    setResetError(null);
    setResetSuccess(null);
    setResetLoading(true);

    try {
      const res = await requestPasswordResetEmail(profile.email);
      setResetSuccess(res.message || `A password reset code/link has been sent to ${profile.email}.`);
    } catch (err: any) {
      setResetError(typeof err === 'string' ? err : (err?.response?.data?.error || err?.message || 'Failed to send password reset email.'));
    } finally {
      setResetLoading(false);
    }
  };

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get<{ success: boolean; profile: BloodCenterProfileData }>(
        '/api/blood-center/profile'
      );
      if (res.data?.success && res.data.profile) {
        setProfile(res.data.profile);
        setFormCenterName(res.data.profile.centerName || '');
        setFormName(res.data.profile.name || '');
        setFormPhone(res.data.profile.phone || '');
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Failed to load blood center profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditSaving(true);
    setEditError(null);

    const payload: any = {
      centerName: formCenterName.trim(),
      name: formName.trim(),
      phone: formPhone.trim(),
    };

    try {
      const res = await axiosInstance.put<{
        success: boolean;
        message?: string;
        profile: BloodCenterProfileData;
      }>('/api/blood-center/profile', payload);

      if (res.data?.success) {
        setProfile(res.data.profile);
        updateUser({
          name: res.data.profile.name,
          centerName: res.data.profile.centerName,
        });
        setEditSuccess('Profile updated successfully.');
        setTimeout(() => setEditSuccess(null), 3000);
        setEditModalOpen(false);
        if (isEditing) {
          navigate('/blood-center/profile');
        }
      }
    } catch (err: any) {
      setEditError(err?.response?.data?.error || err?.message || 'Failed to update profile.');
    } finally {
      setEditSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await axiosInstance.post<{ success: boolean; message?: string }>(
        '/api/blood-center/profile/change-password',
        {
          currentPassword,
          newPassword,
        }
      );

      if (res.data?.success) {
        setPasswordSuccess('Password updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccess(null), 4000);
      }
    } catch (err: any) {
      setPasswordError(err?.response?.data?.error || err?.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (isEditing) {
    return (
      <BloodCenterLayout title={t('bloodCenterProfile.editProfile')} icon={<Building2 size={16} />}>
        <div className="space-y-6 max-w-3xl mx-auto pb-12">
          {/* Breadcrumb Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-line-soft gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-ink-soft mb-1">
                <Link to="/blood-center/profile" className="hover:text-crimson transition-colors">
                  {t('bloodCenterProfile.title')}
                </Link>
                <span>/</span>
                <span className="text-ink font-semibold">{t('bloodCenterProfile.editProfile')}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-ink">
                {t('bloodCenterProfile.editProfile')}
              </h1>
              <p className="text-xs text-ink-soft font-sans mt-0.5">
                {t('bloodCenterProfile.description')}
              </p>
            </div>
            <Link
              to="/blood-center/profile"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-line-soft text-ink-soft hover:text-ink hover:bg-paper rounded-xl text-xs font-semibold transition-colors self-start sm:self-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Profile</span>
            </Link>
          </div>

          {editError && (
            <div className="p-4 bg-crimson/5 border border-crimson/20 rounded-2xl flex items-center gap-3 text-crimson text-sm">
              <AlertCircle size={18} className="shrink-0" />
              <span>{editError}</span>
            </div>
          )}

          {loading ? (
            <div className="bg-white border border-line-soft rounded-[28px] p-12 text-center text-xs font-mono text-ink-soft">
              Loading profile details...
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} className="bg-white border border-line-soft rounded-[28px] p-6 sm:p-8 shadow-xs space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-mono font-bold text-ink uppercase tracking-wider mb-1.5">
                    Blood Center Name <span className="text-crimson">*</span>
                  </label>
                  <input
                    type="text"
                    value={formCenterName}
                    onChange={(e) => setFormCenterName(e.target.value)}
                    required
                    placeholder="e.g. National Blood Bank"
                    className="w-full px-4 py-2.5 bg-paper border border-line-soft rounded-xl text-xs font-sans text-ink focus:outline-none focus:border-crimson"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-ink uppercase tracking-wider mb-1.5">
                    Contact Person Name <span className="text-crimson">*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    placeholder="e.g. Dr. Abebe"
                    className="w-full px-4 py-2.5 bg-paper border border-line-soft rounded-xl text-xs font-sans text-ink focus:outline-none focus:border-crimson"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-mono font-bold text-ink uppercase tracking-wider mb-1.5">
                    Emergency Phone Number
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+251..."
                    className="w-full px-4 py-2.5 bg-paper border border-line-soft rounded-xl text-xs font-mono text-ink focus:outline-none focus:border-crimson"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-5 border-t border-line-soft">
                <button
                  type="button"
                  onClick={() => navigate('/blood-center/profile')}
                  className="px-5 py-2.5 border border-line-soft text-ink-soft hover:text-ink hover:bg-paper rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={editSaving}
                  loadingText="Saving Changes..."
                  className="px-6 gap-2"
                >
                  <span>Save Changes</span>
                </Button>
              </div>
            </form>
          )}
        </div>
      </BloodCenterLayout>
    );
  }

  return (
    <BloodCenterLayout title={t('bloodCenterProfile.title')} icon={<Building2 size={16} />}>
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        {/* Header Banner */}
        <div className="bg-white border border-line-soft rounded-[28px] p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-crimson/10 border border-crimson/20 flex items-center justify-center text-crimson font-serif font-bold text-xl uppercase tracking-tighter shrink-0">
              {(profile?.centerName || 'BC').slice(0, 2)}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-ink">
                {profile?.centerName || t('bloodCenterProfile.title')}
              </h1>
              <p className="text-xs text-ink-soft font-sans mt-0.5">
                {t('bloodCenterProfile.description')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchProfile}
              disabled={loading}
              className="gap-2 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            <Link
              to="/blood-center/profile/edit"
              className="inline-flex items-center gap-2 px-4 py-2 bg-crimson hover:bg-crimson-dark text-white rounded-xl text-xs font-semibold transition-colors shadow-xs shrink-0"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>{t('bloodCenterProfile.editProfile')}</span>
            </Link>
          </div>
        </div>

        {/* Global Success / Error Banners */}
        {editSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
            <span>{editSuccess}</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-crimson/5 border border-crimson/20 rounded-2xl flex items-center gap-3 text-crimson text-sm">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Details Card */}
          <div className="bg-white border border-line-soft rounded-[28px] p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2.5 mb-4 pb-3 border-b border-line-soft">
                <div className="flex items-center gap-2 text-ink font-mono font-bold text-sm uppercase tracking-wider">
                  <Building2 className="w-4 h-4 text-crimson" />
                  <span>Contact Information</span>
                </div>
                <Link
                  to="/blood-center/profile/edit"
                  className="text-xs font-sans text-crimson hover:underline flex items-center gap-1"
                >
                  <Pencil className="w-3 h-3" />
                  <span>Edit</span>
                </Link>
              </div>

              <div className="space-y-4 text-xs font-sans">
                <div className="p-3 bg-paper/60 border border-line-soft rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-soft">
                      Blood Center Name
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider bg-verified/10 text-verified px-2 py-0.5 rounded font-semibold">
                      Editable
                    </span>
                  </div>
                  <p className="text-sm font-serif font-bold text-ink mt-0.5">
                    {profile?.centerName || '—'}
                  </p>
                </div>

                <div className="p-3 bg-paper/60 border border-line-soft rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-soft">
                      Contact Person Name
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider bg-verified/10 text-verified px-2 py-0.5 rounded font-semibold">
                      Editable
                    </span>
                  </div>
                  <p className="text-sm font-sans font-semibold text-ink mt-0.5">
                    {profile?.name || '—'}
                  </p>
                </div>

                <div className="p-3 bg-paper/60 border border-line-soft rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-soft">
                      Email Address
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider bg-ink/5 text-ink-soft px-2 py-0.5 rounded font-semibold">
                      Permanent
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-sm font-mono text-ink flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-ink-soft" />
                      <span>{profile?.email || '—'}</span>
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-paper/60 border border-line-soft rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-soft">
                      Phone Number
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider bg-verified/10 text-verified px-2 py-0.5 rounded font-semibold">
                      Editable
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-sm font-mono text-ink flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-ink-soft" />
                      <span>{profile?.phone || 'Not provided'}</span>
                    </p>
                    <Link
                      to="/blood-center/profile/edit"
                      className="p-1 text-ink-soft hover:text-crimson transition-colors"
                      title="Edit Phone Number"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Location Details Card */}
          <div className="bg-white border border-line-soft rounded-[28px] p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2.5 mb-4 pb-3 border-b border-line-soft">
                <div className="flex items-center gap-2 text-ink font-mono font-bold text-sm uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-crimson" />
                  <span>Location & Map Details</span>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider bg-ink/5 text-ink-soft px-2 py-0.5 rounded font-semibold">
                  Permanent
                </span>
              </div>

              <div className="space-y-4 text-xs font-sans">
                <div className="p-3.5 bg-paper/60 border border-line-soft rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-soft">
                      Street / Facility Address
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider bg-ink/5 text-ink-soft px-2 py-0.5 rounded font-semibold">
                      Permanent
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-sans text-ink">
                      {profile?.location?.address || 'No street address provided'}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-paper/60 border border-line-soft rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-soft">
                      Geo Coordinates
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider bg-ink/5 text-ink-soft px-2 py-0.5 rounded font-semibold">
                      Permanent
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-mono text-ink-soft">
                      {profile?.location?.lat != null && profile?.location?.lng != null
                        ? `Lat: ${profile.location.lat.toFixed(5)}, Lng: ${profile.location.lng.toFixed(5)}`
                        : 'Coordinates not set'}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <LocationLink
                    location={profile?.location}
                    showAddress={false}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-paper hover:bg-paper-dim border border-line-soft rounded-xl text-xs font-semibold text-crimson transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white border border-line-soft rounded-[28px] p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-line-soft">
            <Lock className="w-4 h-4 text-crimson" />
            <h2 className="text-sm font-mono font-bold text-ink uppercase tracking-wider">
              Security & Password
            </h2>
          </div>

          {passwordSuccess && (
            <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm">
              <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="mb-4 p-4 bg-crimson/5 border border-crimson/20 rounded-2xl flex items-center gap-3 text-crimson text-sm">
              <AlertCircle size={18} className="shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="Enter current password"
                  className="w-full px-4 py-2.5 bg-paper border border-line-soft rounded-xl text-xs font-sans text-ink focus:outline-none focus:border-crimson"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Min 8 characters"
                    className="w-full px-4 py-2.5 bg-paper border border-line-soft rounded-xl text-xs font-sans text-ink focus:outline-none focus:border-crimson"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repeat new password"
                    className="w-full px-4 py-2.5 bg-paper border border-line-soft rounded-xl text-xs font-sans text-ink focus:outline-none focus:border-crimson"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-2">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={passwordLoading}
                className="gap-2"
              >
                {passwordLoading ? 'Updating Password...' : 'Change Password'}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setResetModalOpen(true);
                  setResetSuccess(null);
                  setResetError(null);
                }}
                className="gap-2 text-crimson hover:bg-crimson/5 border-crimson/30"
              >
                Reset Password
              </Button>
            </div>
          </form>
        </div>

        {/* Edit Modal */}
        {editModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-line-soft rounded-[28px] max-w-lg w-full p-6 sm:p-8 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-line-soft mb-6">
                <h3 className="text-lg font-serif font-bold text-ink">Edit Blood Center Profile</h3>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="text-ink-soft hover:text-ink font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              {editError && (
                <div className="mb-4 p-3.5 bg-crimson/5 border border-crimson/20 rounded-xl text-crimson text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                    Blood Center Name
                  </label>
                  <input
                    type="text"
                    value={formCenterName}
                    onChange={(e) => setFormCenterName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-paper border border-line-soft rounded-xl text-xs font-sans text-ink focus:outline-none focus:border-crimson"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-paper border border-line-soft rounded-xl text-xs font-sans text-ink focus:outline-none focus:border-crimson"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+251..."
                    className="w-full px-4 py-2.5 bg-paper border border-line-soft rounded-xl text-xs font-sans text-ink focus:outline-none focus:border-crimson"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-line-soft">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={editSaving}
                  >
                    {editSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reset Password Modal */}
        {resetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white border border-line-soft rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-line-soft">
                <h3 className="font-serif font-bold text-ink text-lg">Reset Password</h3>
                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  className="text-ink-soft hover:text-ink text-sm font-mono"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs font-sans text-ink-soft">
                We will send a password reset verification code to your registered blood center email address.
              </p>

              <div className="p-3 bg-paper border border-line-soft rounded-xl text-xs font-mono font-bold text-ink">
                {profile?.email}
              </div>

              {resetSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>{resetSuccess}</span>
                </div>
              )}

              {resetError && (
                <div className="p-3 bg-crimson/10 border border-crimson/20 text-crimson rounded-xl text-xs font-medium flex items-center gap-2">
                  <AlertCircle size={16} className="text-crimson shrink-0" />
                  <span>{resetError}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setResetModalOpen(false)}
                >
                  Close
                </Button>

                {!resetSuccess && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={resetLoading}
                    onClick={handleRequestResetEmail}
                  >
                    {resetLoading ? 'Sending...' : 'Send Reset Code'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </BloodCenterLayout>
  );
};

export default BloodCenterProfilePage;
