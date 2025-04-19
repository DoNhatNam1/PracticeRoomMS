import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Room, Computer } from '../types';

interface RoomsState {
  selectedRoom: Room | null;
  selectedComputer: Computer | null;
  setSelectedRoom: (room: Room | null) => void;
  setSelectedComputer: (computer: Computer | null) => void;
}

export const useRoomsStore = create<RoomsState>()(
  persist(
    (set) => ({
      selectedRoom: null,
      selectedComputer: null,
      setSelectedRoom: (room) => set({ selectedRoom: room }),
      setSelectedComputer: (computer) => set({ selectedComputer: computer }),
    }),
    {
      name: 'rooms-storage',
    }
  )
);