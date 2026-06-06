import { SENSORY_HIGH_THRESHOLD } from '@neurolife/shared';

export interface SensorReading {
  ambientNoise: number;
  lightLevel: number;
  screenTimeMinutes: number;
  motionLevel: number;
}

export interface SensoryAlert {
  load: number;
  message: string;
  suggestions: string[];
  showDelay: boolean;
}

let screenTimeStart = Date.now();
let alertCallback: ((alert: SensoryAlert) => void) | null = null;

export function startScreenTimeTracking() {
  screenTimeStart = Date.now();
}

export function getScreenTimeMinutes(): number {
  return Math.floor((Date.now() - screenTimeStart) / 60000);
}

export function onSensoryAlert(callback: (alert: SensoryAlert) => void) {
  alertCallback = callback;
}

export async function readSensors(): Promise<SensorReading> {
  let motionLevel = 0;
  try {
    const { Accelerometer } = await import('expo-sensors');
    Accelerometer.setUpdateInterval(1000);
    const sub = Accelerometer.addListener((data) => {
      motionLevel = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2) * 10;
    });
    await new Promise((r) => setTimeout(r, 500));
    sub.remove();
  } catch {
    motionLevel = 30;
  }

  return {
    ambientNoise: 40,
    lightLevel: 50,
    screenTimeMinutes: getScreenTimeMinutes(),
    motionLevel: Math.min(100, motionLevel),
  };
}

export function calculateSensoryLoad(reading: SensorReading): number {
  const weights = {
    noise: 0.3,
    light: 0.2,
    screen: 0.3,
    motion: 0.2,
  };
  const screenFactor = Math.min(100, reading.screenTimeMinutes * 2);
  return Math.round(
    reading.ambientNoise * weights.noise +
      reading.lightLevel * weights.light +
      screenFactor * weights.screen +
      reading.motionLevel * weights.motion,
  );
}

export async function checkSensoryLoad(): Promise<SensoryAlert | null> {
  const reading = await readSensors();
  const load = calculateSensoryLoad(reading);

  if (load < SENSORY_HIGH_THRESHOLD - 10) return null;

  const alert: SensoryAlert = {
    load,
    message: load >= SENSORY_HIGH_THRESHOLD
      ? 'Sensory load is rising. A small break might help.'
      : 'Sensory load is building.',
    suggestions: [
      'Put on headphones',
      'Dim the lights',
      'Take a 5-minute break',
      'Try the calm audio ramp',
    ],
    showDelay: true,
  };

  if (load >= SENSORY_HIGH_THRESHOLD && alertCallback) {
    alertCallback(alert);
  }

  return alert;
}
