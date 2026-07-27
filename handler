// handler/commandLoader.js
// Tự động quét thư mục commands/ (không đệ quy vào commands/minigames,
// vì đó là DATA riêng cho từng ngành, không phải lệnh độc lập) và
// đăng ký mọi file .js vào client.commands.
//
// Mỗi file lệnh phải export dạng:
//   module.exports = {
//       name: 'chon',              // gõ !chon để gọi
//       description: '...',
//       async execute(message, args, ctx) { ... }
//   }
// `ctx` là object tiện ích được truyền xuống (db, professions, client...).

const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');

function loadCommands(client) {
    client.commands = new Collection();

    const commandsPath = path.join(__dirname, '..', 'commands');
    const files = fs
        .readdirSync(commandsPath, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith('.js'));

    for (const file of files) {
        const filePath = path.join(commandsPath, file.name);
        delete require.cache[require.resolve(filePath)]; // hỗ trợ hot-reload khi dev
        const command = require(filePath);

        if (!command.name || typeof command.execute !== 'function') {
            console.warn(`⚠️  Bỏ qua ${file.name}: thiếu "name" hoặc "execute".`);
            continue;
        }

        client.commands.set(command.name, command);
        console.log(`   ↳ Đã nạp lệnh: !${command.name}`);
    }

    console.log(`✅ Đã nạp tổng cộng ${client.commands.size} lệnh.`);
}

module.exports = { loadCommands };
