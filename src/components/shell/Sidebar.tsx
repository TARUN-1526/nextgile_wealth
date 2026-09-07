import React from 'react';
import { UserProfile } from '../../types';
import { AccessControlService } from '../../services/accessControl';
import {
  Wallet,
  TrendingUp,
  Coins,
  Building2,
  Briefcase,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  Lock,
  ChevronRight,
  HelpCircle,
  X,
  FileText,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  currentUser: UserProfile;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenRoleSwitcher: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  onOpenRoleSwitcher,
  onLogout,
}) => {
  const isParticipant = currentUser.role === 'plan_participant';
  const isSponsor = currentUser.role === 'plan_sponsor' || currentUser.role === 'cfo' || currentUser.role === 'investment_committee';
  const isBeneficiary = currentUser.role === 'beneficiary';
  const isInternal = currentUser.category === 'internal';

  // Navigation Items defined with strict role gating
  const navItems = [
    {
      id: 'wealth',
      label: isBeneficiary ? 'Trust Assets & Vault' : 'Individual Wealth',
      description: 'Net worth, portfolio, goals, vault',
      icon: Wallet,
      visible: !isParticipant && !isSponsor,
    },
    {
      id: 'tax_estate',
      label: 'Tax, Estate & Giving',
      description: 'TLH, Roth simulator, trusts, DAF',
      icon: Coins,
      visible: !isParticipant && !isSponsor && !isBeneficiary,
    },
    {
      id: 'institutional',
      label: isParticipant ? 'My 401(k) Retirement' : 'Institutional 401(k)',
      description: isParticipant ? 'Balance, deferral, readiness' : 'Plan assets, lineup, Form 5500',
      icon: Building2,
      visible: isParticipant || isSponsor || isInternal,
    },
    {
      id: 'advisor',
      label: 'Advisory Practice',
      description: 'Households, rebalance workbench',
      icon: Briefcase,
      visible: isInternal,
    },
    {
      id: 'audit_feeds',
      label: 'Audit & Feeds Health',
      description: 'SEC ledger, exception queue',
      icon: ShieldCheck,
      visible: isInternal || currentUser.role === 'compliance_user' || currentUser.role === 'operations',
    },
    {
      id: 'communication',
      label: 'Communications',
      description: 'Secure messages & reviews',
      icon: MessageSquare,
      visible: true,
    },
    {
      id: 'reporting',
      label: 'Reporting & Disclosures',
      description: 'Fiduciary statements & CSV exports',
      icon: FileText,
      visible: !isBeneficiary,
    },
  ].filter((item) => item.visible);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-[#0F172A] text-white flex flex-col transition-transform duration-200 ease-in-out border-r border-slate-800 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand / Logo Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-500 rounded-md flex items-center justify-center font-bold text-white text-base shadow-sm">
              N
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white block leading-none">
                Nexgile
              </span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-medium block mt-0.5">
                WealthAgent
              </span>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
            Workspaces
          </span>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full text-left px-3 py-2 rounded-md transition-all flex items-center gap-3 text-sm font-medium ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div
                  className={`p-1.5 rounded shrink-0 ${
                    isActive ? 'bg-emerald-700/60 text-white' : 'text-slate-400 opacity-80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs block truncate font-medium">{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Environment / Persona Context Card */}
        <div className="p-4 border-t border-slate-800 bg-[#1E293B]">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-2 font-bold flex items-center justify-between">
            <span>Environment Mode</span>
            <span className="text-[9px] bg-slate-800 text-slate-400 px-1 py-0.5 rounded uppercase font-semibold">
              {currentUser.category}
            </span>
          </div>

          <div
            onClick={onOpenRoleSwitcher}
            className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-700 hover:border-slate-600 cursor-pointer transition-colors mb-2"
            title="Click to switch preview persona"
          >
            <div className="min-w-0 pr-2">
              <span className="text-xs text-white font-medium block truncate">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-slate-400 block truncate">
                {currentUser.title || currentUser.role}
              </span>
            </div>
            <span className="text-[10px] bg-emerald-900 text-emerald-300 font-bold px-2 py-0.5 rounded shrink-0">
              Switch
            </span>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg bg-slate-900/90 border border-slate-700 hover:border-rose-700 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 transition-colors"
            title="Terminate session and sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
        </div>

        {/* Footer Security Badge */}
        <div className="px-4 py-2.5 border-t border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="truncate">Partitioning Active • Rule 204-2</span>
          </div>
        </div>
      </aside>
    </>
  );
};
