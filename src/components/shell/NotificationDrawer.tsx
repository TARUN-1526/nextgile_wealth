import React, { useState } from 'react';
import { AppNotification, UserProfile } from '../../types';
import { AccessControlService } from '../../services/accessControl';
import {
  Bell,
  CheckCheck,
  X,
  AlertTriangle,
  Info,
  Clock,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNavigate: (module: string, id?: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onNavigate,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'UNREAD' | 'URGENT'>('ALL');

  if (!isOpen) return null;

  // Enforce role-aware security: only display notifications authorized for this user/role
  const authorizedNotifs = AccessControlService.getAuthorizedNotifications(
    currentUser,
    notifications
  );

  const filteredNotifs = authorizedNotifs.filter((n) => {
    if (selectedFilter === 'UNREAD') return !n.isRead;
    if (selectedFilter === 'URGENT') return n.priority === 'urgent';
    return true;
  });

  const unreadCount = authorizedNotifs.filter((n) => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col">
          {/* Header */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  Notifications & Alerts
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-600 text-white">
                      {unreadCount} new
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-slate-500">Role-aware alerts for {currentUser.title || currentUser.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={onMarkAllAsRead}
                className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 p-1.5 rounded hover:bg-indigo-50 flex items-center gap-1"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mark All Read</span>
              </button>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center gap-2 text-xs">
            <button
              onClick={() => setSelectedFilter('ALL')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                selectedFilter === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All ({authorizedNotifs.length})
            </button>
            <button
              onClick={() => setSelectedFilter('UNREAD')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                selectedFilter === 'UNREAD'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setSelectedFilter('URGENT')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                selectedFilter === 'URGENT'
                  ? 'bg-rose-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Urgent
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
            {filteredNotifs.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-medium">All caught up!</p>
                <p className="text-xs text-slate-400 mt-1">No alerts matching your current filter.</p>
              </div>
            ) : (
              filteredNotifs.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    onMarkAsRead(n.id);
                    onNavigate(n.linkModule, n.linkId);
                    onClose();
                  }}
                  className={`p-3.5 rounded-xl cursor-pointer transition-colors relative group my-1 ${
                    n.isRead ? 'bg-white hover:bg-slate-50' : 'bg-indigo-50/40 hover:bg-indigo-50/70 border border-indigo-100/60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {n.priority === 'urgent' ? (
                        <div className="p-1.5 bg-rose-100 text-rose-700 rounded-lg">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                          <Info className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500">
                          {n.category.replace('_', ' ')}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>{n.timestamp}</span>
                        </div>
                      </div>

                      <h4 className={`text-xs mt-1 ${n.isRead ? 'font-medium text-slate-800' : 'font-bold text-slate-900'}`}>
                        {n.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-1">
                        <span className="text-[11px] font-semibold text-indigo-600 group-hover:text-indigo-800 flex items-center gap-1">
                          View details
                          <ArrowRight className="w-3 h-3" />
                        </span>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
            <span className="text-[11px] text-slate-500">
              Access rule: Institutional & Individual data partitions applied
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
