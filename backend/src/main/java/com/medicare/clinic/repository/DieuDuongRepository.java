package com.medicare.clinic.repository;

import com.medicare.clinic.entity.DieuDuong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DieuDuongRepository extends JpaRepository<DieuDuong, String> {
}