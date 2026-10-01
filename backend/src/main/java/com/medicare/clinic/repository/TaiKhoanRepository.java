package com.medicare.clinic.repository;

import com.medicare.clinic.entity.TaiKhoan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TaiKhoanRepository extends JpaRepository<TaiKhoan, Long> {
    // Optional<TaiKhoan> findByUsername(String username); // To be defined based on entity fields
}
