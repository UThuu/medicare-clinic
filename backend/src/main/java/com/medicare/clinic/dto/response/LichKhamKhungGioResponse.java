package com.medicare.clinic.dto.response;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
public record LichKhamKhungGioResponse(String maBacSi, LocalDate ngayKham, List<LocalTime> gioTrong, List<LocalDate> ngayGoiY) {}
