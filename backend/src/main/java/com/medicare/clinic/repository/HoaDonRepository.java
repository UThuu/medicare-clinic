package com.medicare.clinic.repository;
import com.medicare.clinic.entity.HoaDon;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface HoaDonRepository extends JpaRepository<HoaDon, String> {
    Optional<HoaDon> findByLuotKham_IdLuotKham(String id);
    boolean existsByLuotKham_IdLuotKham(String id);
    List<HoaDon> findAllByOrderByNgayTaoDesc();
    java.util.Optional<HoaDon> findByIdAndLuotKham_LichKham_BenhNhan_IdBenhNhan(String id, String patientId);
    java.util.List<HoaDon> findByLuotKham_LichKham_BenhNhan_IdBenhNhanOrderByNgayTaoDesc(String patientId);
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select h from HoaDon h where h.id = :id")
    java.util.Optional<HoaDon> findForPayment(@org.springframework.data.repository.query.Param("id") String id);

    @org.springframework.data.jpa.repository.Query(value = """
        select hd from HoaDon hd
        left join fetch hd.luotKham lk
        left join fetch lk.lichKham lich
        left join fetch lich.benhNhan bn
        left join fetch lich.bacSi bs
        left join fetch bs.nhanVien
        left join fetch hd.thuNgan tn
        left join fetch tn.nhanVien
        where (:idHoaDon is null or lower(hd.id) like lower(concat('%', :idHoaDon, '%')))
          and (:soDienThoai is null or bn.soDienThoai like concat('%', :soDienThoai, '%'))
          and (:tuNgay is null or hd.ngayTao >= :tuNgay)
          and (:denNgayExclusive is null or hd.ngayTao < :denNgayExclusive)
          and (:trangThai is null or hd.trangThai = :trangThai)
        order by hd.ngayTao desc, hd.id desc
        """, countQuery = """
        select count(hd) from HoaDon hd
        left join hd.luotKham lk left join lk.lichKham lich left join lich.benhNhan bn
        where (:idHoaDon is null or lower(hd.id) like lower(concat('%', :idHoaDon, '%')))
          and (:soDienThoai is null or bn.soDienThoai like concat('%', :soDienThoai, '%'))
          and (:tuNgay is null or hd.ngayTao >= :tuNgay)
          and (:denNgayExclusive is null or hd.ngayTao < :denNgayExclusive)
          and (:trangThai is null or hd.trangThai = :trangThai)
        """)
    org.springframework.data.domain.Page<HoaDon> traCuuHoaDon(
        @org.springframework.data.repository.query.Param("idHoaDon") String idHoaDon,
        @org.springframework.data.repository.query.Param("soDienThoai") String soDienThoai,
        @org.springframework.data.repository.query.Param("tuNgay") java.time.LocalDateTime tuNgay,
        @org.springframework.data.repository.query.Param("denNgayExclusive") java.time.LocalDateTime denNgayExclusive,
        @org.springframework.data.repository.query.Param("trangThai") com.medicare.clinic.entity.enums.TrangThaiHoaDon trangThai,
        org.springframework.data.domain.Pageable pageable);

    interface RevenueSummary {
        java.math.BigDecimal getTongDoanhThu();
        long getSoHoaDonDaThanhToan();
    }
    @org.springframework.data.jpa.repository.Query("""
        select coalesce(sum(h.tongTien), 0) as tongDoanhThu,
               count(h) as soHoaDonDaThanhToan
        from HoaDon h
        where h.trangThai = com.medicare.clinic.entity.enums.TrangThaiHoaDon.DA_THANH_TOAN
          and (select min(g.thoiGian) from GiaoDichThanhToan g
               where g.thanhToan.hoaDon = h
                 and g.trangThai = com.medicare.clinic.entity.enums.TrangThaiXuLyThanhToan.THANH_CONG) >= :start
          and (select min(g.thoiGian) from GiaoDichThanhToan g
               where g.thanhToan.hoaDon = h
                 and g.trangThai = com.medicare.clinic.entity.enums.TrangThaiXuLyThanhToan.THANH_CONG) < :end
        """)
    RevenueSummary tongDoanhThu(
        @org.springframework.data.repository.query.Param("start") java.time.LocalDateTime start,
        @org.springframework.data.repository.query.Param("end") java.time.LocalDateTime end);
}
