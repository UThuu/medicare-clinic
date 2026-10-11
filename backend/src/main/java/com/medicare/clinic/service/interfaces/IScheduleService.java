package com.medicare.clinic.service.interfaces;

import com.medicare.clinic.dto.response.DoctorScheduleResponse;
import java.time.LocalDate;
import java.util.List;

public interface IScheduleService {
    List<DoctorScheduleResponse> getDoctorSchedule(String maNv, LocalDate ngayKham);
}
