import React, { useEffect, useMemo, useRef, useState } from 'react';
import{
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Typography
} from '@mui/material';
import CameraswitchIcon from '@mui/icons-material/Cameraswitch';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import VideocamIcon from '@mui/icons-material/Videocam';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import { analyzeExercise, drawPose, normalizeLandmarks } from "../util/poseMath";

const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task';

// kcal burned per kg of bodyweight per hour — sourced from Kaggle exercise_dataset.csv
const CALORIE_RATES = {
  pushups:          1.647825, // Calisthenics, vigorous
  diamond_pushups:  1.647825,
  pike_pushups:     1.647825,
  tricep_dips:      1.234853, // Weight lifting, vigorous
  bicep_curls:      1.234853,
  supermans:        0.721008, // Calisthenics, light
  inchworms:        0.721008,
  squats:           1.647825, // Calisthenics, vigorous
  jump_squats:      1.441339, // Aerobics, high impact
  lunges:           1.647825,
  side_lunges:      1.647825,
  glute_bridge:     0.721008,
  calf_raises:      0.721008,
  plank:            0.721008, // Calisthenics, light (timed)
  mountain_climbers:1.441339, // Aerobics, high impact (timed)
  high_knees:       1.647825, // Running, 5 mph (timed)
  russian_twists:   1.647825,
  leg_raises:       1.647825,
  bicycle_crunches: 1.647825,
  plank_jacks:      1.441339, // Aerobics, high impact (timed)
  burpees:          1.647825, // Circuit training
  jumping_jacks:    1.029722, // Aerobics, low impact
  shoulder_press:   1.234853, // Weight lifting, vigorous
};

// Average seconds per rep for rep-based exercises
const REP_DURATION_SEC = {
  pushups:          3,
  diamond_pushups:  3,
  pike_pushups:     3,
  tricep_dips:      3,
  bicep_curls:      2,
  supermans:        3,
  inchworms:        4,
  squats:           3,
  jump_squats:      2,
  lunges:           2,
  side_lunges:      2,
  glute_bridge:     3,
  calf_raises:      2,
  russian_twists:   1.5,
  leg_raises:       3,
  bicycle_crunches: 1.5,
  burpees:          4,
  jumping_jacks:    1,
  shoulder_press:   3,
};

const DEFAULT_WEIGHT_KG = 70;

