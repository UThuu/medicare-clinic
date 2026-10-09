package com.medicare.clinic.repository;

import com.medicare.clinic.entity.LuotKham;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LuotKhamRepository extends JpaRepository<LuotKham, String> {
    List<LuotKham> findByTrangThai(String trangThai);

    @Query("SELECT lk FROM LuotKham lk WHERE lk.idLuotKham NOT IN (SELECT hd.luotKham.idLuotKham FROM HoaDon hd WHERE hd.trangThai <> 'HUY') AND lk.trangThai IN ('CHO_THANH_TOAN', 'DANG_KHAM', 'HOAN_TAT') ORDER BY lk.lichKham.ngayKham DESC, lk.lichKham.gioKham DESC")
    List<LuotKham> findLuotKhamChoLapHoaDon();
}
