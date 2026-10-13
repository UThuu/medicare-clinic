import React, { useEffect, useState } from 'react';
import { donThuocService } from '../services/donThuocService';
import { DonThuocResponse } from '../types/donThuoc';

export const HoSoYTeCaNhanPage: React.FC = () => {
  const [dsDonThuoc, setDsDonThuoc] = useState<DonThuocResponse[]>([]);
  const [fontSize, setFontSize] = useState<number>(16); // Mặc định 16px (REQ-019)
  const [selectedDon, setSelectedDon] = useState<DonThuocResponse | null>(null);

  // Lấy ID Bệnh nhân từ Auth context (Giả định 'BN001' để test)
  const currentBenhNhanId = "BN001";

  useEffect(() => {
    donThuocService.layHoSoCaNhan(currentBenhNhanId)
      .then(data => setDsDonThuoc(data))
      .catch(err => console.error(err));
  }, []);

  const toggleFontSize = () => {
    setFontSize(prev => (prev === 16 ? 20 : 16)); // Phóng to 20px (REQ-019)
  };

  return (
    <div style={{ fontSize: `${fontSize}px`, padding: '20px' }} className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Hồ Sơ Y Tế Cá Nhân</h1>
        <button 
          onClick={toggleFontSize}
          className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition"
        >
          {fontSize === 16 ? 'Phóng to chữ (20px)' : 'Kích thước chuẩn (16px)'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1">
          <h2 className="font-semibold mb-3">Lịch Sử Đơn Thuốc</h2>
          {dsDonThuoc.map(don => (
            <div 
              key={don.idDonThuoc} 
              className="mb-3 cursor-pointer hover:border-blue-500 p-4 border rounded bg-white shadow-sm" 
              onClick={() => setSelectedDon(don)}
            >
              <p className="font-bold">Ngày kê: {don.ngayKe}</p>
              <p>Bác sĩ: {don.tenBacSi}</p>
            </div>
          ))}
        </div>

        <div className="col-span-2">
          {selectedDon ? (
            <div className="p-6 border rounded shadow bg-white">
              <h2 className="text-xl font-bold mb-4">Chi Tiết Đơn Thuốc</h2>
              <p><strong>Ngày kê:</strong> {selectedDon.ngayKe}</p>
              <p><strong>Bác sĩ:</strong> {selectedDon.tenBacSi}</p>
              <p><strong>Ghi chú:</strong> {selectedDon.ghiChu || 'Không có'}</p>

              <table className="w-full mt-4 border-collapse border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2">Tên thuốc</th>
                    <th className="border p-2">Số lượng</th>
                    <th className="border p-2">Liều lượng</th>
                    <th className="border p-2">Hướng dẫn</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDon.chiTietDonThuoc.map(item => (
                    <tr key={item.id}>
                      <td className="border p-2 font-semibold">{item.tenThuoc}</td>
                      <td className="border p-2 text-center">{item.soLuong} {item.donViTinh}</td>
                      <td className="border p-2">{item.lieuLuong}</td>
                      <td className="border p-2">{item.huongDanSuDung}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-gray-500 border rounded bg-gray-50">
              Vui lòng chọn một đơn thuốc để xem chi tiết.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};