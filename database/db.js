// database/db.js
// Lưu trữ dữ liệu người chơi trên PostgreSQL (web), thay cho SQLite cục bộ.
// Kết nối qua biến môi trường DATABASE_URL (khai báo trong .env).
//
// LƯU Ý QUAN TRỌNG: mọi hàm ở đây đều là ASYNC (trả về Promise) vì Postgres
// giao tiếp qua mạng, không đọc/ghi ổ đĩa tức thời như SQLite. Bất kỳ đâu
// gọi các hàm này đều phải dùng `await`.

const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Hầu hết dịch vụ Postgres free (Supabase, Neon, Railway...) yêu cầu SSL.
    // rejectUnauthorized: false vì các dịch vụ này thường dùng chứng chỉ tự ký.
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
    console.error('❌ Lỗi kết nối PostgreSQL (idle client):', err);
});

// ---------------------------------------------------------------
// Khởi tạo bảng — gọi 1 lần lúc bot start (xem index.js), an toàn khi
// chạy lại nhiều lần nhờ IF NOT EXISTS.
// ---------------------------------------------------------------
async function init() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            user_id     TEXT PRIMARY KEY,
            profession  TEXT,
            credits     INTEGER NOT NULL DEFAULT 1000,
            pity        INTEGER NOT NULL DEFAULT 0,
            created_at  BIGINT NOT NULL
        );
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS inventory (
            id           SERIAL PRIMARY KEY,
            user_id      TEXT NOT NULL REFERENCES users(user_id),
            item_name    TEXT NOT NULL,
            rarity       TEXT NOT NULL,
            profession   TEXT NOT NULL,
            quantity     INTEGER NOT NULL DEFAULT 1,
            UNIQUE(user_id, item_name)
        );
    `);

    console.log('✅ Đã kết nối PostgreSQL và đảm bảo bảng users/inventory tồn tại.');
}

// ---------------------------------------------------------------
// API công khai — các file command chỉ nên gọi qua các hàm này (đều
// phải await), không tự viết SQL trực tiếp.
// ---------------------------------------------------------------

/** Lấy user, tự động tạo mới nếu chưa tồn tại. */
async function getOrCreateUser(userId) {
    const found = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);
    if (found.rows[0]) return found.rows[0];

    await pool.query(
        'INSERT INTO users (user_id, credits, pity, created_at) VALUES ($1, 1000, 0, $2) ON CONFLICT (user_id) DO NOTHING',
        [userId, Date.now()]
    );
    const created = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);
    return created.rows[0];
}

/** Gán ngành nghề cho user. */
async function setProfession(userId, professionId) {
    await getOrCreateUser(userId);
    await pool.query('UPDATE users SET profession = $1 WHERE user_id = $2', [professionId, userId]);
}

/** Cộng (hoặc trừ nếu số âm) tín dụng, trả về số dư mới. */
async function addCredits(userId, amount) {
    const user = await getOrCreateUser(userId);
    const newCredits = Math.max(0, user.credits + amount);
    await pool.query('UPDATE users SET credits = $1 WHERE user_id = $2', [newCredits, userId]);
    return newCredits;
}

/** Đặt lại bộ đếm bảo hiểm (pity) — dùng cho hệ thống roll. */
async function setPity(userId, value) {
    await getOrCreateUser(userId);
    await pool.query('UPDATE users SET pity = $1 WHERE user_id = $2', [value, userId]);
}

/**
 * Thêm 1 vật phẩm vào túi đồ. Nếu đã sở hữu thì tăng quantity.
 * Trả về { isDuplicate, quantity }.
 */
async function addItemToInventory(userId, item, ownerProfessionId) {
    await getOrCreateUser(userId);

    const existing = await pool.query(
        'SELECT * FROM inventory WHERE user_id = $1 AND item_name = $2',
        [userId, item.name]
    );

    if (existing.rows[0]) {
        await pool.query(
            'UPDATE inventory SET quantity = quantity + 1 WHERE user_id = $1 AND item_name = $2',
            [userId, item.name]
        );
        return { isDuplicate: true, quantity: existing.rows[0].quantity + 1 };
    }

    await pool.query(
        'INSERT INTO inventory (user_id, item_name, rarity, profession, quantity) VALUES ($1, $2, $3, $4, 1)',
        [userId, item.name, item.rarity, ownerProfessionId]
    );
    return { isDuplicate: false, quantity: 1 };
}

/** Lấy toàn bộ túi đồ của user. */
async function getInventory(userId) {
    const { rows } = await pool.query(
        'SELECT * FROM inventory WHERE user_id = $1 ORDER BY rarity, item_name',
        [userId]
    );
    return rows;
}

module.exports = {
    pool, // dùng khi cần truy vấn đặc biệt ngoài các hàm sẵn có
    init,
    getOrCreateUser,
    setProfession,
    addCredits,
    setPity,
    addItemToInventory,
    getInventory,
};
