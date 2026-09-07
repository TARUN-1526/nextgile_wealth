import React, { useState, useEffect } from 'react';
import { MOCK_NOTIFICATIONS, MOCK_USERS } from './data/mockData';
import { ApprovalRequest, ApprovalRequestType, AppNotification, UserProfile } from './types';
import { AccessControlService } from './services/accessControl';
import { approvalService } from './services/approvalService';
import { auditService } from './services/auditService';

// Authentication Pages
import { LoginPage } from './components/auth/LoginPage';
import { LogoutPage } from './components/auth/LogoutPage';

// Shell & Navigation Components
import { TopHeader } from './components/shell/TopHeader';
import { Sidebar } from './components/shell/Sidebar';
import { RoleSwitcherModal } from './components/shell/RoleSwitcherModal';
import { GlobalSearchModal } from './components/shell/GlobalSearchModal';
import { NotificationDrawer } from './components/shell/NotificationDrawer';

// Common Modals & Utilities
import { ApprovalWorkflowModal } from './components/common/ApprovalWorkflowModal';
import { PrototypeBadge } from './components/common/PrototypeBadge';

// Functional Domain Modules
import { IndividualWealthModule } from './components/modules/IndividualWealth/IndividualWealthModule';
import { TaxEstatePhilanthropyModule } from './components/modules/TaxEstatePhilanthropy/TaxEstatePhilanthropyModule';
import { InstitutionalRetirementModule } from './components/modules/InstitutionalRetirement/InstitutionalRetirementModule';
import { InternalAdvisoryModule } from './components/modules/InternalAdvisory/InternalAdvisoryModule';
import { AuditComplianceModule } from './components/modules/AuditCompliance/AuditComplianceModule';
import { CommunicationModule } from './components/modules/Communication/CommunicationModule';
import { ReportingModule } from './components/modules/Reporting/ReportingModule';

import { ShieldCheck, Sparkles, BellRing } from 'lucide-react';

