export interface LoginRequest {
  tenDangNhap: string;
  matKhau: string;
}

export interface LoginResponse {
  idTaiKhoan: string;
  tenDangNhap: string;
  hoTen: string;
  vaiTro: 'BAC_SI' | 'DIEU_DUONG' | 'LE_TAN' | 'THU_NGAN' | 'BENH_NHAN';
  maNv: string | null;
  idBenhNhan: string | null;
}
