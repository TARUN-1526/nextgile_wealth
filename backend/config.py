import os
from pydantic import BaseModel
from dotenv import load_dotenv

# Load root .env or environment variables
load_dotenv()

class Settings(BaseModel):
    app_name: str = "Nexgile-WealthAgent Fiduciary API"
    app_version: str = "1.0.0"
    app_url: str = os.getenv("APP_URL", "http://localhost:3000")
    allowed_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        os.getenv("APP_URL", "http://localhost:3000"),
        "*"
    ]
    
    # Gemini API Key
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    
    # Supabase Credentials
    supabase_url: str = os.getenv("SUPABASE_URL", os.getenv("VITE_SUPABASE_URL", "https://gnvniqbfniwyajzwsnjp.supabase.co"))
    supabase_anon_key: str = os.getenv("SUPABASE_ANON_KEY", os.getenv("VITE_SUPABASE_ANON_KEY", ""))
    supabase_service_role_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    database_url: str = os.getenv("DATABASE_URL", "")

settings = Settings()
