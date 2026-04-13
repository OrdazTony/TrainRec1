export const POSE_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 7],
  [0, 4], [4, 5], [5, 6], [6, 8],
  [9, 10],
  [11, 12],
  [11, 13], [13, 15],
  [12, 14], [14, 16],
  [15, 17], [15, 19], [15, 21],
  [16, 18], [16, 20], [16, 22],
  [11, 23], [12, 24], [23, 24],
  [23, 25], [25, 27], [27, 29], [29, 31],
  [24, 26], [26, 28], [28, 30], [30, 32],
];

export function calculateAngle(a, b, c) {
  if (!a || !b || !c) return null;

  const ba = { x: a.x - b.x, y: a.y - b.y };
  const bc = { x: c.x - b.x, y: c.y - b.y };
  const dot = ba.x * bc.x + ba.y * bc.y;
  const magBA = Math.hypot(ba.x, ba.y);
  const magBC = Math.hypot(bc.x, bc.y);

  if (!magBA || !magBC) return null;

  const cosine = Math.min(1, Math.max(-1, dot / (magBA * magBC)));
  return Math.round((Math.acos(cosine) * 180) / Math.PI);
}

export function getExerciseKey(exerciseId = '') {
  const id = exerciseId.toLowerCase();
  if (id.includes('squat')) return 'squat';
  if (id.includes('press')) return 'shoulder_press';
  if (id.includes('curl')) return 'bicep_curl';
  return 'generic';
}

export function analyzeExercise(exerciseId, landmarks, previousState) {
  const key = getExerciseKey(exerciseId);
  const state = {
    count: previousState?.count ?? 0,
    phase: previousState?.phase ?? 'down',
    angle: null,
    feedback: 'Pose detected',
  };

  if (!Array.isArray(landmarks) || landmarks.length < 33) {
    return { ...state, feedback: 'No pose detected' };
  }

  const point = (index) => landmarks[index];

  if (key === 'bicep_curl') {
    const angle = calculateAngle(point(12), point(14), point(16));
    state.angle = angle;
    if (angle == null) return { ...state, feedback: 'Move into frame' };
    if (angle > 160) state.phase = 'down';
    else if (angle < 45 && state.phase === 'down') {
      state.phase = 'up';
      state.count += 1;
    }
    state.feedback = angle < 45 ? 'Top of curl reached' : angle > 160 ? 'Arm extended' : 'Keep elbow stable';
    return state;
  }

  if (key === 'squat') {
    const angle = calculateAngle(point(24), point(26), point(28));
    state.angle = angle;
    if (angle == null) return { ...state, feedback: 'Move into frame' };
    if (angle > 160) state.phase = 'up';
    else if (angle < 95 && state.phase === 'up') {
      state.phase = 'down';
      state.count += 1;
    }
    state.feedback = angle < 95 ? 'Good squat depth' : angle > 160 ? 'Stand tall' : 'Lower with control';
    return state;
  }

  if (key === 'shoulder_press') {
    const angle = calculateAngle(point(12), point(14), point(16));
    state.angle = angle;
    if (angle == null) return { ...state, feedback: 'Move into frame' };
    if (angle < 80) state.phase = 'down';
    else if (angle > 160 && state.phase === 'down') {
      state.phase = 'up';
      state.count += 1;
    }
    state.feedback = angle > 160 ? 'Lockout reached' : angle < 80 ? 'Ready to press' : 'Drive upward';
    return state;
  }

  state.feedback = 'Tracking pose landmarks';
  return state;
}

export function normalizeLandmarks(landmarks = []) {
  return landmarks.map((landmark, index) => ({
    index,
    x: Number(landmark.x.toFixed(6)),
    y: Number(landmark.y.toFixed(6)),
    z: Number((landmark.z ?? 0).toFixed(6)),
    visibility: Number(((landmark.visibility ?? 0)).toFixed(6)),
  }));
}

export function drawPose(ctx, width, height, landmarks = []) {
  if (!ctx || !landmarks.length) return;

  ctx.clearRect(0, 0, width, height);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#4fc3f7';
  ctx.fillStyle = '#ffb74d';

  for (const [start, end] of POSE_CONNECTIONS) {
    const a = landmarks[start];
    const b = landmarks[end];
    if (!a || !b) continue;

    ctx.beginPath();
    ctx.moveTo(a.x * width, a.y * height);
    ctx.lineTo(b.x * width, b.y * height);
    ctx.stroke();
  }

  for (const point of landmarks) {
    ctx.beginPath();
    ctx.arc(point.x * width, point.y * height, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}
