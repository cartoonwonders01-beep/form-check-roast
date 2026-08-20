// Biomechanical Pose & Skeleton Analysis Engine

/**
 * Calculates angle between three points A -> B -> C in degrees
 */
export function calculateAngle(a, b, c) {
  if (!a || !b || !c) return 0;
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) {
    angle = 360.0 - angle;
  }
  return Math.round(angle);
}

/**
 * Analyzes landmarks frame-by-frame and calculates real-time form metrics
 */
export function analyzePoseMetrics(landmarks, exercise = 'pushup') {
  if (!landmarks || landmarks.length < 33) {
    return {
      isValid: false,
      formScore: 85,
      stage: 'READY',
      errors: [],
      angles: { elbow: 180, hip: 180, knee: 180, shoulder: 90 },
      severity: 'mild'
    };
  }

  // Key landmark indices (MediaPipe 33 standard)
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftElbow = landmarks[13];
  const rightElbow = landmarks[14];
  const leftWrist = landmarks[15];
  const rightWrist = landmarks[16];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const leftKnee = landmarks[25];
  const rightKnee = landmarks[26];
  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];

  // Average left & right for robustness
  const shoulder = leftShoulder.visibility > rightShoulder.visibility ? leftShoulder : rightShoulder;
  const elbow = leftElbow.visibility > rightElbow.visibility ? leftElbow : rightElbow;
  const wrist = leftWrist.visibility > rightWrist.visibility ? leftWrist : rightWrist;
  const hip = leftHip.visibility > rightHip.visibility ? leftHip : rightHip;
  const knee = leftKnee.visibility > rightKnee.visibility ? leftKnee : rightKnee;
  const ankle = leftAnkle.visibility > rightAnkle.visibility ? leftAnkle : rightAnkle;

  // Angles
  const elbowAngle = calculateAngle(shoulder, elbow, wrist);
  const hipAngle = calculateAngle(shoulder, hip, ankle);
  const kneeAngle = calculateAngle(hip, knee, ankle);
  const shoulderAngle = calculateAngle(elbow, shoulder, hip);

  const errors = [];
  let deduction = 0;
  let stage = 'TOP';

  if (exercise === 'pushup') {
    if (elbowAngle < 100) stage = 'BOTTOM (DEPTH)';
    else if (elbowAngle < 150) stage = 'ECCENTRIC (LOWERING)';
    else stage = 'LOCKOUT (TOP)';

    // Form Check 1: Sagging or Piking Hips
    if (hipAngle < 155) {
      errors.push({ id: 'hip_sag', label: 'Sagging Hips (Spine Broken)', angle: hipAngle, target: '170°-180°' });
      deduction += 25;
    } else if (hipAngle > 195) {
      errors.push({ id: 'hip_pike', label: 'Piking Hips (A-Frame)', angle: hipAngle, target: '170°-180°' });
      deduction += 15;
    }

    // Form Check 2: Flared Elbows
    if (shoulderAngle > 75) {
      errors.push({ id: 'elbow_flare', label: 'Elbows Flared Out (Shoulder Strain)', angle: shoulderAngle, target: '45°-60°' });
      deduction += 20;
    }

    // Form Check 3: Half-reps
    if (stage === 'BOTTOM (DEPTH)' && elbowAngle > 95) {
      errors.push({ id: 'shallow_depth', label: 'Shallow Depth (Quarter Rep)', angle: elbowAngle, target: '< 90°' });
      deduction += 15;
    }
  } else if (exercise === 'squat') {
    if (kneeAngle < 100) stage = 'BOTTOM (PARALLEL)';
    else if (kneeAngle < 140) stage = 'DESCENDING';
    else stage = 'STAND (LOCKOUT)';

    if (kneeAngle > 105 && stage === 'BOTTOM (PARALLEL)') {
      errors.push({ id: 'quarter_squat', label: 'Above Parallel (Half Squat)', angle: kneeAngle, target: '< 90°' });
      deduction += 30;
    }
    if (hipAngle < 85) {
      errors.push({ id: 'excessive_lean', label: 'Excessive Forward Lean', angle: hipAngle, target: '> 95°' });
      deduction += 20;
    }
  } else if (exercise === 'pullup') {
    if (elbowAngle < 80) stage = 'CHIN OVER BAR';
    else if (elbowAngle < 140) stage = 'PULLING';
    else stage = 'DEAD HANG';

    if (elbowAngle > 85 && stage === 'CHIN OVER BAR') {
      errors.push({ id: 'incomplete_pull', label: 'Chin Below Bar', angle: elbowAngle, target: '< 75°' });
      deduction += 25;
    }
  } else if (exercise === 'dips') {
    if (elbowAngle < 95) stage = 'FULL DEPTH';
    else if (elbowAngle < 145) stage = 'DESCENDING';
    else stage = 'LOCKOUT';

    if (shoulderAngle > 80) {
      errors.push({ id: 'shoulder_roll', label: 'Forward Shoulder Dump', angle: shoulderAngle, target: '< 65°' });
      deduction += 25;
    }
  }

  const formScore = Math.max(10, 100 - deduction);
  const severity = formScore > 80 ? 'mild' : formScore > 50 ? 'medium' : 'savage';

  return {
    isValid: true,
    formScore,
    stage,
    errors,
    severity,
    angles: {
      elbow: elbowAngle,
      hip: hipAngle,
      knee: kneeAngle,
      shoulder: shoulderAngle
    },
    raw: {
      shoulder,
      elbow,
      wrist,
      hip,
      knee,
      ankle
    }
  };
}
