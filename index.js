require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

// Import hàm xử lý sự kiện từ file messageCreate.js
const handleMessageCreate = require('./event/messageCreate');

// Khởi tạo Client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Khi bot đăng nhập thành công
client.once('ready', () => {
    console.log(`✅ Bot đã sẵn sàng hoạt động dưới tên: ${client.user.tag}`);
});

// Lắng nghe sự kiện người dùng gửi tin nhắn
client.on('messageCreate', (message) => handleMessageCreate(client, message));

// Đăng nhập bot
client.login(process.env.TOKEN);
