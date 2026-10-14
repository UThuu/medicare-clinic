package com.medicare.clinic.repository;

import com.medicare.clinic.entity.ThuNgan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ThuNganRepository extends JpaRepository<ThuNgan, String> {
}
