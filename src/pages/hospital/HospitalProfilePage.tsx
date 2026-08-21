import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import Button from '@/components/ui/Button';
import {
  getHospitalProfile,
  changeHospitalPassword,
  requestPasswordResetEmail,
  deleteHospitalAccount,
} from '@/features/hospital/api/hospital-api';
import type { HospitalProfile, LocationData } from '@/features/hospital/types/hospital-types';
import {
  Building2,
  Mail,
  Phone,
  FileText,
  MapPin,
  Pencil,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Lock,
  Eye,
  EyeOff,
  Trash2,
  AlertTriangle,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';

export const HospitalProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<HospitalProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  // Forgot Current Password Modal
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);

  // Delete Account Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getHospitalProfile();
      if (res) {
        const raw = (res as unknown as Record<string, unknown>) || {};
        const hospitalObj =
          (raw.hospital as Record<string, unknown>) ||
          (raw.data as Record<string, unknown>) ||
          raw;

        setProfile({
          id: (hospitalObj.id as string) || (raw.id as string) || undefined,
          name:
            (hospitalObj.name as string) ||
            (hospitalObj.hospitalName as string) ||
            (raw.name as string) ||
            'N/A',
          email: (hospitalObj.email as string) || (raw.email as string) || 'N/A',
          phone: (hospitalObj.phone as string) || (raw.phone as string) || 'N/A',
          licenseNumber:
            (hospitalObj.licenseNumber as string) ||
            (hospitalObj.license_number as string) ||
            (raw.licenseNumber as string) ||
            'N/A',
          location:
            (hospitalObj.location as LocationData | null) ||
            (raw.location as LocationData | null) ||
            null,
        });
      }
    } catch (err: unknown) {
      let message = 'Failed to load hospital profile data.';
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string; error?: string } } };
        message = axiosErr.response?.data?.message || axiosErr.response?.data?.error || message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError('Current password is required.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await changeHospitalPassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setPasswordSuccess(response.message || 'Hospital password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      let message = 'Failed to update password. Please verify current password.';
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string; error?: string } } };
        message = axiosErr.response?.data?.message || axiosErr.response?.data?.error || message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setPasswordError(message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleRequestResetEmail = async () => {
    if (!profile?.email || profile.email === 'N/A') return;
    setForgotError(null);
    setForgotSuccess(null);
    setForgotLoading(true);

    try {
      const res = await requestPasswordResetEmail(profile.email);
      setForgotSuccess(res.message || `Password reset link sent to ${profile.email}`);
    } catch (err: unknown) {
      let message = 'Failed to send reset link.';
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string; error?: string } } };
        message = axiosErr.response?.data?.message || axiosErr.response?.data?.error || message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setForgotError(message);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteConfirmed) return;
    setDeleteError(null);
    setDeleteLoading(true);

    try {
      await deleteHospitalAccount();
      // Clear session state
      localStorage.removeItem('token');
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('auth_token');

      // Redirect to login page
      navigate('/login', {
        replace: true,
        state: { message: 'Your hospital account has been permanently deleted.' },
      });
    } catch (err: unknown) {
      let message = 'Failed to delete account. Please try again later.';
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string; error?: string } } };
        message = axiosErr.response?.data?.message || axiosErr.response?.data?.error || message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setDeleteError(message);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-line-soft">
          <div>
            <h1 className="text-2xl font-serif font-bold text-ink tracking-tight flex items-center gap-2.5">
              <Building2 className="w-6 h-6 text-crimson stroke-[1.75]" />
              <span>Hospital Profile</span>
            </h1>
            <p className="text-sm font-sans text-ink-soft mt-1">
              Registered hospital credentials, password security, and verified emergency contact information.
            </p>
          </div>

          <Link
            to="/hospital/profile/edit"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-crimson hover:bg-crimson-dark text-white rounded-xl font-sans font-semibold text-xs transition-colors shadow-xs"
          >
            <Pencil className="w-4 h-4" />
            <span>Edit Profile</span>
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl p-12 text-center border border-line-soft shadow-xs">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-crimson border-t-transparent"></div>
            <p className="mt-3 text-sm font-sans text-ink-soft font-medium">Fetching hospital profile...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-crimson/5 border border-crimson/20 rounded-xl p-4 text-ink text-sm flex items-start justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-crimson shrink-0 stroke-[1.75]" />
              <div>
                <p className="font-serif font-bold text-ink">Unable to fetch profile</p>
                <p className="text-crimson text-xs mt-0.5 font-sans">{error}</p>
              </div>
            </div>
            <button
              onClick={fetchProfile}
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider bg-crimson/10 hover:bg-crimson/20 text-crimson px-3 py-1.5 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Profile Card View */}
        {!loading && !error && profile && (
          <>
            <div className="bg-white rounded-2xl border border-line-soft shadow-xs overflow-hidden">
              <div className="bg-gradient-to-r from-crimson to-crimson-dark px-6 py-5 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white font-bold text-xl shadow-md border border-white/20">
                    <Building2 className="w-6 h-6 stroke-[1.75]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-serif font-bold tracking-tight">{profile.name}</h2>
                    <p className="text-xs text-red-100 font-mono">
                      License #: {profile.licenseNumber}
                    </p>
                  </div>
                </div>

                <Link
                  to="/hospital/profile/edit"
                  className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 bg-white text-crimson hover:bg-paper rounded-lg font-mono font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit Information</span>
                </Link>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Hospital Name (Editable) */}
                  <div className="p-4 bg-paper/60 border border-line-soft rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold uppercase text-ink-soft/70 tracking-wider flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-crimson stroke-[1.75]" />
                        Facility Name
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-wider bg-verified/10 text-verified px-2 py-0.5 rounded font-semibold">
                        Editable
                      </span>
                    </div>
                    <p className="text-base font-serif font-bold text-ink">{profile.name}</p>
                  </div>

                  {/* Email Address (Editable with verification) */}
                  <div className="p-4 bg-paper/60 border border-line-soft rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold uppercase text-ink-soft/70 tracking-wider flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-crimson stroke-[1.75]" />
                        Official Email (Login ID)
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold">
                        Requires Verification
                      </span>
                    </div>
                    <p className="text-base font-sans font-medium text-ink">{profile.email}</p>
                  </div>

                  {/* Phone Number (Editable directly) */}
                  <div className="p-4 bg-paper/60 border border-line-soft rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold uppercase text-ink-soft/70 tracking-wider flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-crimson stroke-[1.75]" />
                        Emergency Phone Line
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-wider bg-verified/10 text-verified px-2 py-0.5 rounded font-semibold">
                        Direct Edit
                      </span>
                    </div>
                    <p className="text-base font-sans font-medium text-ink">{profile.phone}</p>
                  </div>

                  {/* License Number (Read-Only) */}
                  <div className="p-4 bg-paper/60 border border-line-soft rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold uppercase text-ink-soft/70 tracking-wider flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-crimson stroke-[1.75]" />
                        Ministry License / Reg Number
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-wider bg-paper-dim text-ink-soft px-2 py-0.5 rounded font-semibold border border-line-soft">
                        Read-Only
                      </span>
                    </div>
                    <p className="text-base font-mono font-semibold text-ink">
                      {profile.licenseNumber}
                    </p>
                  </div>
                </div>

                {/* Geolocation Pin Coordinates (Read-Only) */}
                <div className="p-5 bg-crimson/5 border border-crimson/15 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-serif font-bold text-ink tracking-tight flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-crimson stroke-[1.75]" />
                      Hospital Coordinates (Emergency Dispatch)
                    </span>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-crimson/10 text-crimson px-2 py-0.5 rounded">
                      Read-Only
                    </span>
                  </div>

                  {profile.location ? (
                    <div className="text-xs font-sans text-ink-soft">
                      <p className="font-semibold text-ink">
                        Latitude: <span className="font-mono text-crimson font-bold">{profile.location.lat}</span> |{' '}
                        Longitude: <span className="font-mono text-crimson font-bold">{profile.location.lng}</span>
                      </p>
                      <p className="text-[11px] font-sans text-ink-soft/70 mt-1">
                        Coordinates are fixed for automated nearest-hospital emergency dispatching.
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs font-sans text-ink-soft/70">No geographical coordinates registered.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Change Password Section */}
            <div className="bg-white rounded-2xl border border-line-soft shadow-xs overflow-hidden">
              <div className="px-6 py-4 bg-paper border-b border-line-soft flex items-center justify-between">
                <h2 className="text-base font-serif font-bold text-ink flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-crimson stroke-[1.75]" />
                  <span>Change Password</span>
                </h2>
                <span className="text-xs text-ink-soft font-sans">
                  Logged-in session security
                </span>
              </div>

              <form onSubmit={handleChangePassword} className="p-6 sm:p-8 space-y-6">
                {passwordSuccess && (
                  <div className="p-4 bg-verified/10 border border-verified/20 text-verified rounded-xl text-xs font-medium flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0 stroke-[1.75]" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                {passwordError && (
                  <div className="p-4 bg-crimson/10 border border-crimson/20 text-crimson rounded-xl text-xs font-medium flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 stroke-[1.75]" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {/* Current Password */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono font-bold text-ink-soft uppercase tracking-wider">
                      Current Password <span className="text-crimson">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft/40 w-4 h-4" />
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-11 pl-10 pr-10 bg-paper border border-line-soft rounded-xl text-sm outline-none focus:border-crimson"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword((prev) => !prev)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft/40 hover:text-ink"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono font-bold text-ink-soft uppercase tracking-wider">
                      New Password <span className="text-crimson">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft/40 w-4 h-4" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min. 6 chars"
                        className="w-full h-11 pl-10 pr-10 bg-paper border border-line-soft rounded-xl text-sm outline-none focus:border-crimson"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft/40 hover:text-ink"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono font-bold text-ink-soft uppercase tracking-wider">
                      Confirm New Password <span className="text-crimson">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft/40 w-4 h-4" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full h-11 pl-10 pr-10 bg-paper border border-line-soft rounded-xl text-sm outline-none focus:border-crimson"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft/40 hover:text-ink"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-line-soft">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotModalOpen(true);
                      setForgotSuccess(null);
                      setForgotError(null);
                    }}
                    className="text-xs font-mono font-bold uppercase tracking-wider text-crimson hover:underline text-left"
                  >
                    Forgot Current Password? Request Reset via Email
                  </button>

                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={passwordLoading}
                    loadingText="Updating Password..."
                    className="px-6 text-xs"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Update Password</span>
                  </Button>
                </div>
              </form>
            </div>

            {/* Danger Zone: Delete Account */}
            <div className="bg-crimson/5 rounded-2xl border border-crimson/20 p-6 sm:p-8 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-serif font-bold text-crimson flex items-center gap-2">
                    <Trash2 className="w-5 h-5 stroke-[1.75]" />
                    <span>Delete Hospital Account</span>
                  </h3>
                  <p className="text-xs text-ink-soft mt-1 font-sans max-w-xl">
                    Permanently delete your hospital profile, remove live inventory listings, and terminate portal access. This action is irreversible.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setDeleteModalOpen(true);
                    setDeleteConfirmed(false);
                    setDeleteError(null);
                  }}
                  className="px-4 py-2 bg-crimson hover:bg-crimson-dark text-white rounded-xl text-xs font-sans font-semibold transition-colors shadow-xs flex items-center gap-1.5 shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Account</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-line-soft rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-line-soft">
              <h3 className="font-serif font-bold text-ink text-lg">Reset Password via Email</h3>
              <button
                type="button"
                onClick={() => setForgotModalOpen(false)}
                className="text-ink-soft hover:text-ink text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <p className="text-xs font-sans text-ink-soft">
              We will send a password reset verification link to your registered official hospital email address:
            </p>

            <div className="p-3 bg-paper border border-line-soft rounded-xl text-xs font-mono font-bold text-ink">
              {profile?.email}
            </div>

            {forgotSuccess && (
              <div className="p-3 bg-verified/10 border border-verified/20 text-verified rounded-xl text-xs font-medium">
                {forgotSuccess}
              </div>
            )}

            {forgotError && (
              <div className="p-3 bg-crimson/10 border border-crimson/20 text-crimson rounded-xl text-xs font-medium">
                {forgotError}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setForgotModalOpen(false)}
                className="px-4 py-2 border border-line-soft text-ink-soft rounded-xl text-xs font-semibold hover:bg-paper"
              >
                Close
              </button>

              {!forgotSuccess && (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  isLoading={forgotLoading}
                  loadingText="Sending..."
                  onClick={handleRequestResetEmail}
                  className="px-5 text-xs"
                >
                  Send Reset Link
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-crimson/30 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-crimson pb-3 border-b border-line-soft">
              <div className="p-3 bg-crimson/10 rounded-xl">
                <AlertTriangle className="w-6 h-6 stroke-[1.75]" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-ink">Permanent Account Deletion</h3>
                <p className="text-xs text-crimson font-sans">Warning: This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-ink-soft leading-relaxed">
              Deleting your hospital account will remove all registered blood stock, cancel pending blood requests, and revoke access to the Legash Emergency Blood Network.
            </p>

            {deleteError && (
              <div className="p-3 bg-crimson/10 border border-crimson/20 text-crimson rounded-xl text-xs font-medium">
                {deleteError}
              </div>
            )}

            <label className="flex items-start gap-3 p-3 bg-crimson/5 border border-crimson/20 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={deleteConfirmed}
                onChange={(e) => setDeleteConfirmed(e.target.checked)}
                className="mt-0.5 accent-crimson rounded"
              />
              <span className="text-xs font-sans text-ink font-medium">
                I understand that account deletion is permanent and all hospital records will be irreversibly erased.
              </span>
            </label>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleteLoading}
                className="px-4 py-2 border border-line-soft text-ink rounded-xl text-xs font-semibold hover:bg-paper"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={!deleteConfirmed || deleteLoading}
                className="px-5 py-2 bg-crimson hover:bg-crimson-dark disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-sans font-bold transition-all shadow-xs flex items-center gap-2"
              >
                {deleteLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                    <span>Deleting Account...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Permanently Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default HospitalProfilePage;

