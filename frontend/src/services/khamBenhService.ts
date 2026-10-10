export interface SaveKhamBenhRequest {
    idLichKham: string;
    trieuChung: string;
    ketQuaKham: string;
    chanDoan: string;
}

export const khamBenhService = {
  saveKetQuaKham: async (request: SaveKhamBenhRequest): Promise<{ message: string }> => {
    const response = await fetch('/api/khambenh/ket-qua', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });
    
    if (response.status === 401) {
        throw new Error('UNAUTHORIZED');
    }
    if (response.status === 403) {
        throw new Error('FORBIDDEN');
    }
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Lỗi khi lưu kết quả khám');
    }
    return response.json();
  }
};
