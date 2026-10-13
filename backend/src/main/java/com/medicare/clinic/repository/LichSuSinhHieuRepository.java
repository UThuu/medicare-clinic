package com.medicare.clinic.repository;

import com.medicare.clinic.entity.LichSuSinhHieu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LichSuSinhHieuRepository extends JpaRepository<LichSuSinhHieu, String> {
}
