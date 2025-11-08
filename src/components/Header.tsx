import { BiLogoFirefox } from "react-icons/bi";

export default function Header() {
  return (
    <header className="mb-8 text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">
        <BiLogoFirefox className="inline-block w-8 h-8 mr-2" />
        ระบบจัดการชั้น Pixel
      </h1>
      <p className="text-gray-600">ติดตามสถานะการทำงานแต่ละชั้นแบบเรียลไทม์</p>
    </header>
  );
}
