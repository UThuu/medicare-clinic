package com.medicare.clinic.repository;

import com.medicare.clinic.entity.LuotKham;
import com.medicare.clinic.entity.enums.TrangThaiLuotKham;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LuotKhamRepository extends JpaRepository<LuotKham, String> {

    List<LuotKham> findByTrangThaiAndLichKham_NgayKhamOrderByLichKham_GioKhamAsc(
            TrangThaiLuotKham trangThai,
            LocalDate ngayKham
    );

    boolean existsByLichKham_IdLichKham(String idLichKham);

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
}
