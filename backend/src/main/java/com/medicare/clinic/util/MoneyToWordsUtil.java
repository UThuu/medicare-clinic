package com.medicare.clinic.util;

import java.math.BigDecimal;

public class MoneyToWordsUtil {

    private static final String[] DIGITS = {
            "không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"
    };

    private static final String[] UNITS = {
            "", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"
    };

    /**
     * Chuyển số tiền BigDecimal sang chuỗi tiếng Việt có chữ cái đầu viết hoa
     * Ví dụ: 150000 -> "Một trăm năm mươi nghìn đồng chẵn"
     */
    public static String docSoTien(BigDecimal soTien) {
        if (soTien == null || soTien.compareTo(BigDecimal.ZERO) == 0) {
            return "Không đồng";
        }

        long amount = soTien.longValue();
        if (amount < 0) {
            return "Âm " + docSoTien(soTien.abs());
        }

        StringBuilder result = new StringBuilder();
        int unitIndex = 0;

        while (amount > 0) {
            int block = (int) (amount % 1000);
            if (block > 0) {
                String blockText = docBlockBaSo(block, amount >= 1000);
                String unit = UNITS[unitIndex];
                if (!unit.isEmpty()) {
                    blockText += " " + unit;
                }
                if (result.length() > 0) {
                    result.insert(0, blockText + " ");
                } else {
                    result.insert(0, blockText);
                }
            }
            amount /= 1000;
            unitIndex++;
        }

        String raw = result.toString().trim() + " đồng chẵn";
        // Viết hoa chữ cái đầu tiên
        return Character.toUpperCase(raw.charAt(0)) + raw.substring(1);
    }

    private static String docBlockBaSo(int n, boolean coHangNghinPhiaSau) {
        int tram = n / 100;
        int chuc = (n % 100) / 10;
        int donVi = n % 10;

        StringBuilder sb = new StringBuilder();

        if (tram > 0 || coHangNghinPhiaSau) {
            sb.append(DIGITS[tram]).append(" trăm");
        }

        if (chuc > 1) {
            if (sb.length() > 0) sb.append(" ");
            sb.append(DIGITS[chuc]).append(" mươi");
            if (donVi == 1) {
                sb.append(" mốt");
            } else if (donVi == 5) {
                sb.append(" lăm");
            } else if (donVi > 0) {
                sb.append(" ").append(DIGITS[donVi]);
            }
        } else if (chuc == 1) {
            if (sb.length() > 0) sb.append(" ");
            sb.append("mười");
            if (donVi == 5) {
                sb.append(" lăm");
            } else if (donVi > 0) {
                sb.append(" ").append(DIGITS[donVi]);
            }
        } else { // chuc == 0
            if (donVi > 0) {
                if (sb.length() > 0) {
                    sb.append(" lẻ ").append(DIGITS[donVi]);
                } else {
                    sb.append(DIGITS[donVi]);
                }
            }
        }

        return sb.toString();
    }
}
