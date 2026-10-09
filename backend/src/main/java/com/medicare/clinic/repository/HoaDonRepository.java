package com.medicare.clinic.repository;

import com.medicare.clinic.entity.HoaDon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HoaDonRepository extends JpaRepository<HoaDon, String> {
    Optional<HoaDon> findByLuotKham_IdLuotKham(String idLuotKham);
    boolean existsByLuotKham_IdLuotKham(String idLuotKham);
    List<HoaDon> findAllByOrderByNgayTaoDesc();
}
