package com.medicare.clinic.repository;

import com.medicare.clinic.entity.LuotKham;
import com.medicare.clinic.entity.enums.TrangThaiLuotKham;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LuotKhamRepository
        extends JpaRepository<LuotKham, String> {

    List<LuotKham>
    findByTrangThaiAndLichKham_NgayKhamOrderByLichKham_GioKhamAsc(
            TrangThaiLuotKham trangThai,
            LocalDate ngayKham
    );

    boolean existsByLichKham_IdLichKham(String idLichKham);

    java.util.Optional<LuotKham> findByLichKham_IdLichKham(String idLichKham);

    @Query("SELECT l FROM LuotKham l " +
           "JOIN FETCH l.lichKham lk " +
           "JOIN FETCH lk.bacSi bs " +
           "WHERE lk.benhNhan.idBenhNhan = :idBenhNhan " +
           "AND lk.idLichKham != :currentLichKhamId " +
           "ORDER BY lk.ngayKham DESC, lk.gioKham DESC")
    List<LuotKham> findHistoryByBenhNhanId(
            @Param("idBenhNhan") String idBenhNhan, 
            @Param("currentLichKhamId") String currentLichKhamId);
    @Query("SELECT bs.maNv, nv.hoTen, bs.chuyenKhoa, bs.bangCap, " +
           "COUNT(l.idLuotKham), MAX(lk.ngayKham) " +
           "FROM LuotKham l " +
           "JOIN l.lichKham lk " +
           "JOIN lk.bacSi bs " +
           "JOIN bs.nhanVien nv " +
           "WHERE lk.benhNhan.idBenhNhan = :idBenhNhan AND l.trangThai = :trangThai " +
           "GROUP BY bs.maNv, nv.hoTen, bs.chuyenKhoa, bs.bangCap " +
           "ORDER BY COUNT(l.idLuotKham) DESC, MAX(lk.ngayKham) DESC")
    List<Object[]> findDoctorHistoryByPatient(
            @Param("idBenhNhan") String idBenhNhan,
            @Param("trangThai") TrangThaiLuotKham trangThai
    );


    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT l FROM LuotKham l WHERE l.idLuotKham = :id")
    java.util.Optional<LuotKham> findForBilling(@Param("id") String id);

    @Query("SELECT l FROM LuotKham l WHERE l.trangThai = :status " +
           "AND NOT EXISTS (SELECT h.id FROM HoaDon h WHERE h.luotKham = l) " +
           "ORDER BY l.lichKham.ngayKham DESC, l.lichKham.gioKham DESC")
    List<LuotKham> findReadyForBilling(@Param("status") TrangThaiLuotKham status);
}
