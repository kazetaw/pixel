/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Floor {
  profession: string;
  startTime: number | null;
  estimatedDurationMinutes: number;
  // timestamp when the machine entered "floating" state (ms since epoch)
  floatingStart?: number | null;
  status: "idle" | "running" | "completed" | "floating";
  machines: { [key: string]: any };
  remainingSeconds?: number;
  needsSync?: boolean;
}

export interface Floors {
  [floorNumber: string]: Floor;
}

export interface FloorStats {
  total: number;
  idle: number;
  running: number;
  completed: number;
  floating: number;
}
