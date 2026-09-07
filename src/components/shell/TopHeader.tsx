import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../../types';
import {
  Search,
  Bell,
  UserCheck,
  Shield,
  Layers,
  ChevronDown,
  Menu,
  LogOut,
  Users,
  Check,
  ExternalLink,
} from 'lucide-react';

interface TopHeaderProps {
  currentUser: UserProfile;
  activeModuleTitle: string;
  unreadNotificationsCount: number;
  onOpenRoleSwitcher: () => void;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onToggleMobileMenu: () => void;
  onLogout: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentUser,
  activeModuleTitle,
  unreadNotificationsCount,
  onOpenRoleSwitcher,
  onOpenSearch,
  onOpenNotifications,
  onToggleMobileMenu,
  onLogout,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Mobile hamburger & Active Section Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Portal Environment
          </span>
          <span className="text-sm font-bold text-slate-800">{activeModuleTitle}</span>
        </div>
      </div>

      {/* Center: Global Search Trigger Button */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          onClick={onOpenSearch}
          className="w-full text-left bg-slate-100 hover:bg-slate-200/70 border border-transparent hover:border-slate-200 rounded-full py-2 pl-4 pr-3.5 flex items-center justify-between text-xs text-slate-500 transition-colors focus:ring-2 focus:ring-emerald-500"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate">Global Search (Clients, Accounts, Docs...)</span>
          </div>
          <kbd className="font-mono text-[10px] bg-white text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls: Mobile search icon, Notification Bell, Active Persona Pill */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile Search Icon */}
        <button
          onClick={onOpenSearch}
          className="md:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
          title="Search"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors"
          title="Notifications Center"
        >
          <Bell className="w-5 h-5" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          )}
        </button>

        <div className="h-6 w-px bg-slate-200 mx-0.5" />

        {/* Profile / Role Switcher Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2.5 py-1.5 px-2 sm:pl-3 sm:pr-2 rounded-lg border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-all text-left"
            title="User Profile and Fiduciary Session Menu"
          >
            <div className="hidden sm:block text-right min-w-0">
              <span className="text-xs font-bold text-slate-900 block truncate leading-tight">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-slate-500 font-medium block truncate">
                {currentUser.title || currentUser.role}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
              {currentUser.avatarInitials}
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile Dropdown Popover */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-fadeIn text-xs">
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-800 font-bold flex items-center justify-center text-sm shrink-0">
                    {currentUser.avatarInitials}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] bg-slate-50 p-2 rounded-lg border border-slate-150">
                  <span className="text-slate-500 font-medium">Clearance Role:</span>
                  <span className="font-semibold text-emerald-700 uppercase">{currentUser.role}</span>
                </div>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onOpenRoleSwitcher();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-left font-medium transition-colors"
                >
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>Switch Persona / Role</span>
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-rose-600 hover:bg-rose-50 text-left font-semibold transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign Out / Lock Session</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Log Out Icon Button */}
        <button
          onClick={onLogout}
          className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors hidden sm:flex items-center justify-center"
          title="Sign Out / Lock Fiduciary Terminal"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
