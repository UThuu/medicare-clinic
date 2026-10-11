package com.medicare.clinic.repository;

import com.medicare.clinic.entity.BenhNhan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
    @Query("select b from BenhNhan b where " +
            "replace(replace(replace(replace(replace(trim(b.soDienThoai), ' ', ''), '-', ''), '.', ''), '(', ''), ')', '') like concat('%', :phone, '%')")
    List<BenhNhan> findByNormalizedPhoneContaining(@Param("phone") String phone);

    @Query("select b from BenhNhan b where " +
            "replace(replace(replace(replace(replace(trim(b.soDienThoai), ' ', ''), '-', ''), '.', ''), '(', ''), ')', '') = :phone")
    List<BenhNhan> findByNormalizedPhone(@Param("phone") String phone);
}
