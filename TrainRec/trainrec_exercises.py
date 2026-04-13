from flask import Flask, jsonify, request
JWT_SECRET = "your-chosen-secret-key-here"
JWT_ALGORITHM = "HS256"

from flask import Flask, jsonify, request, g  
from flask_cors import CORS
import json # Used for saving and loading session metadata and landmarks in JSON format.
import os # Used for file system operations like creating directories and saving files.
import uuid
import sqlite3                                
from datetime import datetime, timedelta
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timezone, timedelta
from datetime import datetime, timezone #Used for timestamping session start and end times in a standardized format.
from pathlib import Path # Used for easier path manipulations and ensuring cross-platform compatibility when saving session data.

app = Flask(__name__)

# This allows your team's React app (port 5173) to access this API (port 5000)
CORS(app)


DB_PATH = "trainrec.db"
JWT_SECRET = "replace-with-a-very-secret-key"
JWT_ALGORITHM = "HS256"

def get_db():
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
    c.execute("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE, name TEXT, nickname TEXT, password_hash TEXT, sex TEXT, birthdate TEXT, height_in REAL, weight_lb REAL, fitness_activity TEXT, created_at TEXT)")
    c.execute("CREATE TABLE IF NOT EXISTS goals (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, target_weight_lb REAL, weekly_weight_change_lb REAL, activity_level TEXT, daily_calorie_target REAL, updated_at TEXT)")
    c.execute("CREATE TABLE IF NOT EXISTS completed_workouts (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, exercise_name TEXT, calories_burned REAL, completed_at TEXT)")
    conn.commit()
    conn.close()

def auth_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "): return jsonify({"error": "Unauthorized"}), 401
        try:
            token = auth.split(" ")[1]
            data = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            request.user_id = data.get("user_id")
        except: return jsonify({"error": "Invalid token"}), 401
        return fn(*args, **kwargs)
    return wrapper
