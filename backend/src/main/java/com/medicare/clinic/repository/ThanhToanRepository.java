package com.medicare.clinic.repository;

import com.medicare.clinic.entity.ThanhToan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ThanhToanRepository extends JpaRepository<ThanhToan, String> {
    Optional<ThanhToan> findByHoaDon_Id(String idHoaDon);
}
