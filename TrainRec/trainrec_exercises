from flask import Flask, render_template_string, request, jsonify
import uuid

app = Flask(__name__)

# -------------------------
# EXERCISE LIBRARY
# -------------------------
EXERCISES = [
    # UPPER BODY
    {"id": "pushups", "name": "Push-ups", "type": "reps", "category": "Upper Body", "difficulty": "Beginner",
     "default_reps": 12, "description": "Standard chest press movement.",
     "steps": ["Plank position", "Lower chest", "Push up"]},
    {"id": "diamond_pushups", "name": "Diamond Push-ups", "type": "reps", "category": "Upper Body",
     "difficulty": "Advanced", "default_reps": 10, "description": "Close-grip push-ups for triceps.",
     "steps": ["Hands in diamond shape", "Lower chest to hands", "Push up"]},
    {"id": "pike_pushups", "name": "Pike Push-ups", "type": "reps", "category": "Upper Body",
     "difficulty": "Intermediate", "default_reps": 8, "description": "Shoulder-focused push-up.",
     "steps": ["V-shape position", "Lower head toward floor", "Push up"]},

    # LOWER BODY
    {"id": "squats", "name": "Bodyweight Squats", "type": "reps", "category": "Lower Body", "difficulty": "Beginner",
     "default_reps": 15, "description": "Essential leg movement.",
     "steps": ["Feet shoulder-width", "Lower hips", "Drive up"]},
    {"id": "lunges", "name": "Walking Lunges", "type": "reps", "category": "Lower Body", "difficulty": "Beginner",
     "default_reps": 20, "description": "Unilateral leg training.",
     "steps": ["Step forward", "Drop back knee", "Push off front foot"]},
    {"id": "jump_squats", "name": "Jump Squats", "type": "reps", "category": "Lower Body", "difficulty": "Advanced",
     "default_reps": 12, "description": "Explosive leg power.",
     "steps": ["Squat down", "Explode upward", "Land softly"]},
    {"id": "bulgarian_split", "name": "Bulgarian Split Squat", "type": "reps", "category": "Lower Body",
     "difficulty": "Intermediate", "default_reps": 10, "description": "Elevated rear foot squat.",
     "steps": ["Back foot on bench", "Squat on front leg", "Keep torso upright"]},

    # CORE / CARDIO
    {"id": "plank", "name": "Forearm Plank", "type": "time", "category": "Core", "difficulty": "Beginner",
     "default_seconds": 45, "description": "Static core stability.",
     "steps": ["Forearms on floor", "Tighten glutes/abs", "Hold straight line"]},
    {"id": "mountain_climbers", "name": "Mountain Climbers", "type": "time", "category": "Core",
     "difficulty": "Intermediate", "default_seconds": 40, "description": "Rapid knee-to-chest movement.",
     "steps": ["Plank position", "Drive knees to chest", "Switch rapidly"]},
    {"id": "burpees", "name": "Burpees", "type": "reps", "category": "Cardio", "difficulty": "Advanced",
     "default_reps": 10, "description": "Full body explosive movement.",
     "steps": ["Drop to plank", "Push up", "Jump to feet", "Jump up"]},
    {"id": "jumping_jacks", "name": "Jumping Jacks", "type": "time", "category": "Cardio", "difficulty": "Beginner",
     "default_seconds": 60, "description": "Classic cardio warm-up.",
     "steps": ["Jump feet out", "Hands overhead", "Return to start"]}
]

# -------------------------
# MODERN CSS & HTML
# -------------------------

