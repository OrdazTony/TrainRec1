import sqlite3
from sqlite3 import Connection
from datetime import datetime, timedelta
from functools import wraps
from typing import Optional, Dict, Any

from flask import Flask, request, jsonify, g
from werkzeug.security import generate_password_hash, check_password_hash
import jwt

# ---------- Configuration ----------
DB_PATH = "trainrec.db"
JWT_SECRET = "replace-with-a-very-secret-key"
JWT_ALGORITHM = "HS256"
JWT_EXP_DELTA_SECONDS = 86400  # 24 hours

app = Flask(__name__)

# ---------- Database Setup ----------
def get_db() -> Connection:
    db = getattr(g, "_database", None)
    if db is None:
        db = g._database = sqlite3.connect(DB_PATH)
        db.row_factory = sqlite3.Row
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, "_database", None)
    if db is not None:
        db.close()

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    # Users Table: Stores Imperial Height (in) and Weight (lb)
    c.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        nickname TEXT,
        password_hash TEXT NOT NULL,
        sex TEXT,
        birthdate TEXT,
        height_in REAL,
        weight_lb REAL,
        fitness_activity TEXT,
        created_at TEXT NOT NULL
    )
    """)
    # Goals Table: Stores Target Weight in lbs
    c.execute("""
    CREATE TABLE IF NOT EXISTS goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        target_weight_lb REAL,
        weekly_weight_change_lb REAL,
        activity_level TEXT,
        daily_calorie_target REAL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )
    """)
    conn.commit()
    conn.close()

# ---------- Auth Helpers ----------
def auth_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid Authorization header"}), 401
        token = auth.split(" ", 1)[1].strip()
        try:
            data = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            request.user_id = data.get("user_id")
        except:
            return jsonify({"error": "Invalid or expired token"}), 401
        return fn(*args, **kwargs)
    return wrapper

# ---------- Calorie Logic (Imperial) ----------
def calculate_daily_calories(sex, weight, height, birthdate, activity, weekly_change):
    # Auto-age calculation
    birth = datetime.fromisoformat(birthdate)
    today = datetime.utcnow()
    age = today.year - birth.year - ((today.month, today.day) < (birth.month, birth.day))
    
    # Mifflin-St Jeor Imperial Formula
    if sex.lower() in ("m", "male"):
        bmr = (6.23 * weight) + (12.7 * height) - (6.76 * age) + 66
    else:
        bmr = (4.35 * weight) + (4.7 * height) - (4.7 * age) + 655
    
    multipliers = {"sedentary": 1.2, "light": 1.375, "moderate": 1.55, "active": 1.725, "very_active": 1.9}
    maintenance = bmr * multipliers.get(activity, 1.2)
    
    # 1 lb fat = 3500 calories
    daily_delta = (weekly_change * 3500) / 7.0
    return round(max(maintenance + daily_delta, 1200), 1)

# ---------- Endpoints ----------

@app.route("/register", methods=["POST"])
def register():
    payload = request.get_json()
    pw_hash = generate_password_hash(payload["password"])
    db = get_db()
    try:
        db.execute("""INSERT INTO users (email, name, nickname, password_hash, sex, birthdate, height_in, weight_lb, created_at) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                   (payload["email"].lower(), payload["name"], payload.get("nickname"), pw_hash, 
                    payload["sex"], payload["birthdate"], payload["height_in"], payload["weight_lb"], datetime.utcnow().isoformat()))
        db.commit()
        return jsonify({"message": "Account Created"}), 201
    except:
        return jsonify({"error": "User already exists"}), 400

@app.route("/login", methods=["POST"])
def login():
    payload = request.get_json() or {}
    email = payload.get("email", "").lower()
    password = payload.get("password", "")

    db = get_db()
    # Find the user by email
    user = db.execute("SELECT id, password_hash FROM users WHERE email = ?", (email,)).fetchone()

    if user and check_password_hash(user["password_hash"], password):
        # Create the token (valid for 24 hours)
        token = jwt.encode(
            {"user_id": user["id"], "exp": datetime.utcnow() + timedelta(seconds=86400)}, 
            JWT_SECRET, 
            algorithm=JWT_ALGORITHM
        )
        return jsonify({
            "message": "Logged in successfully",
            "token": token
        }), 200
    
    return jsonify({"error": "Invalid email or password"}), 401

@app.route("/reset_password", methods=["POST"])
@auth_required
def reset_password():
    new_pw = request.get_json().get("new_password")
    db = get_db()
    db.execute("UPDATE users SET password_hash = ? WHERE id = ?", (generate_password_hash(new_pw), request.user_id))
    db.commit()
    return jsonify({"message": "Password updated"})

@app.route("/me/update_profile", methods=["POST"])
@auth_required
def update_profile():
    payload = request.get_json()
    db = get_db()
    # Dynamic update for weight, height, nickname, and fitness activity
    for key in ["weight_lb", "height_in", "nickname", "fitness_activity"]:
        if key in payload:
            db.execute(f"UPDATE users SET {key} = ? WHERE id = ?", (payload[key], request.user_id))
    db.commit()
    return jsonify({"message": "Profile updated"})

@app.route("/goals", methods=["POST"])
@auth_required
def set_goals():
    payload = request.get_json()
    db = get_db()
    user = db.execute("SELECT * FROM users WHERE id = ?", (request.user_id,)).fetchone()
    
    calories = calculate_daily_calories(user["sex"], user["weight_lb"], user["height_in"], 
                                       user["birthdate"], payload["activity_level"], payload["weekly_weight_change_lb"])

    db.execute("""INSERT INTO goals (user_id, target_weight_lb, weekly_weight_change_lb, activity_level, daily_calorie_target, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?)""", 
               (request.user_id, payload["target_weight_lb"], payload["weekly_weight_change_lb"], 
                payload["activity_level"], calories, datetime.utcnow().isoformat()))
    db.commit()
    return jsonify({"message": "Goal set", "daily_calories": calories})

@app.route("/dashboard", methods=["GET"])
@auth_required
def dashboard():
    db = get_db()
    user = db.execute("SELECT * FROM users WHERE id = ?", (request.user_id,)).fetchone()
    
    # Auto-age for dashboard
    birth = datetime.fromisoformat(user["birthdate"])
    age = datetime.utcnow().year - birth.year
    
    return jsonify({
        "display_name": user["nickname"] or user["name"],
        "age": age,
        "stats": {
            "weight": f"{user['weight_lb']} lbs",
            "height": f"{user['height_in']} inches",
            "activity": user["fitness_activity"]
        }
    })

if __name__ == "__main__":
    init_db()
    app.run(debug=True)