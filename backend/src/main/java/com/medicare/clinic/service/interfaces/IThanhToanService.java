package com.medicare.clinic.service.interfaces;

import com.medicare.clinic.dto.request.XacNhanThanhToanRequest;
import com.medicare.clinic.dto.response.GiaoDichResponse;
import com.medicare.clinic.dto.response.HoaDonResponse;
import com.medicare.clinic.dto.response.KetQuaThanhToanResponse;
import com.medicare.clinic.dto.response.ThongTinThanhToanResponse;

import java.util.List;

public interface IThanhToanService {

    /**
     * Lấy danh sách các hóa đơn chưa thanh toán chờ xử lý tại quầy
     */
    List<HoaDonResponse> layDanhSachHoaDonChuaThanhToan();

    /**
     * Lấy chi tiết thông tin thanh toán của một hóa đơn kèm lịch sử giao dịch
     */
    ThongTinThanhToanResponse layThongTinThanhToan(String idHoaDon);

    /**
     * UC-17: Xác nhận thanh toán cho một hóa đơn
     */
    KetQuaThanhToanResponse xacNhanThanhToan(XacNhanThanhToanRequest request);

    /**
     * Lấy lịch sử tất cả các lần thử giao dịch thanh toán của hóa đơn
     */
    List<GiaoDichResponse> layLichSuGiaoDich(String idHoaDon);
}
