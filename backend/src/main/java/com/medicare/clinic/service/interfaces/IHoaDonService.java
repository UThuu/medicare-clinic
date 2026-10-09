package com.medicare.clinic.service.interfaces;

import com.medicare.clinic.dto.request.TaoHoaDonRequest;
import com.medicare.clinic.dto.response.ChiPhiKhamPreviewResponse;
import com.medicare.clinic.dto.response.HoaDonResponse;
import com.medicare.clinic.dto.response.LuotKhamChoHoaDonResponse;

import java.util.List;

public interface IHoaDonService {
    /**
     * Lấy danh sách các lượt khám đã hoàn tất khám / kê đơn nhưng chưa lập hóa đơn
     */
    List<LuotKhamChoHoaDonResponse> layDanhSachLuotKhamChoLapHoaDon();

    /**
     * UC-16: Tính toán và xem trước các khoản chi phí (tiền khám, tiền thuốc, tổng tiền)
     */
    ChiPhiKhamPreviewResponse layChiPhiDuKien(String idLuotKham);

    /**
     * UC-15: Lập và lưu hóa đơn cho lượt khám
     */
    HoaDonResponse taoHoaDon(TaoHoaDonRequest request);

    /**
     * Xem chi tiết hóa đơn theo ID hóa đơn
     */
    HoaDonResponse layHoaDonTheoId(String idHoaDon);

    /**
     * Lấy hóa đơn của một lượt khám cụ thể
     */
    HoaDonResponse layHoaDonTheoLuotKham(String idLuotKham);

    /**
     * Lấy danh sách tất cả hóa đơn đã lập
     */
    List<HoaDonResponse> layDanhSachTatCaHoaDon();
}
