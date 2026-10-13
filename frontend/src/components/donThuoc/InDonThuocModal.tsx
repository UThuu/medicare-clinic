import React from 'react';
import { DonThuocResponse } from '../../types/donThuoc';
import { Button } from '../common/Button';
import { printHtmlViaHiddenIframe } from '../../utils/printHelper';

interface InDonThuocModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: DonThuocResponse | null;
}

export const InDonThuocModal: React.FC<InDonThuocModalProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  const handlePrint = () => {
    const printArea = document.getElementById('printable-prescription-content');
    if (!printArea) {
      window.print();
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="vi">
        <head>
          <meta charset="UTF-8">
          <title>Don_Thuoc_${data.idDonThuoc || 'MediCare'}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
            * { box-sizing: border-box; }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              color: #1e293b;
              margin: 0;
              padding: 24px;
              background: #fff;
              font-size: 14px;
              line-height: 1.5;
            }
            .header {
              display: flex;
              justify-content: space-between;
              border-bottom: 2px solid #0f766e;
              padding-bottom: 12px;
              margin-bottom: 20px;
            }
            .brand h1 { margin: 0; color: #0f766e; font-size: 22px; font-weight: 800; text-transform: uppercase; }
            .brand p { margin: 3px 0 0; color: #64748b; font-size: 13px; }
            .meta { text-align: right; font-size: 13px; }
            .title { text-align: center; margin: 16px 0 24px; }
            .title h2 { margin: 0; font-size: 22px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; }
            .title p { margin: 4px 0 0; color: #64748b; font-size: 13px; }
            .section-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
              background: #f8fafc;
              padding: 16px;
              border-radius: 8px;
              margin-bottom: 24px;
              border: 1px solid #e2e8f0;
            }
            .field strong { color: #475569; font-weight: 600; margin-right: 6px; }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 24px;
            }
            th {
              background: #0f766e;
              color: #ffffff;
              text-align: left;
              padding: 10px 12px;
              font-weight: 600;
              font-size: 13px;
            }
            td {
              padding: 10px 12px;
              border-bottom: 1px solid #e2e8f0;
              font-size: 13px;
              vertical-align: top;
            }
            tr:nth-child(even) td { background: #f8fafc; }
            .note {
              background: #fefce8;
              border-left: 4px solid #eab308;
              padding: 12px;
              border-radius: 4px;
              margin-bottom: 32px;
              font-size: 13px;
            }
            .footer-sign {
              display: flex;
              justify-content: space-between;
              text-align: center;
              margin-top: 40px;
              page-break-inside: avoid;
            }
            .sign-box p { margin: 4px 0; }
            .sign-box strong { display: block; margin-top: 60px; font-size: 14px; }
            @page { size: A4; margin: 15mm; }
          </style>
        </head>
        <body>
          ${printArea.innerHTML}
        </body>
      </html>
    `;

    printHtmlViaHiddenIframe(htmlContent, 'prescription-print-frame');
  };

  const fmtDate = (d?: string | null) => (d ? d.split('-').reverse().join('/') : '');

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '850px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
      >
        {/* Header Modal */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🖨️</span>
            <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: 700 }}>
              Xem trước & In đơn thuốc (PDF)
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#64748b',
              lineHeight: 1,
            }}
          >
            &times;
          </button>
        </div>

        {/* Nội dung xem trước */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, background: '#f1f5f9' }}>
          <div
            id="printable-prescription-content"
            style={{
              background: '#ffffff',
              padding: '36px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              maxWidth: '750px',
              margin: '0 auto',
            }}
          >
            {/* Header phòng khám */}
            <div className="header" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f766e', paddingBottom: '12px', marginBottom: '20px' }}>
              <div className="brand">
                <h1 style={{ margin: 0, color: '#0f766e', fontSize: '20px', fontWeight: 800 }}>
                  PHÒNG KHÁM MEDICARE CLINIC
                </h1>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>
                  Hotline: 1800 6868 · Website: medicareclinic.vn
                </p>
              </div>
              <div className="meta" style={{ textAlign: 'right', fontSize: '13px', color: '#64748b' }}>
                <div>Mã đơn: <strong>{data.idDonThuoc || 'Chưa lưu'}</strong></div>
                <div>Ngày: <strong>{fmtDate(data.ngayKe) || new Date().toLocaleDateString('vi-VN')}</strong></div>
              </div>
            </div>

            {/* Tiêu đề đơn thuốc */}
            <div className="title" style={{ textAlign: 'center', margin: '16px 0 24px' }}>
              <h2 style={{ margin: 0, fontSize: '22px', color: '#0f172a', fontWeight: 800, textTransform: 'uppercase' }}>
                ĐƠN THUỐC ĐIỀU TRỊ
              </h2>
            </div>

            {/* Thông tin bệnh nhân */}
            <div
              className="section-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                background: '#f8fafc',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #e2e8f0',
                fontSize: '13px',
              }}
            >
              <div><strong>Họ và tên:</strong> {data.hoTenBenhNhan}</div>
              <div><strong>Mã bệnh nhân:</strong> {data.idBenhNhan}</div>
              <div><strong>Tuổi:</strong> {data.tuoiBenhNhan ? `${data.tuoiBenhNhan} tuổi` : '—'}</div>
              <div><strong>Giới tính:</strong> {data.gioiTinhBenhNhan === 'NAM' ? 'Nam' : data.gioiTinhBenhNhan === 'NU' ? 'Nữ' : 'Khác'}</div>
              <div style={{ gridColumn: '1 / -1' }}><strong>Địa chỉ:</strong> {data.diaChiBenhNhan || '—'}</div>
              <div style={{ gridColumn: '1 / -1' }}><strong>Chẩn đoán:</strong> {data.chanDoan || '—'}</div>
            </div>

            {/* Bảng danh sách thuốc */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
              <thead>
                <tr style={{ background: '#0f766e', color: '#ffffff' }}>
                  <th style={{ padding: '8px 10px', width: '40px', textAlign: 'center' }}>STT</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left' }}>Tên thuốc</th>
                  <th style={{ padding: '8px 10px', width: '90px', textAlign: 'center' }}>Số lượng</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left' }}>Liều lượng & Hướng dẫn sử dụng</th>
                </tr>
              </thead>
              <tbody>
                {data.chiTietDonThuoc.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 1 ? '#f8fafc' : '#fff' }}>
                    <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>{idx + 1}</td>
                    <td style={{ padding: '10px' }}>
                      <strong style={{ color: '#0f172a' }}>{item.tenThuoc}</strong>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      {item.soLuong} {item.donViTinh}
                    </td>
                    <td style={{ padding: '10px' }}>
                      <div>{item.lieuLuong}</div>
                      {item.huongDanSuDung && (
                        <small style={{ color: '#64748b', fontStyle: 'italic' }}>({item.huongDanSuDung})</small>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Lời dặn */}
            {data.ghiChu && (
              <div
                className="note"
                style={{
                  background: '#fefce8',
                  borderLeft: '4px solid #eab308',
                  padding: '12px',
                  borderRadius: '4px',
                  marginBottom: '24px',
                  fontSize: '13px',
                }}
              >
                <strong>Lời dặn của bác sĩ:</strong> {data.ghiChu}
              </div>
            )}

            {/* Chữ ký */}
            <div
              className="footer-sign"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '36px',
                textAlign: 'center',
                fontSize: '13px',
              }}
            >
              <div>
                <p><strong>Người bệnh / Thân nhân</strong></p>
                <p style={{ color: '#64748b', fontSize: '11px' }}>(Ký và ghi rõ họ tên)</p>
              </div>
              <div>
                <p><strong>Bác sĩ điều trị</strong></p>
                <p style={{ color: '#64748b', fontSize: '11px' }}>(Ký và ghi rõ họ tên)</p>
                <div style={{ marginTop: '50px', fontWeight: 700, color: '#0f766e' }}>
                  {data.tenBacSi ? `BS. ${data.tenBacSi}` : 'Bác sĩ điều trị'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            background: '#ffffff',
          }}
        >
          <Button variant="secondary" onClick={onClose}>
            Đóng
          </Button>
          <Button variant="primary" onClick={handlePrint}>
            🖨️ In đơn thuốc (PDF)
          </Button>
        </div>
      </div>
    </div>
  );
};
