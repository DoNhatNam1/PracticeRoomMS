import { Computer } from '../computer-service/computers';
import { Room } from './rooms';

export interface ComputerUsage {
  id: number;
  computerId: number;
  notes: string | null;
  roomUsageId: number;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
  computer: Computer;
}

export interface RoomUsage {
  id: number;
  roomId: number;
  userId: number;
  startTime: string;
  endTime: string;
  purpose: string;
  createdAt: string;
  updatedAt: string;
  scheduleId: number | null;
  room: Room;
  schedule: any | null;
  computerUsages: ComputerUsage[];
}