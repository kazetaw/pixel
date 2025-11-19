import { ref, update } from "firebase/database";
import type { Floor } from "../types/floor";
import { database, COMPANY_ID } from "../firebase/config";
import { useState } from "react";
import { FaClock, FaTimes, FaPlay } from "react-icons/fa";

interface Props {
  open: boolean;
  selected: { num: string; floor: Floor } | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function TimerModal({
  open,
  selected,
  onClose,
  onSuccess,
}: Props) {
  const [selectedTime, setSelectedTime] = useState<string>("00:30:00");
  if (!open || !selected) return null;

  const onStart = () => {
    const [h = "0", m = "0", s = "0"] = selectedTime.split(":");
    const totalSeconds = Number(h) * 3600 + Number(m) * 60 + Number(s);
    const totalMinutes = totalSeconds / 60;

    if (totalSeconds <= 0) {
      alert("กรุณาตั้งเวลาให้มากกว่า 0 วินาที");
      return;
    }

    const floorRef = ref(
      database,
      `companies/${COMPANY_ID}/floors/${selected.num}`
    );
    update(floorRef, {
      status: "running",
      startTime: Date.now(),
      estimatedDurationMinutes: totalMinutes,
    })
      .then(() => {
        onClose();
        onSuccess?.();
        setSelectedTime("00:30:00");
      })
      .catch((e) => {
        console.error("Error starting floor:", e);
        alert("❌ ไม่สามารถเริ่มทำงานได้");
      });
  };

  const [h = "00", m = "00", s = "00"] = selectedTime.split(":");

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-xl">
              <FaClock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-800">
                ตั้งเวลาทำงาน
              </h3>
              <p className="text-sm text-slate-600">
                ชั้น {selected.num} • {selected.floor.profession || "ไม่ระบุ"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Time Input */}
        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-sm text-slate-600 mb-4">
              กำหนดระยะเวลาในการทำงาน
            </p>

            <div className="flex justify-center gap-3">
              {[
                { label: "ชั่วโมง", max: 99, val: h, idx: 0 },
                { label: "นาที", max: 59, val: m, idx: 1 },
                { label: "วินาที", max: 59, val: s, idx: 2 },
              ].map(({ label, max, val, idx }) => (
                <div key={label} className="flex flex-col items-center">
                  <label className="block text-xs font-medium text-slate-600 mb-2">
                    {label}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={max}
                    value={val}
                    onChange={(e) => {
                      const parts = selectedTime.split(":");
                      const cleaned = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 2);
                      parts[idx] = cleaned;
                      setSelectedTime(parts.join(":"));
                    }}
                    onBlur={(e) => {
                      const parts = selectedTime.split(":");
                      const raw = e.target.value.replace(/\D/g, "");
                      const n = raw === "" ? 0 : Math.min(Number(raw), max);
                      parts[idx] = String(n).padStart(2, "0");
                      setSelectedTime(parts.join(":"));
                    }}
                    className="w-20 h-14 text-center text-xl font-mono font-bold border-2 border-slate-200 
                             rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 
                             transition-all outline-none bg-slate-50 focus:bg-white"
                  />
                </div>
              ))}
            </div>

            {/* Quick Time Presets */}
            <div className="mt-6">
              <p className="text-xs text-slate-500 mb-3">เวลาที่ใช้บ่อย</p>
              <div className="flex justify-center gap-2">
                {["00:15:00", "00:30:00", "01:00:00", "02:00:00"].map(
                  (preset) => (
                    <button
                      key={preset}
                      onClick={() => setSelectedTime(preset)}
                      className={`
                      px-3 py-2 text-xs font-medium rounded-lg transition-colors
                      ${
                        selectedTime === preset
                          ? "bg-blue-500 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }
                    `}
                    >
                      {preset.replace("00:", "").replace(":00", " นาที")}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 
                     font-semibold rounded-xl transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={onStart}
            className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white 
                     font-semibold rounded-xl transition-colors shadow-lg shadow-blue-200
                     inline-flex items-center justify-center gap-2"
          >
            <FaPlay className="w-4 h-4" />
            เริ่มทำงาน
          </button>
        </div>
      </div>
    </div>
  );
}