#Guarantees the data directory exists for storing pose session data. 
#Each session will be saved as a JSON file with a unique name based on the timestamp and a random UUID to avoid collisions.
#This is where Abdiel's section will read from to display past workout sessions and their associated pose data.
BASE_DIR = Path(__file__).resolve().parent
POSE_DATA_DIR = BASE_DIR / 'data' / 'pose_sessions'
POSE_DATA_DIR.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------------
# EXERCISE LIBRARY DATA
# This is the "Source of Truth" for Abdiel's section.
# ---------------------------------------------------------
EXERCISES = [
    # --- UPPER BODY ---
    {"id": "pushups", "name": "Push-ups", "category": "Upper Body", "difficulty": "Beginner", "type": "reps", "target": 15, "icon": "fitness_center", "description": "Standard chest press movement.", "steps": ["Hands wide", "Lower chest", "Push up"]},
    {"id": "diamond_pushups", "name": "Diamond Push-ups", "category": "Upper Body", "difficulty": "Advanced", "type": "reps", "target": 10, "icon": "handyman", "description": "Tricep-focused push-ups.", "steps": ["Hands in diamond shape", "Keep elbows in"]},
    {"id": "pike_pushups", "name": "Pike Push-ups", "category": "Upper Body", "difficulty": "Intermediate", "type": "reps", "target": 10, "icon": "architecture", "description": "Shoulder-focused push-up.", "steps": ["Hips high in V-shape", "Lower head to floor"]},
    {"id": "tricep_dips", "name": "Tricep Dips", "category": "Upper Body", "difficulty": "Beginner", "type": "reps", "target": 12, "icon": "chair", "description": "Using a chair or bench for triceps.", "steps": ["Hands on edge", "Lower hips", "Push up"]},
    {"id": "bicep_curls", "name": "Bicep Curls", "category": "Upper Body", "difficulty": "Beginner", "type": "reps", "target": 12, "icon": "fitness_center", "description": "Classic elbow flexion for bicep isolation.", "steps": ["Stand tall, arms at sides", "Curl both arms to shoulder height", "Squeeze at the top", "Lower with control"]},
    {"id": "supermans", "name": "Supermans", "category": "Upper Body", "difficulty": "Beginner", "type": "reps", "target": 15, "icon": "flight", "description": "Strengthens the lower back and shoulders.", "steps": ["Lie face down", "Lift arms and legs", "Hold and lower"]},
    {"id": "inchworms", "name": "Inchworms", "category": "Upper Body", "difficulty": "Intermediate", "type": "reps", "target": 8, "icon": "bug_report", "description": "Full body stretch and shoulder stability.", "steps": ["Walk hands out to plank", "Walk hands back to feet"]},

    # --- LOWER BODY ---
    {"id": "squats", "name": "Bodyweight Squats", "category": "Lower Body", "difficulty": "Beginner", "type": "reps", "target": 20, "icon": "accessibility_new", "description": "Essential leg movement.", "steps": ["Feet shoulder-width", "Sit back", "Chest up"]},
    {"id": "jump_squats", "name": "Jump Squats", "category": "Lower Body", "difficulty": "Advanced", "type": "reps", "target": 12, "icon": "bolt", "description": "Explosive leg power.", "steps": ["Squat down", "Jump explosively", "Land softly"]},
    {"id": "lunges", "name": "Walking Lunges", "category": "Lower Body", "difficulty": "Intermediate", "type": "reps", "target": 20, "icon": "directions_walk", "description": "Unilateral leg training.", "steps": ["Step forward", "Drop back knee", "Switch legs"]},
    {"id": "glute_bridge", "name": "Glute Bridges", "category": "Lower Body", "difficulty": "Beginner", "type": "reps", "target": 15, "icon": "airline_seat_flat", "description": "Isolating the glutes.", "steps": ["Lie on back", "Lift hips", "Squeeze"]},
    {"id": "calf_raises", "name": "Calf Raises", "category": "Lower Body", "difficulty": "Beginner", "type": "reps", "target": 25, "icon": "height", "description": "Lower leg definition.", "steps": ["Stand on toes", "Lower slowly"]},
    {"id": "side_lunges", "name": "Side Lunges", "category": "Lower Body", "difficulty": "Intermediate", "type": "reps", "target": 12, "description": "Lateral leg movement.", "steps": ["Step wide to side", "Keep one leg straight"]},

    # --- CORE ---
    {"id": "plank", "name": "Forearm Plank", "category": "Core", "difficulty": "Beginner", "type": "seconds", "target": 60, "icon": "timer", "description": "Static core stability.", "steps": ["Hold forearm position", "Keep back flat"]},
    {"id": "mountain_climbers", "name": "Mountain Climbers", "category": "Core", "difficulty": "Intermediate", "type": "seconds", "target": 40, "icon": "terrain", "description": "Rapid knee-to-chest movement.", "steps": ["High plank", "Run knees in"]},
    {"id": "russian_twists", "name": "Russian Twists", "category": "Core", "difficulty": "Intermediate", "type": "reps", "target": 30, "icon": "sync", "description": "Oblique rotational strength.", "steps": ["Sit with knees bent", "Twist torso side to side"]},
    {"id": "leg_raises", "name": "Leg Raises", "category": "Core", "difficulty": "Intermediate", "type": "reps", "target": 15, "icon": "vertical_align_top", "description": "Lower ab isolation.", "steps": ["Lie on back", "Lift legs to 90 degrees", "Lower slowly"]},
    {"id": "bicycle_crunches", "name": "Bicycle Crunches", "category": "Core", "difficulty": "Advanced", "type": "reps", "target": 20, "icon": "pedal_bike", "description": "Dynamic core rotation.", "steps": ["Opposite elbow to knee", "Keep legs moving"]},
    {"id": "plank_jacks", "name": "Plank Jacks", "category": "Core", "difficulty": "Intermediate", "type": "seconds", "target": 30, "icon": "unfold_more", "description": "Cardio-core hybrid.", "steps": ["Plank position", "Jump feet wide and in"]},

    # --- CARDIO ---
    {"id": "burpees", "name": "Standard Burpees", "category": "Cardio", "difficulty": "Advanced", "type": "reps", "target": 10, "icon": "rocket_launch", "description": "Full body explosive movement.", "steps": ["Squat", "Plank", "Jump"]},
    {"id": "jumping_jacks", "name": "Jumping Jacks", "category": "Cardio", "difficulty": "Beginner", "type": "reps", "target": 50, "icon": "celebration", "description": "Classic cardio warm-up.", "steps": ["Jump wide", "Hands up"]},
    {"id": "high_knees", "name": "High Knees", "category": "Cardio", "difficulty": "Intermediate", "type": "seconds", "target": 30, "icon": "directions_run", "description": "Running in place with lift.", "steps": ["Drive knees high", "Pump arms"]}
]

# ---------------------------------------------------------
# API ROUTES
# ---------------------------------------------------------

