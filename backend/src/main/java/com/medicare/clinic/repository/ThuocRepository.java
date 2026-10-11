package com.medicare.clinic.repository;

import com.medicare.clinic.entity.Thuoc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ThuocRepository extends JpaRepository<Thuoc, Long> {
}
