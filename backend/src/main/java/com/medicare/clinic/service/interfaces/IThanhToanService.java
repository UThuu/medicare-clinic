package com.medicare.clinic.service.interfaces;

import com.medicare.clinic.dto.request.ThanhToanQrRequest;
import com.medicare.clinic.dto.request.ThanhToanTienMatRequest;
import com.medicare.clinic.dto.request.XacNhanThanhToanRequest;
import com.medicare.clinic.dto.response.GiaoDichResponse;
import com.medicare.clinic.dto.response.HoaDonResponse;
import com.medicare.clinic.dto.response.KetQuaThanhToanResponse;
import com.medicare.clinic.dto.response.ThanhToanTienMatResponse;
import com.medicare.clinic.dto.response.ThongTinQrResponse;
import com.medicare.clinic.dto.response.ThongTinThanhToanResponse;
import com.medicare.clinic.dto.response.VNPayCallbackResponse;
import com.medicare.clinic.dto.response.VNPayPaymentResponse;

import java.util.List;
import java.util.Map;

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
     * UC-18: Xác nhận thanh toán tiền mặt tại quầy (tính tiền thừa/thối lại)
     */
    ThanhToanTienMatResponse thanhToanTienMat(ThanhToanTienMatRequest request);

    /**
     * UC-19: Lấy thông tin mã VietQR để thanh toán hóa đơn tại quầy
     */
    ThongTinQrResponse layThongTinQrThanhToan(String idHoaDon);

    /**
     * UC-19: Xác nhận thanh toán qua QR/Ngân hàng thành công
     */
    KetQuaThanhToanResponse xacNhanThanhToanQr(ThanhToanQrRequest request);

    /**
     * UC-20: Khởi tạo liên kết thanh toán trực tuyến qua cổng VNPay Gateway
     */
    VNPayPaymentResponse taoGiaoDichVNPay(String idHoaDon);

    /**
     * UC-20: Xử lý và xác thực kết quả thanh toán từ VNPay Callback (IPN / Return)
     */
    VNPayCallbackResponse xuLyKetQuaVNPay(Map<String, String> vnpParams);

    /**
     * Lấy lịch sử tất cả các lần thử giao dịch thanh toán của hóa đơn
     */
    List<GiaoDichResponse> layLichSuGiaoDich(String idHoaDon);
}

