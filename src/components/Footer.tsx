import { FaPlay, FaPause, FaRedo, FaInfoCircle } from "react-icons/fa";

export default function Footer() {
  const instructions = [
    {
      icon: FaPlay,
      action: "เริ่ม",
      description: "เพื่อเริ่มทำงาน โดยตั้งเวลา",
      color: "text-blue-600 bg-blue-50",
    },
    {
      icon: FaPause,
      action: "หยุด",
      description: "เพื่อหยุดการทำงาน",
      color: "text-amber-600 bg-amber-50",
    },
    {
      icon: FaRedo,
      action: "รีเซ็ต",
      description: "เพื่อรีเซ็ตสถานะ",
      color: "text-slate-600 bg-slate-50",
    },
  ];

  return (
    <footer className="mt-10">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-blue-50 rounded-lg">
            <FaInfoCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 mb-1">วิธีใช้งาน</h3>
            <p className="text-sm text-slate-600">
              ปฏิบัติการพื้นฐานสำหรับการจัดการชั้น
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {instructions.map(
            ({ icon: Icon, action, description, color }) => (
              <div
                key={action}
                className={`
                p-4 rounded-xl border transition-all duration-200 hover:shadow-md
                ${color} border-current border-opacity-20
              `}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${color} bg-opacity-20`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-800 mb-1">
                      {action}
                    </div>
                    <div className="text-sm text-slate-600">{description}</div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-6 pt-4 border-t border-slate-200">
          <div className="text-center">
            <p className="text-xs text-slate-500">
              ระบบจัดการชั้น Pixel • อัปเดตเรียลไทม์ • ใช้งานง่าย
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
