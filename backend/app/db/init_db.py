from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from app.core.config import settings
from typing import Optional

client: Optional[MongoClient] = None
db = None


def connect_to_mongo():
    """
    Initialize a MongoDB connection and verify it's alive.
    Called on FastAPI startup.
    """
    global client, db

    try:
        # Create client with sane defaults
        client = MongoClient(
            settings.MONGO_URI,
            serverSelectionTimeoutMS=3000,
            maxPoolSize=20,
        )

        # Force a real connection
        client.admin.command("ping")

        # Get the target database
        db = client[settings.MONGO_DB]

        print("MongoDB connected successfully")

    except (ConnectionFailure, ServerSelectionTimeoutError) as e:
        print("Failed to connect to MongoDB")
        print(f"Reason: {e}")
        raise RuntimeError("MongoDB connection failed") from e


def close_mongo_connection():
    """Gracefully close on FastAPI shutdown."""
    global client
    if client:
        client.close()
        print("MongoDB connection closed")


def get_db():
    """
    Safe getter — ensures DB is ready.
    Prevents NoneType errors if startup didn't run.
    """
    if db is None:
        raise RuntimeError(
            "MongoDB not initialized. Did FastAPI startup_event run?"
        )
    return db

