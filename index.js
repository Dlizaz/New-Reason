require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { loadCommands } = require('./handler/commandLoader');
const handleMessageCreate = require('./event/messageCreate');
const db = require('./database/db');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

loadCommands(client);

client.once('clientReady', () => {
    console.log(`✅ Bot đã sẵn sàng hoạt động dưới tên: ${client.user.tag}`);
});

client.on('messageCreate', (message) => handleMessageCreate(client, message, db));

// Bọc trong async IIFE vì db.init() và client.login() đều là Promise —
// phải chắc chắn kết nối PostgreSQL thành công trước khi bot bắt đầu nhận lệnh.
(async () => {
    try {
        await db.init();
        await client.login(process.env.TOKEN);
    } catch (err) {
        console.error('❌ Không thể khởi động bot:', err);
        process.exit(1);
    }
})();
