import { ref, update } from "firebase/database";
import type { Floor } from "../types/floor";
import { hhmmss } from "../utils/time";
import { getStatusColor, getStatusText } from "../utils/ui";
import { database, COMPANY_ID } from "../firebase/config";
import { FaPlay, FaPause, FaRedo } from "react-icons/fa";
import { FaSadTear } from "react-icons/fa";
import { IoIosTime } from "react-icons/io";

interface Props {
  num: string;
  floor: Floor;
  onStart: (floorNum: string, floor: Floor) => void;
  onReset: (floorNum: string) => void;
}

export default function FloorCard({ num, floor, onStart, onReset }: Props) {
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

  return (
    <div
      className={[
        "h-[340px]", // << ความสูงคงที่ทั้งใบ
        "flex flex-col", // layout ภายในเป็นคอลัมน์
        "p-4 border-2 rounded-lg transition-shadow",
        getStatusColor(floor.status),
        // เอา scale ออกเพื่อไม่ให้สูง/ใหญ่กว่าการ์ดอื่น
        floor.status === "running" ? "shadow-lg" : "hover:shadow-md",
      ].join(" ")}
    >
      {/* Header */}
      <div className="mb-3">
        <div className="flex justify-between items-start">
          <div className="min-w-0">
            <div className="text-2xl font-bold text-gray-800">ชั้น {num}</div>
            <div className="text-sm text-gray-600 truncate">
              {floor.profession || "ไม่ระบุอาชีพ"}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xs text-gray-500">สถานะ</div>
            <div className="font-bold text-sm px-2 py-1 rounded bg-white/50">
              {getStatusText(floor.status)}
            </div>
          </div>
        </div>
      </div>

      {/* Content (กินพื้นที่ที่เหลือทั้งหมด) */}
      <div className="flex-1 flex items-center justify-center">
        {floor.status === "running" ? (
          <div className="p-3 bg-white/60 rounded-lg text-center w-full max-w-[260px]">
            <div className="text-xs text-gray-600 mb-1">
              <IoIosTime className="inline-block w-4 h-4 mr-1" />
              เวลาเหลือ
            </div>
            <div className="text-2xl font-mono font-bold text-gray-800">
              {hhmmss(floor.remainingSeconds || 0)}
            </div>
            {/* <div className="text-xs text-gray-500 mt-1">
              ทั้งหมด {floor.estimatedDurationMinutes} นาที
            </div> */}
          </div>
        ) : floor.status === "completed" ? (
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-lg animate-[fadeIn_0.6s_ease-out_forwards]">
              {" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={3}
                stroke="white"
                className="w-8 h-8 animate-[glow_2s_ease-in-out_infinite]"
              >
                {" "}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />{" "}
              </svg>{" "}
            </div>
            <p className="mt-3 text-green-700 font-semibold text-lg">
              เสร็จละจู้ว
            </p>
          </div>
        ) : floor.status === "floating" ? (
          <div className="flex flex-col items-center justify-center">
            <FaSadTear className="w-24 h-24 text-gray-500" />

            <p className="mt-3 text-gray-600 font-semibold text-lg">
              ลอยแล้วพรี่!!
            </p>
          </div>
        ) : (
          <div className="p-3 bg-white/60 rounded-lg text-center text-sm text-gray-600 w-full max-w-[260px]">
            พร้อมทำงาน ✨
          </div>
        )}
      </div>

      {/* Buttons (จะอยู่ล่างเสมอเพราะ parent เป็น flex-col + flex-1 ดันพื้นที่ไปแล้ว) */}
      <div className="flex gap-2">
        {floor.status !== "running" && (
          <button
            onClick={() => onStart(num, floor)}
            className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors shadow-md inline-flex items-center justify-center gap-2"
          >
            <FaPlay className="w-4 h-4" />
            <span>เริ่ม</span>
          </button>
        )}
        {floor.status === "running" && (
          <button
            onClick={() => stopFloor(num)}
            className="flex-1 px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors shadow-md inline-flex items-center justify-center gap-2"
          >
            <FaPause className="w-4 h-4" />
            <span>หยุด</span>
          </button>
        )}
        <button
          onClick={() => onReset(num)}
          className="flex-1 px-3 py-2 bg-gray-400 hover:bg-gray-500 text-white font-semibold rounded-lg transition-colors shadow-md inline-flex items-center justify-center gap-2"
        >
          <FaRedo className="w-4 h-4" />
          <span>รีเซ็ต</span>
        </button>
      </div>
    </div>
  );
}
