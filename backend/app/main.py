from fastapi import FastAPI
from app.api import router as api_router 
from app.db.init_db import connect_to_mongo, close_mongo_connection


app = FastAPI()

@app.on_event("startup")
def startup_event():
    try:
        connect_to_mongo()   # MUST happen before router import side-effects
    except Exception as e:
        print("Failed to connect to MongoDB on startup")
        raise e

@app.on_event("shutdown")
def shutdown_event():
    close_mongo_connection()


app.include_router(api_router)

