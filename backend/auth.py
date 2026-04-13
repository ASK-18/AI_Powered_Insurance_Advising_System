"""
auth.py
───────────────────────────────────────────────────────────────────────────────
Register and login with role support.
  - Regular users: role = "user"
  - Admins: must supply ADMIN_SECRET_KEY from .env during registration
  - Passwords hashed with bcrypt
───────────────────────────────────────────────────────────────────────────────
"""

import os
import bcrypt
from database import get_users_collection
from dotenv import load_dotenv

load_dotenv()

# Set this in your .env file — keep it secret
ADMIN_SECRET_KEY = os.getenv("ADMIN_SECRET_KEY", "insureai-admin-2024")


def register_user(email: str, password: str, admin_key: str = "") -> dict:
    users = get_users_collection()
    email = email.lower().strip()

    if users.find_one({"email": email}):
        return {"error": "Email already registered. Please login."}

    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

    # Determine role
    role = "admin" if admin_key.strip() == ADMIN_SECRET_KEY else "user"

    users.insert_one({
        "email":    email,
        "password": hashed,
        "role":     role,
    })

    return {"success": True, "role": role}


def login_user(email: str, password: str) -> dict:
    users = get_users_collection()
    email = email.lower().strip()

    user = users.find_one({"email": email})
    if not user:
        return {"error": "No account found with this email. Please register."}

    if not bcrypt.checkpw(password.encode("utf-8"), user["password"]):
        return {"error": "Incorrect password. Please try again."}

    return {"success": True, "role": user.get("role", "user")}