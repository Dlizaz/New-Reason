// data/items/index.js
// Gom item của tất cả ngành lại thành 1 map { professionId: [items] }.
// Ngành nào CHƯA có file data/items/<id>.js sẽ tự động bị bỏ qua (không
// crash bot) — khi bạn thêm file mới, chỉ cần restart bot là roll nhận
// diện ngành đó ngay, không phải sửa code roll.js.

const fs = require('fs');
const path = require('path');
const professions = require('../professions');

const itemsByProfession = {};
const missingProfessions = [];

for (const prof of professions) {
    const filePath = path.join(__dirname, `${prof.id}.js`);
    if (fs.existsSync(filePath)) {
        itemsByProfession[prof.id] = require(filePath);
    } else {
        missingProfessions.push(prof.id);
    }
}

if (missingProfessions.length > 0) {
    console.warn(
        `⚠️  Chưa có dữ liệu vật phẩm cho ${missingProfessions.length} ngành: ${missingProfessions.join(', ')}. ` +
            `Thêm file data/items/<id>.js để kích hoạt roll cho các ngành này.`
    );
}

/** Danh sách id các ngành ĐÃ có dữ liệu item (dùng để roll được). */
const availableProfessionIds = Object.keys(itemsByProfession);

module.exports = { itemsByProfession, availableProfessionIds, missingProfessions };
