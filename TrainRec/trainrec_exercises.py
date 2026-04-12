from flask import Flask, jsonify, request
from flask_cors import CORS
import json # Used for saving and loading session metadata and landmarks in JSON format.
import os # Used for file system operations like creating directories and saving files.
import uuid
from datetime import datetime, timezone #Used for timestamping session start and end times in a standardized format.
from pathlib import Path # Used for easier path manipulations and ensuring cross-platform compatibility when saving session data.

app = Flask(__name__)

# This allows your team's React app (port 5173) to access this API (port 5000)
CORS(app)

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

if __name__ == '__main__':
    # Standard port 5000 is used so Vite proxy works correctly.
    app.run(debug=True, port=5000)