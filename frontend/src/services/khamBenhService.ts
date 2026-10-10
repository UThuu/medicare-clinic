export interface SaveKhamBenhRequest {
    idLichKham: string;
    trieuChung: string;
    ketQuaKham: string;
    chanDoan: string;
}

async function post(path: string, body?: SaveKhamBenhRequest): Promise<{ message: string }> {
    const response = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
    });
    if (response.status === 401) throw new Error('Vui lòng đăng nhập lại.');
    if (response.status === 403) throw new Error('Bạn không có quyền khám bệnh.');
    if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || 'Không thể thực hiện khám bệnh. Vui lòng thử lại.');
    }
    return response.json();
}

export const khamBenhService = {
    startKhamBenh: (idLichKham: string) => post(`/api/khambenh/${encodeURIComponent(idLichKham)}/bat-dau`),
    saveKetQuaKham: (request: SaveKhamBenhRequest) => post('/api/khambenh/ket-qua', request),
};
