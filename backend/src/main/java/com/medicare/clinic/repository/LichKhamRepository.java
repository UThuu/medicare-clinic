package com.medicare.clinic.repository;

import com.medicare.clinic.entity.LichKham;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LichKhamRepository extends JpaRepository<LichKham, Long> {
}
