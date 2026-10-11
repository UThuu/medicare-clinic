package com.medicare.clinic.repository;

import com.medicare.clinic.entity.LichKham;
import com.medicare.clinic.entity.enums.TrangThaiLichKham;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LichKhamRepository extends JpaRepository<LichKham, String> {
    boolean existsByBacSi_MaNvAndNgayKhamAndGioKhamAndTrangThaiNot(
            String maBacSi, java.time.LocalDate ngayKham, java.time.LocalTime gioKham,
            com.medicare.clinic.entity.enums.TrangThaiLichKham trangThai);


    @Query("select l.gioKham from LichKham l where l.bacSi.maNv = :doctor and l.ngayKham = :date and l.trangThai <> :cancelled")
    List<java.time.LocalTime> findOccupiedTimes(@Param("doctor") String doctor, @Param("date") LocalDate date,
                                               @Param("cancelled") TrangThaiLichKham cancelled);

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

    @Query("SELECT lk FROM LichKham lk " +
           "JOIN FETCH lk.benhNhan " +
           "JOIN FETCH lk.bacSi " +
           "LEFT JOIN FETCH lk.luotKham " +
           "WHERE lk.idLichKham = :idLichKham")
    java.util.Optional<LichKham> findByIdWithDetails(@Param("idLichKham") String idLichKham);
}
