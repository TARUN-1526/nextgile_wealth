import React from 'react';
import {
  CheckCircle2,
  Lock,
  ArrowLeft,
  ShieldCheck,
  RotateCcw,
  Building2,
  Clock,
  UserCheck,
} from 'lucide-react';
import { UserProfile } from '../../types';

interface LogoutPageProps {
  lastUser: UserProfile;
  onReturnToLogin: () => void;
  onReLoginAsLastUser: () => void;
}

export const LogoutPage: React.FC<LogoutPageProps> = ({
  lastUser,
  onReturnToLogin,
  onReLoginAsLastUser,
}) => {
  const logoutTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const logoutDate = new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center font-bold text-white shadow-sm ring-1 ring-emerald-500/30">
            NW
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white">Nexgile-WealthAgent</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded font-mono font-medium">
                Session Terminated
              </span>
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline">
              Fiduciary Wealth Management & Institutional Retirement Platform
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1.5 rounded-lg">
          <ShieldCheck className="w-4 h-4" />
          <span>Fiduciary State Cleared</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-950 border-2 border-emerald-600 rounded-full mx-auto flex items-center justify-center text-emerald-400 shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-white">You Have Been Securely Logged Out</h1>
            <p className="text-sm text-slate-400">
              Your active session and authorization tokens have been revoked. Per SEC Rule 204-2 and ERISA guidelines, cached portfolio caches have been cleared from this browser session.
            </p>
          </div>

          {/* Session Audit Summary Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center justify-between">
              <span>Session Log Record</span>
              <span className="text-emerald-400 font-mono">SEC-AUDIT-LOGGED</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-300">
              <div className="flex items-center gap-2">
                <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-400">User Identity:</span>
              </div>
              <div className="font-semibold text-white text-right truncate">
                {lastUser.name}
              </div>

              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-400">Organization / Role:</span>
              </div>
              <div className="text-right text-slate-300 truncate">
                {lastUser.organization || lastUser.role}
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-400">Signed Out At:</span>
              </div>
              <div className="text-right text-slate-300 font-mono">
                {logoutDate} {logoutTime}
              </div>

              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-400">Audit Status:</span>
              </div>
              <div className="text-right text-emerald-400 font-medium">
                Immutable WORM Entry Created
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={onReLoginAsLastUser}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Log Back In as {lastUser.name.split(' ')[0]}</span>
            </button>

            <button
              onClick={onReturnToLogin}
              className="w-full py-3 px-4 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Portal Sign-In (Switch Identity)</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-800/80">
        Nexgile-WealthAgent Fiduciary Terminal • SEC Rule 204-2 & FINRA Rule 4511 compliant
      </footer>
    </div>
  );
};
