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
import { analyzeExercise, drawPose, normalizeLandmarks } from '../utils/poseMath';

const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task';


const PoseTrainer = ({ exercise, onQuit }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const streamRef = useRef(null);
  const poseLandmarkerRef = useRef(null);
  const sessionIdRef = useRef(null);
  const frameBatcghRef = useRef([]);
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
  const [recording, setRecording] = useState(true);
  const [savedFrames, setSavedFrames] = useState(0);

  const exerciseKey = useMemo(() => exercise?.id ?? 'generic', [exercise]);

  const flushFrames = async (force = false) => {
    if (!sessionIdRef.current || !recording) return;
    if (frameBatchRef.current.length < 15 && !force) return;

    const payload = {
      frames: frameBatchRef.current,
      exerciseId: exercise?.id,
      exerciseName: exercise?.name,
    };

    const framesSent = frameBatcghRef.current.length;
    frameBatcghRef.current = [];

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

            const nextAnalysis = analyzeExercise(exerciseKey, landmarks, analysis);
            setAnalysis(nextAnalysis);

            if(landmarks.length && recording && sessionIdRef.current) {
                frameBatcghRef.current.push({
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
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>
                {exercise?.name}
              </Typography>
              <Typography color="text.secondary">
                Browser camera + real-time pose landmarks + saved training data
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip
                icon={<FiberManualRecordIcon />}
                color={recording ? 'error' : 'default'}
                label={recording ? 'Recording' : 'Paused'}
              />
              <Chip label={`Reps: ${analysis.count}`} color="primary" />
              <Chip label={`Phase: ${analysis.phase}`} variant="outlined" />
              <Chip
                label={analysis.angle != null ? `Angle: ${analysis.angle}°` : 'Angle: --'}
                variant="outlined"
              />
            </Stack>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          {!permissionStarted && (
            <Alert severity="info">
              Tap <strong>Start camera</strong> first. On iPhone, camera labels usually appear only
              after permission is granted.
            </Alert>
          )}

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '1.4fr 0.8fr' },
              gap: 2.5,
            }}
          >
            <Box>
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: 4,
                  overflow: 'hidden',
                  bgcolor: '#000',
                  minHeight: 320,
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
                      <VideocamIcon sx={{ fontSize: 64 }} />
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
            </Box>

            <Stack spacing={2}>
              <Box sx={{ p: 2, borderRadius: 4, bgcolor: 'action.hover' }}>
                <Typography variant="overline" sx={{ fontWeight: 800 }}>
                  Live feedback
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                  {analysis.feedback}
                </Typography>
                <Typography color="text.secondary">
                  Saved frames: {savedFrames}. Landmark batches are posted to Flask so you can use
                  them later for training and validation.
                </Typography>
              </Box>

              <FormControl fullWidth>
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

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button variant="contained" disabled={isInitializing} onClick={() => startCamera()}>
                  Start camera
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CameraswitchIcon />}
                  onClick={handleSwitchFacingMode}
                >
                  Switch {preferredFacingMode === 'user' ? 'to rear' : 'to front'}
                </Button>
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button
                  variant={recording ? 'outlined' : 'contained'}
                  color={recording ? 'warning' : 'success'}
                  onClick={() => setRecording((prev) => !prev)}
                >
                  {recording ? 'Pause recording' : 'Resume recording'}
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<StopCircleIcon />}
                  onClick={async () => {
                    await stopCamera();
                    onQuit?.();
                  }}
                >
                  End session
                </Button>
              </Stack>

              <Box sx={{ p: 2, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="overline" sx={{ fontWeight: 800 }}>
                  How this works
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  The browser handles the camera for desktop and mobile. MediaPipe extracts pose
                  landmarks in real time. The Flask API stores frame batches as JSON for later model
                  training.
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default PoseTrainer;
