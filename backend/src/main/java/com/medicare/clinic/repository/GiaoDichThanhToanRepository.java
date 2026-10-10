package com.medicare.clinic.repository;

import com.medicare.clinic.entity.GiaoDichThanhToan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GiaoDichThanhToanRepository extends JpaRepository<GiaoDichThanhToan, String> {
    List<GiaoDichThanhToan> findByThanhToan_IdOrderByThoiGianDesc(String idThanhToan);
    List<GiaoDichThanhToan> findByThanhToan_HoaDon_IdOrderByThoiGianDesc(String idHoaDon);
}
