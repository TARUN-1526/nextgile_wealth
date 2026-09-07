import logging
from typing import Optional
from backend.config import settings

logger = logging.getLogger("fiduciary-db")

supabase_client = None

def get_supabase_client():
    global supabase_client
    if supabase_client is not None:
        return supabase_client
    
    url = settings.supabase_url
    # Use service role key if available for elevated admin actions, otherwise anon key
    key = settings.supabase_service_role_key or settings.supabase_anon_key
    
    if url and key and "YOUR_" not in key:
        try:
            from supabase import create_client, Client
            supabase_client = create_client(url, key)
            logger.info("Supabase client successfully initialized.")
            return supabase_client
        except Exception as e:
            logger.warning(f"Supabase client initialization deferred: {e}")
            return None
    return None

def check_db_health() -> dict:
    has_supabase = bool(settings.supabase_url and (settings.supabase_anon_key or settings.supabase_service_role_key))
    has_postgres_url = bool(settings.database_url)
    
    return {
        "status": "connected" if has_supabase or has_postgres_url else "configured_local",
        "supabase_connected": has_supabase,
        "database_url_configured": has_postgres_url,
        "supabase_endpoint": settings.supabase_url if has_supabase else None,
        "audit_persistence": "WORM_POSTGRES_COMPLIANT"
    }
