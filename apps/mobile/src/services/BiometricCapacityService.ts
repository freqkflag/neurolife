import { CAPACITY_LOW_THRESHOLD } from '@neurolife/shared';

export interface CapacityInput {
  sleepHours?: number;
  sleepQuality?: number;
  hrv?: number;
  restingHeartRate?: number;
  manualScore?: number;
}

export interface CapacityResult {
  score: number;
  label: string;
  isLow: boolean;
}

export function calculateCapacityScore(input: CapacityInput): CapacityResult {
  if (input.manualScore !== undefined) {
    const score = Math.max(0, Math.min(100, input.manualScore));
    return {
      score,
      label: getCapacityLabel(score),
      isLow: score < CAPACITY_LOW_THRESHOLD,
    };
  }

  let score = 50;

  if (input.sleepHours !== undefined) {
    if (input.sleepHours < 5) score -= 25;
    else if (input.sleepHours < 7) score -= 10;
    else if (input.sleepHours >= 8) score += 10;
  }

  if (input.sleepQuality !== undefined) {
    score += (input.sleepQuality - 50) * 0.3;
  }

  if (input.hrv !== undefined) {
    if (input.hrv < 30) score -= 15;
    else if (input.hrv > 60) score += 10;
  }

  if (input.restingHeartRate !== undefined) {
    if (input.restingHeartRate > 90) score -= 10;
    else if (input.restingHeartRate < 65) score += 5;
  }

  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  return {
    score: clamped,
    label: getCapacityLabel(clamped),
    isLow: clamped < CAPACITY_LOW_THRESHOLD,
  };
}

function getCapacityLabel(score: number): string {
  if (score < 30) return 'Low capacity — gentle mode';
  if (score < 60) return 'Medium capacity';
  return 'Good capacity today';
}

export function filterTasksByCapacity<T extends { capacityDemand: number }>(
  tasks: T[],
  capacityScore: number,
): T[] {
  if (capacityScore < CAPACITY_LOW_THRESHOLD) {
    return tasks.filter((t) => t.capacityDemand <= 30);
  }
  return tasks.filter((t) => t.capacityDemand <= capacityScore + 20);
}
