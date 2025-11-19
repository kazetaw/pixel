import type { Floors } from "../types/floor";

interface Props {
  floors: Floors;
  onFloorClick: (floorNum: string) => void;
}

export default function FloorOverview({ floors, onFloorClick }: Props) {
  const sortedFloors = Object.entries(floors).sort(
    (a, b) => parseInt(a[0]) - parseInt(b[0])
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "idle":
        return "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600";
      case "running":
        return "bg-gradient-to-br from-blue-500 to-blue-600  border-blue-500 text-white shadow-blue-200";
      case "completed":
        return "bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 border-emerald-500 text-white shadow-emerald-200";
      case "floating":
        return "bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border-red-500 text-white shadow-red-200";
      default:
        return "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600";
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

  // คำนวณ responsive grid
  const totalFloors = sortedFloors.length;
  const getGridCols = () => {
    if (totalFloors <= 5) return totalFloors;
    if (totalFloors <= 10) return 5;
    if (totalFloors <= 20) return 10;
    return 12;
  };

  const gridCols = getGridCols();

  const statusCounts = {
    idle: sortedFloors.filter(([, f]) => f.status === "idle").length,
    running: sortedFloors.filter(([, f]) => f.status === "running").length,
    completed: sortedFloors.filter(([, f]) => f.status === "completed").length,
    floating: sortedFloors.filter(([, f]) => f.status === "floating").length,
  };

  return (
    <section className="mb-8">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        {/* <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-800">
            ภาพรวมสถานะชั้น
          </h2>
          <div className="text-sm text-slate-500">{totalFloors} ชั้น</div>
        </div> */}

        {/* Status Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
            <span className="text-sm font-medium text-slate-600">ว่าง</span>
            <span className="text-sm font-bold text-slate-800 ml-auto">
              {statusCounts.idle}
            </span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100">
            <div className="w-3 h-3 bg-blue-500 rounded-full "></div>
            <span className="text-sm font-medium text-blue-600">ทำงาน</span>
            <span className="text-sm font-bold text-blue-800 ml-auto">
              {statusCounts.running}
            </span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            <span className="text-sm font-medium text-emerald-600">เสร็จ</span>
            <span className="text-sm font-bold text-emerald-800 ml-auto">
              {statusCounts.completed}
            </span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100">
            <div className="w-3 h-3 bg-red-500 rounded-full "></div>
            <span className="text-sm font-medium text-red-600">ลอย</span>
            <span className="text-sm font-bold text-red-800 ml-auto">
              {statusCounts.floating}
            </span>
          </div>
        </div>

        {/* Floor Grid */}
        <div
          className={`
            grid gap-2 justify-center
            grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-15
          `}
          style={{
            maxWidth: `${gridCols * 3.5}rem`,
            margin: "0 auto",
          }}
        >
          {sortedFloors.map(([num, floor]) => (
            <div
              key={num}
              onClick={() => onFloorClick(num)}
              className={`
                relative w-12 h-12 rounded-xl border cursor-pointer 
                transition-all duration-300 transform hover:scale-110 hover:z-10
                flex items-center justify-center shadow-sm hover:shadow-lg
                ${getStatusColor(floor.status)}
                ${floor.status === "running" ? "shadow-lg" : ""}
                ${floor.status === "floating" ? "" : ""}
              `}
              title={`ชั้น ${num} - ${getStatusText(floor.status)}${
                floor.profession ? ` (${floor.profession})` : ""
              }`}
            >
              {/* หมายเลขชั้น */}
              <span className="text-xs font-bold drop-shadow-sm">{num}</span>

              {/* Status indicator dot */}
              {floor.status === "running" && (
                <div className="absolute -top-1 -right-1 w-3 h-3"></div>
              )}
              {floor.status === "completed" && (
                <div className="absolute -top-1 -right-1 border-2 border-white">
                  <div className="absolute inset-1 bg-white rounded-full"></div>
                </div>
              )}
              {floor.status === "floating" && (
                <div className="absolute -top-1 -right-1 rounded-full border-2 border-white "></div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-slate-500">คลิกเพื่อไปยังรายละเอียดชั้น</p>
        </div>
      </div>
    </section>
  );
}