COMMON_STYLES = """
<style>
    :root { --primary: #00d2ff; --secondary: #3a7bd5; --dark: #121212; --card: #1e1e1e; --text: #e0e0e0; }
    body { font-family: 'Segoe UI', Tahoma, sans-serif; background: var(--dark); color: var(--text); margin: 0; padding-bottom: 100px; }
    .container { max-width: 800px; margin: auto; padding: 20px; }
    h1 { color: white; text-align: center; font-weight: 800; letter-spacing: -1px; }

    .filter-bar { display: flex; gap: 10px; overflow-x: auto; padding: 10px 0; margin-bottom: 20px; }
    .filter-btn { background: #333; border: none; color: white; padding: 8px 16px; border-radius: 20px; cursor: pointer; white-space: nowrap; transition: 0.3s; }
    .filter-btn:hover, .filter-btn.active { background: var(--primary); }

    .exercise-card { background: var(--card); border-radius: 15px; padding: 20px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #333; transition: transform 0.2s; }
    .exercise-card:hover { transform: translateY(-3px); border-color: var(--primary); }
    .tag { font-size: 0.65rem; text-transform: uppercase; font-weight: bold; padding: 4px 10px; border-radius: 5px; margin-right: 5px; }
    .Beginner { background: #2ecc71; color: white; }
    .Intermediate { background: #f1c40f; color: black; }
    .Advanced { background: #e74c3c; color: white; }

    .btn-add { background: var(--primary); border: none; color: white; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; }

    #tray { position: fixed; bottom: 0; width: 100%; background: rgba(30, 30, 30, 0.95); backdrop-filter: blur(10px); padding: 20px; border-top: 1px solid #444; display: none; box-sizing: border-box; z-index: 100; }
    .tray-content { max-width: 800px; margin: auto; display: flex; justify-content: space-between; align-items: center; }
    .start-btn { background: linear-gradient(to right, var(--primary), var(--secondary)); border: none; color: white; padding: 12px 30px; border-radius: 10px; font-size: 1.1rem; font-weight: bold; cursor: pointer; }
</style>
"""

INDEX_HTML = """
<!doctype html>
<html>
<head>
    <title>TrainRec | Library</title>
""" + COMMON_STYLES + """
</head>
<body>
    <div class="container">
        <h1>TrainRec <span style="color:var(--primary)">Library</span></h1>

        <div class="filter-bar">
            <button class="filter-btn active" onclick="filter_cat('All', this)">All</button>
            <button class="filter-btn" onclick="filter_cat('Upper Body', this)">Upper Body</button>
            <button class="filter-btn" onclick="filter_cat('Lower Body', this)">Lower Body</button>
            <button class="filter-btn" onclick="filter_cat('Core', this)">Core</button>
            <button class="filter-btn" onclick="filter_cat('Cardio', this)">Cardio</button>
        </div>

        <div id="list">
            {% for ex in exercises %}
            <div class="exercise-card" data-cat="{{ ex.category }}">
                <div>
                    <span class="tag {{ ex.difficulty }}">{{ ex.difficulty }}</span>
                    <span style="color: #888; font-size: 0.8rem;">{{ ex.category }}</span>
                    <h3 style="margin: 5px 0 10px 0;">{{ ex.name }}</h3>
                    <p style="font-size: 0.9rem; color: #aaa; margin: 0;">{{ ex.description }}</p>
                </div>
                <button class="btn-add" onclick="add_to_workout('{{ ex.id }}')">Add</button>
            </div>
            {% endfor %}
        </div>
    </div>

    <div id="tray">
        <div class="tray-content">
            <div>
                <strong id="count">0</strong> Exercises Selected
            </div>
            <button class="start-btn" onclick="start_workout()">START WORKOUT</button>
        </div>
    </div>

<script>
    const all_exercises = {{ exercises|tojson }};
    let current_session = [];

    function filter_cat(cat, btn) {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.exercise-card').forEach(c => {
            c.style.display = (cat === 'All' || c.dataset.cat === cat) ? 'flex' : 'none';
        });
    }

    function add_to_workout(id) {
        const found = all_exercises.find(x => x.id === id);
        current_session.push(found);
        document.getElementById('tray').style.display = 'block';
        document.getElementById('count').innerText = current_session.length;
    }

    function start_workout() {
        fetch("/session/start", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "My Workout", exercises: current_session })
        })
        .then(r => r.json())
        .then(d => window.location = "/session/run/" + d.session_id);
    }
</script>
</body>
</html>
"""

