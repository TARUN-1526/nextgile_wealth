from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

# --- Auth Models ---
class UserLogin(BaseModel):
    email: str
    password: str
    mfa_code: Optional[str] = None
    remember_me: bool = True

class UserProfileSchema(BaseModel):
    id: str
    name: str
    email: str
    role: str
    category: str
    title: Optional[str] = None
    organization: Optional[str] = None
    avatar_initials: str
    permissions: List[str] = []

class AuthResponse(BaseModel):
    success: bool
    message: str
    token: str
    user: UserProfileSchema

# --- Wealth & Custodian Models ---
class Holding(BaseModel):
    symbol: str
    name: str
    asset_class: str
    shares: float
    price: float
    market_value: float
    cost_basis: float
    unrealized_gain_loss: float
    account_id: str

class CustodianAccount(BaseModel):
    id: str
    account_number: str
    custodian: str  # Schwab, Fidelity, BNY Mellon Pershing
    account_type: str  # Taxable, Traditional IRA, Roth IRA, Trust
    household: str
    total_balance: float
    cash_balance: float
    status: str = "Connected & Reconciled"

class RebalanceRequest(BaseModel):
    portfolio_id: str
    drift_threshold: float = 0.05
    tax_sensitive: bool = True
    fiduciary_approval: bool = True

# --- Tax & Estate Models ---
class TaxHarvestExecution(BaseModel):
    opportunity_id: str
    ticker_to_sell: str
    loss_amount: float
    replacement_ticker: str
    reason: str
    prevent_wash_sale: bool = True

class DAFGrantRequest(BaseModel):
    charity_name: str
    charity_ein: str
    amount: float
    donor_advised_fund: str
    purpose: str

# --- Retirement & ERISA Models ---
class FundReplacementProposal(BaseModel):
    plan_id: str
    fund_to_remove: str
    replacement_fund: str
    reason: str
    expense_ratio_savings: float
    committee_approval_required: bool = True

# --- Compliance & Audit Models ---
class AuditLogEntry(BaseModel):
    timestamp: Optional[str] = None
    user_id: str
    user_name: str
    user_role: str
    action: str
    object_affected: str
    previous_value: Optional[str] = None
    new_value: Optional[str] = None
    reason: str
    sec_rule: str = "SEC Rule 204-2"
    worm_hash: Optional[str] = None

# --- AI Assistant ---
class AiPromptRequest(BaseModel):
    prompt: str
    context_role: str
    household_id: Optional[str] = None
    plan_id: Optional[str] = None

class AiPromptResponse(BaseModel):
    response: str
    confidence_score: float
    regulatory_citations: List[str]
    suggested_actions: List[str]
