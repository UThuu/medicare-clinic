
import { AllergyInfo, MedicalRecordResponse } from '../types/MedicalRecord';

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
  },

  addAllergy: async (idBenhNhan: string, data: { thanhPhan: string; ghiChu?: string }): Promise<AllergyInfo[]> => {
    const response = await fetch(`/api/benhnhan/${idBenhNhan}/di-ung`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || 'Lỗi khi lưu dị ứng bệnh nhân');
    }
    return response.json();
  },

  deleteAllergy: async (idBenhNhan: string, thanhPhan: string): Promise<AllergyInfo[]> => {
    const response = await fetch(
      `/api/benhnhan/${idBenhNhan}/di-ung?thanhPhan=${encodeURIComponent(thanhPhan)}`,
      { method: 'DELETE' }
    );
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || 'Lỗi khi xóa dị ứng');
    }
    return response.json();
  },
};

