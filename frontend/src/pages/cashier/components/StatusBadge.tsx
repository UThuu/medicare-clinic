import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'CHUA_THANH_TOAN':
      return <span className="badge badge-warning" id="badge-chua-thanh-toan">⏳ Chưa thanh toán</span>;
    case 'DA_THANH_TOAN':
      return <span className="badge badge-success" id="badge-da-thanh-toan">✅ Đã thanh toán</span>;
    case 'CHO_THANH_TOAN':
      return <span className="badge badge-info" id="badge-cho-thanh-toan">📋 Chờ lập hóa đơn</span>;
    case 'HOAN_TAT':
      return <span className="badge badge-success" id="badge-hoan-tat">🎉 Hoàn tất khám</span>;
    case 'DANG_KHAM':
      return <span className="badge badge-info" id="badge-dang-kham">🩺 Đang khám</span>;
    case 'HUY':
      return <span className="badge badge-danger" id="badge-huy">❌ Đã hủy</span>;
    default:
      return <span className="badge badge-info">{status}</span>;
  }
};
