import { JSX, useEffect, useMemo, useRef, useState } from "react";
import { onValue, ref, update } from "firebase/database";
import { database, COMPANY_ID } from "../firebase/config";
import type { Floor, Floors, FloorStats } from "../types/floor";
import Header from "../components/Header";
import Stats from "../components/Stats";
import FloorsGrid from "../components/FloorsGrid";
import TimerModal from "../components/TimerModal";
import Footer from "../components/Footer";

const computeRemaining = (floor: Floor): number => {
  if (
    floor.status === "running" &&
    floor.startTime &&
    floor.estimatedDurationMinutes
  ) {
    const end = floor.startTime + floor.estimatedDurationMinutes * 60 * 1000;
    return Math.max(0, Math.floor((end - Date.now()) / 1000));
  }
  
  // คำนวณเวลาที่เหลือก่อนจะลอยสำหรับ status "completed"
  if (
    floor.status === "completed" &&
    floor.startTime &&
    floor.estimatedDurationMinutes
  ) {
    const completionTime = floor.startTime + floor.estimatedDurationMinutes * 60 * 1000;
    const floatingTime = completionTime + 15 * 60 * 1000; // เพิ่ม 15 นาที
    return Math.max(0, Math.floor((floatingTime - Date.now()) / 1000));
  }
  
  return 0;
};

export default function PixelFloorManagement(): JSX.Element {
  const [floors, setFloors] = useState<Floors>({});
  const [loading, setLoading] = useState<boolean>(true);

  // Modal state
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [selected, setSelected] = useState<{
    num: string;
    floor: Floor;
  } | null>(null);

  // useRef with proper browser typing
  const tickId = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMounted = useRef(false);

  // ------------------------------
  // Subscribe to Firebase (RTDB)
  // ------------------------------
  useEffect(() => {
    isMounted.current = true;

    const floorsRef = ref(database, `companies/${COMPANY_ID}/floors`);
    const unsub = onValue(floorsRef, (snap) => {
      const data = snap.val() as Floors | null;
      if (!isMounted.current) return;

      if (data) {
        // attach client-side remainingSeconds (derived)
        const next: Floors = {};
        Object.entries(data).forEach(([num, f]) => {
          next[num] = {
            ...f,
            remainingSeconds: computeRemaining(f),
            // never trust server for needsSync flag
            needsSync: false,
          };
        });
        setFloors(next);
      } else {
        setFloors({});
      }
      setLoading(false);
    });

    return () => {
      isMounted.current = false;
      unsub();
    };
  }, []);

  // ------------------------------
  // Client-side countdown tick
  // ------------------------------
  useEffect(() => {
    tickId.current = setInterval(() => {
      setFloors((prev) => {
        let changed = false;
        const updated: Floors = {};

        for (const [num, floor] of Object.entries(prev)) {
          if (floor.status === "running") {
            const nextRemaining =
              (floor.remainingSeconds ?? computeRemaining(floor)) - 1;
            if (nextRemaining > 0) {
              updated[num] = { ...floor, remainingSeconds: nextRemaining };
              changed = true;
              continue;
            }
            // running -> completed (start 15 min grace)
            updated[num] = {
              ...floor,
              status: "completed",
              remainingSeconds: 15 * 60, //เครื่องลอย
              needsSync: true,
            };
            changed = true;
            continue;
          }

          if (floor.status === "completed") {
            const nextRemaining = (floor.remainingSeconds ?? 0) - 1;
            if (nextRemaining > 0) {
              updated[num] = { ...floor, remainingSeconds: nextRemaining };
              changed = true;
              continue;
            }
            // completed -> floating
            updated[num] = {
              ...floor,
              status: "floating",
              needsSync: true,
              remainingSeconds: 0,
            };
            changed = true;
            continue;
          }

          // idle / floating unchanged
          updated[num] = floor;
        }

        return changed ? updated : prev;
      });
    }, 1000);

    // When tab visibility changes, recompute remainingSeconds for accuracy
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        setFloors((prev) => {
          const next: Floors = {};
          let changed = false;
          for (const [num, f] of Object.entries(prev)) {
            const recalculated =
              f.status === "running" || f.status === "completed"
                ? computeRemaining(f)
                : f.remainingSeconds ?? 0;
            const same = recalculated === (f.remainingSeconds ?? 0);
            next[num] = same ? f : { ...f, remainingSeconds: recalculated };
            if (!same) changed = true;
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

  // ------------------------------
  // Actions
  // ------------------------------
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
    }).catch(console.error);
  };

  // ------------------------------
  // Derived stats (memoized)
  // ------------------------------
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100">
        {/* จุดสามจุดเด้ง ๆ */}
        <div className="flex space-x-2 mb-6">
          <span className="w-4 h-4 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-4 h-4 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-4 h-4 bg-pink-500 rounded-full animate-bounce"></span>
        </div>

        {/* ข้อความโหลด */}
        {/* <p className="text-gray-600 text-lg font-medium tracking-wide animate-pulse">
          กำลังโหลดข้อมูล...
        </p> */}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br  p-4">
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