/** Save a completed session's calories to localStorage (daily accumulator) */
function saveSessionCalories(exerciseId, exerciseName, calories, repsOrSeconds, isTimedEx) {
  const today = new Date().toISOString().slice(0, 10);
  let log = JSON.parse(localStorage.getItem('trainrec_daily_log') || 'null');
  if (!log || log.date !== today) {
    log = { date: today, totalCalories: 0, sessions: [] };
  }
  log.totalCalories = +(log.totalCalories + calories).toFixed(1);
  log.sessions.push({
    exercise: exerciseId,
    name: exerciseName,
    calories: +calories.toFixed(1),
    [isTimedEx ? 'seconds' : 'reps']: repsOrSeconds,
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem('trainrec_daily_log', JSON.stringify(log));
}


const EXERCISE_VIDEOS = {
  bicep_curls:    '/exercise-videos/bicep_curls.mp4',
  pushups:        '/exercise-videos/pushups.mp4',
  diamond_pushups:'/exercise-videos/diamond_pushups.mp4',
  pike_pushups:   '/exercise-videos/pike_pushups.mp4',
  tricep_dips:    '/exercise-videos/tricep_dips.mp4',
  squats:         '/exercise-videos/squats.mp4',
  jump_squats:    '/exercise-videos/jump_squats.mp4',
  glute_bridge:   '/exercise-videos/glute_bridge.mp4',
  plank:          '/exercise-videos/plank.mp4',
  plank_jacks:    '/exercise-videos/plank_jacks.mp4',
  russian_twists: '/exercise-videos/russian_twists.mp4',
  leg_raises:     '/exercise-videos/leg_raises.mp4',
  shoulder_press: '/exercise-videos/shoulder_press.mp4',
};

const PoseTrainer = ({ exercise, onQuit }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const streamRef = useRef(null);
  const poseLandmarkerRef = useRef(null);
  const sessionIdRef = useRef(null);
  const frameBatchRef = useRef([]);
  const lastVideoTimeRef = useRef(-1);
  const startedRef = useRef(false);

  const [permissionStarted, setPermissionStarted] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [error, setError] = useState('');
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [preferredFacingMode, setPreferredFacingMode] = useState('user');
  const [analysis, setAnalysis] = useState({
    count: 0,
    phase: 'down',
    angle: null,
    feedback: 'Camera not started',
  });
  const analysisRef = useRef({
    count: 0,
    phase: 'down',
    angle: null,
    feedback: 'Camera not started',
    formGood: false,
  });
  const formGoodRef = useRef(false);
  const [recording, setRecording] = useState(true);
  const [savedFrames, setSavedFrames] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef(null);

  const isTimed = exercise?.type === 'seconds';
  const exerciseKey = useMemo(() => exercise?.id ?? 'generic', [exercise]);

  const calorieRate = CALORIE_RATES[exercise?.id] ?? 1.234853;
  const repDuration = REP_DURATION_SEC[exercise?.id] ?? 3;

  // Live calorie estimate — recalculates whenever reps or timed seconds change
  const totalCalories = useMemo(() => {
    const kcalPerSec = (calorieRate * DEFAULT_WEIGHT_KG) / 3600;
    if (isTimed) {
      return +(kcalPerSec * elapsedSeconds).toFixed(1);
    }
    return +(kcalPerSec * repDuration * analysis.count).toFixed(1);
  }, [isTimed, elapsedSeconds, analysis.count, calorieRate, repDuration]);

  const flushFrames = async (force = false) => {
    if (!sessionIdRef.current || !recording) return;
    if (frameBatchRef.current.length < 15 && !force) return;

    const payload = {
      frames: frameBatchRef.current,
      exerciseId: exercise?.id,
      exerciseName: exercise?.name,
    };

    const framesSent = frameBatchRef.current.length;
    frameBatchRef.current = [];

    try {
      await fetch(`/api/pose/session/${sessionIdRef.current}/landmarks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setSavedFrames((prev) => prev + framesSent);
    } catch (saveError) {
        console.error('Failed to save landmarks', saveError);
    }
};

const stopCamera = async () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = null;

    await flushFrames(true);

    if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
    }

    if(sessionIdRef.current) {
        try {
            await fetch(`/api/pose/session/${sessionIdRef.current}/stop`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ savedFrames, repCount: analysis.count }),
            });
        } catch (stopError) {
            console.error('Failed to stop session', stopError);
        }
    }

    sessionIdRef.current = null;
    setIsCameraOn(false);
    setElapsedSeconds(0);
};

const enumerateVideoDevices = async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    const allDevices = await navigator.mediaDevices.enumerateDevices();
    const videoInputs = allDevices.filter((device) => device.kind === 'videoinput');
    setDevices(videoInputs);

    if (!selectedDeviceId && videoInputs.length > 0) {
        setSelectedDeviceId(videoInputs[0].deviceId);
    }
};

const runDetection = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const poseLandmarker = poseLandmarkerRef.current;

    if (!video || !canvas || !poseLandmarker) return;

    const ctx = canvas.getContext('2d');

    const loop = async () => {
        if (!videoRef.current || video.readyState < 2 || !poseLandmarkerRef.current) {
            animationRef.current = requestAnimationFrame(loop);
            return;
        }

        const currentTime = performance.now();
        if (lastVideoTimeRef.current !== video.currentTime) {
            lastVideoTimeRef.current = video.currentTime;
            const result = poseLandmarker.detectForVideo(video, currentTime);
            const landmarks = result.landmarks?.[0] ?? [];

            canvas.width = video.videoWidth || 960;
            canvas.height = video.videoHeight || 540;
            drawPose(ctx, canvas.width, canvas.height, landmarks);

            const nextAnalysis = analyzeExercise(exerciseKey, landmarks, analysisRef.current);
            analysisRef.current = nextAnalysis;
            formGoodRef.current = nextAnalysis.formGood ?? false;
            setAnalysis(nextAnalysis);

            if(landmarks.length && recording && sessionIdRef.current) {
                frameBatchRef.current.push({
                    ts: new Date().toISOString(),
                    elapsedSec: Number(video.currentTime.toFixed(3)),
                    repCount: nextAnalysis.count,
                    phase: nextAnalysis.phase,
                    angle: nextAnalysis.angle,
                    landmarks: normalizeLandmarks(landmarks),
                });
            }

            flushFrames(false);
        }

        animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);
};

const ensurePoseLandmarker = async () => {
    if (poseLandmarkerRef.current) return poseLandmarkerRef.current;
    const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );
    poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_URL },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.6,
        minPosePresenceConfidence: 0.6,
        minTrackingConfidence: 0.6,
    });
    return poseLandmarkerRef.current;
};

const startCamera = async (
    overrideDeviceId = selectedDeviceId,
    overrideFacingMode = preferredFacingMode
) => {
    setError('');
    setPermissionStarted(true);
    setIsInitializing(true);

    try {
        if (!navigator.mediaDevices?.getUserMedia) {
            throw new Error('This browser does not support camera access.');
        }

        await ensurePoseLandmarker();

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
        }

        const constraints = {
            audio: false,
            video: overrideDeviceId
                ? {
                    deviceId: { exact: overrideDeviceId},
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                  }
             :   {
                    facingMode: { ideal: overrideFacingMode },
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        const video = videoRef.current;
        if (!video) return;

        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;
        video.autoplay = true;
        await video.play();

        await enumerateVideoDevices();
if (!sessionIdRef.current) {
        const response = await fetch('/api/pose/session/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            exerciseId: exercise?.id,
            exerciseName: exercise?.name,
            cameraLabel: stream.getVideoTracks()[0]?.label ?? overrideFacingMode,
            deviceId: overrideDeviceId || null,
            facingMode: overrideFacingMode,
          }),
        });
        const data = await response.json();
        sessionIdRef.current = data.sessionId;
      }

      if (!startedRef.current) {
        startedRef.current = true;
        runDetection();
      }

      setIsCameraOn(true);
    } catch (cameraError) {
      console.error(cameraError);
      setError(cameraError.message || 'Unable to start camera.');
      setIsCameraOn(false);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSwitchFacingMode = async () => {
    const next = preferredFacingMode === 'user' ? 'environment' : 'user';
    setPreferredFacingMode(next);
    setSelectedDeviceId('');
    if (isCameraOn) await startCamera('', next);
  };

  // Timer for endurance / timed exercises — only counts while form is correct
  useEffect(() => {
    if (isTimed && isCameraOn && recording) {
      timerRef.current = setInterval(() => {
        if (formGoodRef.current) {
          setElapsedSeconds((prev) => prev + 1);
        }
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isTimed, isCameraOn, recording]);

  useEffect(() => {
    return () => {
      stopCamera();
      if (poseLandmarkerRef.current) {
        poseLandmarkerRef.current.close();
        poseLandmarkerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card sx={{ borderRadius: 6, boxShadow: 10, overflow: 'hidden' }}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Stack spacing={2.5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>
                {exercise?.name}
              </Typography>
            </Box>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          {!permissionStarted && (
            <Alert severity="info">
              Tap <strong>Start camera</strong> first. On iPhone, camera labels usually appear only
              after permission is granted.
            </Alert>
          )}

          {/* Status chips */}
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip
              icon={<FiberManualRecordIcon />}
              color={isCameraOn && recording ? 'error' : 'default'}
              label={isCameraOn ? (recording ? 'Recording' : 'Paused') : 'Camera off'}
            />
            {isTimed
              ? <Chip label={`Time: ${elapsedSeconds}s`} color="primary" />
              : <Chip label={`Reps: ${analysis.count}`} color="primary" />}
            <Chip label={`Phase: ${analysis.phase}`} variant="outlined" />
            <Chip
              label={analysis.angle != null ? `Angle: ${analysis.angle}°` : 'Angle: --'}
              variant="outlined"
            />
          </Stack>

          {/* Demo video + Camera feed side by side */}
          <Grid container spacing={2}>
            {EXERCISE_VIDEOS[exercise?.id] && (
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="overline" sx={{ fontWeight: 800, mb: 0.5, display: 'block' }}>
                  Example — follow along
                </Typography>
                <Box sx={{ borderRadius: 4, overflow: 'hidden', bgcolor: '#000', lineHeight: 0 }}>
                  <video
                    key={exercise.id}
                    src={EXERCISE_VIDEOS[exercise.id]}
                    controls
                    loop
                    playsInline
                    style={{ width: '100%', height: 300, objectFit: 'cover', display: 'block' }}
                  />
                </Box>
              </Grid>
            )}

            <Grid size={{ xs: 12, md: EXERCISE_VIDEOS[exercise?.id] ? 6 : 12 }}>
              <Typography variant="overline" sx={{ fontWeight: 800, mb: 0.5, display: 'block' }}>
                Camera feed
              </Typography>
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: 4,
                  overflow: 'hidden',
                  bgcolor: '#000',
                  height: 300,
                  lineHeight: 0,
                }}
              >
                {!isCameraOn && (
                  <Stack
                    spacing={2}
                    alignItems="center"
                    justifyContent="center"
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      color: '#fff',
                      zIndex: 2,
                      px: 3,
                      textAlign: 'center',
                    }}
                  >
                    {isInitializing ? (
                      <CircularProgress color="inherit" />
                    ) : (
                      <VideocamIcon sx={{ fontSize: 48 }} />
                    )}
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      {isInitializing ? 'Starting camera...' : 'Camera preview will appear here'}
                    </Typography>
                  </Stack>
                )}

                <video
                  ref={videoRef}
                  style={{
                    width: '100%',
                    display: 'block',
                    transform: preferredFacingMode === 'user' ? 'scaleX(-1)' : 'none',
                  }}
                />

                <canvas
                  ref={canvasRef}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    transform: preferredFacingMode === 'user' ? 'scaleX(-1)' : 'none',
                    pointerEvents: 'none',
                  }}
                />
              </Box>
            </Grid>
          </Grid>

          {/* Live feedback — compact bar */}
          <Box
            sx={{
              py: 1,
              px: 2,
              borderRadius: 3,
              bgcolor: 'action.hover',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary' }}>
              Feedback:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, flex: 1 }}>
              {analysis.feedback}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary' }}>
              Calories:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 900, color: '#ff7a18' }}>
              {totalCalories} kcal
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Frames: {savedFrames}
            </Typography>
          </Box>

          {/* Controls */}
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="nowrap">
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="camera-device-label">Camera device</InputLabel>
              <Select
                labelId="camera-device-label"
                label="Camera device"
                value={selectedDeviceId}
                onChange={async (event) => {
                  const value = event.target.value;
                  setSelectedDeviceId(value);
                  if (isCameraOn) await startCamera(value, preferredFacingMode);
                }}
              >
                {devices.map((device, index) => (
                  <MenuItem key={device.deviceId || index} value={device.deviceId}>
                    {device.label || `Camera ${index + 1}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              disabled={isInitializing}
              color={isCameraOn ? 'warning' : 'success'}
              startIcon={isCameraOn ? <StopCircleIcon /> : <VideocamIcon />}
              onClick={() => {
                if (isCameraOn) {
                  stopCamera();
                } else {
                  startCamera();
                }
              }}
            >
              {isCameraOn ? 'Pause Camera' : 'Start Camera'}
            </Button>

            <Button
              variant="outlined"
              startIcon={<CameraswitchIcon />}
              onClick={handleSwitchFacingMode}
            >
              Switch {preferredFacingMode === 'user' ? 'to rear' : 'to front'}
            </Button>

            <Button
              variant="contained"
              color="error"
              startIcon={<StopCircleIcon />}
              sx={{ color: '#fff' }}
              onClick={async () => {
                await stopCamera();
                // Completed = 8+ reps for rep exercises, 60+ seconds for timed
                const completed = isTimed
                  ? elapsedSeconds >= 60
                  : analysis.count >= 8;
                saveSessionCalories(
                  exercise?.id,
                  exercise?.name,
                  totalCalories,
                  isTimed ? elapsedSeconds : analysis.count,
                  isTimed
                );
                onQuit?.(totalCalories, completed);
              }}
            >
              End Workout
            </Button>

            <Typography variant="body2" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
              1 set of {exercise?.target ?? 8} {exercise?.type === 'seconds' ? 'seconds' : 'reps'}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default PoseTrainer;
