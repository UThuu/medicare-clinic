package com.medicare.clinic.repository;

import com.medicare.clinic.entity.BenhNhan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BenhNhanRepository
        extends JpaRepository<BenhNhan, String> {

    List<BenhNhan> findBySoDienThoaiContainingIgnoreCase(
            String soDienThoai
    );

    List<BenhNhan> findByHoTenContainingIgnoreCaseAndNgaySinh(
            String hoTen,
            LocalDate ngaySinh
    );

    Optional<BenhNhan> findBySoDienThoai(
            String soDienThoai
    );
}