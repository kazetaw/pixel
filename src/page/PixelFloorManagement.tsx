/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSX, useEffect, useMemo, useRef, useState } from "react";
import { onValue, ref, update } from "firebase/database";
import { database, COMPANY_ID } from "../firebase/config";
import type { Floor, Floors, FloorStats } from "../types/floor";
import Header from "../components/Header";
import Stats from "../components/Stats";
import FloorsGrid from "../components/FloorsGrid";
import TimerModal from "../components/TimerModal";
import Footer from "../components/Footer";

/** ------------------------------
 *  CONFIG
 *  ------------------------------ */
const LIFT_GRACE_MIN = 15; // เวลารอ "ลอย" หลังเสร็จงาน (นาที)

/** ------------------------------
 *  TYPES (เฉพาะในไฟล์นี้)
 *  ------------------------------ */
type Phase = "idle" | "running" | "completed" | "floating";

/** ------------------------------
 *  HELPERS
 *  ------------------------------ */

/**
 * คำนวณ phase และเวลา remaining โดยอิง timestamp จริง
 * - running: เหลือเวลาจนถึง end (startTime + estimatedDurationMinutes)
 * - completed: เหลือเวลาจนถึง floatAt (end + 15 นาที)
 * - floating: เกิน floatAt แล้ว
 */
function getPhase(
  floor: Floor,
  now = Date.now()
): { phase: Phase; remaining: number; end?: number; floatAt?: number } {
  const { startTime, estimatedDurationMinutes } = floor || {};
  const status = (floor?.status ?? "idle") as Phase;

  if (
    !startTime ||
    !estimatedDurationMinutes ||
    estimatedDurationMinutes <= 0
  ) {
    return { phase: status, remaining: 0 };
  }

  const end = startTime + estimatedDurationMinutes * 60 * 1000;
  const floatAt = end + LIFT_GRACE_MIN * 60 * 1000;

  if (now < end) {
    return {
      phase: "running",
      remaining: Math.ceil((end - now) / 1000),
      end,
      floatAt,
    };
  }
  if (now < floatAt) {
    return {
      phase: "completed",
      remaining: Math.ceil((floatAt - now) / 1000),
      end,
      floatAt,
    };
  }
  return { phase: "floating", remaining: 0, end, floatAt };
}

/** ------------------------------
 *  MAIN COMPONENT
 *  ------------------------------ */
