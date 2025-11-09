import { ref, update } from "firebase/database";
import type { Floor } from "../types/floor";
import { database, COMPANY_ID } from "../firebase/config";
import { useState } from "react";

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
        setSelectedTime("00:00:00");
      })
      .catch((e) => {
        console.error("Error starting floor:", e);
        alert("❌ ไม่สามารถเริ่มทำงานได้");
      });
  };

  const [h = "00", m = "00", s = "00"] = selectedTime.split(":");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 shadow-2xl w-80">
        <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
          ตั้งเวลา {selected.floor.profession}
        </h3>

        <div className="flex justify-center gap-2 mb-6 text-center">
          {[
            { label: "ชั่วโมง", max: 99, val: h, idx: 0 },
            { label: "นาที", max: 59, val: m, idx: 1 },
            { label: "วินาที", max: 59, val: s, idx: 2 },
          ].map(({ label, max, val, idx }) => (
            <div key={label}>
              <label className="block text-xs text-gray-500 mb-1">
                {label}
              </label>
                  <input
                    type="number"
                    min="0"
                    max={max}
                    value={val}
                    onChange={(e) => {
                      // Allow empty input while typing (don't pad here)
                      const parts = selectedTime.split(":");
                      const cleaned = e.target.value.replace(/\D/g, "").slice(0, 2);
                      parts[idx] = cleaned;
                      setSelectedTime(parts.join(":"));
                    }}
                    onBlur={(e) => {
                      // Normalize value on blur: clamp to max and pad to 2 digits
                      const parts = selectedTime.split(":");
                      const raw = e.target.value.replace(/\D/g, "");
                      const n = raw === "" ? 0 : Math.min(Number(raw), max);
                      parts[idx] = String(n).padStart(2, "0");
                      setSelectedTime(parts.join(":"));
                    }}
                    className="w-16 border rounded-lg text-center text-lg py-1"
                  />
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold"
          >
            ยกเลิก
          </button>
          <button
            onClick={onStart}
            className="flex-1 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold"
          >
            เริ่ม
          </button>
        </div>
      </div>
    </div>
  );
}
