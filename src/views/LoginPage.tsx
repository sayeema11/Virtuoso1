import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  User,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  KeyRound,
  Lock,
} from 'lucide-react';
import { useAuth } from '../services/AuthContext';
import { UserRole } from '../types';

interface LoginPageProps {
  onBackToApp?: () => void;
  isModal?: boolean;
}

export interface FormattedAuthError {
  code: string;
  title: string;
  description: string;
}

export function parseFirebaseAuthError(err: any): FormattedAuthError {
  const code = err?.code || 'auth/unknown';
  const rawMsg = err?.message || 'An unexpected error occurred during Google authentication.';

  switch (code) {
    case 'auth/popup-closed-by-user':
      return {
        code,
        title: 'Sign-In Cancelled',
        description: 'The Google Sign-In popup was closed before completing authentication. Please try again.',
      };
    case 'auth/popup-blocked':
      return {
        code,
        title: 'Popup Blocked',
        description: 'Your browser blocked the Google Sign-In popup window. Please allow popups for this app.',
      };
    default:
      return {
        code,
        title: 'Authentication Notice',
        description: rawMsg.replace(/^Firebase:\s*/i, '').replace(/\(auth\/[^)]+\)\.?/i, '').trim() || rawMsg,
      };
  }
}

export const LoginPage: React.FC<LoginPageProps> = ({ onBackToApp, isModal = false }) => {
  const {
    signInWithGoogle,
    signInAsLocalUser,
    firebaseUser,
    signOutUser,
  } = useAuth();

  const [formattedError, setFormattedError] = useState<FormattedAuthError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setFormattedError(null);
      await signInWithGoogle();
      setSuccessMsg('Signed in with Google successfully!');
      if (onBackToApp) setTimeout(onBackToApp, 500);
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      setFormattedError(parseFirebaseAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocalProfileLogin = () => {
    setIsLoading(true);
    setFormattedError(null);
    signInAsLocalUser('learner@virtuoso.io', 'Virtuoso Learner', 'apprentice');
    setSuccessMsg('Signed in with Quick Profile access!');
    if (onBackToApp) setTimeout(onBackToApp, 500);
    setIsLoading(false);
  };

  return (
    <div
      className={`w-full ${
        isModal
          ? 'p-6 sm:p-8 bg-[#F5EEE4] rounded-2xl'
          : 'min-h-[85vh] flex items-center justify-center p-4 sm:p-6 lg:p-12'
      }`}
    >
      <div className="w-full max-w-md mx-auto space-y-5">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          {onBackToApp && (
            <button
              onClick={onBackToApp}
              className="inline-flex items-center gap-1.5 text-xs text-[#111111]/70 hover:text-[#111111] mb-1 font-medium transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Workspace</span>
            </button>
          )}

          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white shadow-md">
            <ShieldCheck className="w-7 h-7" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-[#111111] uppercase tracking-tight font-['Cabinet_Grotesk']">
            {firebaseUser ? 'Active Session' : 'Sign In to Virtuoso'}
          </h2>

          <p className="text-xs text-[#111111]/70 max-w-sm mx-auto">
            {firebaseUser
              ? 'You are securely authenticated via Firebase Authentication & Cloud Firestore.'
              : 'Sign in with your Google account to access your skill matrix, assessments, and workplace evidence.'}
          </p>
        </div>

        {/* Card Frame */}
        <div className="virt-surface p-6 sm:p-7 rounded-3xl border border-[#111111]/15 shadow-xl space-y-5">
          {/* Active Session Display if Already Authenticated */}
          {firebaseUser ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#E8DDCC]/60 border border-[#111111]/10 flex items-center gap-3.5">
                {firebaseUser.photoURL ? (
                  <img
                    src={firebaseUser.photoURL}
                    alt={firebaseUser.displayName || 'User'}
                    className="w-12 h-12 rounded-full border-2 border-white shadow-xs object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white flex items-center justify-center font-bold text-lg">
                    {(firebaseUser.displayName || firebaseUser.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-[#111111] truncate">
                      {firebaseUser.displayName || 'Authenticated Member'}
                    </span>
                    <span className="px-1.5 py-0.5 text-[9px] uppercase font-bold bg-emerald-100 text-emerald-800 rounded-sm">
                      Google Auth
                    </span>
                  </div>
                  <p className="text-xs text-[#111111]/70 truncate">{firebaseUser.email}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                {onBackToApp && (
                  <button
                    onClick={onBackToApp}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white text-xs font-bold transition-all shadow-sm hover:opacity-95 text-center flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Continue to Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={signOutUser}
                  className="py-2.5 px-4 rounded-xl border border-[#111111]/15 text-xs font-semibold text-[#111111] hover:bg-[#DED0BD]/60 transition-all text-center cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Google Sign-In Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-3.5 px-5 rounded-2xl bg-white hover:bg-neutral-50 text-[#111111] border-2 border-[#111111]/20 font-extrabold text-sm flex items-center justify-center gap-3 transition-all shadow-md active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.89c2.28-2.1 3.65-5.2 3.65-9.15z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.89-3.05c-1.08.72-2.45 1.16-4.04 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.98 0 12s.45 3.84 1.24 5.42l4.04-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
                <span className="ml-auto text-[9px] font-black uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800 shrink-0">
                  Firebase
                </span>
              </button>

              {/* Instant Profile Option */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleLocalProfileLogin}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 text-[#111111] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#4F46E5]" />
                  <span>Instant Guest Profile Access</span>
                </button>
              </div>

              {/* Error Alert Display */}
              <AnimatePresence>
                {formattedError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-[#111111] space-y-2 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-extrabold text-xs text-[#111111]">{formattedError.title}</h4>
                          <p className="text-[11px] text-[#111111]/80 leading-relaxed mt-0.5">
                            {formattedError.description}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormattedError(null)}
                        className="text-[#111111]/50 hover:text-[#111111] text-xs font-bold p-0.5 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success Message Alert */}
              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}
            </div>
          )}

          {/* Security & Architecture Guarantee Footnote */}
          <div className="pt-3 border-t border-[#111111]/10 flex items-center justify-between text-[11px] text-[#111111]/60">
            <span className="flex items-center gap-1.5 font-medium">
              <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
              <span>Firebase Google Authentication</span>
            </span>
            <span className="font-mono text-[10px]">Secure OAuth</span>
          </div>
        </div>
      </div>
    </div>
  );
};
