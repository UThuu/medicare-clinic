package com.medicare.clinic.repository;

import com.medicare.clinic.entity.BenhNhanDiUng;
import com.medicare.clinic.entity.BenhNhanDiUngId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BenhNhanDiUngRepository extends JpaRepository<BenhNhanDiUng, BenhNhanDiUngId> {
    List<BenhNhanDiUng> findByBenhNhan_IdBenhNhan(String idBenhNhan);
}
