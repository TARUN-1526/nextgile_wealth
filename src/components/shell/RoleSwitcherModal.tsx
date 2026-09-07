import React, { useState } from 'react';
import { MOCK_USERS } from '../../data/mockData';
import { UserCategory, UserProfile, UserRole } from '../../types';
import {
  Users,
  Check,
  ShieldAlert,
  Building,
  Briefcase,
  UserCheck,
  X,
  Lock,
} from 'lucide-react';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<UserCategory>(currentUser.category);

  if (!isOpen) return null;

  const categories: { id: UserCategory; label: string; icon: any; count: number; desc: string }[] = [
    {
      id: 'individual',
      label: 'Individual & Family Clients',
      icon: Users,
      count: MOCK_USERS.filter((u) => u.category === 'individual').length,
      desc: 'HNW clients, retirees, business owners, beneficiaries, philanthropy',
    },
    {
      id: 'institutional',
      label: 'Institutional Retirement',
      icon: Building,
      count: MOCK_USERS.filter((u) => u.category === 'institutional').length,
      desc: 'Plan sponsors, CFOs, committee, fiduciaries, participants',
    },
    {
      id: 'internal',
      label: 'Internal Advisory Firm',
      icon: Briefcase,
      count: MOCK_USERS.filter((u) => u.category === 'internal').length,
      desc: 'Advisors, investment team, tax specialists, estate counsel, compliance',
    },
  ];

  const filteredUsers = MOCK_USERS.filter((u) => u.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Role & Persona Switcher (Access Control Testing)
              </h3>
              <p className="text-xs text-slate-500">
                Preview exact data partitions, relationship filtering, and authorization tiers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-slate-200 bg-slate-100/50 p-2 gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-3 rounded-xl text-left transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'bg-white shadow-xs border border-slate-200/80'
                    : 'hover:bg-slate-200/60 text-slate-600'
                }`}
              >
                <div
                  className={`p-2 rounded-lg shrink-0 ${
                    isSelected ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200/60 text-slate-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold ${
                        isSelected ? 'text-slate-900' : 'text-slate-700'
                      }`}
                    >
                      {cat.label}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200/70 text-slate-600 font-mono font-bold">
                      {cat.count}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{cat.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Users Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredUsers.map((user) => {
              const isCurrent = currentUser.id === user.id;

              return (
                <div
                  key={user.id}
                  onClick={() => {
                    onSelectUser(user);
                    onClose();
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 relative group ${
                    isCurrent
                      ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50/80'
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs border border-slate-700">
                    {user.avatarInitials}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{user.name}</h4>
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white shrink-0">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-semibold text-emerald-700 mt-0.5 truncate">{user.title}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.organization}</p>

                    {/* Role Specific Access Badge */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold uppercase">
                        Role: {user.role.replace(/_/g, ' ')}
                      </span>

                      {user.role === 'beneficiary' && (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-medium flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> Trust Access Only
                        </span>
                      )}

                      {user.role === 'plan_sponsor' && (
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-medium flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> Aggregate Plan Only (No Individual Balances)
                        </span>
                      )}

                      {user.role === 'plan_participant' && (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-medium flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> Personal 401(k) Only
                        </span>
                      )}

                      {user.category === 'internal' && (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-medium flex items-center gap-1">
                          <ShieldAlert className="w-2.5 h-2.5 text-emerald-600" /> Advisory & Fiduciary Team
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info note */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Relationship filtering is enforced at the service layer for all queries and views.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
