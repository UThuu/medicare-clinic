package com.medicare.clinic.repository;

import com.medicare.clinic.entity.TaiKhoan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaiKhoanRepository extends JpaRepository<TaiKhoan, String> {
    Optional<TaiKhoan> findByTenDangNhap(String tenDangNhap);

    @Query(value = "SELECT 'BAC_SI' AS vai_tro FROM bac_si WHERE ma_nv = :maNv " +
                   "UNION ALL " +
                   "SELECT 'DIEU_DUONG' AS vai_tro FROM dieu_duong WHERE ma_nv = :maNv " +
                   "UNION ALL " +
                   "SELECT 'LE_TAN' AS vai_tro FROM le_tan WHERE ma_nv = :maNv " +
                   "UNION ALL " +
                   "SELECT 'THU_NGAN' AS vai_tro FROM thu_ngan WHERE ma_nv = :maNv", 
           nativeQuery = true)
    List<String> findVaiTroByMaNv(@Param("maNv") String maNv);
}
