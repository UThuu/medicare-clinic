package com.medicare.clinic.repository;

import com.medicare.clinic.entity.BenhNhan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BenhNhanRepository extends JpaRepository<BenhNhan, Long> {
}
