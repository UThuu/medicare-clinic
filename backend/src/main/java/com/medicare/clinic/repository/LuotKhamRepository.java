package com.medicare.clinic.repository;

import com.medicare.clinic.entity.LuotKham;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LuotKhamRepository extends JpaRepository<LuotKham, Long> {
}
