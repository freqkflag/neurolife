import { Audio, type AVPlaybackStatus } from 'expo-av';

export interface EntrainmentRamp {
  type: 'CALM' | 'ACTIVATE' | 'FOCUS' | 'ROOM_RESCUE';
  startBPM: number;
  endBPM: number;
  stepInterval: number;
  bpmStep: number;
  mutedHighs: boolean;
}

let currentSound: Audio.Sound | null = null;
let mutedHighs = true;
let isPlaying = false;

const BPM_TRACKS: Record<number, string> = {
  60: 'ambient-calm',
  80: 'downtempo',
  100: 'chillstep',
  120: 'edm-mid',
  140: 'edm-high',
  160: 'edm-peak',
};

export function setMutedHighs(enabled: boolean) {
  mutedHighs = enabled;
}

export function getMutedHighs(): boolean {
  return mutedHighs;
}

async function crossfadeToBPM(bpm: number): Promise<void> {
  if (currentSound) {
    await currentSound.setVolumeAsync(0);
    await currentSound.stopAsync();
    await currentSound.unloadAsync();
  }

  const trackId = BPM_TRACKS[bpm] ?? BPM_TRACKS[80];
  // Placeholder: in production, load bundled audio assets
  const { sound } = await Audio.Sound.createAsync(
    { uri: `asset:/audio/${trackId}.mp3` },
    { shouldPlay: true, volume: mutedHighs ? 0.7 : 1.0, isLooping: true },
  );
  currentSound = sound;
  isPlaying = true;
}

export async function startDeescalationRamp(currentBPM = 140): Promise<void> {
  await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
  let bpm = Math.min(180, Math.max(110, currentBPM));

  while (bpm >= 60) {
    await crossfadeToBPM(bpm);
    await new Promise((r) => setTimeout(r, 30000));
    bpm -= 10;
  }
  await crossfadeToBPM(60);
}

export async function triggerDopamineDrop(): Promise<void> {
  await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
  if (currentSound) {
    await currentSound.stopAsync();
    await currentSound.unloadAsync();
  }
  // 30-second build-up → drop loop placeholder
  const { sound } = await Audio.Sound.createAsync(
    { uri: 'asset:/audio/dopamine-drop.mp3' },
    { shouldPlay: true, volume: 0.8, isLooping: false },
  );
  currentSound = sound;
  isPlaying = true;
}

export async function startBassBodyDouble(taskType: string): Promise<void> {
  await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
  const { sound } = await Audio.Sound.createAsync(
    { uri: 'asset:/audio/bass-groove.mp3' },
    { shouldPlay: true, volume: mutedHighs ? 0.6 : 0.9, isLooping: true },
  );
  currentSound = sound;
  isPlaying = true;
}

export async function stopAudio(): Promise<void> {
  if (currentSound) {
    await currentSound.stopAsync();
    await currentSound.unloadAsync();
    currentSound = null;
  }
  isPlaying = false;
}

export function getIsPlaying(): boolean {
  return isPlaying;
}

export async function runEntrainmentRamp(ramp: EntrainmentRamp): Promise<void> {
  let bpm = ramp.startBPM;
  const direction = ramp.endBPM < ramp.startBPM ? -1 : 1;

  while (direction < 0 ? bpm >= ramp.endBPM : bpm <= ramp.endBPM) {
    await crossfadeToBPM(bpm);
    await new Promise((r) => setTimeout(r, ramp.stepInterval * 1000));
    bpm += ramp.bpmStep * direction;
  }
}