export default function PixelFloorManagement(): JSX.Element {
  const [floors, setFloors] = useState<Floors>({}); // state ฝั่ง client (เสริมฟิลด์ช่วย)
  const [loading, setLoading] = useState<boolean>(true);

  // Modal state
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [selected, setSelected] = useState<{
    num: string;
    floor: Floor;
  } | null>(null);

  // Tick และ lifecycle
  const tickId = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMounted = useRef(false);

  /**
   * หมายเหตุ: เราจะเก็บ "สถานะที่มาจากเซิร์ฟเวอร์ล่าสุด" ไว้ใน floor.serverStatus
   * เพื่อใช้ตัดสินใจว่าต้อง sync transition กลับ RTDB หรือไม่
   *
   * ฟิลด์เสริมฝั่ง client:
   * - remainingSeconds: number
   * - needsSync: boolean
   * - serverStatus: Phase | undefined
   */

  /** ------------------------------
   *  Subscribe to Firebase (RTDB)
   *  ------------------------------ */
  useEffect(() => {
    isMounted.current = true;

    const floorsRef = ref(database, `companies/${COMPANY_ID}/floors`);
    const unsub = onValue(floorsRef, (snap) => {
      if (!isMounted.current) return;
      const data = (snap.val() ?? {}) as Floors;
      const now = Date.now();

      const next: Floors = {};
      for (const [num, raw] of Object.entries(data)) {
        const { phase, remaining } = getPhase(raw, now);
        next[num] = {
          ...raw,
          status: phase, // อัปเดตสถานะตามเวลา (ฝั่ง client)
          remainingSeconds: remaining, // วินาทีที่เหลือ (derived)
          needsSync: false, // ไม่เชื่อ server สำหรับ flag นี้
          // จำ "สถานะที่มาจาก server" ล่าสุด (ก่อนถูกคำนวณทับ)
          serverStatus: (raw.status ?? "idle") as Phase,
        } as Floor & {
          remainingSeconds?: number;
          needsSync?: boolean;
          serverStatus?: Phase;
        };
      }

      setFloors(next);
      setLoading(false);
    });

    return () => {
      isMounted.current = false;
      unsub();
    };
  }, []);

  /** ------------------------------
   *  Client tick (derive จากเวลาเสมอ)
   *  ------------------------------ */
  useEffect(() => {
    tickId.current = setInterval(() => {
      setFloors((prev) => {
        const now = Date.now();
        let changed = false;
        const updated: Floors = {};

        for (const [num, floor] of Object.entries(prev)) {
          const beforeClientStatus = (floor.status ?? "idle") as Phase;
          const serverStatus = (floor.serverStatus ??
            beforeClientStatus) as Phase;

          const { phase, remaining } = getPhase(floor, now);

          const nextFloor: Floor & {
            remainingSeconds?: number;
            needsSync?: boolean;
            serverStatus?: Phase;
          } = {
            ...floor,
            status: phase,
            remainingSeconds: remaining,
            needsSync: false,
            serverStatus, // ค่าจากรอบ subscribe ล่าสุด
          };

          // ถ้า phase (client) != serverStatus แปลว่ามี transition ที่ควร sync
          if (phase !== serverStatus) {
            nextFloor.needsSync = true;
          }

          updated[num] = nextFloor;

          if (
            phase !== beforeClientStatus ||
            (floor.remainingSeconds ?? 0) !== remaining ||
            !!floor.needsSync !== !!nextFloor.needsSync
          ) {
            changed = true;
          }
        }

        return changed ? updated : prev;
      });
    }, 1000);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        setFloors((prev) => {
          const now = Date.now();
          let changed = false;
          const next: Floors = {};
          for (const [num, f] of Object.entries(prev)) {
            const { phase, remaining } = getPhase(f, now);
            const samePhase = phase === f.status;
            const sameRemain = (f.remainingSeconds ?? 0) === remaining;
            next[num] =
              samePhase && sameRemain
                ? f
                : { ...f, status: phase, remainingSeconds: remaining };
            if (!samePhase || !sameRemain) changed = true;
          }
          return changed ? next : prev;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      if (tickId.current) clearInterval(tickId.current);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  /** ------------------------------
   *  Sync transitions to RTDB (idempotent)
   *  ------------------------------ */
  useEffect(() => {
    // รวบงานที่ต้อง sync
    const toSync = Object.entries(floors).filter(
      ([, f]) => (f as any)?.needsSync
    );

    if (toSync.length === 0) return;

    toSync.forEach(async ([num, f]) => {
      const floor = f as Floor & {
        remainingSeconds?: number;
        needsSync?: boolean;
        serverStatus?: Phase;
      };
      const floorRef = ref(database, `companies/${COMPANY_ID}/floors/${num}`);

      const currentPhase = (floor.status ?? "idle") as Phase;
      const lastServer = (floor.serverStatus ?? currentPhase) as Phase;

      try {
        // running -> completed
        if (lastServer !== "completed" && currentPhase === "completed") {
          const endAt =
            (floor.startTime ?? 0) +
            (floor.estimatedDurationMinutes ?? 0) * 60 * 1000;

          await update(floorRef, {
            status: "completed",
            completedAt: endAt, // บันทึกเวลาเสร็จจริง
          });
        }

        // completed -> floating
        if (lastServer !== "floating" && currentPhase === "floating") {
          await update(floorRef, {
            status: "floating",
          });
        }

        // running stays running (ไม่ต้องอัปเดตบ่อย ๆ)
        // idle หรือ reset ก็ค่อยไปอัปเดตตอนกด action

        // อัปเดตฝั่ง client: needsSync=false และ serverStatus = currentPhase
        setFloors((prev) => {
          const prevFloor = prev[num] as any;
          if (!prevFloor) return prev;
          return {
            ...prev,
            [num]: {
              ...prevFloor,
              needsSync: false,
              serverStatus: currentPhase,
            },
          };
        });
      } catch (e) {
        console.error("Sync error:", e);
        // ถ้าล้มเหลว ปล่อย needsSync ค้างไว้ แล้วรันรอบหน้าใหม่
      }
    });
  }, [floors]);

  /** ------------------------------
   *  Actions
   *  ------------------------------ */
  const startFloor = (floorNum: string, floor: Floor) => {
    setSelected({ num: floorNum, floor });
    setShowTimerModal(true);
  };

  const resetFloor = (floorNum: string) => {
    const floorRef = ref(
      database,
      `companies/${COMPANY_ID}/floors/${floorNum}`
    );
    update(floorRef, {
      status: "idle",
      startTime: null,
      estimatedDurationMinutes: 0,
      completedAt: null,
    }).catch(console.error);
  };

  /** ------------------------------
   *  Derived stats
   *  ------------------------------ */
  const stats: FloorStats = useMemo(() => {
    const values = Object.values(floors);
    return {
      total: values.length,
      idle: values.filter((f) => f.status === "idle").length,
      running: values.filter((f) => f.status === "running").length,
      completed: values.filter((f) => f.status === "completed").length,
      floating: values.filter((f) => f.status === "floating").length,
    };
  }, [floors]);

  /** ------------------------------
   *  UI
   *  ------------------------------ */
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100">
        <div className="flex space-x-2 mb-6">
          <span className="w-4 h-4 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-4 h-4 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-4 h-4 bg-pink-500 rounded-full animate-bounce"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br p-4">
      <div className="max-w-7xl mx-auto">
        <Header />
        <Stats stats={stats} />
        <FloorsGrid floors={floors} onStart={startFloor} onReset={resetFloor} />
        <Footer />
      </div>

      <TimerModal
        open={showTimerModal}
        selected={selected}
        onClose={() => setShowTimerModal(false)}
      />
    </div>
  );
}
