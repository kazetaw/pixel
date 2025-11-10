import { ref, update } from "firebase/database";
import type { Floor } from "../types/floor";
import { hhmmss } from "../utils/time";
import { getStatusColor, getStatusText } from "../utils/ui";
import { database, COMPANY_ID } from "../firebase/config";
import { FaPlay, FaPause, FaRedo } from "react-icons/fa";
// import { FaSadTear } from "react-icons/fa";
import { IoIosTime } from "react-icons/io";
import { useEffect, useState } from "react";
import SuccessImgage from "../assets/images/2.png";
import CryImage from "../assets/images/3.png";
import Working from "../assets/images/1.png";

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
            <div className="w-28 h-28 mx-auto mb-4">
              <img
                src={Working}
                alt="working"
                className="w-full h-full object-contain 
                rounded-full"
                // style={{ animationDuration: "8s" }}
                //                animate-spin border-2
              />
            </div>
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
            <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center shadow-lg animate-[fadeIn_0.6s_ease-out_forwards]">
              {" "}
              <img src={SuccessImgage} alt="" />
              {/* <svg
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
              </svg>{" "} */}
            </div>
            <p className="mt-3 text-green-700 font-semibold text-lg">
              เสร็จแล้วจู้วว
            </p>

            {/* Completion time and countdown until floating */}
            <div className="mt-2 text-center text-sm text-gray-600">
              {/* {floor.startTime && floor.estimatedDurationMinutes ? (
                <div>เวลาเสร็จ: {new Date(floor.startTime + floor.estimatedDurationMinutes * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              ) : (
                <div>เวลาเสร็จ: -</div>
              )} */}

              <div className="mt-1 text-xs text-gray-500">
                {/* จะลอยใน:  */}
                {/* <span className="text-[18px] font-mono font-semibold">
                  {hhmmss(floor.remainingSeconds ?? 1)}
                </span> */}
              </div>
            </div>
          </div>
        ) : floor.status === "floating" ? (
          <FloatingInfo floor={floor} />
        ) : (
          <div className="">
            <div className="w-24 h-24 rounded-full flex items-center justify-center ">
              {/* <img src={CryImage} alt="" /> */}
              <FaPause className="w-16 h-16 text-gray-400" />
            </div>
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

function FloatingInfo({ floor }: { floor: Floor }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (floor.status !== "floating") return;
    const id = setInterval(() => setNow(Date.now()), 60 * 1000); // update every minute
    return () => clearInterval(id);
  }, [floor.status]);

  const floatingStart =
    floor.startTime && floor.estimatedDurationMinutes
      ? floor.startTime +
        floor.estimatedDurationMinutes * 60 * 1000 +
        15 * 60 * 1000
      : null;

  const elapsedMs = floatingStart ? Math.max(0, now - floatingStart) : null;
  const hours = elapsedMs ? Math.floor(elapsedMs / (1000 * 60 * 60)) : 0;
  const minutes = elapsedMs
    ? Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60))
    : 0;

  const elapsedText = elapsedMs
    ? hours > 0
      ? `${hours} ชม ${minutes} นาที`
      : `${minutes} นาที`
    : "-";
  console.log("🚀 ~ FloatingInfo ~ elapsedText:", elapsedText)

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center shadow-lg animate-[fadeIn_0.6s_ease-out_forwards]">
        <img src={CryImage} alt="" />
      </div>
      <p className="mt-3 text-gray-600 font-semibold text-lg">ลอยแล้วพรี่!!</p>
      {/* <div className="mt-2 text-sm text-gray-600">
        <span className="font-mono text-[18px] font-semibold">
          {elapsedText}
        </span>
      </div> */}
    </div>
  );
}