import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Building2,
  Users,
  Briefcase,
  KeyRound,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  LogOut,
  Fingerprint,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { MOCK_USERS } from '../../data/mockData';

interface LoginPageProps {
  onLogin: (user: UserProfile) => void;
  loggedOutMessage?: string | null;
  onDismissLoggedOutNotice?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLogin,
  loggedOutMessage,
  onDismissLoggedOutNotice,
}) => {
  const [activeMode, setActiveMode] = useState<'persona' | 'credentials'>('persona');
  const [emailInput, setEmailInput] = useState('jhayes@nexgilewealth.com');
  const [passwordInput, setPasswordInput] = useState('••••••••••••');
  const [mfaCode, setMfaCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Group personas by domain category
  const advisorUsers = MOCK_USERS.filter((u) => u.category === 'internal');
  const clientUsers = MOCK_USERS.filter((u) => u.category === 'individual');
  const institutionalUsers = MOCK_USERS.filter((u) => u.category === 'institutional');

  const handleCredentialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const matched = MOCK_USERS.find(
        (u) => u.email.toLowerCase() === emailInput.trim().toLowerCase()
      );

      if (matched) {
        onLogin(matched);
      } else {
        // If not found in mock list, check if user provided valid email format
        if (emailInput.includes('@')) {
          // Default to senior advisor with custom email
          const customUser: UserProfile = {
            ...MOCK_USERS[11], // Jonathan Hayes
            email: emailInput,
            name: emailInput.split('@')[0].replace('.', ' ').toUpperCase(),
          };
          onLogin(customUser);
        } else {
          setAuthError('Please enter a valid institutional corporate email address.');
        }
      }
    }, 400);
  };

  const handleSsoLogin = (providerName: string) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      // Default to Jonathan Hayes (Lead Wealth Advisor)
      const advisor = MOCK_USERS.find((u) => u.id === 'user_jonathan_hayes') || MOCK_USERS[0];
      onLogin(advisor);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Header Bar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center font-bold text-white shadow-sm ring-1 ring-emerald-500/30">
            NW
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white">Nexgile-WealthAgent</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded font-mono font-medium">
                Fiduciary v1.0
              </span>
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline">
              SEC Rule 204-2 & ERISA 404(c) Fiduciary Workstation
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">256-Bit TLS End-to-End Encryption</span>
            <span className="sm:hidden">Encrypted</span>
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Logged Out Notice Banner */}
          {loggedOutMessage && (
            <div className="bg-emerald-950/60 border-b border-emerald-800/60 p-4 flex items-start justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-900/80 border border-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-emerald-200">Secure Sign-Out Complete</h4>
                  <p className="text-xs text-emerald-400/90">{loggedOutMessage}</p>
                </div>
              </div>
              {onDismissLoggedOutNotice && (
                <button
                  onClick={onDismissLoggedOutNotice}
                  className="text-xs text-emerald-400 hover:text-emerald-200 underline shrink-0"
                >
                  Dismiss
                </button>
              )}
            </div>
          )}

          {/* Form and Persona Selector Header */}
          <div className="p-6 sm:p-8 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Institutional Portal Sign-In</h1>
              <p className="text-sm text-slate-400 mt-1">
                Authenticate to access wealth management portfolios, institutional plans, or advisory workbench.
              </p>
            </div>

            {/* Authentication Mode Switcher */}
            <div className="flex items-center p-1 bg-slate-900 rounded-lg border border-slate-800 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setActiveMode('persona')}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeMode === 'persona'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Role & Persona Access
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('credentials')}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeMode === 'credentials'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                Corporate SSO / Password
              </button>
            </div>
          </div>

          {/* Tab 1: One-Click Verified Institutional Persona Login */}
          {activeMode === 'persona' && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Select an authorized profile to authenticate with verified RBAC permissions:
                </span>
                <span className="text-xs text-emerald-400 font-medium">Instant session provision</span>
              </div>

              {/* Group 1: Advisory & Compliance Firm Staff */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Advisory Practice, Investment Committee & Compliance</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {advisorUsers.slice(0, 3).map((user) => (
                    <button
                      key={user.id}
                      onClick={() => onLogin(user)}
                      className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500 hover:bg-slate-800/80 transition-all text-left group flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold text-xs flex items-center justify-center">
                          {user.avatarInitials}
                        </div>
                        <span className="text-[10px] font-semibold uppercase bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                          {user.role === 'compliance_user' ? 'CCO' : 'Advisor'}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-white group-hover:text-emerald-300 transition-colors">
                          {user.name}
                        </div>
                        <div className="text-xs text-slate-400 truncate mt-0.5">{user.title}</div>
                        <div className="text-[11px] text-slate-500 mt-1">{user.email}</div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-emerald-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Authenticate Session</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Group 2: High-Net-Worth Individuals & Family Office */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span>High-Net-Worth Individuals, Family Offices & Beneficiaries</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {clientUsers.slice(0, 3).map((user) => (
                    <button
                      key={user.id}
                      onClick={() => onLogin(user)}
                      className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-blue-500 hover:bg-slate-800/80 transition-all text-left group flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-800 text-blue-300 font-bold text-xs flex items-center justify-center">
                          {user.avatarInitials}
                        </div>
                        <span className="text-[10px] font-semibold uppercase bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                          {user.role === 'beneficiary' ? 'Trust Beneficiary' : 'HNW Client'}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-white group-hover:text-blue-300 transition-colors">
                          {user.name}
                        </div>
                        <div className="text-xs text-slate-400 truncate mt-0.5">{user.title}</div>
                        <div className="text-[11px] text-slate-500 mt-1">{user.organization}</div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Access Wealth Portal</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Group 3: Institutional 401(k) Plan Sponsors & Participants */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Institutional ERISA 404(c) Retirement Plans</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {institutionalUsers.slice(0, 2).map((user) => (
                    <button
                      key={user.id}
                      onClick={() => onLogin(user)}
                      className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500 hover:bg-slate-800/80 transition-all text-left group flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-800 text-amber-300 font-bold text-xs flex items-center justify-center">
                          {user.avatarInitials}
                        </div>
                        <span className="text-[10px] font-semibold uppercase bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                          {user.role === 'plan_sponsor' ? 'Plan Sponsor (Apex BioTech)' : '401(k) Participant'}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-white group-hover:text-amber-300 transition-colors">
                          {user.name}
                        </div>
                        <div className="text-xs text-slate-400 truncate mt-0.5">{user.title}</div>
                        <div className="text-[11px] text-slate-500 mt-1">{user.organization}</div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-amber-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Enter Plan Portal</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Corporate Email / Password / SSO */}
          {activeMode === 'credentials' && (
            <div className="p-6 sm:p-8">
              <form onSubmit={handleCredentialSubmit} className="max-w-md mx-auto space-y-4">
                {authError && (
                  <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-lg text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Corporate Fiduciary Email
                  </label>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="advisor@nexgilewealth.com"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Supported test logins: jhayes@nexgilewealth.com, sjenkins@apexbio.com, richard.vance@vanceholdings.com
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-300">
                      Workstation Master Password
                    </label>
                    <span className="text-[11px] text-emerald-400 hover:underline cursor-pointer">
                      Forgot credentials?
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Password"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Fiduciary 2FA Token Code <span className="text-slate-500">(Optional for demo)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value)}
                      placeholder="6-digit authenticator code (e.g. 842109)"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all pl-10"
                    />
                    <Fingerprint className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400">
                    <input
                      type="checkbox"
                      checked={rememberDevice}
                      onChange={(e) => setRememberDevice(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0"
                    />
                    <span>Remember terminal for 8 hours (SEC Rule 204-2 lock)</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <span>Authenticate Secure Session</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="relative my-6 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800" />
                  </div>
                  <span className="relative bg-slate-950 px-3 text-[11px] uppercase tracking-wider text-slate-500">
                    Or sign in with Corporate IdP
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSsoLogin('Okta')}
                    className="py-2 px-3 rounded-lg border border-slate-700 hover:border-slate-600 bg-slate-900 hover:bg-slate-850 text-xs font-medium text-slate-300 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Building2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Okta SSO</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSsoLogin('Azure AD')}
                    className="py-2 px-3 rounded-lg border border-slate-700 hover:border-slate-600 bg-slate-900 hover:bg-slate-850 text-xs font-medium text-slate-300 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Building2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Microsoft Entra</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Footer Security Badges */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Multi-Tenant Data Isolation Enabled</span>
            </div>
            <div className="flex items-center gap-4">
              <span>FINRA Rule 4511 WORM Compliant</span>
              <span>•</span>
              <span>ERISA 404(c) Segregated</span>
            </div>
          </div>
        </div>
      </main>

      {/* Page Bottom Disclaimer */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-800/80">
        Nexgile-WealthAgent © 2026. Confidential and proprietary institutional fiduciary software. All actions audited per SEC Rule 204-2.
      </footer>
    </div>
  );
};
