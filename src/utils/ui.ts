import type { Floor } from "../types/floor";

// ปรับระดับสีให้เท่ากัน (ทุก status อยู่ที่ระดับ 100)
export const getStatusColor = (status: Floor["status"]): string => {
  switch (status) {
    case "running":
      return "bg-blue-100 text-blue-700 border-blue-300";
    case "completed":
      return "bg-green-100 text-green-700 border-green-300";
    case "floating":
      return "bg-red-100 text-red-700 border-red-300";
    default:
      return "bg-gray-100 text-gray-700 border-gray-300";
  }
};

export const getStatusText = (status: Floor["status"]): string => {
  switch (status) {
    case "idle":
      return "ว่าง";
    case "running":
      return "กำลังทำงาน";
    case "completed":
      return "เสร็จแล้ว";
    case "floating":
      return "ลอย";
    default:
      return status;
  }
};
