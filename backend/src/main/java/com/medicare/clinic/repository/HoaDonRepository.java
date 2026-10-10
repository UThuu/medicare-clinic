package com.medicare.clinic.repository;

import com.medicare.clinic.entity.HoaDon;
import com.medicare.clinic.entity.enums.TrangThaiHoaDon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface HoaDonRepository extends JpaRepository<HoaDon, String> {

    @Query("""
            SELECT DISTINCT hd
            FROM HoaDon hd
            LEFT JOIN FETCH hd.luotKham lk
            LEFT JOIN FETCH lk.lichKham lich
            LEFT JOIN FETCH lich.benhNhan bn
            LEFT JOIN FETCH lich.bacSi bs
            LEFT JOIN FETCH bs.nhanVien bsNv
            LEFT JOIN FETCH hd.thuNgan tn
            LEFT JOIN FETCH tn.nhanVien tnNv
            LEFT JOIN FETCH hd.chiTietHoaDons cthd
            WHERE (:idHoaDon IS NULL OR LOWER(hd.id) LIKE LOWER(CONCAT('%', :idHoaDon, '%')))
            AND (:soDienThoai IS NULL OR LOWER(bn.soDienThoai) LIKE LOWER(CONCAT('%', :soDienThoai, '%'))) 
            AND (:tuNgay IS NULL OR hd.ngayTao >= :tuNgay)
            AND (:denNgayExclusive IS NULL OR hd.ngayTao < :denNgayExclusive)
            AND (:trangThai IS NULL OR hd.trangThai = :trangThai)
            ORDER BY hd.ngayTao DESC
            """)

    List<HoaDon> traCuuHoaDon(
            @Param("idHoaDon") String idHoaDon,
            @Param("soDienThoai") String soDienThoai,
            @Param("tuNgay") LocalDateTime tuNgay,
            @Param("denNgayExclusive") LocalDateTime denNgayExclusive,
            @Param("trangThai") TrangThaiHoaDon trangThai
    );
}
