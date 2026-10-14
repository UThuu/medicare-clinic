package com.medicare.clinic.repository;

import com.medicare.clinic.entity.ChiTietDonThuoc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChiTietDonThuocRepository extends JpaRepository<ChiTietDonThuoc, String> {
    List<ChiTietDonThuoc> findByDonThuoc_Id(String idDonThuoc);
    void deleteByDonThuoc_Id(String idDonThuoc);
}
