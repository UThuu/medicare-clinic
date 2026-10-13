import axios from 'axios';
import { DonThuocRequest, DonThuocResponse, CanhBaoDiUngResponse } from '../types/donThuoc';

const API_URL = 'http://localhost:8080/api/don-thuoc';

export const donThuocService = {
  kiemTraDiUng: async (idLuotKham: string, dsIdThuoc: string[]): Promise<CanhBaoDiUngResponse[]> => {
    const res = await axios.post(`${API_URL}/kiểm-tra-di-ung?idLuotKham=${idLuotKham}`, dsIdThuoc);
    return res.data;
  },

  taoDonThuoc: async (data: DonThuocRequest): Promise<DonThuocResponse> => {
    const res = await axios.post(API_URL, data);
    return res.data;
  },

  capNhatDonThuoc: async (idDonThuoc: string, data: DonThuocRequest): Promise<DonThuocResponse> => {
    const res = await axios.put(`${API_URL}/${idDonThuoc}`, data);
    return res.data;
  },

  layByLuotKham: async (idLuotKham: string): Promise<DonThuocResponse> => {
    const res = await axios.get(`${API_URL}/luot-kham/${idLuotKham}`);
    return res.data;
  },

  layHoSoCaNhan: async (idBenhNhan: string): Promise<DonThuocResponse[]> => {
    const res = await axios.get(`${API_URL}/ho-so-ca-nhan/${idBenhNhan}`);
    return res.data;
  }
};