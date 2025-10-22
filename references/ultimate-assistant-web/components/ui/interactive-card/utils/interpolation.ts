type Vector2D = { x: number; y: number };

// Lerp function for smooth interpolation
export const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor;
};

// Spring physics calculation
export const spring = (
  current: number,
  target: number,
  velocity: number,
  mass: number = 1,
  stiffness: number = 170,
  damping: number = 26
): [number, number] => {
  const force = -stiffness * (current - target);
  const acceleration = force / mass;
  const newVelocity = (velocity + acceleration) * (1 - damping / 100);
  const newPosition = current + newVelocity;
  
  return [newPosition, newVelocity];
};

// Smooth damp for controlled interpolation
export const smoothDamp = (
  current: Vector2D,
  target: Vector2D,
  currentVelocity: Vector2D,
  smoothTime: number,
  deltaTime: number,
  maxSpeed: number = Infinity
): [Vector2D, Vector2D] => {
  const omega = 2 / smoothTime;
  const x = omega * deltaTime;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  
  const changex = target.x - current.x;
  const changey = target.y - current.y;
  
  const maxChange = maxSpeed * smoothTime;
  
  const clampedChangex = Math.max(Math.min(changex, maxChange), -maxChange);
  const clampedChangey = Math.max(Math.min(changey, maxChange), -maxChange);
  
  const newX = current.x + clampedChangex;
  const newY = current.y + clampedChangey;
  
  const tempx = (currentVelocity.x + omega * clampedChangex) * deltaTime;
  const tempy = (currentVelocity.y + omega * clampedChangey) * deltaTime;
  
  const newVelocityX = (currentVelocity.x - omega * tempx) * exp;
  const newVelocityY = (currentVelocity.y - omega * tempy) * exp;
  
  return [
    { x: newX, y: newY },
    { x: newVelocityX, y: newVelocityY }
  ];
};

// Bezier easing function for natural motion
export const createBezier = (x1: number, y1: number, x2: number, y2: number) => {
  const kSplineTableSize = 11;
  const kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

  const sampleValues = new Float32Array(kSplineTableSize);
  for (let i = 0; i < kSplineTableSize; ++i) {
    sampleValues[i] = calcBezier(i * kSampleStepSize, x1, x2);
  }

  const getTForX = (aX: number): number => {
    let intervalStart = 0.0;
    let currentSample = 1;
    const lastSample = kSplineTableSize - 1;

    for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
      intervalStart += kSampleStepSize;
    }
    --currentSample;

    const dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
    const guessForT = intervalStart + dist * kSampleStepSize;

    return guessForT;
  };

  return (x: number): number => {
    if (x1 === y1 && x2 === y2) return x;
    if (x === 0) return 0;
    if (x === 1) return 1;
    return calcBezier(getTForX(x), y1, y2);
  };
};

// Helper function for bezier calculation
const calcBezier = (aT: number, aA1: number, aA2: number): number => {
  return ((getA(aA1, aA2) * aT + getB(aA1, aA2)) * aT + getC(aA1)) * aT;
};

const getA = (aA1: number, aA2: number): number => {
  return 1.0 - 3.0 * aA2 + 3.0 * aA1;
};

const getB = (aA1: number, aA2: number): number => {
  return 3.0 * aA2 - 6.0 * aA1;
};

const getC = (aA1: number): number => {
  return 3.0 * aA1;
}; 