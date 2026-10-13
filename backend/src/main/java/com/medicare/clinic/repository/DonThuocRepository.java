package com.medicare.clinic.repository;

import com.medicare.clinic.entity.DonThuoc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DonThuocRepository extends JpaRepository<DonThuoc, Long> {
}
