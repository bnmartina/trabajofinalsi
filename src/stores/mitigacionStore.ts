import { create } from "zustand";

type MitigacionState = {
  mitigacion: number; // 0,20,40,60,100
setMitigacion: (v: number) => void;
};

export const useMitigacionStore = create<MitigacionState>((set) => ({
    mitigacion: 0,
    setMitigacion: (v) => set({ mitigacion: v }),
}));
