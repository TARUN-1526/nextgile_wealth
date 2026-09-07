import React, { useState, useMemo } from 'react';
import {
  MOCK_ACCOUNTS,
  MOCK_ACTION_ITEMS,
  MOCK_AUDIT_EVENTS,
  MOCK_CLIENTS,
  MOCK_DOCUMENTS,
  MOCK_GOALS,
  MOCK_HOLDINGS,
  MOCK_HOUSEHOLDS,
  MOCK_MEETINGS,
  MOCK_MESSAGES,
  MOCK_PARTICIPANTS,
  MOCK_PLAN_INVESTMENTS,
  MOCK_RETIREMENT_PLAN,
  MOCK_TAX_OPPORTUNITIES,
  MOCK_TRANSACTIONS,
} from '../../data/mockData';
import { UserProfile } from '../../types';
import {
  Search,
  X,
  Building2,
  User,
  CreditCard,
  TrendingUp,
  Target,
  FileText,
  MessageSquare,
  Calendar,
  CheckSquare,
  Shield,
  Briefcase,
  Bookmark,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface SearchResultItem {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  badge?: string;
  tabTarget: string;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onNavigate: (tabId: string, contextId?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Tax-loss harvest BND',
    'Vance Dynasty Trust',
    'Apex 401(k) Form 5500',
    'Elena Rostova readiness',
  ]);
  const [savedViews, setSavedViews] = useState<{ name: string; query: string; category: string }[]>([
    { name: 'Active HNW Households', query: 'Vance', category: 'Households' },
    { name: 'Watchlist Funds 401(k)', query: 'FDEEX', category: 'Investment Lineup' },
    { name: 'Pending Fiduciary Approvals', query: 'Pending', category: 'Audit & Approvals' },
  ]);

  // Aggregate all mock database items into searchable entities
  const allSearchableItems: SearchResultItem[] = useMemo(() => {
    const items: SearchResultItem[] = [];

    // Households
    MOCK_HOUSEHOLDS.forEach((hh) => {
      items.push({
        id: hh.id,
        category: 'Households',
        title: hh.name,
        subtitle: `Net Worth: $${hh.totalNetWorth.toLocaleString()} • ${hh.investmentObjective}`,
        badge: hh.riskTolerance,
        tabTarget: 'wealth',
      });
    });

    // Clients
    MOCK_CLIENTS.forEach((c) => {
      items.push({
        id: c.id,
        category: 'Clients',
        title: `${c.firstName} ${c.lastName}`,
        subtitle: `${c.roleInHousehold} • ${c.employmentStatus} • SSN: ${c.ssnMasked}`,
        badge: c.roleInHousehold,
        tabTarget: 'advisor',
      });
    });

    // Accounts
    MOCK_ACCOUNTS.forEach((acc) => {
      items.push({
        id: acc.id,
        category: 'Accounts',
        title: acc.name,
        subtitle: `${acc.custodian} • ${acc.accountNumberMasked} • Balance: $${acc.balance.toLocaleString()}`,
        badge: acc.type.replace('_', ' ').toUpperCase(),
        tabTarget: 'wealth',
      });
    });

    // Holdings
    MOCK_HOLDINGS.forEach((h) => {
      items.push({
        id: h.id,
        category: 'Holdings',
        title: `${h.symbol} - ${h.name}`,
        subtitle: `${h.assetClass} • Mkt Val: $${h.marketValue.toLocaleString()} • PnL: +$${h.unrealizedGainLoss.toLocaleString()}`,
        badge: `${h.unrealizedGainLossPercent >= 0 ? '+' : ''}${h.unrealizedGainLossPercent.toFixed(1)}%`,
        tabTarget: 'wealth',
      });
    });

    // Goals
    MOCK_GOALS.forEach((g) => {
      items.push({
        id: g.id,
        category: 'Goals',
        title: g.title,
        subtitle: `Target: $${g.targetAmount.toLocaleString()} (${g.fundingPercent}% Funded) • Due: ${g.targetDate}`,
        badge: g.status,
        tabTarget: 'wealth',
      });
    });

    // Institutional Plan
    items.push({
      id: MOCK_RETIREMENT_PLAN.id,
      category: 'Plans',
      title: MOCK_RETIREMENT_PLAN.planName,
      subtitle: `${MOCK_RETIREMENT_PLAN.sponsorName} • Assets: $${MOCK_RETIREMENT_PLAN.totalAssets.toLocaleString()} • 312 Participants`,
      badge: '91.5% Participation',
      tabTarget: 'institutional',
    });

    // Plan Investments
    MOCK_PLAN_INVESTMENTS.forEach((inv) => {
      items.push({
        id: inv.id,
        category: 'Investment Lineup',
        title: `${inv.symbol} - ${inv.name}`,
        subtitle: `${inv.assetClass} • Expense: ${(inv.expenseRatio * 100).toFixed(2)}% • 3Yr: ${inv.threeYearReturn}%`,
        badge: inv.status,
        tabTarget: 'institutional',
      });
    });

    // Participants
    MOCK_PARTICIPANTS.forEach((p) => {
      items.push({
        id: p.id,
        category: 'Participants',
        title: `${p.firstName} ${p.lastName}`,
        subtitle: `${p.title} • Balance: $${p.totalBalance.toLocaleString()} • Deferral: ${p.deferralRatePercent}%`,
        badge: `Score: ${p.retirementReadinessScore}`,
        tabTarget: 'participant',
      });
    });

    // Documents
    MOCK_DOCUMENTS.forEach((doc) => {
      items.push({
        id: doc.id,
        category: 'Documents',
        title: doc.name,
        subtitle: `Category: ${doc.category} • Size: ${doc.size} • Version: ${doc.version}`,
        badge: doc.reviewStatus,
        tabTarget: 'wealth',
      });
    });

    // Messages
    MOCK_MESSAGES.forEach((m) => {
      items.push({
        id: m.id,
        category: 'Messages',
        title: m.subject,
        subtitle: `With ${m.participantNames.join(', ')} • ${m.lastMessageAt}`,
        badge: `${m.messages.length} messages`,
        tabTarget: 'communication',
      });
    });

    // Meetings
    MOCK_MEETINGS.forEach((meet) => {
      items.push({
        id: meet.id,
        category: 'Meetings',
        title: meet.title,
        subtitle: `${meet.date} at ${meet.time} • Host: ${meet.advisorName}`,
        badge: meet.status,
        tabTarget: 'communication',
      });
    });

    // Action Items
    MOCK_ACTION_ITEMS.forEach((act) => {
      items.push({
        id: act.id,
        category: 'Tasks & Action Items',
        title: act.title,
        subtitle: `Assigned: ${act.assignedTo} • Due: ${act.dueDate}`,
        badge: act.priority,
        tabTarget: 'communication',
      });
    });

    // Tax Opportunities
    MOCK_TAX_OPPORTUNITIES.forEach((tax) => {
      items.push({
        id: tax.id,
        category: 'Tax Opportunities',
        title: `Harvest Loss: ${tax.holdingSymbol} → ${tax.replacementCandidate}`,
        subtitle: `Loss: $${Math.abs(tax.unrealizedLoss).toLocaleString()} • Estimated Tax Savings: $${tax.estimatedTaxSavings.toLocaleString()}`,
        badge: tax.status,
        tabTarget: 'tax',
      });
    });

    // Audit Events
    MOCK_AUDIT_EVENTS.forEach((aud) => {
      items.push({
        id: aud.id,
        category: 'Audit & Compliance',
        title: aud.action,
        subtitle: `${aud.objectAffected} by ${aud.userName} • ${aud.timestamp}`,
        badge: 'Audited',
        tabTarget: 'audit',
      });
    });

    return items;
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(allSearchableItems.map((item) => item.category));
    return ['ALL', ...Array.from(cats)];
  }, [allSearchableItems]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();

    return allSearchableItems.filter((item) => {
      const matchCategory = activeCategory === 'ALL' || item.category === activeCategory;
      const matchText =
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        (item.badge && item.badge.toLowerCase().includes(q));
      return matchCategory && matchText;
    });
  }, [query, activeCategory, allSearchableItems]);

  if (!isOpen) return null;

  const handleSelectResult = (item: SearchResultItem) => {
    // Add to recent searches
    if (!recentSearches.includes(item.title)) {
      setRecentSearches((prev) => [item.title, ...prev.slice(0, 4)]);
    }
    onNavigate(item.tabTarget, item.id);
    onClose();
  };

  const handleSaveCurrentView = () => {
    if (!query.trim()) return;
    setSavedViews((prev) => [
      ...prev,
      {
        name: `View: ${query} (${activeCategory})`,
        query,
        category: activeCategory,
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 backdrop-blur-xs p-4 pt-16 sm:pt-24 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-white">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clients, households, accounts, holdings, plans, tax lots, audit events..."
            className="w-full text-base bg-transparent border-none outline-hidden text-slate-900 placeholder-slate-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-500 font-mono"
          >
            ESC
          </button>
        </div>

        {/* Categories Bar */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors font-medium text-[11px] ${
                activeCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results / Suggestions Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {query.trim() ? (
            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Results ({searchResults.length})
                </span>
                <button
                  onClick={handleSaveCurrentView}
                  className="text-xs text-emerald-600 hover:text-emerald-800 font-medium flex items-center gap-1"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  Save as Saved View
                </button>
              </div>

              {searchResults.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <Search className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-medium">No records found for "{query}"</p>
                  <p className="text-xs text-slate-400 mt-0.5">Try searching for symbols, names, or accounts</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden bg-white">
                  {searchResults.map((item) => (
                    <button
                      key={`${item.category}-${item.id}`}
                      onClick={() => handleSelectResult(item)}
                      className="w-full text-left p-3 hover:bg-emerald-50/50 transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[10px]">
                            {item.category}
                          </span>
                          <span className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                            {item.title}
                          </span>
                          {item.badge && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{item.subtitle}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Recent Searches */}
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Recent Searches
                </h4>
                <div className="space-y-1.5">
                  {recentSearches.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQuery(item)}
                      className="w-full text-left text-xs text-slate-700 hover:text-emerald-700 hover:bg-white p-2 rounded-lg transition-colors flex items-center justify-between"
                    >
                      <span>{item}</span>
                      <Search className="w-3 h-3 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Saved Views */}
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-slate-500" />
                  Saved Portal Views
                </h4>
                <div className="space-y-1.5">
                  {savedViews.map((view, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setQuery(view.query);
                        setActiveCategory(view.category);
                      }}
                      className="w-full text-left text-xs text-slate-700 hover:text-emerald-700 hover:bg-white p-2 rounded-lg transition-colors flex items-center justify-between"
                    >
                      <span>{view.name}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>Search across 21 core wealth, fiduciary, and audit data objects</span>
          <span className="text-[11px] font-mono text-slate-400">Nexgile-WealthAgent Global Engine</span>
        </div>
      </div>
    </div>
  );
};
