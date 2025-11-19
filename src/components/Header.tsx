import Icon from "../assets/images/1.png";
export default function Header() {
  return (
    <header className="mb-10 text-center">
      <div className="inline-flex items-center justify-center p-4  backdrop-blur-sm rounded-2xl  border border-white/20 mb-6">
        <div className="p-3 bg-gradient-to-br  rounded-xl mr-4">
          <img src={Icon} alt="Icon" className="w-14 h-14" />
        </div>
        <div className="text-left">
          <h1 className="text-3xl font-bold text-slate-800">
            ระบบจัดการชั้น Pixel
          </h1>
          <p className="text-slate-600 text-sm font-medium">
            ติดตามสถานะการทำงานแต่ละชั้นแบบเรียลไทม์
          </p>
        </div>
      </div>

      {/* Subtitle */}
      {/* <div className="text-slate-500 text-sm">
        <span className="px-3 py-1 bg-white/60 backdrop-blur-sm rounded-full border border-white/30">
          อัปเดตแบบเรียลไทม์ • ติดตามประสิทธิภาพ • จัดการงานอัจฉริยะ
        </span>
      </div> */}
    </header>
  );
}
