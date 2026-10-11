
import { MedicalRecordResponse } from '../types/MedicalRecord';

export const medicalRecordService = {
  getMedicalRecord: async (idLichKham: string): Promise<MedicalRecordResponse> => {
    const response = await fetch(`/api/doctor/medical-record/${idLichKham}`);
    if (response.status === 401) {
        throw new Error('UNAUTHORIZED');
    }
    if (response.status === 403) {
        throw new Error('FORBIDDEN');
    }
    if (response.status === 404) {
        throw new Error('NOT_FOUND');
    }
    if (!response.ok) {
      throw new Error('Lỗi khi lấy thông tin hồ sơ bệnh nhân');
    }
    return response.json();
  }
};
