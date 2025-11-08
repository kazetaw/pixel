import type { Floors, Floor } from "../types/floor";
import FloorCard from "./FloorCard";

interface Props {
  floors: Floors;
  onStart: (floorNum: string, floor: Floor) => void;
  onReset: (floorNum: string) => void;
}

export default function FloorsGrid({ floors, onStart, onReset }: Props) {
  const hasFloors = Object.keys(floors).length > 0;

  return (
    <section className="p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        🏬 ชั้นทั้งหมด ({Object.keys(floors).length})
      </h2>

      {!hasFloors ? (
        <div className="text-center py-12 text-gray-500 text-lg">
          ไม่มีข้อมูลชั้น
        </div>
      ) : (
        <div
          className="
            grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
            gap-6 items-stretch auto-rows-fr
          "
        >
          {Object.entries(floors)
            .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
            .map(([num, floor]) => (
              // ให้ child ยืดเต็มความสูง cell
              <div key={num} className="h-full">
                <FloorCard
                  num={num}
                  floor={floor}
                  onStart={onStart}
                  onReset={onReset}
                />
              </div>
            ))}
        </div>
      )}
    </section>
  );
}
