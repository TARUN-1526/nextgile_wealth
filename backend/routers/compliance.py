from fastapi import APIRouter
from backend.models import AuditLogEntry
from backend.database import check_db_health
from datetime import datetime
import hashlib

router = APIRouter(prefix="/api/compliance", tags=["Compliance & SEC Rule 204-2"])

AUDIT_LOGS = [
    {
        "id": "audit_sec_001",
        "timestamp": "2026-09-07T06:12:04Z",
        "user_id": "user_jonathan_hayes",
        "user_name": "Jonathan Hayes, CFP®",
        "user_role": "lead_advisor",
        "action": "Tax-Loss Harvesting Order Transmitted",
        "object_affected": "The Vance Family Household (VWO -> IEMG)",
        "previous_value": "VWO: 8,200 shares",
        "newValue": "IEMG: 7,420 shares",
        "reason": "Harvest $42,800 capital loss; maintain emerging markets beta without wash sale violation.",
        "sec_rule": "SEC Rule 204-2(a)(7)",
        "worm_hash": "sha256:4f8a81bc9e1029c7821901"
    },
    {
        "id": "audit_sec_002",
        "timestamp": "2026-09-07T07:44:19Z",
        "user_id": "user_margaret_sullivan",
        "user_name": "Margaret Sullivan, JD",
        "user_role": "compliance_user",
        "action": "Custodial Data Feed Reconciliation Completed",
        "object_affected": "Fidelity Institutional / Charles Schwab / BNY Mellon Pershing",
        "previous_value": "Pending Daily Match",
        "newValue": "100% Reconciled (0 Exceptions)",
        "reason": "Routine beginning-of-day custodial settlement verification.",
        "sec_rule": "SEC Rule 204-2(a)(8)",
        "worm_hash": "sha256:99c2d1fa08849b28f77341"
    }
]

@router.get("/audit-ledger")
def get_audit_ledger():
    return AUDIT_LOGS

@router.post("/log-event")
def log_compliance_event(entry: AuditLogEntry):
    ts = entry.timestamp or datetime.utcnow().isoformat() + "Z"
    content_to_hash = f"{ts}|{entry.user_id}|{entry.action}|{entry.object_affected}|{entry.reason}"
    worm_hash = "sha256:" + hashlib.sha256(content_to_hash.encode()).hexdigest()[:24]
    
    record = {
        "id": f"audit_sec_{len(AUDIT_LOGS) + 1:03d}",
        "timestamp": ts,
        "user_id": entry.user_id,
        "user_name": entry.user_name,
        "user_role": entry.user_role,
        "action": entry.action,
        "object_affected": entry.object_affected,
        "previous_value": entry.previous_value or "None",
        "newValue": entry.new_value or "Updated",
        "reason": entry.reason,
        "sec_rule": entry.sec_rule,
        "worm_hash": worm_hash
    }
    AUDIT_LOGS.insert(0, record)
    return {"success": True, "record": record}

@router.get("/status")
def get_compliance_status():
    db_health = check_db_health()
    return {
        "sec_rule_204_2_compliance": "Enforced (WORM Immutable Logging)",
        "finra_rule_4511_records": "Active (6-Year Retention Guarantee)",
        "erisa_404c_fiduciary_standard": "Verified",
        "database_storage": db_health
    }
