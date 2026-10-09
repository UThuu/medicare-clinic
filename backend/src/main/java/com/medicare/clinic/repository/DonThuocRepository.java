package com.medicare.clinic.repository;

import com.medicare.clinic.entity.DonThuoc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DonThuocRepository extends JpaRepository<DonThuoc, String> {
    Optional<DonThuoc> findByLuotKham_IdLuotKham(String idLuotKham);
}
