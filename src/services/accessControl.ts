import {
  Account,
  AppNotification,
  Goal,
  Holding,
  Household,
  ParticipantRecord,
  UserProfile,
  VaultDocument,
} from '../types';

export class AccessControlService {
  /**
   * Check whether a user has permission to access a household's data.
   */
  static canAccessHousehold(user: UserProfile, householdId: string): boolean {
    if (user.category === 'internal') {
      // Compliance, Leadership, and Operations have firm-wide oversight
      if (['compliance_user', 'leadership', 'operations', 'investment_team', 'tax_specialist', 'estate_attorney', 'trust_officer'].includes(user.role)) {
        return true;
      }
      // Financial advisors have strictly assigned households
      if (user.assignedHouseholdIds && user.assignedHouseholdIds.includes(householdId)) {
        return true;
      }
      return false;
    }

    if (user.category === 'individual') {
      return user.householdId === householdId;
    }

    // Institutional users cannot browse private individual households
    return false;
  }

  /**
   * Get all households accessible by a user
   */
  static getAccessibleHouseholds(user: UserProfile, households: Household[]): Household[] {
    return households.filter((hh) => this.canAccessHousehold(user, hh.id));
  }

  /**
   * Check whether a user can access a specific financial account.
   * Special constraint: Beneficiary role can ONLY see trust accounts they are specifically authorized for.
   */
  static canAccessAccount(user: UserProfile, account: Account, activeHouseholdId?: string): boolean {
    // If an active household context is specified, must match it
    if (activeHouseholdId && account.householdId !== activeHouseholdId) {
      return false;
    }

    if (user.category === 'internal') {
      return this.canAccessHousehold(user, account.householdId);
    }

    if (user.role === 'beneficiary') {
      // Beneficiary can ONLY see authorized trust accounts
      if (user.trustAccessIds && user.trustAccessIds.includes(account.id)) {
        return true;
      }
      return false;
    }

    if (user.category === 'individual') {
      return user.householdId === account.householdId;
    }

    return false;
  }

  /**
   * Check whether a user can access a specific vault document.
   */
  static canAccessDocument(user: UserProfile, doc: VaultDocument, activeHouseholdId?: string): boolean {
    if (activeHouseholdId && doc.householdId && doc.householdId !== activeHouseholdId) {
      return false;
    }

    if (user.category === 'internal') {
      if (doc.restrictedToRoles && !doc.restrictedToRoles.includes(user.role) && user.role !== 'compliance_user' && user.role !== 'leadership') {
        return false;
      }
      if (doc.householdId) {
        return this.canAccessHousehold(user, doc.householdId);
      }
      return true;
    }

    if (user.role === 'beneficiary') {
      // Beneficiary can only access trust documents designated for them or not restricted
      if (doc.restrictedToTrustId) {
        return true;
      }
      return false;
    }

    if (user.category === 'individual') {
      if (doc.householdId && doc.householdId === user.householdId) {
        return true;
      }
      return false;
    }

    if (user.category === 'institutional') {
      if (doc.planId && doc.planId === user.assignedPlanId) {
        // Participants only see participant notices, not confidential sponsor minutes
        if (user.role === 'plan_participant' && doc.category === 'Fiduciary Minutes') {
          return false;
        }
        return true;
      }
      return false;
    }

    return false;
  }

  /**
   * Institutional security constraint:
   * Plan sponsors and committee members can view plan aggregate metrics,
   * but MUST NOT see individual participant account balances (HIPAA/ERISA privacy).
   * A participant can see ONLY their own participant record.
   */
  static canViewParticipantRecord(user: UserProfile, participant: ParticipantRecord): boolean {
    // Participants can view ONLY their own record
    if (user.role === 'plan_participant') {
      return user.participantId === participant.id;
    }

    // Plan admin or HR benefits with specific clearance may inspect census for operations
    if (user.role === 'plan_admin' || user.role === 'fiduciary') {
      return user.assignedPlanId === participant.planId;
    }

    // Advisors / Compliance
    if (user.category === 'internal' && ['financial_advisor', 'compliance_user', 'operations'].includes(user.role)) {
      return true;
    }

    // Plan Sponsor, CFO, Committee: STRICTLY BLOCKED from individual participant balances
    if (['plan_sponsor', 'cfo', 'investment_committee', 'hr_benefits'].includes(user.role)) {
      return false;
    }

    return false;
  }

  /**
   * Check institutional plan-level access
   */
  static canAccessPlanLevel(user: UserProfile, planId: string): boolean {
    if (user.category === 'internal') return true;
    if (user.category === 'institutional') {
      return user.assignedPlanId === planId;
    }
    return false;
  }

  /**
   * Filter an array of accounts to only those authorized for the current user
   */
  static getAuthorizedAccounts(user: UserProfile, accounts: Account[], activeHouseholdId?: string): Account[] {
    return accounts.filter((acc) => this.canAccessAccount(user, acc, activeHouseholdId));
  }

  /**
   * Filter holdings according to authorized accounts
   */
  static getAuthorizedHoldings(
    user: UserProfile,
    holdings: Holding[],
    accounts: Account[],
    activeHouseholdId?: string
  ): Holding[] {
    const authorizedAccountIds = new Set(
      this.getAuthorizedAccounts(user, accounts, activeHouseholdId).map((a) => a.id)
    );
    return holdings.filter((h) => authorizedAccountIds.has(h.accountId));
  }

  /**
   * Filter goals according to user's household access
   */
  static getAuthorizedGoals(user: UserProfile, goals: Goal[], activeHouseholdId?: string): Goal[] {
    if (user.role === 'beneficiary') {
      // Beneficiaries only see goals linked to their education/trust
      return goals.filter((g) => g.linkedAccountIds.some((accId) => user.trustAccessIds?.includes(accId)));
    }
    if (activeHouseholdId) {
      return goals.filter((g) => g.householdId === activeHouseholdId && this.canAccessHousehold(user, g.householdId));
    }
    return goals.filter((g) => this.canAccessHousehold(user, g.householdId));
  }

  /**
   * Filter documents according to user permissions
   */
  static getAuthorizedDocuments(user: UserProfile, docs: VaultDocument[], activeHouseholdId?: string): VaultDocument[] {
    return docs.filter((doc) => this.canAccessDocument(user, doc, activeHouseholdId));
  }

  /**
   * Filter notifications relevant to current user role and permissions
   */
  static getAuthorizedNotifications(
    user: UserProfile,
    notifications: AppNotification[]
  ): AppNotification[] {
    return notifications.filter((notif) => {
      if (notif.targetUserIds && notif.targetUserIds.includes(user.id)) return true;
      if (notif.targetRoles && notif.targetRoles.includes(user.role)) return true;
      if (notif.targetRoleCategories && notif.targetRoleCategories.includes(user.category)) return true;
      // If neither is specified, visible to all
      if (!notif.targetRoles && !notif.targetRoleCategories && !notif.targetUserIds) return true;
      return false;
    });
  }
}
