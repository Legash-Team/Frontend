import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';

type CallbackState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'no_session' }
  | { status: 'ready' };

// Note: The 'ready' state means a Supabase session was obtained.
// The access token is available but NOT extracted or logged here.
// Backend integration (POST /api/auth/google) is pending contract verification.

export const AuthCallbackPage = () => {
  const [state, setState] = useState<CallbackState>({ status: 'loading' });
  const hasHandled = useRef(false);

  useEffect(() => {
    if (hasHandled.current) return;
    hasHandled.current = true;

    if (!supabase) {
      setState({
        status: 'error',
        message: 'Authentication is not configured. Please contact support.',
      });
      return;
    }

    const supabaseClient = supabase;

    const handleCallback = async () => {
      try {
        const { data, error } = await supabaseClient.auth.getSession();

        if (error) {
          setState({ status: 'error', message: error.message });
          return;
        }

        if (!data.session) {
          setState({ status: 'no_session' });
          return;
        }

        // Session is available. The access token is available at:
        // data.session.access_token
        //
        // BACKEND INTEGRATION BOUNDARY:
        // The next step is to send this token to the backend endpoint
        // POST /api/auth/google to exchange it for a LEGASH JWT.
        // The backend contract has NOT been verified yet.
        // Do NOT call the endpoint until the contract is confirmed.
        // Do NOT store a LEGASH JWT or claim the user is authenticated.
        // Keep the Supabase session intact.

        setState({ status: 'ready' });
      } catch (err: any) {
        setState({
          status: 'error',
          message: err?.message || 'An unexpected error occurred.',
        });
      }
    };

    handleCallback();
  }, []);

  if (state.status === 'loading') {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl border border-line-soft shadow-xs">
          <LoadingState text="Completing sign-in..." />
        </div>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl border border-line-soft shadow-xs p-6">
          <ErrorState
            title="Sign-in failed"
            message={state.message}
            onRetry={() => (window.location.href = '/login')}
            retryLabel="Back to Login"
          />
        </div>
      </div>
    );
  }

  if (state.status === 'no_session') {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl border border-line-soft shadow-xs p-6">
          <ErrorState
            title="No session found"
            message="We could not find a valid sign-in session. Please try signing in again."
            onRetry={() => (window.location.href = '/login')}
            retryLabel="Back to Login"
          />
        </div>
      </div>
    );
  }

  // status === 'ready'
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-line-soft shadow-xs p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-verified/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-verified" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-serif font-bold text-ink mb-2">Google Account Verified</h2>
        <p className="text-sm text-ink-soft mb-6">
          Your Google account has been verified, but LEGASH sign-in cannot complete yet. The backend integration for this flow is not yet available. Please check back later or use email/password login.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center justify-center px-6 py-2.5 bg-crimson hover:bg-crimson-dark text-white rounded-xl text-sm font-semibold transition-colors"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
