from fastapi import APIRouter
from backend.models import FundReplacementProposal

router = APIRouter(prefix="/api/retirement", tags=["Institutional ERISA 404(c)"])

@router.get("/erisa-status")
def get_erisa_plan_status():
    return {
        "plan_name": "Apex BioTech 401(k) Profit Sharing Plan",
        "plan_assets": 48600000.0,
        "participants_count": 312,
        "erisa_404c_compliance_score": 98.4,
        "nondiscrimination_adp_acp_test": "Passed (Safe Harbor Match Qualified)",
        "form_5500_status": "Ready for Filing",
        "average_participant_deferral_rate": 8.4,
        "qdia_default_fund": "Vanguard Target Retirement 2030-2065 Series"
    }

@router.get("/watchlist")
def get_investment_watchlist():
    return [
        {
            "fund_name": "Active Large Growth Trust",
            "ticker": "ALGTX",
            "asset_class": "US Large Cap Growth",
            "ips_score": 52,
            "status": "Watchlist - Under Review",
            "trailing_3yr_rank": "78th percentile",
            "net_expense_ratio": 0.74,
            "recommended_replacement": "Vanguard Growth Index Instl (VIGIX - 0.04%)",
            "annual_plan_savings": 46200.0
        },
        {
            "fund_name": "Global High Yield Bond Portfolio",
            "ticker": "GHYBX",
            "asset_class": "High Yield Bond",
            "ips_score": 64,
            "status": "Acceptable / Monitored",
            "trailing_3yr_rank": "42nd percentile",
            "net_expense_ratio": 0.58
        }
    ]

@router.post("/replace-fund")
def replace_plan_fund(proposal: FundReplacementProposal):
    return {
        "success": True,
        "plan_id": proposal.plan_id,
        "fund_removed": proposal.fund_to_remove,
        "fund_added": proposal.replacement_fund,
        "projected_fee_reduction": proposal.expense_ratio_savings,
        "participant_30_day_notice_dispatched": True,
        "erisa_fiduciary_record_id": "ERISA-404C-2026-VOTE-01"
    }
