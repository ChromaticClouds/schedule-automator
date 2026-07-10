import { create } from 'zustand';

type ComposerState = {
  instructions: Record<string, string>;
  submittedInstructions: Record<string, string>;
  clearInstruction: (date: string) => void;
  setInstruction: (date: string, instruction: string) => void;
  submitInstruction: (date: string, instruction: string) => void;
};

export const useScheduleDraftComposerStore = create<ComposerState>((set) => ({
  instructions: {},
  submittedInstructions: {},
  clearInstruction: (date) =>
    set((state) => {
      const { [date]: _, ...instructions } = state.instructions;
      return { instructions };
    }),
  setInstruction: (date, instruction) =>
    set((state) => ({
      instructions: { ...state.instructions, [date]: instruction },
    })),
  submitInstruction: (date, instruction) =>
    set((state) => ({
      submittedInstructions: {
        ...state.submittedInstructions,
        [date]: instruction,
      },
    })),
}));
