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
    # UPPER BODY
    {
        "id": "pushups", 
        "name": "Push-ups", 
        "category": "Upper Body", 
        "difficulty": "Beginner", 
        "type": "reps",
        "target": 12,
        "description": "Standard chest press movement.",
        "steps": ["Plank position", "Lower chest", "Push up"]
    },
    {
        "id": "diamond_pushups", 
        "name": "Diamond Push-ups", 
        "category": "Upper Body", 
        "difficulty": "Advanced", 
        "type": "reps",
        "target": 10,
        "description": "Close-grip push-ups for triceps.",
        "steps": ["Hands in diamond shape", "Lower chest to hands", "Push up"]
    },
    {
        "id": "pike_pushups", 
        "name": "Pike Push-ups", 
        "category": "Upper Body", 
        "difficulty": "Intermediate", 
        "type": "reps",
        "target": 8,
        "description": "Shoulder-focused push-up.",
        "steps": ["V-shape position", "Lower head toward floor", "Push up"]
    },
    
    # LOWER BODY
    {
        "id": "squats", 
        "name": "Bodyweight Squats", 
        "category": "Lower Body", 
        "difficulty": "Beginner", 
        "type": "reps",
        "target": 15,
        "description": "Essential leg movement.",
        "steps": ["Feet shoulder-width", "Lower hips", "Drive up"]
    },
    {
        "id": "lunges", 
        "name": "Walking Lunges", 
        "category": "Lower Body", 
        "difficulty": "Beginner", 
        "type": "reps",
        "target": 20,
        "description": "Unilateral leg training.",
        "steps": ["Step forward", "Drop back knee", "Push off front foot"]
    },
    {
        "id": "jump_squats", 
        "name": "Jump Squats", 
        "category": "Lower Body", 
        "difficulty": "Advanced", 
        "type": "reps",
        "target": 12,
        "description": "Explosive leg power.",
        "steps": ["Squat down", "Explode upward", "Land softly"]
    },

    # CORE / CARDIO
    {
        "id": "plank", 
        "name": "Forearm Plank", 
        "category": "Core", 
        "difficulty": "Beginner", 
        "type": "time",
        "target": 45,
        "description": "Static core stability.",
        "steps": ["Forearms on floor", "Hold straight line"]
    },
    {
        "id": "mountain_climbers", 
        "name": "Mountain Climbers", 
        "category": "Core", 
        "difficulty": "Intermediate", 
        "type": "time",
        "target": 40,
        "description": "Rapid knee-to-chest movement.",
        "steps": ["Plank position", "Drive knees to chest", "Switch rapidly"]
    },
    {
        "id": "burpees", 
        "name": "Burpees", 
        "category": "Cardio", 
        "difficulty": "Advanced", 
        "type": "reps",
        "target": 10,
        "description": "Full body explosive movement.",
        "steps": ["Drop to plank", "Push up", "Jump to feet", "Jump up"]
    }
]

# ---------------------------------------------------------
# API ROUTES
# ---------------------------------------------------------

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

@app.route("/api/session/start", methods=["POST"])
def start_session():
    """
    Receives a list of selected exercises from the React frontend.
    Returns a unique Session ID to track the workout history.
    """
    data = request.get_json()
    if not data or 'exercises' not in data:
        return jsonify({"error": "No exercises selected"}), 400
    
    session_id = str(uuid.uuid4())
    # Note: In the future, this is where you'd save to a database for Vladimir's history.
    return jsonify({
        "session_id": session_id,
        "status": "Workout initialized",
        "exercise_count": len(data['exercises'])
    })

@app.route("/api/health", methods=["GET"])
def health_check():
    """Simple route to verify the backend is running."""
    return jsonify({"status": "online", "version": "2.0.0"})

if __name__ == "__main__":
    # Standard port 5000 is used so Vite proxy works correctly.
    app.run(debug=True, port=5000)
