package com.medicare.clinic.repository;

import com.medicare.clinic.entity.LuotKham;
import com.medicare.clinic.entity.enums.TrangThaiLuotKham;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LuotKhamRepository
        extends JpaRepository<LuotKham, String> {

    List<LuotKham>
    findByTrangThaiAndLichKham_NgayKhamOrderByLichKham_GioKhamAsc(
            TrangThaiLuotKham trangThai,
            LocalDate ngayKham
    );

    boolean existsByLichKham_IdLichKham(String idLichKham);
}