export default function App() {
  // Active Persona / User state
  const [currentUser, setCurrentUser] = useState<UserProfile>(MOCK_USERS[0]); // Richard Vance (HNW Client)

  // Active Workspace Tab
  const [activeTab, setActiveTab] = useState<string>('wealth');

  // Modals & Drawers
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Approval Workflow Modal state
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvalModalMode, setApprovalModalMode] = useState<'create_new' | 'view_review'>('create_new');
  const [approvalModalType, setApprovalModalType] = useState<ApprovalRequestType>('tlh');
  const [selectedApprovalRequest, setSelectedApprovalRequest] = useState<ApprovalRequest | null>(null);

  // Notifications state
  const [notifications, setNotifications] = useState<AppNotification[]>([...MOCK_NOTIFICATIONS]);

  // Authentication state: 'authenticated', 'login', or 'logout'
  const [authView, setAuthView] = useState<'authenticated' | 'login' | 'logout'>('authenticated');
  const [loggedOutMessage, setLoggedOutMessage] = useState<string | null>(null);
  const [lastUser, setLastUser] = useState<UserProfile>(MOCK_USERS[0]);

  // Global Keyboard Shortcut: Cmd/Ctrl + K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // When user switches role, automatically navigate to an appropriate authorized default tab
  const handleSelectUser = (user: UserProfile) => {
    setCurrentUser(user);
    if (user.role === 'plan_participant') {
      setActiveTab('institutional');
    } else if (user.role === 'plan_sponsor' || user.role === 'cfo' || user.role === 'investment_committee') {
      setActiveTab('institutional');
    } else if (user.role === 'compliance_user' || user.role === 'operations') {
      setActiveTab('audit_feeds');
    } else if (user.category === 'internal') {
      setActiveTab('advisor');
    } else {
      setActiveTab('wealth');
    }
  };

  const handleLogin = (user: UserProfile) => {
    handleSelectUser(user);
    setAuthView('authenticated');
    setLoggedOutMessage(null);
    auditService.logEvent({
      user,
      action: 'Fiduciary Workstation Session Established',
      objectAffected: 'Session State & RBAC Context',
      previousValue: 'Unauthenticated (Locked)',
      newValue: `Active Session (${user.name} - ${user.role})`,
      reason: 'User authenticated with verified credentials.',
    });
  };

  const handleLogout = () => {
    auditService.logEvent({
      user: currentUser,
      action: 'Session Terminated & Workstation Locked',
      objectAffected: 'Session State & Authorization Tokens',
      previousValue: `Active Session (${currentUser.name})`,
      newValue: 'Unauthenticated (Locked)',
      reason: 'SEC Rule 204-2 compliance sign-out initiated by user.',
    });
    setLastUser(currentUser);
    setLoggedOutMessage(`Session ended for ${currentUser.name}. All cached fiduciary tokens have been cleared.`);
    setAuthView('logout');
  };

  // Notification handlers
  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // Authorized unread notifications count for current user
  const authorizedNotifs = AccessControlService.getAuthorizedNotifications(currentUser, notifications);
  const unreadCount = authorizedNotifs.filter((n) => !n.isRead).length;

  // Handle global search navigation target
  const handleSearchNavigate = (tabTarget: string) => {
    setActiveTab(tabTarget);
  };

  // Open Approval Modal for new request
  const handleOpenNewApproval = (type: ApprovalRequestType) => {
    setApprovalModalType(type);
    setApprovalModalMode('create_new');
    setSelectedApprovalRequest(null);
    setIsApprovalModalOpen(true);
  };

  // Get active module title
  const getActiveModuleTitle = () => {
    switch (activeTab) {
      case 'wealth':
        return currentUser.role === 'beneficiary' ? 'Authorized Trust Assets & Vault' : 'Individual Wealth Dashboard';
      case 'tax_estate':
        return 'Tax Optimization, Estate & Giving';
      case 'institutional':
        return currentUser.role === 'plan_participant' ? 'Participant 401(k) Retirement Center' : 'Institutional Plan Sponsor & Committee';
      case 'advisor':
        return 'Internal Advisory Practice & Workbench';
      case 'audit_feeds':
        return 'Audit Ledger, Exceptions & Custodial Feeds';
      case 'communication':
        return 'Client & Fiduciary Communications';
      case 'reporting':
        return 'Reporting & Disclosures Studio';
      default:
        return 'Nexgile-WealthAgent Portal';
    }
  };

  if (authView === 'login') {
    return (
      <LoginPage
        onLogin={handleLogin}
        loggedOutMessage={loggedOutMessage}
        onDismissLoggedOutNotice={() => setLoggedOutMessage(null)}
      />
    );
  }

  if (authView === 'logout') {
    return (
      <LogoutPage
        lastUser={lastUser}
        onReturnToLogin={() => setAuthView('login')}
        onReLoginAsLastUser={() => handleLogin(lastUser)}
      />
    );
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 overflow-hidden font-sans antialiased">
      {/* Dynamic Navigation Sidebar */}
      <Sidebar
        currentUser={currentUser}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <TopHeader
          currentUser={currentUser}
          activeModuleTitle={getActiveModuleTitle()}
          unreadNotificationsCount={unreadCount}
          onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onLogout={handleLogout}
        />

        {/* Scrollable Workspace View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === 'wealth' && (
            <IndividualWealthModule
              currentUser={currentUser}
              onOpenApprovalModal={() => handleOpenNewApproval('trade')}
            />
          )}

          {activeTab === 'tax_estate' && (
            <TaxEstatePhilanthropyModule
              currentUser={currentUser}
              onRequestApproval={(type) => handleOpenNewApproval(type)}
            />
          )}

          {activeTab === 'institutional' && (
            <InstitutionalRetirementModule
              currentUser={currentUser}
              onRequestApproval={(type) => handleOpenNewApproval(type)}
            />
          )}

          {activeTab === 'advisor' && (
            <InternalAdvisoryModule
              currentUser={currentUser}
              onRequestRebalance={() => handleOpenNewApproval('rebalance')}
              onNavigateToClient={() => setActiveTab('wealth')}
            />
          )}

          {activeTab === 'audit_feeds' && (
            <AuditComplianceModule currentUser={currentUser} />
          )}

          {activeTab === 'communication' && (
            <CommunicationModule currentUser={currentUser} />
          )}

          {activeTab === 'reporting' && (
            <ReportingModule currentUser={currentUser} />
          )}
        </main>

        {/* Professional Polish System Health & Reconciled Status Footer */}
        <div className="h-8 bg-slate-100 border-t border-slate-200 flex items-center justify-between px-6 text-[9px] text-slate-500 uppercase tracking-widest font-medium shrink-0">
          <div className="flex items-center gap-4">
            <span>System Health: <strong className="text-emerald-700 font-bold">Optimal</strong></span>
            <span>Reconciled: Today 06:00 AM</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span>Prototype Environment • Simulated Data Logic</span>
          </div>
        </div>
      </div>

      {/* Quick Fiduciary Action Floating Button */}
      <div className="fixed bottom-10 right-6 z-20">
        <button
          onClick={() => handleOpenNewApproval('tlh')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 sm:px-4 sm:py-2.5 rounded-full shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center gap-2 text-xs font-bold"
          title="Initiate Fiduciary Request"
        >
          <ShieldCheck className="w-4 h-4" />
          <span className="hidden sm:inline">New Action Request</span>
        </button>
      </div>

      {/* Role Switcher Modal */}
      <RoleSwitcherModal
        isOpen={isRoleSwitcherOpen}
        onClose={() => setIsRoleSwitcherOpen(false)}
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
      />

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        currentUser={currentUser}
        onNavigate={handleSearchNavigate}
      />

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        currentUser={currentUser}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onNavigate={(mod) => setActiveTab(mod)}
      />

      {/* Approval Workflow Modal */}
      <ApprovalWorkflowModal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        currentUser={currentUser}
        mode={approvalModalMode}
        initialType={approvalModalType}
        selectedRequest={selectedApprovalRequest}
      />
    </div>
  );
}
