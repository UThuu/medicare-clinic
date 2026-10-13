/** Request DTO cho UC23 - Xem tổng doanh thu. Ngày được gửi theo yyyy-MM-dd. */
export interface HoaDonTongDoanhThuRequest {
  tuNgay: string;
  denNgay: string;
}

/** Response DTO tương ứng HoaDonTongDoanhThuResponse ở backend. */
export interface HoaDonTongDoanhThuResponse {
  tuNgay: string;
  denNgay: string;
  /** Jackson thường trả BigDecimal dạng number; chấp nhận string để an toàn với cấu hình serializer khác. */
  tongDoanhThu: number | string;
  soHoaDonDaThanhToan: number;
  thongBao: string;
}