@app.route("/register", methods=["POST"])
def register():
    payload = request.get_json()
    db = get_db()

    email = payload.get("email", "").lower().strip()
    if not email:
        return jsonify({"error": "Email is required"}), 400
        
    pw_hash = generate_password_hash(payload["password"])
    
    try:
        db.execute("""
            INSERT INTO users (email, name, nickname, password_hash, sex, birthdate, height_in, weight_lb, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            email, 
            payload.get("name"), 
            payload.get("nickname"), 
            pw_hash, 
            payload.get("sex"), 
            payload.get("birthdate"), 
            payload.get("height_in"), 
            payload.get("weight_lb"), 
            datetime.now(timezone.utc).isoformat()
        ))
        db.commit()

        # 4. Get the user ID for the token
        user = db.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
        
        token = jwt.encode({
            'user_id': user['id'],
            'exp': datetime.now(timezone.utc) + timedelta(hours=24)
        }, "JWT_SECRET", algorithm="HS256")

        return jsonify({"message": "Account Created", "token": token}), 201

    except sqlite3.IntegrityError:
        return jsonify({"error": "User already exists"}), 400
    except Exception as e:
        print(f"ERROR: {e}")
        return jsonify({"error": str(e)}), 500
    
@app.route("/login", methods=["POST"])
def login():
    payload = request.get_json() or {}
    email = payload.get("email", "").lower()
    password = payload.get("password", "")

    db = get_db()
    # Find the user by email
    user = db.execute("SELECT id, password_hash FROM users WHERE email = ?", (email,)).fetchone()

    if user and check_password_hash(user["password_hash"], password):
        # Using now(timezone.utc) is more reliable than utcnow()
        token = jwt.encode(
            {
                "user_id": user["id"], 
                "exp": datetime.now(timezone.utc) + timedelta(hours=24),
                "iat": datetime.now(timezone.utc) # "Issued At" - ensures uniqueness
            }, 
            JWT_SECRET, 
            algorithm=JWT_ALGORITHM
        )
        return jsonify({
            "message": "Logged in successfully",
            "token": token
        }), 200

    return jsonify({"error": "Invalid email or password"}), 401

@app.route("/reset_password", methods=["POST"])
def reset_password():
    data = request.get_json()
    email = data.get("email")
    new_pw = data.get("new_password")

    if not email or not new_pw:
        return jsonify({"error": "Email and new password are required"}), 400

    db = get_db()
    
    # Check if the user actually exists first
    user = db.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
    if not user:
        return jsonify({"error": "No account found with that email"}), 404

    # Update using the EMAIL, not the ID
    db.execute("UPDATE users SET password_hash = ? WHERE email = ?", 
               (generate_password_hash(new_pw), email))
    db.commit()
    
    return jsonify({"message": "Password updated successfully"}), 200

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

@app.route("/me/full_profile", methods=["GET"])
def get_full_profile():
    db = get_db()
    # 1. Fetch User Info (including the new bio field)
    user = db.execute("SELECT name, email, nickname, sex, birthdate, height_in, weight_lb, bio FROM users WHERE id = ?", (request.user_id,)).fetchone()
    
    # 2. Fetch Total Calories
    total_cal = db.execute("SELECT SUM(calories_burned) as total FROM completed_workouts WHERE user_id = ?", (request.user_id,)).fetchone()
    
    # 3. Fetch Last 5 Workouts
    history = db.execute("SELECT exercise_name, completed_at FROM completed_workouts WHERE user_id = ? ORDER BY completed_at DESC LIMIT 5", (request.user_id,)).fetchall()

    if user:
        res = dict(user)
        res["total_calories"] = total_cal["total"] or 0
        res["history"] = [dict(row) for row in history]
        return jsonify(res)
    return jsonify({"error": "User not found"}), 404

@app.route("/update_bio", methods=["POST"])
def update_bio():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"error": "Unauthorized"}), 401
    
    # Get the bio from the React request
    data = request.get_json()
    new_bio = data.get("bio")
    
    try:
        # Decode token to get user_id (using our bypass from earlier)
        token = auth_header.split(" ")[1]
        decoded = jwt.decode(token, options={"verify_signature": False})
        user_id = decoded.get("user_id")

        # Update the database
        db = get_db()
        db.execute("UPDATE users SET bio = ? WHERE id = ?", (new_bio, user_id))
        db.commit()

        # Return the updated user record
        user = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        return jsonify(dict(user)), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/workouts/complete", methods=["POST"])
def complete_workout():
    payload = request.get_json()
    db = get_db()
    db.execute("""INSERT INTO completed_workouts (user_id, exercise_name, calories_burned, completed_at) 
                 VALUES (?, ?, ?, ?)""",
               (request.user_id, payload["exercise_name"], payload["calories_burned"], datetime.utcnow().isoformat()))
    db.commit()
    return jsonify({"message": "Workout saved!"})

@app.route('/profile', methods=['GET'])
@app.route('/me', methods=['GET'])
def get_profile():
    auth_header = request.headers.get('Authorization')
    token = auth_header.split(" ")[1] if auth_header else None
    
    if not token:
        return jsonify({"error": "Missing token"}), 401

    try:
        # Using the bypass we discussed
        decoded = jwt.decode(token, options={"verify_signature": False})
        user_id = decoded.get('user_id')

        db = get_db()
        user_row = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()

        if user_row:
            user_data = dict(user_row)
            user_data.pop('password_hash', None)
            return jsonify(user_data), 200
        else:
            return jsonify({"error": "User not found in database"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 401
    
@app.route("/dashboard", methods=["GET"])
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
#--------------------------------------------------------------------------------
# Temporary storage for active sessions
active_sessions = {}

def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def session_dir(session_id: str) -> Path:
    path = POSE_DATA_DIR / session_id
    path.mkdir(parents=True, exist_ok=True)
    return path

@app.route('/api/session/start', methods=['POST'])
def start_session():
    data = request.json or {}
    exercise_id = data.get('exerciseId')
    
    # Generate a unique ID for this specific workout
    session_id = str(uuid.uuid4())
    
    active_sessions[session_id] = {
        'exercise_id': exercise_id,
        'start_time': utc_now_iso(), #actual start time of the session in ISO format
        'status': 'active'
    }
    
    return jsonify({'sessionId': session_id, 'status': 'success'})

@app.route('/api/pose/session/start', methods=['POST'])
def start_pose_session():
    data = request.json or {}
    session_id = str(uuid.uuid4())
    record = {
        'sessionId': session_id,
        'exerciseId': data.get('exerciseId'),
        'exerciseName': data.get('exerciseName'),
        'cameraLabel': data.get('cameraLabel'),
        'deviceId': data.get('deviceId'),
        'facingMode': data.get('facingMode'),
        'startedAt': utc_now_iso(),
        'status': 'active',
        'framesReceived': 0,
    }

    active_sessions[session_id] = record
    directory = session_dir(session_id)
    (directory / 'metadata.json').write_text(json.dumps(record, indent=2))
    (directory / 'landmarks.json').touch(exist_ok=True)  # Create an empty file for landmarks

    return jsonify({'sessionId': session_id, 'status': 'started'})

@app.route('/api/pose/session/<session_id>/landmarks', methods=['POST'])
def append_landmarks(session_id):
    session = active_sessions.get(session_id)
    if not session:
        return jsonify({'error': 'Session not found'}), 404
    
    data = request.json or {}
    frames = data.get('frames', [])
    directory = session_dir(session_id)
    jsonl_path = directory / 'landmarks.jsonl'

    with jsonl_path.open('a', encoding='utf-8') as output:
        for frame in frames:
            output.write(json.dumps(frame) + '\n')
    
    session['framesReceived'] = session.get('framesReceived', 0) + len(frames)
    metadata_path = directory / 'metadata.json'
    metadata_path.write_text(json.dumps(session, indent=2))

    return jsonify({'status': 'saved', 'framesSaved': len(frames), 'totalFrames': session['framesReceived']})

@app.route('/api/pose/session/<session_id>/stop', methods=['POST'])
def stop_pose_session(session_id):
    session = active_sessions.get(session_id)
    if not session:
        return jsonify({'error': 'Session not found'}), 404
    
    data = request.json or {}
    session['status'] = 'completed'
    session['endedAt'] = utc_now_iso()
    session['savedFramesClient'] = data.get('savedFrames', 0)
    session['repCount'] = data.get('repCount', 0)

    directory = session_dir(session_id)
    (directory / 'metadata.json').write_text(json.dumps(session, indent=2))
    return jsonify({'status': 'completed', 'sessionId': session_id})

@app.route('/api/pose/sessions', methods=['GET'])
def get_pose_sessions():
    sessions = []
    for entry in sorted(POSE_DATA_DIR.iterdir(), reverse=True):
        metadata = entry / 'metadata.json'
        if metadata.exists():
            sessions.append(json.loads(metadata.read_text(encoding='utf-8')))
    return jsonify(sessions)

@app.route('/api/exercises', methods=['GET'])
def get_exercises():
    #Returns the full list of exercises for the library UI.
    return jsonify(EXERCISES)

@app.route('/api/exercises/filter', methods=['GET'])
def filter_exercises():
    #Allows filtering by category or difficulty via URL parameters.
    category = request.args.get('category')
    difficulty = request.args.get('difficulty')
    
    results = EXERCISES
    if category:
        results = [e for e in results if e['category'] == category]
    if difficulty:
        results = [e for e in results if e['difficulty'] == difficulty]
        
    return jsonify(results)


@app.route("/api/health", methods=["GET"])
def health_check():
    #Simple route to verify the backend is running.
    return jsonify({'status': 'online', 'version': '3.0.0'})

if __name__ == "__main__":
    init_db()
if __name__ == '__main__':
    # Standard port 5000 is used so Vite proxy works correctly.
    app.run(debug=True, port=5000)