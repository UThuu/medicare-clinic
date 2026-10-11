package com.medicare.clinic.repository;
import com.medicare.clinic.entity.HoaDon;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface HoaDonRepository extends JpaRepository<HoaDon, String> {
    Optional<HoaDon> findByLuotKham_IdLuotKham(String id);
    boolean existsByLuotKham_IdLuotKham(String id);
    List<HoaDon> findAllByOrderByNgayTaoDesc();
}
