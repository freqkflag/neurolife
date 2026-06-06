import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppState {
  capacityScore: number;
  sensoryLoad: number;
  tinyNextAction: string;
  theme: 'mutedDark' | 'softCream';
  privacyMode: 'FULLY_LOCAL' | 'SELF_HOSTED' | 'HYBRID' | 'CLOUD_ASSISTED';
  pinnedTasks: string[];
  brainDumps: string[];
  setCapacity: (score: number) => void;
  setSensoryLoad: (load: number) => void;
  setTinyNextAction: (action: string) => void;
  setTheme: (theme: 'mutedDark' | 'softCream') => void;
  addBrainDump: (text: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      capacityScore: 50,
      sensoryLoad: 30,
      tinyNextAction: 'Take one slow breath.',
      theme: 'mutedDark',
      privacyMode: 'HYBRID',
      pinnedTasks: [],
      brainDumps: [],
      setCapacity: (score) => set({ capacityScore: score }),
      setSensoryLoad: (load) => set({ sensoryLoad: load }),
      setTinyNextAction: (action) => set({ tinyNextAction: action }),
      setTheme: (theme) => set({ theme }),
      addBrainDump: (text) =>
        set((s) => ({ brainDumps: [text, ...s.brainDumps].slice(0, 20) })),
    }),
    {
      name: 'neurolife-pocket',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
