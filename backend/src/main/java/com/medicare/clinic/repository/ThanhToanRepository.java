package com.medicare.clinic.repository;

import com.medicare.clinic.entity.ThanhToan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ThanhToanRepository extends JpaRepository<ThanhToan, String> {
    java.util.Optional<ThanhToan> findByHoaDon_Id(String invoiceId);
}
