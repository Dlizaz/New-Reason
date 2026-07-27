// data/rarityConfig.js
// Cấu hình tập trung cho 3 bậc độ hiếm — icon/màu/tỷ lệ đều lấy từ đây,
// không hard-code rải rác trong từng file item nữa.

module.exports = {
    SSR: { label: 'SSR', chance: 5, color: 0xe74c3c, icon: '🌟' },
    SR: { label: 'SR', chance: 25, color: 0x9b59b6, icon: '🔷' },
    R: { label: 'R', chance: 70, color: 0x95a5a6, icon: '⚪' },
};

// Thứ tự ưu tiên khi cần fallback (vd ngành chưa có item ở 1 bậc nào đó)
module.exports.ORDER = ['SSR', 'SR', 'R'];
