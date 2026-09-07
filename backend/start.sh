#!/bin/bash
# Nexgile-WealthAgent FastAPI Backend Runner
echo "Starting Nexgile-WealthAgent FastAPI backend on port 8001..."
python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8001 --reload
