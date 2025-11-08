import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PixelFloorManagement from "./page/PixelFloorManagement";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* default → PixelFloorManagement */}
        <Route path="/" element={<Navigate to="/floors" replace />} />
        <Route path="/floors" element={<PixelFloorManagement />} />
        {/* 404 fallback */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center text-gray-600">
              ไม่พบหน้า
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
