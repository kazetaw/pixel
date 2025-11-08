export interface Machine {
  id: string;
  machineName: string;
  floorNumber: number;
  profession: string;
  initialSeconds: number;
  remainingSeconds: number;
  status: "ว่าง" | "ทำงานอยู่" | "หยุด" | "เสร็จแล้ว" | "ลอย";
  finishedAt: number | null;
  createdAt: number;
  needsSync?: boolean;
}

export interface FloorGroups {
  [floorNumber: number]: Machine[];
}

export interface MachineStats {
  total: number;
  working: number;
  finished: number;
  floating: number;
}
