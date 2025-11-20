/* eslint-disable react-hooks/exhaustive-deps */
import { ref, update } from "firebase/database";
import type { Floor } from "../types/floor";
import { hhmmss } from "../utils/time";
import { database, COMPANY_ID } from "../firebase/config";
import { FaPlay, FaPause, FaRedo } from "react-icons/fa";
import { useEffect, useState } from "react";
import SuccessImgage from "../assets/images/2.png";
import CryImage from "../assets/images/3.png";
import Working from "../assets/images/1.png";

interface Props {
  num: string;
  floor: Floor;
  onStart: (floorNum: string, floor: Floor) => void;
  onReset: (floorNum: string) => void;
  isHighlighted?: boolean;
}

export default function FloorCard({
  num,
  floor,
  onStart,
  onReset,
  isHighlighted,
}: Props) {
  const stopFloor = (floorNum: string) => {
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

  const getCardStyles = (status: string) => {
    const baseStyles =
      "h-[220px] flex flex-col p-3 rounded-lg transition-all duration-500 shadow-sm hover:shadow-md border";

    switch (status) {
      case "idle":
        return `${baseStyles} bg-white border-slate-200 hover:border-slate-300`;
      case "running":
        return `${baseStyles} bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-blue-100`;
      case "completed":
        return `${baseStyles} bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-emerald-100`;
      case "floating":
        return `${baseStyles} bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-red-100`;
      default:
        return `${baseStyles} bg-white border-slate-200`;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "idle":
        return "ว่าง";
      case "running":
        return "ทำงาน";
      case "completed":
        return "เสร็จ";
      case "floating":
        return "ลอย";
      default:
        return "ไม่ทราบ";
    }
  };

  return (
    <div
      className={`
        ${getCardStyles(floor.status)}
        ${
          isHighlighted
            ? "ring-2 ring-amber-400 ring-opacity-50 shadow-lg scale-105"
            : ""
        }
      `}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 min-w-0">
          <div className="text-base font-bold text-slate-800 mb-0.5">
            ชั้น {num}
          </div>
          <div className="text-xs text-slate-600 truncate">
            {floor.profession || "ไม่ระบุอาชีพ"}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div
            className={`
            px-2 py-0.5 rounded-full text-xs font-semibold border
            ${
              floor.status === "idle"
                ? "bg-slate-100 text-slate-600 border-slate-200"
                : ""
            }
            ${
              floor.status === "running"
                ? "bg-blue-500 text-white border-blue-500 animate-pulse"
                : ""
            }
            ${
              floor.status === "completed"
                ? "bg-emerald-500 text-white border-emerald-500"
                : ""
            }
            ${
              floor.status === "floating"
                ? "bg-red-500 text-white border-red-500"
                : ""
            }
          `}
          >
            {getStatusText(floor.status)}
          </div>
        </div>
      </div>
      {/* Content Area */}
      <div className="flex-1 flex items-center justify-center min-h-0">
        {floor.status === "running" ? (
          <div className="text-center w-full">
            <div className="w-16 h-16 mx-auto mb-1 relative">
              <div className="absolute inset-0 bg-blue-100 rounded-full"></div>
              <img
                src={Working}
                alt="working"
                className="w-full h-full object-contain rounded-full relative z-10"
              />
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-1.5 border border-white/40">
              <div className="text-sm font-mono font-bold text-slate-800 mb-0.5">
                {hhmmss(floor.remainingSeconds || 0)}
              </div>

              {floor.startTime && floor.estimatedDurationMinutes ? (
                <div className="text-xs text-slate-600">
                  เสร็จ:{" "}
                  {new Date(
                    floor.startTime + floor.estimatedDurationMinutes * 60 * 1000
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              ) : null}
            </div>
          </div>
        ) : floor.status === "completed" ? (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-1 relative">
              <div className="absolute inset-0 bg-emerald-500 rounded-full animate-pulse opacity-20"></div>
              <div className="w-full h-full rounded-full bg-emerald-500 flex items-center justify-center relative z-10">
                <img
                  src={SuccessImgage}
                  alt="success"
                  className="w-16 h-16 object-contain"
                />
              </div>
            </div>

            <p className="text-emerald-700 font-bold text-xs mb-1">
              เสร็จแล้วจู้วว
            </p>

            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-1.5 border border-white/40">
              {floor.startTime && floor.estimatedDurationMinutes
                ? (() => {
                    const completionMs =
                      floor.startTime +
                      floor.estimatedDurationMinutes * 60 * 1000;
                    const floatingMs = completionMs + 15 * 60 * 1000;
                    const remainingSec = Math.max(
                      0,
                      Math.floor((floatingMs - Date.now()) / 1000)
                    );
                    return (
                      <div className="text-center">
                        {/* <div className="text-xs text-slate-600">ลอยใน</div> */}
                        <div className="text-xs font-mono font-bold text-slate-800">
                          {hhmmss(remainingSec)}
                        </div>
                      </div>
                    );
                  })()
                : null}
            </div>
          </div>
        ) : floor.status === "floating" ? (
          <FloatingInfo floor={floor} />
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-1 bg-slate-100 rounded-full flex items-center justify-center">
              <FaPause className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium text-xs">พร้อมใช้งาน</p>
          </div>
        )}
      </div>
      {/* Action Buttons */}
      <div className="flex gap-1.5 mt-6">
        {floor.status !== "running" && (
          <button
            onClick={() => onStart(num, floor)}
            className="flex-1 px-2 py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg 
                     transition-colors shadow-sm shadow-blue-200 hover:shadow-blue-300
                     inline-flex items-center justify-center gap-1 text-xs"
          >
            <FaPlay className="w-2.5 h-2.5" />
            <span>เริ่ม</span>
          </button>
        )}
        {floor.status === "running" && (
          <button
            onClick={() => stopFloor(num)}
            className="flex-1 px-2 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg 
                     transition-colors shadow-sm shadow-amber-200 hover:shadow-amber-300
                     inline-flex items-center justify-center gap-1 text-xs"
          >
            <FaPause className="w-2.5 h-2.5" />
            <span>หยุด</span>
          </button>
        )}
        <button
          onClick={() => onReset(num)}
          className="flex-1 px-2 py-1.5 bg-slate-500 hover:bg-slate-600 text-white font-semibold rounded-lg 
                   transition-colors shadow-sm shadow-slate-200 hover:shadow-slate-300
                   inline-flex items-center justify-center gap-1 text-xs"
        >
          <FaRedo className="w-2.5 h-2.5" />
          <span>รีเซ็ต</span>
        </button>
      </div>
    
    </div>
  );
}

function FloatingInfo({ floor }: { floor: Floor }) {
  const [, setNow] = useState(Date.now());

  useEffect(() => {
    if (floor.status !== "floating") return;
    const id = setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => clearInterval(id);
  }, [floor.status]);

  const floatingStart =
    floor.startTime && floor.estimatedDurationMinutes
      ? floor.startTime +
        floor.estimatedDurationMinutes * 60 * 1000 +
        15 * 60 * 1000
      : null;

  return (
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-1 relative">
        <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-30"></div>
        <div className="w-full h-full bg-red-500 rounded-full flex items-center justify-center relative z-10">
          <img
            src={CryImage}
            alt="floating"
            className="w-16 h-16 object-contain"
          />
        </div>
      </div>

      <p className="text-red-600 font-bold text-xs mb-1">ลอยแล้วพรี่!!</p>

      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-1.5 border border-white/40">
        {/* <div className="text-xs text-slate-600">เวลาลอย</div> */}
        {(() => {
          function LiveElapsed() {
            const [now2, setNow2] = useState(Date.now());

            useEffect(() => {
              if (!floatingStart) return;
              const id = setInterval(() => setNow2(Date.now()), 1000);
              return () => clearInterval(id);
            }, [floatingStart]);

            const elapsed = floatingStart
              ? Math.max(0, now2 - floatingStart)
              : 0;
            const hh = String(Math.floor(elapsed / 3600000)).padStart(2, "0");
            const mm = String(Math.floor((elapsed % 3600000) / 60000)).padStart(
              2,
              "0"
            );
            const ss = String(Math.floor((elapsed % 60000) / 1000)).padStart(
              2,
              "0"
            );

            return (
              <span className="font-mono text-xs font-bold text-red-700">
                {floatingStart ? `${hh}:${mm}:${ss}` : "00:00:00"}
              </span>
            );
          }

          return <LiveElapsed />;
        })()}
      </div>
    </div>
  );
}
