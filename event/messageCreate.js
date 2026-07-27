// event/messageCreate.js
// Chỉ chịu trách nhiệm: nhận diện prefix "!", tách tên lệnh, tìm trong
// client.commands (được nạp bởi handler/commandLoader.js) và gọi execute().
// KHÔNG chứa logic game ở đây nữa — mọi logic nằm trong từng file commands/*.js.

const professions = require('../data/professions');

const PREFIX = '!';

module.exports = async (client, message, db) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (!command) return;

    // ctx: mọi thứ dùng chung mà các lệnh cần, tránh mỗi file phải require lại
    const ctx = { db, professions, client };

    try {
        await command.execute(message, args, ctx);
    } catch (err) {
        console.error(`❌ Lỗi khi thực thi lệnh !${commandName}:`, err);
        message.reply('❌ Đã có lỗi xảy ra khi xử lý lệnh này.').catch(() => {});
    }
};
