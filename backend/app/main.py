from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db import client
from .routers import auth, notes
from .core.config import settings

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    # You can add any startup logic here, like connecting to the database
    pass

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

@app.get("/healthz")
def health_check():
    return {"status": "ok"}

@app.get("/api/v1/test")
async def test_endpoint():
    return {"message": "API is working", "timestamp": "2024-10-02"}

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(notes.router, prefix="/api/v1/notes", tags=["notes"])