"""
database.py
───────────────────────────────────────────────────────────────────────────────
MongoDB connection using PyMongo.
Configure MONGO_URI and DB_NAME in your .env file.
───────────────────────────────────────────────────────────────────────────────
"""

import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME   = os.getenv("DB_NAME", "insureai")

# Single client reused across all requests
_client = MongoClient(MONGO_URI)
_db     = _client[DB_NAME]

def get_users_collection():
    """Returns the MongoDB 'users' collection."""
    return _db["users"]

def get_plans_collection():
    """Returns the MongoDB 'plans' collection."""
    return _db["plans"]