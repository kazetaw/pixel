import type { Floors, Floor } from "../types/floor";
import FloorCard from "./FloorCard";

interface Props {
  floors: Floors;
  onStart: (floorNum: string, floor: Floor) => void;
  onReset: (floorNum: string) => void;
  highlightedFloor?: string | null;
}

export default function FloorsGrid({
  floors,
  onStart,
  onReset,
  highlightedFloor,
}: Props) {
  const hasFloors = Object.keys(floors).length > 0;
  const floorCount = Object.keys(floors).length;

  return (
    <section className="mb-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-white/20 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">
            รายละเอียดชั้น
          </h2>
          <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
            {floorCount} ชั้น
          </div>
        </div>

        {!hasFloors ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-600 mb-2">
              ไม่มีข้อมูลชั้น
            </h3>
            <p className="text-slate-500">ยังไม่มีชั้นที่ลงทะเบียนในระบบ</p>
          </div>
        ) : (
          <div
            className="
              grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7
              gap-3 auto-rows-fr
            "
          >
            {Object.entries(floors)
              .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
              .map(([num, floor]) => (
                <div key={num} className="h-full" data-floor={num}>
                  <FloorCard
                    num={num}
                    floor={floor}
                    onStart={onStart}
                    onReset={onReset}
                    isHighlighted={highlightedFloor === num}
                  />
                </div>
              ))}
          </div>
        )}
      </div>
    </section>
  );
}
