// index.js
// Entry point chính: khởi tạo Discord Client, kết nối PostgreSQL,
// nạp toàn bộ command trong commands/ và lắng nghe sự kiện messageCreate.

require('dotenv').config();

const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { loadCommands } = require('./handler/commandLoader');
const messageCreateHandler = require('./event/messageCreate');
const db = require('./database/db');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
    ],
    partials: [Partials.Channel, Partials.Message],
});

async function main() {
    // 1. Nạp toàn bộ lệnh vào client.commands
    loadCommands(client);

    // 2. Đảm bảo bảng users/inventory tồn tại trên PostgreSQL
    await db.init();

    // 3. Lắng nghe sự kiện tin nhắn (prefix "!")
    client.on('messageCreate', (message) => messageCreateHandler(client, message, db));

    // 4. Log khi bot online thành công
    client.once('ready', () => {
        console.log(`✅ Đã đăng nhập với tên ${client.user.tag}`);
    });

    // 5. Đăng nhập vào Discord bằng token trong biến môi trường
    await client.login(process.env.TOKEN);
}

main().catch((err) => {
    console.error('❌ Lỗi khởi động bot:', err);
    process.exit(1);
});
