from fastapi import APIRouter
from backend.models import RebalanceRequest, CustodianAccount
from typing import List

router = APIRouter(prefix="/api/wealth", tags=["Individual Wealth & Custodians"])

CUSTODIAL_ACCOUNTS = [
    {
        "id": "acct_schwab_taxable_01",
        "account_number": "SCHW-8821-4902",
        "custodian": "Charles Schwab Institutional",
        "account_type": "Taxable Joint Tenancy (WROS)",
        "household": "The Vance Family Household",
        "total_balance": 8450200.0,
        "cash_balance": 320400.0,
        "status": "Reconciled (Real-time Feed)"
    },
    {
        "id": "acct_fidelity_ira_02",
        "account_number": "FID-9901-3310",
        "custodian": "Fidelity Institutional Clearing",
        "account_type": "Traditional IRA Rollover",
        "household": "The Vance Family Household",
        "total_balance": 3240000.0,
        "cash_balance": 110000.0,
        "status": "Reconciled (Real-time Feed)"
    },
    {
        "id": "acct_pershing_trust_03",
        "account_number": "BNY-4402-1829",
        "custodian": "BNY Mellon Pershing",
        "account_type": "Irrevocable Dynasty Trust",
        "household": "The Vance Family Household",
        "total_balance": 12890000.0,
        "cash_balance": 450000.0,
        "status": "Reconciled (Real-time Feed)"
    }
]

@router.get("/overview")
def get_wealth_overview():
    total_aum = sum(a["total_balance"] for a in CUSTODIAL_ACCOUNTS)
    return {
        "total_aum": total_aum,
        "households_count": 48,
        "custodians_connected": ["Charles Schwab", "Fidelity Institutional", "BNY Mellon Pershing"],
        "unreconciled_breaks": 0,
        "ytd_net_return": 11.4,
        "asset_allocation": {
            "us_equities": 42.5,
            "intl_equities": 18.0,
            "fixed_income": 24.5,
            "real_assets": 8.0,
            "cash_equivalents": 7.0
        }
    }

@router.get("/custodians", response_model=List[CustodianAccount])
def get_custodian_accounts():
    return [CustodianAccount(**a) for a in CUSTODIAL_ACCOUNTS]

@router.post("/rebalance")
def execute_rebalance(request: RebalanceRequest):
    return {
        "success": True,
        "portfolio_id": request.portfolio_id,
        "orders_generated": 6,
        "estimated_tax_impact": "$0.00 (Tax-Loss Harvest offsets applied)",
        "fiduciary_logged": True,
        "sec_audit_id": "REBAL-2026-0907-SEC2042"
    }
