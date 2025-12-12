# app/db.py

from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from app.core.config import settings
from typing import Optional

client: Optional[MongoClient] = None
db = None


def connect_to_mongo():
    """Connect to MongoDB with retries + proper error handling."""
    global client, db

    try:
        client = MongoClient(
            settings.MONGO_URI,
            serverSelectionTimeoutMS=3000,   # fail fast if Mongo is down
            maxPoolSize=20,                  # reasonable for a backend API
        )

        # Trigger actual connection (MongoClient is lazy by default)
        client.admin.command("ping")

        db = client[settings.MONGO_DB]
        print("MongoDB connected successfully")

    except (ConnectionFailure, ServerSelectionTimeoutError) as e:
        print("MongoDB connection failed!")
        print(f"Reason: {e}")
        raise e


def close_mongo_connection():
    """Gracefully close MongoDB connection."""
    global client
    if client:
        client.close()
        print("MongoDB connection closed")

