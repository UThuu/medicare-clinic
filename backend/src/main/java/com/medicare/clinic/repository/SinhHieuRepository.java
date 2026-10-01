package com.medicare.clinic.repository;

import com.medicare.clinic.entity.SinhHieu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SinhHieuRepository extends JpaRepository<SinhHieu, Long> {
}
