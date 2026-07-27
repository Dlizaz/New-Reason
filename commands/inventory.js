// commands/inventory.js
const { EmbedBuilder } = require('discord.js');
const RARITY = require('../data/rarityConfig');

module.exports = {
    name: 'inventory',
    description: 'Xem túi đồ vật phẩm đã sở hữu.',

    async execute(message, args, ctx) {
        const { db } = ctx;
        const userId = message.author.id;
        const user = await db.getOrCreateUser(userId);
        const items = await db.getInventory(userId);

        if (items.length === 0) {
            return message.reply('🎒 Túi đồ của bạn đang trống! Gõ `!roll` để tìm vật phẩm đầu tiên.');
        }

        const lines = items.map((item) => {
            const meta = RARITY[item.rarity] || {};
            return `${meta.icon || ''} **${item.item_name}** [${item.rarity}] x${item.quantity}`;
        });

        const embed = new EmbedBuilder()
            .setTitle(`🎒 TÚI ĐỒ VẬT PHẨM - ${message.author.username.toUpperCase()}`)
            .setColor(0x3498db)
            .addFields(
                { name: '💰 Tín Dụng', value: `${user.credits}`, inline: true },
                { name: '📦 Loại Vật Phẩm', value: `${items.length}`, inline: true },
                { name: '📜 Danh Sách', value: lines.join('\n').slice(0, 1024) || 'Trống' }
            );

        return message.channel.send({ embeds: [embed] });
    },
};
