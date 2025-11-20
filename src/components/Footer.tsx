// import { FaPlay, FaPause, FaRedo } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="mt-6">
      <div className="max-w-7xl mx-auto px-3">
        <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
          {/* <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-blue-50 text-blue-600">
              <FaPlay className="w-3 h-3" />
            </div>
            <div className="p-1 rounded-md bg-amber-50 text-amber-600">
              <FaPause className="w-3 h-3" />
            </div>
            <div className="p-1 rounded-md bg-slate-50 text-slate-600">
              <FaRedo className="w-3 h-3" />
            </div>
          </div> */}

          <div className="flex-1 text-center truncate">
            ระบบจัดการชั้น Pixel — อัปเดตเรียลไทม์
          </div>

          <div className="text-right text-xs text-slate-400">v1</div>
        </div>
      </div>
    </footer>
  );
}
