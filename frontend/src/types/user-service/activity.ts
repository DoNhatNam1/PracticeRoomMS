export interface UserActivity {
  id: number;
  action: string;
  details: any;
  createdAt: string;
  actorId: number;
  visibleToId: number | null;
}