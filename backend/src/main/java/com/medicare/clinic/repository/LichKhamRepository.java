package com.medicare.clinic.repository;

import com.medicare.clinic.entity.LichKham;
import com.medicare.clinic.entity.enums.TrangThaiLichKham;
import com.medicare.clinic.entity.enums.TrangThaiLuotKham;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LichKhamRepository extends JpaRepository<LichKham, String> {

    List<LichKham> findByBenhNhan_IdBenhNhanAndNgayKhamOrderByGioKhamAsc(
            String idBenhNhan,
            LocalDate ngayKham
    );

    List<LichKham> findByBenhNhan_IdBenhNhanAndNgayKhamAndTrangThaiOrderByGioKhamAsc(
            String idBenhNhan,
            LocalDate ngayKham,
            TrangThaiLichKham trangThai
    );

    @Query("SELECT lk FROM LichKham lk " +
            "LEFT JOIN FETCH lk.luotKham " +
            "JOIN FETCH lk.benhNhan " +
            "WHERE lk.bacSi.maNv = :maNv AND lk.ngayKham = :ngayKham " +
            "ORDER BY lk.gioKham ASC, lk.idLichKham ASC")
    List<LichKham> findScheduleByDoctorAndDate(@Param("maNv") String maNv, @Param("ngayKham") LocalDate ngayKham);

    // Danh sách dùng chung cho bác sĩ và điều dưỡng: chỉ lượt khám đang chờ khám.
    @Query("SELECT lk FROM LichKham lk " +
            "JOIN FETCH lk.luotKham luot " +
            "JOIN FETCH lk.benhNhan " +
            "WHERE lk.ngayKham = :ngayKham " +
            "AND luot.trangThai = :trangThai " +
            "ORDER BY lk.gioKham ASC, lk.idLichKham ASC")
    List<LichKham> findWaitingSchedulesByDate(
            @Param("ngayKham") LocalDate ngayKham,
            @Param("trangThai") TrangThaiLuotKham trangThai
    );

}