SESSION_HTML = """
<!doctype html>
<html>
<head>
    <title>Session Active</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; background: #000; color: white; margin: 0; text-align: center; overflow: hidden; }
        .main { height: 100vh; display: flex; flex-direction: column; }
        .camera-area { flex-grow: 1; background: #111; display: flex; align-items: center; justify-content: center; position: relative; }
        .overlay-label { position: absolute; top: 20px; left: 20px; background: rgba(255, 71, 87, 0.8); padding: 5px 15px; border-radius: 5px; font-weight: bold; font-size: 0.8rem; }
        .ui-panel { height: 260px; background: #1e1e1e; border-top-left-radius: 30px; border-top-right-radius: 30px; padding: 30px; box-sizing: border-box; border-top: 2px solid #333; }
        .timer { font-size: 5rem; font-weight: 900; color: #00d2ff; line-height: 1; margin: 10px 0; }
        .rest-mode { color: #2ecc71 !important; }
        .controls { margin-top: 15px; }
        button { background: #444; border: none; color: white; padding: 8px 20px; border-radius: 5px; cursor: pointer; }
    </style>
</head>
<body>
    <div class="main">
        <div class="camera-area">
            <div class="overlay-label" id="status">LIVE FEED</div>
            <div style="color: #333; font-size: 1.2rem;">[ OPENCV POSENET VIEWPORT ]</div>
        </div>
        <div class="ui-panel">
            <div id="exercise-name" style="font-size: 1.4rem; opacity: 0.7; font-weight: bold;">Get Ready</div>
            <div id="display-value" class="timer">--</div>
            <div id="next-up" style="color: #666; font-size: 0.9rem;">Next Up: ...</div>
            <div class="controls">
                <button onclick="window.location='/'">Quit Workout</button>
            </div>
        </div>
    </div>

<script>
    const session_data = {{ session|tojson }};
    let current_index = 0;
    let rest_state = false;
    let timer_id;

    function refresh_ui() {
        clearInterval(timer_id);

        if (current_index >= session_data.exercises.length) {
            alert("Workout Complete! Great job.");
            window.location = "/";
            return;
        }

        const current_ex = session_data.exercises[current_index];
        const name_label = document.getElementById("exercise-name");
        const val_label = document.getElementById("display-value");
        const next_label = document.getElementById("next-up");

        if (rest_state) {
            name_label.innerText = "REST";
            val_label.classList.add("rest-mode");
            next_label.innerText = "Get ready for: " + current_ex.name;
            run_countdown(10, () => {
                rest_state = false;
                refresh_ui();
            });
        } else {
            name_label.innerText = current_ex.name;
            val_label.classList.remove("rest-mode");
            next_label.innerText = "Next: " + (session_data.exercises[current_index+1]?.name || "Finish");

            if (current_ex.type === "reps") {
                val_label.innerText = current_ex.default_reps + " REPS";
                // Simulation of pose detection finishing a set
                timer_id = setTimeout(complete_step, 5000); 
            } else {
                run_countdown(current_ex.default_seconds || 30, complete_step);
            }
        }
    }

    function run_countdown(seconds, callback) {
        let remaining = seconds;
        document.getElementById("display-value").innerText = remaining + "s";
        timer_id = setInterval(() => {
            remaining--;
            document.getElementById("display-value").innerText = remaining + "s";
            if (remaining <= 0) { 
                clearInterval(timer_id); 
                callback(); 
            }
        }, 1000);
    }

    function complete_step() {
        if (!rest_state) {
            rest_state = true;
            current_index++;
        }
        refresh_ui();
    }

    // Start the engine
    refresh_ui();
</script>
</body>
</html>
"""

SESSIONS = {}


# -------------------------
# FLASK ROUTES
# -------------------------

@app.route("/")
def home():
    return render_template_string(INDEX_HTML, exercises=EXERCISES)


@app.route("/session/start", methods=["POST"])
def start_session():
    data = request.get_json()
    sid = str(uuid.uuid4())
    SESSIONS[sid] = data
    return jsonify({"session_id": sid})


@app.route("/session/run/<sid>")
def run_session(sid):
    return render_template_string(SESSION_HTML, session=SESSIONS[sid])


if __name__ == "__main__":
    app.run(debug=True)
