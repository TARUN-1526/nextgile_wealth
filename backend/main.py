from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.routers import auth, wealth, tax_estate, retirement, compliance, ai
from backend.database import check_db_health

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Full-Stack Fiduciary API powering SEC Rule 204-2 and ERISA 404(c) Wealth Management.",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all modular API routers
app.include_router(auth.router)
app.include_router(wealth.router)
app.include_router(tax_estate.router)
app.include_router(retirement.router)
app.include_router(compliance.router)
app.include_router(ai.router)

@app.get("/")
def root():
    return {
        "service": settings.app_name,
        "version": settings.app_version,
        "docs": "/api/docs",
        "status": "online"
    }

@app.get("/api/health")
def api_health():
    db_status = check_db_health()
    return {
        "status": "healthy",
        "environment": "fiduciary-production",
        "proxy_gateway": "Vite Port 3000 -> FastAPI Port 8001",
        "database": db_status
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
