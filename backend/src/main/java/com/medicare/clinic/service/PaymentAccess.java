package com.medicare.clinic.service;
import com.medicare.clinic.dto.response.LoginResponse;
import com.medicare.clinic.entity.HoaDon;
import com.medicare.clinic.repository.HoaDonRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
@Service @RequiredArgsConstructor
public class PaymentAccess {
    private final HoaDonRepository invoices;
    public LoginResponse user(HttpServletRequest request) {
        var session=request.getSession(false);
        if(session==null || !(session.getAttribute("AUTH_USER") instanceof LoginResponse u)) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Vui lòng đăng nhập");
        return u;
    }
    public LoginResponse cashier(HttpServletRequest request) {
        LoginResponse u=user(request);
        if(!"THU_NGAN".equals(u.getVaiTro())) throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Chỉ thu ngân được thực hiện thao tác này");
        return u;
    }
    public LoginResponse patient(HttpServletRequest request) {
        LoginResponse u=user(request);
        if(!"BENH_NHAN".equals(u.getVaiTro()) || u.getIdBenhNhan()==null) throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Tài khoản chưa liên kết hồ sơ khách hàng");
        return u;
    }
    public HoaDon own(HttpServletRequest request,String id) {
        LoginResponse u=patient(request);
        return invoices.findByIdAndLuotKham_LichKham_BenhNhan_IdBenhNhan(id,u.getIdBenhNhan()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Không tìm thấy hóa đơn của bạn"));
    }
    public void view(HttpServletRequest request,String id) {
        if("THU_NGAN".equals(user(request).getVaiTro())) cashier(request); else own(request,id);
    }
}
