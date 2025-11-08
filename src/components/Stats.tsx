import type { FloorStats } from "../types/floor";

interface Props {
  stats: FloorStats;
}

export default function Stats({ stats }: Props) {
  const items: [string, number, string, string][] = [
    ["ชั้นทั้งหมด", stats.total, "text-gray-800", "bg-gray-50"],
    ["ว่าง", stats.idle, "text-gray-600", "bg-gray-50"],
    ["กำลังทำงาน", stats.running, "text-blue-600", "bg-blue-50"],
    ["เสร็จแล้ว", stats.completed, "text-green-600", "bg-green-50"],
    ["ลอย", stats.floating, "text-red-600", "bg-red-50"],
  ];

  return (
    <section className="mb-6 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-xl font-bold text-gray-800 mb-4">📊 สถิติภาพรวม</h2>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {items.map(([label, value, text, bg]) => (
          <div key={label} className={`text-center p-4 ${bg} rounded-lg`}>
            <div className={`text-3xl font-bold ${text}`}>{value}</div>
            <div className="text-sm text-gray-600 mt-1">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
