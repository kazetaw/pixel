export default function Footer() {
  return (
    <footer className="mt-8 p-6 bg-white rounded-xl shadow-lg text-sm text-gray-600">
      <h3 className="font-bold text-gray-800 mb-2">📝 วิธีใช้งาน:</h3>
      <ul className="space-y-1 list-disc list-inside">
        <li>
          กด <strong>"▶️ เริ่ม"</strong> เพื่อเริ่มทำงาน โดยตั้งเวลา
        </li>
        <li>
          กด <strong>"⏸️ หยุด"</strong> เพื่อหยุดการทำงาน
        </li>
        <li>
          กด <strong>"🔄 รีเซ็ต"</strong> เพื่อรีเซ็ตสถานะ
        </li>
      </ul>
    </footer>
  );
}
