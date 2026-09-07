from fastapi import APIRouter
from backend.models import TaxHarvestExecution, DAFGrantRequest

router = APIRouter(prefix="/api/tax-estate", tags=["Tax Optimization & Estate Planning"])

@router.get("/harvesting")
def get_tax_loss_opportunities():
    return [
        {
            "id": "tlh_001",
            "symbol": "VWO",
            "name": "Vanguard FTSE Emerging Markets ETF",
            "current_loss": -42800.0,
            "cost_basis": 412000.0,
            "market_value": 369200.0,
            "replacement_proxy": "IEMG",
            "replacement_name": "iShares Core MSCI Emerging Markets ETF",
            "wash_sale_risk": "None (MSCI vs FTSE Index Divergence)",
            "estimated_tax_savings": 15836.0
        },
        {
            "id": "tlh_002",
            "symbol": "BNDX",
            "name": "Vanguard Total International Bond ETF",
            "current_loss": -18400.0,
            "cost_basis": 220000.0,
            "market_value": 201600.0,
            "replacement_proxy": "IAGG",
            "replacement_name": "iShares Core International Aggregate Bond",
            "wash_sale_risk": "None (Permitted Proxy)",
            "estimated_tax_savings": 6808.0
        }
    ]

@router.post("/execute-harvest")
def execute_tax_loss_harvest(req: TaxHarvestExecution):
    return {
        "success": True,
        "opportunity_id": req.opportunity_id,
        "sold_ticker": req.ticker_to_sell,
        "bought_ticker": req.replacement_ticker,
        "tax_alpha_generated": req.loss_amount * 0.37,
        "wash_sale_window_days": 31,
        "status": "Executed & Custodially Settled"
    }

@router.get("/rmd-schedule")
def get_rmd_schedule():
    return {
        "tax_year": 2026,
        "regulation": "SECURE 2.0 Act (Age 73 mandatory beginning date)",
        "clients_subject_to_rmd": [
            {
                "client_name": "Arthur Pendelton",
                "age": 75,
                "prior_year_end_balance": 2840000.0,
                "irs_uniform_lifetime_factor": 24.6,
                "calculated_rmd": 115447.15,
                "distributions_ytd": 60000.0,
                "remaining_rmd": 55447.15,
                "deadline": "2026-12-31"
            }
        ]
    }

@router.post("/daf-grant")
def issue_daf_grant(grant: DAFGrantRequest):
    return {
        "success": True,
        "grant_id": "DAF-GR-2026-8842",
        "charity_name": grant.charity_name,
        "amount": grant.amount,
        "deduction_year": 2026,
        "status": "Transmitted to Schwab Charitable / Fidelity Charitable"
    }
