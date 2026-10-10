package com.medicare.clinic.repository;

import com.medicare.clinic.entity.HoaDon;
import com.medicare.clinic.entity.enums.TrangThaiHoaDon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface HoaDonRepository extends JpaRepository<HoaDon, String> {

    List<HoaDon> findByTrangThaiAndNgayTaoGreaterThanEqualAndNgayTaoLessThan(
            TrangThaiHoaDon trangThai,
            LocalDateTime tuThoiDiem,
            LocalDateTime denThoiDiem
    );
}
