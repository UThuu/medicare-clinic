package com.medicare.clinic.repository;

import com.medicare.clinic.entity.BacSi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BacSiRepository extends JpaRepository<BacSi, String> {
    @org.springframework.data.jpa.repository.Query("select b from BacSi b join fetch b.nhanVien n order by n.hoTen, b.maNv")
    java.util.List<BacSi> findDoctorsWithNames();
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select b from BacSi b where b.maNv = :doctor")
    java.util.Optional<BacSi> lockForBooking(@org.springframework.data.repository.query.Param("doctor") String doctor);
}
