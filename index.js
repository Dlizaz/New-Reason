require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const handleMessageCreate = require('./event/messageCreate');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Sử dụng clientReady chuẩn theo khuyến nghị mới của Discord.js
client.once('clientReady', () => {
    console.log(`✅ Bot đã sẵn sàng hoạt động dưới tên: ${client.user.tag}`);
});

client.on('messageCreate', (message) => handleMessageCreate(client, message));

client.login(process.env.TOKEN);
