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
}
