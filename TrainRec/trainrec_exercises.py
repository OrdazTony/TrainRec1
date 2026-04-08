from flask import Flask, jsonify, request
from flask_cors import CORS
import uuid

app = Flask(__name__)

# This allows your team's React app (port 5173) to access this API (port 5000)
CORS(app)

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
# Temporary storage for active sessions
active_sessions = {}

@app.route("/api/session/start", methods=["POST"])
def start_session():
    data = request.json
    exercise_id = data.get("exerciseId")
    
    # Generate a unique ID for this specific workout
    session_id = str(uuid.uuid4())
    
    active_sessions[session_id] = {
        "exercise_id": exercise_id,
        "start_time": uuid.uuid1().time, # A simple way to get a timestamp
        "status": "active"
    }
    
    print(f"Started session {session_id} for {exercise_id}")
    return jsonify({"sessionId": session_id, "status": "success"})

@app.route("/api/exercises", methods=["GET"])
def get_exercises():
    """Returns the full list of exercises for the library UI."""
    return jsonify(EXERCISES)

@app.route("/api/exercises/filter", methods=["GET"])
def filter_exercises():
    """Allows filtering by category or difficulty via URL parameters."""
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
    """Simple route to verify the backend is running."""
    return jsonify({"status": "online", "version": "2.0.0"})

if __name__ == "__main__":
    # Standard port 5000 is used so Vite proxy works correctly.
    app.run(debug=True, port=5000)